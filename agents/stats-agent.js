// ============================================================
// stats-agent.js — aipickspro.com (v7 — FINAL)
// Runs once daily at 09:00 via daily-run.js.
//
// GUARANTEES:
//   - Each match stored exactly once (external_id UNIQUE constraint)
//   - Only future fixtures (2h+ from now)
//   - Skips known external_ids before hitting the API
//   - Cleans up matches older than 7 days at the start of each run
// ============================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const AF_KEY  = process.env.API_FOOTBALL_KEY;
const AF_BASE = 'https://v3.football.api-sports.io';

if (!AF_KEY) { console.error('FATAL: API_FOOTBALL_KEY missing'); process.exit(1); }

function currentSeason() {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

const LEAGUES = [
  { sport: 'football', name: 'Premier League',     id: 39  },
  { sport: 'football', name: 'La Liga',            id: 140 },
  { sport: 'football', name: 'Serie A',            id: 135 },
  { sport: 'football', name: 'Bundesliga',         id: 78  },
  { sport: 'football', name: 'Ligue 1',            id: 61  },
  { sport: 'football', name: 'Champions League',   id: 2   },
  { sport: 'football', name: 'Europa League',      id: 3   },
  { sport: 'football', name: 'Conference League',  id: 848 },
  { sport: 'football', name: 'Eredivisie',         id: 88  },
  { sport: 'football', name: 'Primeira Liga',      id: 94  },
  { sport: 'football', name: 'Super Lig',          id: 203 },
  { sport: 'football', name: 'Belgian Pro League', id: 144 },
  { sport: 'football', name: 'Scottish Premiership', id: 179 },
  { sport: 'football', name: 'MLS',                id: 253 },
];

const FIXTURES_PER_LEAGUE = 5;
const MIN_HOURS_AHEAD     = 2;
const KEEP_DAYS           = 7;

const sleep  = (ms) => new Promise(r => setTimeout(r, ms));
const round2 = (n)  => n == null ? null : Math.round(n * 100) / 100;

function median(arr) {
  const v = arr.filter(x => x != null && isFinite(x));
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

let quotaLeft = null;

async function apiFetch(path) {
  const res = await fetch(`${AF_BASE}${path}`, {
    headers: { 'x-apisports-key': AF_KEY }
  });
  const rem = res.headers.get('x-ratelimit-requests-remaining');
  if (rem != null) quotaLeft = parseInt(rem);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  if (d.errors && !Array.isArray(d.errors) && Object.keys(d.errors).length)
    throw new Error(JSON.stringify(d.errors).slice(0, 100));
  return d;
}

function extractOdds(resp) {
  if (!resp?.length) return null;
  const h = { home: [], draw: [], away: [] };
  const t = {};
  const b = { yes: [], no: [] };
  for (const e of resp) {
    for (const bm of e.bookmakers || []) {
      for (const bet of bm.bets || []) {
        const nm = (bet.name || '').toLowerCase();
        if (bet.id === 1 || nm === 'match winner') {
          for (const v of bet.values || []) {
            const o = parseFloat(v.odd);
            if (!isFinite(o)) continue;
            if (v.value === 'Home') h.home.push(o);
            else if (v.value === 'Draw') h.draw.push(o);
            else if (v.value === 'Away') h.away.push(o);
          }
        } else if (bet.id === 5 || nm === 'goals over/under') {
          for (const v of bet.values || []) {
            const o = parseFloat(v.odd);
            if (!isFinite(o)) continue;
            const m = (v.value || '').match(/(Over|Under)\s+([\d.]+)/i);
            if (!m) continue;
            const pt = parseFloat(m[2]);
            t[pt] ||= { over: [], under: [] };
            t[pt][m[1].toLowerCase()].push(o);
          }
        } else if (bet.id === 8 || nm.includes('both teams')) {
          for (const v of bet.values || []) {
            const o = parseFloat(v.odd);
            if (!isFinite(o)) continue;
            if (v.value === 'Yes') b.yes.push(o);
            else if (v.value === 'No') b.no.push(o);
          }
        }
      }
    }
  }
  let bp = null, bd = Infinity;
  for (const pt of Object.keys(t)) {
    const d = Math.abs(parseFloat(pt) - 2.5);
    if (d < bd) { bd = d; bp = parseFloat(pt); }
  }
  const tb = bp != null ? t[bp] : null;
  return {
    home_odds:      round2(median(h.home)),
    draw_odds:      round2(median(h.draw)),
    away_odds:      round2(median(h.away)),
    totals_point:   bp,
    over_odds:      tb ? round2(median(tb.over))  : null,
    under_odds:     tb ? round2(median(tb.under)) : null,
    btts_yes_odds:  round2(median(b.yes)),
    btts_no_odds:   round2(median(b.no)),
    bookmaker_count: resp[0]?.bookmakers?.length || 0,
  };
}

function extractStats(resp) {
  if (!resp?.length) return {};
  const p  = resp[0];
  const hl = p.teams?.home?.last_5;
  const al = p.teams?.away?.last_5;
  const h2h = (p.h2h || []).slice(-5)
    .map(m => ({
      date:  m.fixture?.date?.split('T')[0],
      home:  m.teams?.home?.name,
      away:  m.teams?.away?.name,
      score: m.goals?.home != null ? `${m.goals.home}-${m.goals.away}` : null,
    }))
    .filter(g => g.score);
  const flat = (Array.isArray(p.league?.standings?.[0])
    ? p.league.standings.flat()
    : (p.league?.standings || []));
  const hr = flat.find(s => s.team?.id === p.teams?.home?.id);
  const ar = flat.find(s => s.team?.id === p.teams?.away?.id);
  return {
    home_form:          hl?.form || null,
    away_form:          al?.form || null,
    home_goals_for:     round2(parseFloat(hl?.goals?.for?.average?.total)),
    home_goals_against: round2(parseFloat(hl?.goals?.against?.average?.total)),
    away_goals_for:     round2(parseFloat(al?.goals?.for?.average?.total)),
    away_goals_against: round2(parseFloat(al?.goals?.against?.average?.total)),
    home_position:      hr?.rank || null,
    away_position:      ar?.rank || null,
    h2h:                h2h.length ? h2h : null,
  };
}

async function run() {
  console.log('Stats Agent v7 starting —', new Date().toISOString());

  // Verify API key + plan
  try {
    const s = await apiFetch('/status');
    const r = s.response?.requests;
    console.log(`API: ${s.response?.account?.email} | plan: ${s.response?.subscription?.plan} | quota: ${r?.current}/${r?.limit_day}`);
    if (s.response?.subscription?.plan?.toLowerCase() === 'free') {
      console.error('FATAL: Free plan cannot access current season.');
      process.exit(1);
    }
    quotaLeft = r ? r.limit_day - r.current : null;
  } catch (e) {
    console.error('FATAL: API check failed —', e.message);
    process.exit(1);
  }

  // ── 7-day cleanup ─────────────────────────────────────────
  const cutoffDate = new Date(Date.now() - KEEP_DAYS * 86400000).toISOString();
  const { data: oldMatches } = await supabase
    .from('matches')
    .select('id')
    .lt('match_date', cutoffDate);

  if (oldMatches?.length) {
    const oldIds = oldMatches.map(m => m.id);
    await supabase.from('articles').delete().in('match_id', oldIds);
    await supabase.from('matches').delete().in('id', oldIds);
    console.log(`Cleaned up ${oldMatches.length} matches older than ${KEEP_DAYS} days`);
  }

  // ── Load known external_ids (DB-level dedup) ──────────────
  const { data: known } = await supabase.from('matches').select('external_id');
  const knownIds = new Set((known || []).map(m => String(m.external_id)));
  console.log(`Known in DB: ${knownIds.size} matches`);

  const futureOnly = Date.now() + MIN_HOURS_AHEAD * 3600000;

  // ── Fetch fixtures per league ─────────────────────────────
  const toEnrich = [];
  for (const league of LEAGUES) {
    try {
      const d = await apiFetch(`/fixtures?league=${league.id}&season=${currentSeason()}&next=${FIXTURES_PER_LEAGUE}`);
      const fresh = (d.response || []).filter(f => {
        if (knownIds.has(String(f.fixture.id))) return false;
        if (new Date(f.fixture.date).getTime() < futureOnly) return false;
        return true;
      });
      if (fresh.length) console.log(`  ${league.name}: ${fresh.length} new (quota: ${quotaLeft ?? '?'})`);
      for (const f of fresh) toEnrich.push({ f, league });
    } catch (e) {
      console.warn(`  ${league.name}: ${e.message}`);
    }
    await sleep(300);
  }

  console.log(`\nNew fixtures to enrich: ${toEnrich.length}`);
  if (!toEnrich.length) {
    console.log('Nothing new today.');
    await supabase.from('agent_logs').insert({ agent: 'stats-agent', status: 'success', message: 'No new fixtures' });
    return;
  }

  // ── Enrich: odds + stats ──────────────────────────────────
  const rows = [];
  for (const { f, league } of toEnrich) {
    const fid = f.fixture.id;
    let odds = null, stats = {};

    try {
      const od = await apiFetch(`/odds?fixture=${fid}`);
      odds = extractOdds(od.response);
      await sleep(300);
    } catch (e) { console.warn(`  fid ${fid} odds: ${e.message}`); }

    try {
      const pd = await apiFetch(`/predictions?fixture=${fid}`);
      stats = extractStats(pd.response);
      await sleep(300);
    } catch (e) { console.warn(`  fid ${fid} stats: ${e.message}`); }

    rows.push({
      sport:               league.sport,
      league:              league.name,
      home_team:           f.teams.home.name,
      away_team:           f.teams.away.name,
      match_date:          f.fixture.date,
      external_id:         String(fid),
      home_odds:           odds?.home_odds    ?? null,
      draw_odds:           odds?.draw_odds    ?? null,
      away_odds:           odds?.away_odds    ?? null,
      totals_point:        odds?.totals_point ?? null,
      over_odds:           odds?.over_odds    ?? null,
      under_odds:          odds?.under_odds   ?? null,
      btts_yes_odds:       odds?.btts_yes_odds ?? null,
      btts_no_odds:        odds?.btts_no_odds  ?? null,
      bookmaker_count:     odds?.bookmaker_count ?? 0,
      ...stats,
      status: 'upcoming',
    });

    console.log(`  ✓ ${f.teams.home.name} vs ${f.teams.away.name} | 1X2: ${odds?.home_odds ?? '?'}/${odds?.draw_odds ?? '?'}/${odds?.away_odds ?? '?'}`);
  }

  // ── Save (onConflict = ignore, UNIQUE constraint enforces dedup) ──
  if (rows.length) {
    const { error } = await supabase
      .from('matches')
      .upsert(rows, { onConflict: 'external_id', ignoreDuplicates: true });
    if (error) { console.error('Save error:', error.message); }
    else        { console.log(`\nSaved ${rows.length} matches. Quota left: ${quotaLeft ?? '?'}`); }
  }

  await supabase.from('agent_logs').insert({
    agent: 'stats-agent', status: 'success',
    message: `Saved ${rows.length} new matches. Quota: ${quotaLeft ?? '?'}`,
  });
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
