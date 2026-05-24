// ============================================================
// publisher-agent.js — aipickspro.com (v5 — FINAL)
// Sync agent: DB is source of truth, GitHub mirrors it exactly.
//
// Runs:
//  - After writing-agent: publishes new articles (github_published=false)
//  - After validation-agent: updates articles with WON/LOST badges
//  - Deletes orphan MDX files automatically
// ============================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Octokit }      = require('@octokit/rest');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const octokit  = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;
const ROOT  = 'content/predictions';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getLeagueSlug(league) {
  const map = {
    'Premier League': 'premier-league', 'La Liga': 'la-liga',
    'Serie A': 'serie-a', 'Bundesliga': 'bundesliga', 'Ligue 1': 'ligue-1',
    'Champions League': 'champions-league', 'Europa League': 'europa-league',
    'Conference League': 'conference-league', 'Eredivisie': 'eredivisie',
    'Primeira Liga': 'primeira-liga', 'Super Lig': 'super-lig',
    'Belgian Pro League': 'belgian-pro-league',
    'Scottish Premiership': 'scottish-premiership', 'MLS': 'mls',
  };
  return map[league] || league.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getPath(sport, league, slug) {
  return `${ROOT}/${sport}/${getLeagueSlug(league)}/${slug}.mdx`;
}

function sofiaDay(iso) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sofia', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso));
}

function lifecycle(matchISO, pickWon) {
  const kickoff = new Date(matchISO), now = new Date();
  const matchDay = sofiaDay(matchISO), today = sofiaDay(new Date());
  const finished  = pickWon !== null && pickWon !== undefined;
  const upcoming  = !finished && kickoff > now;
  const live      = !finished && !upcoming && (now - kickoff) < 4 * 3600000;
  const isToday   = !finished && matchDay === today;
  let lc = upcoming ? (isToday ? 'today' : 'upcoming') : finished ? 'finished' : live ? 'live' : 'awaiting_result';
  return { matchDay, isToday, upcoming, live, finished, lc };
}

function esc(s) { return (s ?? '').toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' '); }

function buildMDX(art, matchDate) {
  const lc  = lifecycle(matchDate, art.pick_won);
  const pub  = new Date(art.published_at).toISOString().split('T')[0];
  const res  = art.pick_won === true ? 'won' : art.pick_won === false ? 'lost' : 'pending';

  const fm = `title: "${esc(art.title)}"
slug: "${art.slug}"
sport: "${art.sport}"
league: "${esc(art.league)}"
published_at: "${pub}"
date: "${lc.matchDay}"
match_date: "${matchDate}"
lifecycle: "${lc.lc}"
is_today: ${lc.isToday}
is_upcoming: ${lc.upcoming}
is_live: ${lc.live}
is_finished: ${lc.finished}
awaiting_result: ${lc.lc === 'awaiting_result'}
market: "${esc(art.market)}"
pick_code: "${esc(art.pick_code)}"
pick_odds: ${art.pick_odds ?? 'null'}
odds: "${art.odds || art.pick_odds || ''}"
prediction: "${esc(art.prediction)}"
confidence: ${art.confidence || 3}
model_prob: ${art.model_prob ?? 'null'}
implied_prob: ${art.implied_prob ?? 'null'}
edge: ${art.edge ?? 'null'}
reasoning: "${esc(art.reasoning)}"
bookmaker: "${esc(art.bookmaker) || 'Market median'}"
pick_won: ${art.pick_won === true ? 'true' : art.pick_won === false ? 'false' : 'null'}
actual_home_score: ${art.actual_home_score ?? 'null'}
actual_away_score: ${art.actual_away_score ?? 'null'}
actual_winner: "${art.actual_winner || ''}"
actual_total: ${art.actual_total ?? 'null'}
actual_btts: ${art.actual_btts === true ? 'true' : art.actual_btts === false ? 'false' : 'null'}
result: "${res}"
validated_at: "${art.validated_at || ''}"
meta_description: "${esc(art.meta_description)}"
excerpt: "${esc(art.excerpt)}"`;

  const banner = lc.finished
    ? `> **Result:** ${art.actual_home_score}–${art.actual_away_score} — pick **${art.pick_won ? '✓ WON' : '✗ LOST'}**\n\n`
    : '';

  return `---\n${fm}\n---\n\n${banner}${art.content}\n\n---\n*Odds correct at time of publication. Gamble responsibly. 18+*\n`;
}

