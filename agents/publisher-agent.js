require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Octokit } = require('@octokit/rest');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

function getContentPath(sport, league) {
  const leagueMap = {
    'Premier League': 'premier-league',
    'Championship': 'championship',
    'League One': 'league-one',
    'League Two': 'league-two',
    'La Liga': 'la-liga',
    'La Liga 2': 'la-liga-2',
    'Bundesliga': 'bundesliga',
    'Bundesliga 2': 'bundesliga-2',
    'Serie A': 'serie-a',
    'Serie B': 'serie-b',
    'Ligue 1': 'ligue-1',
    'Ligue 2': 'ligue-2',
    'Champions League': 'champions-league',
    'UEFA Champions League': 'champions-league',
    'Europa League': 'europa-league',
    'UEFA Europa League': 'europa-league',
    'Conference League': 'conference-league',
    'Copa Libertadores': 'copa-libertadores',
    'Copa Sudamericana': 'copa-sudamericana',
    'MLS': 'mls',
    'Liga MX': 'liga-mx',
    'Primeira Liga': 'primeira-liga',
    'Eredivisie': 'eredivisie',
    'Scottish Premiership': 'scottish-premiership',
    'Super League Turkey': 'super-lig',
    'Saudi Pro League': 'saudi-pro-league',
    'Brasileirao': 'brasileirao',
    'Primera Division Argentina': 'primera-division-argentina',
    'Belgian First Division': 'belgian-first-division',
    'Austrian Bundesliga': 'austrian-bundesliga',
    'Swiss Super League': 'swiss-super-league',
    'Super League Greece': 'super-league-greece',
    'NBA': 'nba',
    'Roland Garros ATP': 'roland-garros',
    'Roland Garros WTA': 'roland-garros',
    'ATP': 'atp',
    'WTA': 'wta',
    'NFL': 'nfl',
  };

  const leagueSlug = leagueMap[league] || league.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  if (sport === 'football') return `content/predictions/football/${leagueSlug}`;
  if (sport === 'basketball') return `content/predictions/basketball/${leagueSlug}`;
  if (sport === 'tennis') return `content/predictions/tennis/${leagueSlug}`;
  if (sport === 'nfl') return `content/predictions/nfl`;
  return `content/predictions/${sport}/${leagueSlug}`;
}

function buildMDX(article) {
  const date = new Date(article.published_at).toISOString().split('T')[0];
  const title = (article.title || '').replace(/"/g, "'");
  const excerpt = (article.excerpt || '').replace(/"/g, "'");
  const meta = (article.meta_description || '').replace(/"/g, "'");
  const prediction = (article.prediction || '').replace(/"/g, "'");

  return `---
title: "${title}"
date: "${date}"
sport: "${article.sport}"
league: "${article.league || ''}"
slug: "${article.slug}"
excerpt: "${excerpt}"
metaDescription: "${meta}"
prediction: "${prediction}"
odds: "${article.odds || ''}"
confidence: ${article.confidence || 3}
bookmaker: "${article.bookmaker || 'Bet365'}"
result: "${article.result || 'pending'}"
---

${article.content}

---

*Odds correct at time of publication. 18+ | Gamble Responsibly | T&Cs apply.*
`;
}

async function fileExists(path) {
  try {
    await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    return true;
  } catch (e) {
    return false;
  }
}

async function publishArticle(article) {
  const dir = getContentPath(article.sport, article.league);
  const path = `${dir}/${article.slug}.mdx`;
  const content = Buffer.from(buildMDX(article)).toString('base64');
  const message = `Add prediction: ${article.title.substring(0, 60)}`;

  const exists = await fileExists(path);

  if (exists) {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO, path, message, content, sha: data.sha
    });
  } else {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO, path, message, content
    });
  }

  return path;
}

async function runPublisherAgent() {
  console.log('Publisher Agent starting...');

  const today = new Date().toISOString().split('T')[0];
  const todayStart = `${today}T00:00:00.000Z`;

  // Get articles published today that haven't been pushed to GitHub yet
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .gte('published_at', todayStart)
    .eq('github_published', false);

  // Fallback: if github_published column doesn't exist, get today's articles
  if (error && error.message.includes('github_published')) {
    console.log('Using fallback query...');
    const { data: fallbackArticles, error: fallbackError } = await supabase
      .from('articles')
      .select('*')
      .gte('published_at', todayStart);

    if (fallbackError) { console.error('DB error:', fallbackError.message); return; }
    if (!fallbackArticles?.length) { console.log('No articles for today'); return; }

    console.log(`Publishing ${fallbackArticles.length} articles...`);
    let published = 0;

    for (const article of fallbackArticles) {
      console.log(`→ ${article.title?.substring(0, 55)}...`);
      try {
        const path = await publishArticle(article);
        console.log(`  → ${path}`);
        published++;
      } catch (err) {
        console.error(`  Error: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 800));
    }

    await supabase.from('agent_logs').insert({
      agent: 'publisher-agent',
      status: 'success',
      message: `Published ${published} articles to GitHub`
    });

    console.log(`\nPublisher Agent completed! Published ${published} articles.`);
    return;
  }

  if (error) { console.error('DB error:', error.message); return; }
  if (!articles?.length) { console.log('No new articles to publish'); return; }

  console.log(`Publishing ${articles.length} articles...`);
  let published = 0;

  for (const article of articles) {
    console.log(`→ ${article.title?.substring(0, 55)}...`);
    try {
      const path = await publishArticle(article);
      console.log(`  → ${path}`);
      await supabase.from('articles').update({ github_published: true }).eq('id', article.id);
      published++;
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  await supabase.from('agent_logs').insert({
    agent: 'publisher-agent',
    status: 'success',
    message: `Published ${published} articles to GitHub`
  });

  console.log(`\nPublisher Agent completed! Published ${published} articles.`);
}

runPublisherAgent().catch(e => console.error('FATAL:', e.message));
