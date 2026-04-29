require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Octokit } = require('@octokit/rest');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

async function deleteFileFromGitHub(path, sha) {
  try {
    await octokit.repos.deleteFile({
      owner: OWNER,
      repo: REPO,
      path,
      message: `Cleanup: remove old prediction ${path.split('/').pop()}`,
      sha
    });
    return true;
  } catch (err) {
    console.error(`  Failed to delete ${path}:`, err.message);
    return false;
  }
}

async function getFilesInDir(dirPath) {
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: dirPath });
    if (!Array.isArray(data)) return [];
    return data;
  } catch (e) {
    return [];
  }
}

async function runCleanupAgent() {
  console.log('Cleanup Agent starting...');
  console.log('Time:', new Date().toISOString());

  const cutoff = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0];
  console.log(`Removing articles older than: ${cutoff}`);

  const sports = ['football', 'basketball', 'tennis', 'nfl'];
  let deleted = 0;
  let dbDeleted = 0;

  for (const sport of sports) {
    const baseDir = `content/predictions/${sport}`;

    try {
      const entries = await getFilesInDir(baseDir);

      for (const entry of entries) {
        if (entry.type === 'file' && entry.name.endsWith('.mdx')) {
          // Check date in filename
          const dateMatch = entry.name.match(/(\d{4}-\d{2}-\d{2})\.mdx$/);
          if (dateMatch && dateMatch[1] < cutoff) {
            console.log(`  Deleting: ${entry.path}`);
            const success = await deleteFileFromGitHub(entry.path, entry.sha);
            if (success) deleted++;
            await new Promise(r => setTimeout(r, 300));
          }
        } else if (entry.type === 'dir') {
          // Check subdirectory
          const subFiles = await getFilesInDir(entry.path);
          for (const file of subFiles) {
            if (file.type === 'file' && file.name.endsWith('.mdx')) {
              const dateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})\.mdx$/);
              if (dateMatch && dateMatch[1] < cutoff) {
                console.log(`  Deleting: ${file.path}`);
                const success = await deleteFileFromGitHub(file.path, file.sha);
                if (success) deleted++;
                await new Promise(r => setTimeout(r, 300));
              }
            }
          }
        }
      }
    } catch (err) {
      console.log(`  Skipping ${sport}:`, err.message);
    }
  }

  // Delete old records from Supabase
  const { data: oldArticles } = await supabase
    .from('articles')
    .select('id')
    .lt('published_at', `${cutoff}T00:00:00.000Z`);

  if (oldArticles?.length) {
    const ids = oldArticles.map(a => a.id);
    await supabase.from('articles').delete().in('id', ids);
    dbDeleted = ids.length;
    console.log(`Deleted ${dbDeleted} old articles from database`);
  }

  // Also clean old matches
  await supabase.from('matches')
    .delete()
    .lt('match_date', `${cutoff}T00:00:00.000Z`);

  console.log(`\nCleanup completed: ${deleted} files deleted from GitHub, ${dbDeleted} records from DB`);

  await supabase.from('agent_logs').insert({
    agent: 'cleanup-agent',
    status: 'success',
    message: `Deleted ${deleted} old files, ${dbDeleted} DB records`
  });
}

runCleanupAgent().catch(e => console.error('FATAL:', e.message));
