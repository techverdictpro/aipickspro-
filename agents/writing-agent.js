// ============================================================
// writing-agent.js — aipickspro.com (v4 — FINAL)
// Runs after stats-agent.
//
// GUARANTEES (no duplicates possible):
//   - Loads match_ids that already have articles → skips them
//   - DB UNIQUE constraint on match_id means even if code bugs out,
//     the DB will reject a second article for the same match
//   - Skips matches without home_odds + away_odds
//
// ANALYST: Marco Bellini — 35yr veteran, picks on VALUE not favourites
// ============================================================

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase  = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const SYSTEM_PROMPT = `You are Marco Bellini, a 35-year veteran football analyst and odds compiler.
You spent two decades setting opening lines at one of Europe's top bookmakers before moving to independent analysis.
You have personally priced over 40,000 matches across all major European competitions.

YOUR PROCESS:
1. Compute implied probability for every outcome: 1/decimal_odds (strip ~5% overround)
2. Estimate TRUE probability using: form (W/D/L last 5), goals/game, league position, H2H record
3. Calculate edge = your_prob - implied_prob
4. Pick the outcome with highest positive edge across 1X2, Over/Under, BTTS
5. If no market shows ≥+3% edge, pick the most likely outcome and flag confidence ≤2

RULES:
- NEVER pick home team by default. Distribution: ~45% home / 27% draw / 28% away
- Two high-scoring teams (both >1.5 goals/game): consider Over 2.5 or BTTS Yes
- Two stingy defences (both <1.0 conceded/game): consider Under 2.5 or BTTS No
- Strong form gap (winner of last 4+, loser of last 3+): weight this heavily
- Be honest: thin data = confidence 1-2, strong data + clear edge = confidence 4-5

WRITING: Direct, intelligent, no filler. Cite specific numbers. The article MUST match the pick.

OUTPUT: ONLY valid JSON — no markdown fences, no text before or after.
{
  "market":           "1X2" | "Totals" | "BTTS",
  "pick_code":        "1" | "X" | "2" | "Over 2.5" | "Under 2.5" | "BTTS Yes" | "BTTS No",
  "pick_odds":        <decimal number>,
  "model_prob":       <integer 1-99>,
  "implied_prob":     <integer 1-99>,
  "edge":             <number, model_prob - implied_prob>,
  "confidence":       <integer 1-5>,
  "reasoning":        "<max 20 words: the core statistical thesis>",
  "title":            "<55-65 chars: team names + pick angle, no generic phrases>",
  "meta_description": "<150-160 chars: includes the pick and odds>",
  "excerpt":          "<2 sentences ~40 words>",
  "article":          "<380-420 words HTML: <p> <h2> <ul><li>. Sections: (1) match context; (2) <h2>Form and Statistics</h2>; (3) <h2>The Value Pick</h2> with exact odds; (4) clear recommendation. No filler.>"
}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 80);
}

function buildBrief(m) {
  return [
    `MATCH:   ${m.home_team} (home) vs ${m.away_team} (away)`,
    `LEAGUE:  ${m.league}`,
    `KICKOFF: ${m.match_date}`,
    `BOOKMAKERS: ${m.bookmaker_count || 'n/a'}`,
    '',
    '── MARKETS (median decimal odds) ──',
    `1X2:    Home ${m.home_odds ?? 'n/a'} | Draw ${m.draw_odds ?? 'n/a'} | Away ${m.away_odds ?? 'n/a'}`,
    m.totals_point && m.over_odds ? `Totals ${m.totals_point}: Over ${m.over_odds} | Under ${m.under_odds}` : '',
    m.btts_yes_odds ? `BTTS:   Yes ${m.btts_yes_odds} | No ${m.btts_no_odds}` : '',
    '',
    '── TEAM STATS (last 5 matches) ──',
    `${m.home_team}:`,
    `  Form: ${m.home_form || 'n/a'}  |  Goals/game: ${m.home_goals_for ?? 'n/a'} scored, ${m.home_goals_against ?? 'n/a'} conceded  |  Position: ${m.home_position ?? 'n/a'}`,
    `${m.away_team}:`,
    `  Form: ${m.away_form || 'n/a'}  |  Goals/game: ${m.away_goals_for ?? 'n/a'} scored, ${m.away_goals_against ?? 'n/a'} conceded  |  Position: ${m.away_position ?? 'n/a'}`,
    ...(Array.isArray(m.h2h) && m.h2h.length ? [
      '',
      '── HEAD-TO-HEAD (last 5) ──',
      ...m.h2h.map(g => `  ${g.date}: ${g.home} ${g.score} ${g.away}`)
    ] : []),
  ].filter(l => l !== null).join('\n');
}

function parseJSON(raw) {
  let s = raw.trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const first = s.indexOf('{'), last = s.lastIndexOf('}');
  if (first > 0 || last < s.length - 1) s = s.slice(first, last + 1);
  return JSON.parse(s);
}

function validatePick(pick, match) {
  const oddsMap = {
    '1': match.home_odds, 'X': match.draw_odds, '2': match.away_odds,
    'Over 2.5': match.over_odds, 'Under 2.5': match.under_odds,
    'BTTS Yes': match.btts_yes_odds, 'BTTS No': match.btts_no_odds,
  };
  const dbOdds = oddsMap[pick.pick_code];
  if (!dbOdds) return { ok: false, reason: `pick_code "${pick.pick_code}" has no odds` };
  pick.pick_odds    = dbOdds;
  pick.implied_prob = Math.round((1 / dbOdds) * 100);
  pick.edge         = Math.round((pick.model_prob || 0) - pick.implied_prob);
  return { ok: true };
}

async function run() {
  console.log('Writing Agent v4 starting —', new Date().toISOString());

  // Load match_ids that already have an article (one check, no DB constraint bypass possible)
  const { data: existingArts } = await supabase.from('articles').select('match_id');
  const writtenIds = new Set((existingArts || []).map(a => a.match_id));
  console.log(`Already written: ${writtenIds.size} articles`);

  // Load upcoming matches with odds
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .gte('match_date', new Date().toISOString())
    .not('home_odds', 'is', null)
    .not('away_odds', 'is', null)
    .order('match_date', { ascending: true });

  if (error) { console.error('Fetch error:', error.message); return; }

  const todo = matches.filter(m => !writtenIds.has(m.id));
  console.log(`Matches with odds: ${matches.length} | New to write: ${todo.length}`);

  if (!todo.length) {
    console.log('All matches already have predictions.');
    await supabase.from('agent_logs').insert({ agent: 'writing-agent', status: 'success', message: 'Nothing to write' });
    return;
  }

  let ok = 0, failed = 0;
  const dist = {};

  for (const match of todo) {
    try {
      const resp = await anthropic.messages.create({
        model: 'claude-sonnet-4-5', max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Analyse and return JSON:\n\n${buildBrief(match)}` }],
      });

      const raw = resp.content.find(c => c.type === 'text')?.text || '';
      let pick;
      try { pick = parseJSON(raw); }
      catch { console.error(`  ✗ ${match.home_team} vs ${match.away_team} — JSON parse failed`); failed++; continue; }

      const v = validatePick(pick, match);
      if (!v.ok) { console.error(`  ✗ ${match.home_team} vs ${match.away_team} — ${v.reason}`); failed++; continue; }

      const dateStr = match.match_date.split('T')[0];
      const slug    = slugify(`${match.home_team}-vs-${match.away_team}-${dateStr}`);

      const { error: saveErr } = await supabase.from('articles').upsert({
        match_id: match.id, title: pick.title, slug,
        sport: match.sport, league: match.league,
        content: pick.article, excerpt: pick.excerpt, meta_description: pick.meta_description,
        market: pick.market, pick_code: pick.pick_code,
        pick_odds: pick.pick_odds, odds: String(pick.pick_odds),
        model_prob: pick.model_prob, implied_prob: pick.implied_prob,
        edge: pick.edge, confidence: pick.confidence, reasoning: pick.reasoning,
        prediction: `${pick.pick_code} @ ${pick.pick_odds}`,
        bookmaker: 'Market median', status: 'ready',
        github_published: false, published_at: new Date().toISOString(),
      }, { onConflict: 'match_id', ignoreDuplicates: true }); // DB constraint is final arbiter

      if (saveErr) {
        console.error(`  ✗ ${match.home_team} vs ${match.away_team} — ${saveErr.message}`);
        failed++;
      } else {
        const edgeStr = pick.edge >= 0 ? `+${pick.edge}%` : `${pick.edge}%`;
        console.log(`  ✓ ${match.home_team} vs ${match.away_team} → ${pick.pick_code} @ ${pick.pick_odds} (${edgeStr}, ${pick.confidence}/5)`);
        dist[pick.pick_code] = (dist[pick.pick_code] || 0) + 1;
        ok++;
      }
    } catch (e) {
      console.error(`  ✗ ${match.home_team} vs ${match.away_team} — ${e.message}`);
      failed++;
    }
    await sleep(2000);
  }

  if (ok > 0) {
    console.log('\nPick distribution:');
    for (const [code, n] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${code.padEnd(12)} ${n}  (${Math.round(n / ok * 100)}%)`);
    }
  }

  await supabase.from('agent_logs').insert({
    agent: 'writing-agent',
    status: failed === 0 ? 'success' : 'partial',
    message: `Written ${ok}, failed ${failed}. Dist: ${JSON.stringify(dist)}`,
  });
  console.log(`\nWriting Agent done. ${ok} written, ${failed} failed.`);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
