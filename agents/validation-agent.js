// ============================================================
// validation-agent.js — aipickspro.com (v3 — FINAL)
// Runs at 07:00 via Task Scheduler.
// Fetches results from API-Football for all finished matches
// that have no validated_at yet. Never re-validates.
// Sets github_published=false so publisher re-pushes WON/LOST badges.
// ============================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const AF_KEY   = process.env.API_FOOTBALL_KEY;
const AF_BASE  = 'https://v3.football.api-sports.io';

if (!AF_KEY) { console.error('FATAL: API_FOOTBALL_KEY missing'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const DONE  = ['FT', 'AET', 'PEN', 'AWD', 'WO'];

async function apiFetch(path) {
  const res = await fetch(`${AF_BASE}${path}`, { headers: { 'x-apisports-key': AF_KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  if (d.errors && !Array.isArray(d.errors) && Object.keys(d.errors).length)
    throw new Error(JSON.stringify(d.errors).slice(0, 80));
  return d;
}

function evalPick(code, home, away) {
  switch (code) {
    case '1':         return home > away;
    case 'X':         return home === away;
    case '2':         return away > home;
    case 'Over 2.5':  return (home + away) > 2.5;
    case 'Under 2.5': return (home + away) < 2.5;
    case 'BTTS Yes':  return home > 0 && away > 0;
    case 'BTTS No':   return !(home > 0 && away > 0);
    default:          return null;
  }
}

async function run() {
  console.log('Validation Agent v3 starting —', new Date().toISOString());

  // Only articles whose match has finished and aren't validated yet
  const { data: arts, error } = await supabase
    .from('articles')
    .select('id, pick_code, matches!inner(external_id, match_date, home_team, away_team)')
    .lt('matches.match_date', new Date().toISOString())
    .is('validated_at', null)
    .not('pick_code', 'is', null);

  if (error) { console.error('DB error:', error.message); return; }

  const candidates = (arts || []).filter(a => a.matches);
  console.log(`Awaiting validation: ${candidates.length}`);

  if (!candidates.length) {
    console.log('Nothing to validate.');
    await supabase.from('agent_logs').insert({ agent: 'validation-agent', status: 'success', message: 'Nothing to validate' });
    return;
  }

  let validated = 0, wins = 0, losses = 0, pending = 0, failed = 0;
  const byMarket = {};

  for (const art of candidates) {
    const fid = art.matches.external_id;

    let fixture;
    try {
      const d = await apiFetch(`/fixtures?id=${fid}`);
      fixture  = d.response?.[0];
      await sleep(300);
    } catch (e) { console.warn(`  ! fid ${fid}: ${e.message}`); failed++; continue; }

    if (!fixture) { console.warn(`  ! fid ${fid}: no data`); failed++; continue; }

    const status = fixture.fixture?.status?.short;
    if (!DONE.includes(status)) {
      console.log(`  ~ ${art.matches.home_team} vs ${art.matches.away_team}: ${status} (not finished)`);
      pending++;
      continue;
    }

    const hs = fixture.goals?.home, as_ = fixture.goals?.away;
    if (hs == null || as_ == null) { failed++; continue; }

    const won    = evalPick(art.pick_code, hs, as_);
    const winner = hs > as_ ? '1' : as_ > hs ? '2' : 'X';

    const { error: upErr } = await supabase.from('articles').update({
      actual_home_score: hs, actual_away_score: as_,
      actual_winner: winner, actual_total: hs + as_,
      actual_btts: hs > 0 && as_ > 0, pick_won: won,
      validated_at: new Date().toISOString(),
      github_published: false, // force publisher to re-push with badge
    }).eq('id', art.id);

    if (upErr) { console.error(`  ! update: ${upErr.message}`); failed++; continue; }

    validated++;
    if (won) wins++; else losses++;
    byMarket[art.pick_code] ||= { wins: 0, total: 0 };
    byMarket[art.pick_code].total++;
    if (won) byMarket[art.pick_code].wins++;

    console.log(`  ${won ? '✓ WIN' : '✗ LOSS'} ${art.matches.home_team} ${hs}-${as_} ${art.matches.away_team} | pick: ${art.pick_code}`);
  }

  const hitRate = validated ? ((wins / validated) * 100).toFixed(1) : '—';

  await supabase.from('agent_logs').insert({
    agent: 'validation-agent', status: 'success',
    message: `Validated ${validated}. ${wins}W/${losses}L. Hit rate: ${hitRate}%`,
  });

  console.log('\n── Validation Report ─────────────────');
  console.log(`Validated:    ${validated}`);
  console.log(`Pending:      ${pending}`);
  console.log(`Failed:       ${failed}`);
  if (validated > 0) {
    console.log(`\nHit rate:     ${wins}/${validated}  (${hitRate}%)`);
    console.log('\nBy market:');
    for (const [code, st] of Object.entries(byMarket).sort((a, b) => b[1].total - a[1].total)) {
      console.log(`  ${code.padEnd(14)} ${st.wins}/${st.total}  (${(st.wins/st.total*100).toFixed(1)}%)`);
    }
  }
  if (validated > 0) console.log('\n→ Run publisher-agent next to push WON/LOST badges to site.');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
