require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const SYSTEM_PROMPT = `You are a senior sports journalist and analyst with 35 years of experience. You spent 20 of those years as a lead odds compiler for a major European bookmaker, setting lines for Premier League, Champions League, NBA, and NFL markets.

Your writing rules:
- Sharp, authoritative, direct. Zero fluff.
- Cite specific statistics to back every claim.
- Understand value betting — mention if the odds represent value.
- Write like The Athletic or ESPN Insider — premium, intelligent sports journalism.
- Articles are 380-420 words. Strictly enforced.
- Structure: Strong hook (1 sentence) → Match context (2-3 sentences) → Statistical analysis (3-4 sentences) → Key deciding factor (2 sentences) → Prediction with odds assessment (2-3 sentences) → Verdict (1 bold sentence).
- Never use filler phrases like "it remains to be seen" or "only time will tell".
- Verdict line must start with: VERDICT:
- Write in English only.
- No subheadings. Clean paragraphs only.`;

function buildPrompt(match, homeStats, awayStats) {
  return `Write a match prediction article.

MATCH: ${match.home_team} vs ${match.away_team}
COMPETITION: ${match.league}
SPORT: ${match.sport}
DATE: ${new Date(match.match_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

ODDS: ${match.home_team} ${match.home_odds} | Draw ${match.draw_odds || 'N/A'} | ${match.away_team} ${match.away_odds}

${match.home_team} STATS:
- Form: ${homeStats?.form || 'Unknown'}
- Goals per game: ${homeStats?.goals_scored || 'Unknown'} scored / ${homeStats?.goals_conceded || 'Unknown'} conceded
- xG: ${homeStats?.xg || 'N/A'}
- Injuries: ${homeStats?.injuries || 'None reported'}

${match.away_team} STATS:
- Form: ${awayStats?.form || 'Unknown'}
- Goals per game: ${awayStats?.goals_scored || 'Unknown'} scored / ${awayStats?.goals_conceded || 'Unknown'} conceded
- xG: ${awayStats?.xg || 'N/A'}
- Injuries: ${awayStats?.injuries || 'None reported'}

Write the article. Start with a compelling title on the first line (no # symbol). Then write the article. End with VERDICT: on its own line.`;
}

function generateSlug(home, away, league) {
  const date = new Date().toISOString().split('T')[0];
  const clean = s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${clean(home)}-vs-${clean(away)}-${clean(league)}-prediction-${date}`;
}

async function runWritingAgent() {
  console.log('Writing Agent starting...');

  // Get all upcoming matches that don't have articles yet
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true });

  if (error) { console.error('DB error:', error.message); return; }
  if (!matches?.length) { console.log('No matches found'); return; }

  // Get existing article slugs to avoid duplicates
  const { data: existingArticles } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'ready');

  const existingSlugs = new Set((existingArticles || []).map(a => a.slug));

  // Filter out matches that already have articles today
  const toWrite = matches.filter(m => {
    const slug = generateSlug(m.home_team, m.away_team, m.league);
    return !existingSlugs.has(slug);
  });

  if (toWrite.length === 0) {
    console.log('All matches already have articles for today');
    return;
  }

  console.log(`Writing ${toWrite.length} new articles...`);

  for (const match of toWrite) {
    console.log(`\n→ ${match.home_team} vs ${match.away_team} (${match.league})`);

    const { data: homeStats } = await supabase
      .from('team_stats').select('*')
      .eq('team_name', match.home_team).single();

    const { data: awayStats } = await supabase
      .from('team_stats').select('*')
      .eq('team_name', match.away_team).single();

    try {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(match, homeStats, awayStats) }]
      });

      const content = response.content[0].text;
      const lines = content.split('\n').filter(l => l.trim());
      const title = lines[0];
      const slug = generateSlug(match.home_team, match.away_team, match.league);
      const verdictLine = lines.find(l => l.startsWith('VERDICT:')) || '';
      const excerpt = verdictLine.replace('VERDICT:', '').trim();
      const metaDesc = `${match.home_team} vs ${match.away_team} prediction, betting tips and analysis for ${match.league}. Expert stats-based pick with best odds.`;
      const prediction = match.home_odds && match.away_odds && match.home_odds <= match.away_odds
        ? `${match.home_team} Win @ ${match.home_odds}`
        : `${match.away_team} Win @ ${match.away_odds}`;

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
        odds: match.home_odds?.toString(),
        confidence: 4,
        bookmaker: 'Bet365',
        status: 'ready',
        published_at: new Date().toISOString()
      }, { onConflict: 'slug' });

      if (err) {
        console.error('Save error:', err.message);
      } else {
        console.log('Saved:', title.substring(0, 60) + '...');
      }
    } catch (apiErr) {
      console.error('Claude API error:', apiErr.message);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  await supabase.from('agent_logs').insert({
    agent: 'writing-agent',
    status: 'success',
    message: `Generated ${toWrite.length} articles for upcoming matches`
  });

  console.log('\nWriting Agent completed!');
}

runWritingAgent().catch(e => console.error('FATAL:', e.message));
