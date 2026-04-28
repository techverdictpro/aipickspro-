require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const SYSTEM_PROMPT = `You are James Hargreaves — a veteran sports journalist with 34 years of experience. You spent the first 12 years covering football for The Times and The Guardian, then 15 years as a senior analyst at a major European bookmaking firm where you set odds for Premier League, Champions League, La Liga, Bundesliga, Serie A, NBA and NFL markets. For the past 7 years you have been the chief sports analyst at ESPN's European division.

Your journalism philosophy:
- Every article must answer the question: "Why does this match matter, and what will happen?"
- Lead with the most important fact — never bury the lede.
- Back every claim with specific numbers. Vague observations are not journalism.
- Identify the ONE key factor that will decide this match. Every game has one.
- Be direct. Editors at top publications cut fluff. Your writing has no fluff.
- Never use passive voice when active voice is available.
- Never begin sentences with "It is" or "There are".
- Avoid clichés: "must-win", "crucial clash", "battle", "firing on all cylinders".
- Write in a tone that respects the intelligence of a serious sports bettor or analyst.
- Your odds assessment must reflect genuine market understanding — identify value or lack of it.

Article structure (strict):
1. HOOK — One powerful sentence that captures the essence of this fixture. Must contain a specific fact.
2. CONTEXT — 2-3 sentences. Competition stakes, form narrative, what separates these teams right now.
3. STATISTICAL CASE — 3-4 sentences. Hard numbers: goals per game, xG, recent form record (W-D-L), defensive record, head-to-head relevant data.
4. THE DECIDING FACTOR — 2 sentences. One tactical, physical or psychological edge that tips the balance.
5. ODDS ANALYSIS — 2-3 sentences. Assess market pricing. Is there value? At what price does the pick become a bet?
6. VERDICT — One sentence. Clear, definitive, no hedging. Must start with "VERDICT:"

Total length: 400-450 words. No subheadings. Clean paragraphs only. English only.`;

function buildPrompt(match, homeStats, awayStats) {
  const matchDate = new Date(match.match_date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });

  return `Write a match prediction and analysis article for the following fixture.

FIXTURE: ${match.home_team} vs ${match.away_team}
COMPETITION: ${match.league} (${match.country})
SPORT: ${match.sport}
KICK-OFF: ${matchDate} UTC

MARKET ODDS:
- ${match.home_team}: ${match.home_odds || 'N/A'}
- Draw: ${match.draw_odds || 'N/A'}
- ${match.away_team}: ${match.away_odds || 'N/A'}

${match.home_team.toUpperCase()} — TEAM DATA:
- Recent form (last 5): ${homeStats?.form || 'Data unavailable'}
- Goals scored per game: ${homeStats?.goals_scored ?? 'N/A'}
- Goals conceded per game: ${homeStats?.goals_conceded ?? 'N/A'}
- Expected goals (xG) per game: ${homeStats?.xg ?? 'N/A'}
- Injury/suspension news: ${homeStats?.injuries || 'None reported'}

${match.away_team.toUpperCase()} — TEAM DATA:
- Recent form (last 5): ${awayStats?.form || 'Data unavailable'}
- Goals scored per game: ${awayStats?.goals_scored ?? 'N/A'}
- Goals conceded per game: ${awayStats?.goals_conceded ?? 'N/A'}
- Expected goals (xG) per game: ${awayStats?.xg ?? 'N/A'}
- Injury/suspension news: ${awayStats?.injuries || 'None reported'}

Write the article now. First line must be the article title (no formatting symbols). Then write the article body. Final line must be the VERDICT.`;
}

function generateSlug(home, away, league) {
  const date = new Date().toISOString().split('T')[0];
  const clean = s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${clean(home)}-vs-${clean(away)}-${clean(league)}-prediction-${date}`;
}

async function runWritingAgent() {
  console.log('Writing Agent starting...');

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true });

  if (error) { console.error('DB error:', error.message); return; }
  if (!matches?.length) { console.log('No matches found'); return; }

  const today = new Date().toISOString().split('T')[0];
  const todayStart = `${today}T00:00:00.000Z`;

  const { data: existingArticles } = await supabase
    .from('articles')
    .select('slug')
    .gte('published_at', todayStart);

  const existingSlugs = new Set((existingArticles || []).map(a => a.slug));

  const toWrite = matches.filter(m => {
    const slug = generateSlug(m.home_team, m.away_team, m.league);
    return !existingSlugs.has(slug);
  });

  if (toWrite.length === 0) {
    console.log('All matches already have articles for today');
    return;
  }

  console.log(`Writing ${toWrite.length} articles...\n`);

  for (const match of toWrite) {
    console.log(`→ ${match.home_team} vs ${match.away_team} (${match.league})`);

    const { data: homeStats } = await supabase
      .from('team_stats').select('*')
      .eq('team_name', match.home_team).single();

    const { data: awayStats } = await supabase
      .from('team_stats').select('*')
      .eq('team_name', match.away_team).single();

    try {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(match, homeStats, awayStats) }]
      });

      const content = response.content[0].text;
      const lines = content.split('\n').filter(l => l.trim());
      const title = lines[0];
      const slug = generateSlug(match.home_team, match.away_team, match.league);
      const verdictLine = lines.find(l => l.startsWith('VERDICT:')) || '';
      const excerpt = verdictLine.replace('VERDICT:', '').trim();
      const metaDesc = `${match.home_team} vs ${match.away_team} prediction and expert analysis — ${match.league}. In-depth stats, form guide and best odds.`;

      let prediction;
      if (match.home_odds && match.away_odds) {
        prediction = match.home_odds <= match.away_odds
          ? `${match.home_team} Win @ ${match.home_odds}`
          : `${match.away_team} Win @ ${match.away_odds}`;
      } else {
        prediction = `${match.home_team} vs ${match.away_team}`;
      }

      const { error: err } = await supabase.from('articles').upsert({
        match_id: match.id,
        title,
        slug,
        sport: match.sport,
        league: match.league,
        content,
        excerpt,
        meta_description: metaDesc,
        prediction,
        odds: match.home_odds?.toString() || null,
        confidence: 4,
        bookmaker: 'Bet365',
        status: 'ready',
        published_at: new Date().toISOString()
      }, { onConflict: 'slug' });

      if (err) {
        console.error('  Save error:', err.message);
      } else {
        console.log('  Saved:', title.substring(0, 65) + '...');
      }
    } catch (apiErr) {
      console.error('  Claude API error:', apiErr.message);
    }

    await new Promise(r => setTimeout(r, 2500));
  }

  await supabase.from('agent_logs').insert({
    agent: 'writing-agent',
    status: 'success',
    message: `Generated ${toWrite.length} articles`
  });

  console.log('\nWriting Agent completed!');
}

runWritingAgent().catch(e => console.error('FATAL:', e.message));
