require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Octokit } = require('@octokit/rest');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

function sportToCategory(sport) {
  const map = { football: 'football', basketball: 'basketball', tennis: 'tennis', nfl: 'nfl' };
  return map[sport] || 'general';
}

function buildMDX(article) {
  const date = new Date(article.published_at).toISOString().split('T')[0];
  const title = article.title.replace(/"/g, "'");
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
  const category = sportToCategory(article.sport);
  const path = `content/predictions/${category}/${article.slug}.mdx`;
  const content = Buffer.from(buildMDX(article)).toString('base64');
  const message = `Add prediction: ${article.title.substring(0, 60)}`;

  const exists = await fileExists(path);

  if (exists) {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO, path,
      message, content, sha: data.sha
    });
  } else {
    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER, repo: REPO, path,
      message, content
    });
  }

  return path;
}

async function runPublisherAgent() {
  console.log('Publisher Agent starting...');

  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'ready')
    .limit(10);

  if (error) {
    console.error('DB error:', error.message);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('No articles ready to publish');
    return;
  }

  console.log('Publishing ' + articles.length + ' articles...');

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log('\nPublishing: ' + article.title.substring(0, 50) + '...');

    try {
      const path = await publishArticle(article);
      console.log('Saved to: ' + path);

      await supabase.from('articles')
        .update({ status: 'published' })
        .eq('id', article.id);

      console.log('Status: published');
    } catch (err) {
      console.error('Error: ' + err.message);
    }

    await new Promise(function(r) { setTimeout(r, 1500); });
  }

  await supabase.from('agent_logs').insert({
    agent: 'publisher-agent',
    status: 'success',
    message: 'Published ' + articles.length + ' articles to GitHub'
  });

  console.log('\nPublisher Agent completed!');
}

runPublisherAgent().catch(function(e) { console.error('FATAL:', e.message); });
