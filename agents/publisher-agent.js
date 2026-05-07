require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Octokit } = require('@octokit/rest');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

function getLeagueSlug(league) {
  const map = {
    'Premier League': 'premier-league', 'Championship': 'championship',
    'League One': 'league-one', 'La Liga': 'la-liga', 'La Liga 2': 'la-liga-2',
    'Bundesliga': 'bundesliga', 'Bundesliga 2': 'bundesliga-2',
    'Serie A': 'serie-a', 'Serie B': 'serie-b',
    'Ligue 1': 'ligue-1', 'Ligue 2': 'ligue-2',
    'Champions League': 'champions-league', 'UEFA Champions League': 'champions-league',
    'Europa League': 'europa-league', 'Conference League': 'conference-league',
    'Copa Libertadores': 'copa-libertadores', 'Copa Sudamericana': 'copa-sudamericana',
    'MLS': 'mls', 'Liga MX': 'liga-mx', 'Primeira Liga': 'primeira-liga',
    'Eredivisie': 'eredivisie', 'Scottish Premiership': 'scottish-premiership',
    'Super Lig Turkey': 'super-lig', 'Saudi Pro League': 'saudi-pro-league',
    'Brasileirao': 'brasileirao', 'Primera Division Argentina': 'primera-division-argentina',
    'Belgian First Division': 'belgian-first-division', 'Austrian Bundesliga': 'austrian-bundesliga',
    'Super League Greece': 'super-league-greece', 'NBA': 'nba',
    'Roland Garros ATP': 'roland-garros', 'Roland Garros WTA': 'roland-garros', 'NFL': 'nfl',
  };
  return map[league] || league.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getFilePath(sport, league, slug) {
  const leagueSlug = getLeagueSlug(league);
  if (sport === 'nfl') return `content/predictions/nfl/${slug}.mdx`;
  return `content/predictions/${sport}/${leagueSlug}/${slug}.mdx`;
}

function buildMDX(article) {
  const date = new Date(article.published_at).toISOString().split('T')[0];
  return `---
title: "${(article.title || '').replace(/"/g, "'")}"
date: "${date}"
sport: "${article.sport}"
league: "${article.league || ''}"
slug: "${article.slug}"
prediction: "${(article.prediction || '').replace(/"/g, "'")}"
odds: "${article.odds || ''}"
confidence: ${article.confidence || 3}
result: "${article.result || 'pending'}"
bookmaker: "${article.bookmaker || 'Bet365'}"
---

${article.content}

---
*Odds correct at time of publication. 18+ | Gamble Responsibly.*
`;
}

async function fileExistsInGitHub(path) {
  try {
    await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    return true;
  } catch (e) {
    return false;
  }
}

async function createFileInGitHub(path, content, title) {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO, path,
      message: `Add: ${title.substring(0, 60)}`,
      content: Buffer.from(content).toString('base64')
    });
    return true;
  } catch (err) {
    console.error(`  GitHub error: ${err.message}`);
    return false;
  }
}

async function runPublisherAgent() {
  console.log('Publisher Agent starting...');
  console.log('Time:', new Date().toISOString());

  // Only get articles not yet published to GitHub
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('github_published', false)
    .not('odds', 'is', null)
    .neq('odds', 'N/A')
    .neq('odds', 'null');

  if (error) { console.error('DB error:', error.message); return; }
  if (!articles?.length) { console.log('No new articles to publish'); return; }

  console.log(`Found ${articles.length} unpublished articles\n`);

  let published = 0;
  let skipped = 0;

  for (const article of articles) {
    const filePath = getFilePath(article.sport, article.league, article.slug);

    // CRITICAL: Check if file already exists - never overwrite
    const exists = await fileExistsInGitHub(filePath);
    if (exists) {
      console.log(`  SKIP (exists): ${article.slug.substring(0, 50)}`);
      // Mark as published in DB so we don't check again
      await supabase.from('articles').update({ github_published: true }).eq('id', article.id);
      skipped++;
      continue;
    }

    // Only create new files
    const mdx = buildMDX(article);
    const ok = await createFileInGitHub(filePath, mdx, article.title);

    if (ok) {
      await supabase.from('articles').update({ github_published: true }).eq('id', article.id);
      console.log(`  ✓ ${article.title?.substring(0, 55)}`);
      published++;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  await supabase.from('agent_logs').insert({
    agent: 'publisher-agent',
    status: 'success',
    message: `Published ${published} new articles, skipped ${skipped} existing`
  });

  console.log(`\nDone! Published: ${published}, Skipped: ${skipped}`);
}

runPublisherAgent().catch(e => console.error('FATAL:', e.message));