async function listMDX(path) {
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    const items = Array.isArray(data) ? data : [data];
    const files = [];
    for (const item of items) {
      if (item.type === 'dir') files.push(...await listMDX(item.path));
      else if (item.name.endsWith('.mdx')) files.push({ path: item.path, sha: item.sha });
    }
    return files;
  } catch (e) { return e.status === 404 ? [] : Promise.reject(e); }
}

async function upsertFile(path, content) {
  let sha;
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    if (!Array.isArray(data)) sha = data.sha;
  } catch (e) { if (e.status !== 404) throw e; }
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path,
    message: sha ? `update: ${path.split('/').pop()}` : `add: ${path.split('/').pop()}`,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  });
  return sha ? 'updated' : 'created';
}

async function deleteFile(path, sha) {
  await octokit.repos.deleteFile({
    owner: OWNER, repo: REPO, path, sha,
    message: `cleanup: ${path.split('/').pop()}`,
  });
}

async function run() {
  console.log('Publisher Agent v5 starting —', new Date().toISOString());

  // Load all ready articles with match date
  const { data: allArts, error } = await supabase
    .from('articles')
    .select('*, matches!inner(match_date)')
    .eq('status', 'ready');

  if (error) { console.error('DB error:', error.message); return; }
  if (!allArts.length) { console.log('No articles in DB.'); return; }

  // Build expected path map
  const expected = new Map();
  for (const a of allArts) {
    if (!a.slug || !a.sport) continue;
    expected.set(getPath(a.sport, a.league, a.slug), a);
  }
  console.log(`Articles in DB: ${allArts.length}`);

  // Articles that need publishing (new or result updated)
  const toPublish = allArts.filter(a =>
    !a.github_published || (a.pick_won !== null && a.validated_at)
  );
  console.log(`To publish/update: ${toPublish.length}`);

  if (!toPublish.length) {
    console.log('Everything up to date — scanning for orphans only.');
  }

  // Scan GitHub for orphans
  let existing = [];
  try { existing = await listMDX(ROOT); }
  catch (e) { console.warn('GitHub scan failed:', e.message); }

  let deleted = 0;
  for (const file of existing) {
    if (!expected.has(file.path)) {
      try { await deleteFile(file.path, file.sha); deleted++; await sleep(300); }
      catch (e) { console.warn(`  ! delete ${file.path}: ${e.message}`); }
    }
  }
  if (deleted) console.log(`Deleted ${deleted} orphan files`);

  // Publish
  let created = 0, updated = 0, failed = 0;
  for (const [path, art] of expected) {
    const needsPublish = !art.github_published || (art.pick_won !== null && art.validated_at);
    if (!needsPublish) continue;

    const mdx = buildMDX(art, art.matches.match_date);
    try {
      const op = await upsertFile(path, mdx);
      await supabase.from('articles').update({ github_published: true }).eq('id', art.id);
      const lc = lifecycle(art.matches.match_date, art.pick_won);
      const icon = op === 'created' ? '+' : '~';
      console.log(`  ${icon} [${lc.lc}] ${art.slug}`);
      if (op === 'created') created++; else updated++;
    } catch (e) {
      console.error(`  ! ${art.slug}: ${e.message}`);
      failed++;
    }
    await sleep(300);
  }

  // Lifecycle summary
  const lcs = {};
  for (const a of allArts) {
    const lc = lifecycle(a.matches.match_date, a.pick_won);
    lcs[lc.lc] = (lcs[lc.lc] || 0) + 1;
  }

  await supabase.from('agent_logs').insert({
    agent: 'publisher-agent', status: failed ? 'partial' : 'success',
    message: `created=${created} updated=${updated} deleted=${deleted} failed=${failed}`,
  });

  console.log('\n── Publisher Report ──────────────────');
  console.log(`Created:   ${created}`);
  console.log(`Updated:   ${updated}`);
  console.log(`Deleted:   ${deleted} orphans`);
  console.log(`Failed:    ${failed}`);
  console.log('\nLifecycle:', Object.entries(lcs).map(([k,v]) => `${k}=${v}`).join(' | '));
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
