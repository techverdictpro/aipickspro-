require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Octokit } = require('@octokit/rest');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const FOOTBALL_KEY = process.env.FOOTBALL_DATA_KEY;

async function getMatchResult(homeTeam, awayTeam) {
  try {
    const yesterday = new Date(Date.now() - 24 * 3600000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const url = `https://api.football-data.org/v4/matches?dateFrom=${yesterday}&dateTo=${today}&status=FINISHED`;
    const response = await fetch(url, { headers: { 'X-Auth-Token': FOOTBALL_KEY } });
    const data = await response.json();

    if (!data.matches) return null;

    const match = data.matches.find(m =>
      (m.homeTeam.name.includes(homeTeam.split(' ')[0]) || homeTeam.includes(m.homeTeam.name.split(' ')[0])) &&
      (m.awayTeam.name.includes(awayTeam.split(' ')[0]) || awayTeam.includes(m.awayTeam.name.split(' ')[0]))
    );

    if (!match) return null;

    return {
      homeScore: match.score.fullTime.home,
      awayScore: match.score.fullTime.away,
      winner: match.score.winner
    };
  } catch (err) {
    return null;
  }
}

function checkPrediction(prediction, result) {
  if (!result || !prediction) return null;

  const pred = prediction.toLowerCase();

  if (pred.includes('win') && !pred.includes('draw')) {
    const teamName = prediction.split(' Win')[0].trim().toLowerCase();
    if (result.winner === 'HOME_TEAM' && pred.includes('home')) return true;
    if (result.winner === 'AWAY_TEAM' && pred.includes('away')) return true;
    if (result.winner === 'DRAW') return false;

    if (result.homeScore > result.awayScore) {
      return pred.includes(teamName.split(' ')[0]);
    } else if (result.awayScore > result.homeScore) {
      return pred.includes(teamName.split(' ')[0]);
    }
  }

  if (pred.includes('draw')) {
    return result.winner === 'DRAW';
  }

  if (pred.includes('over 2.5')) {
    return (result.homeScore + result.awayScore) > 2.5;
  }

  if (pred.includes('under 2.5')) {
    return (result.homeScore + result.awayScore) < 2.5;
  }

  if (pred.includes('btts') || pred.includes('both teams to score')) {
    return result.homeScore > 0 && result.awayScore > 0;
  }

  return null;
}

async function updateArticleFile(article, resultStatus) {
  const sports = ['football', 'basketball', 'tennis', 'nfl'];

  for (const sport of sports) {
    const baseDir = `content/predictions/${sport}`;

    try {
      const dirs = ['', 'premier-league', 'la-liga', 'bundesliga', 'serie-a', 'ligue-1', 'champions-league', 'europa-league', 'conference-league', 'copa-libertadores', 'copa-sudamericana', 'nba', 'roland-garros', 'atp', 'nfl'];

      for (const dir of dirs) {
        const filePath = dir ? `${baseDir}/${dir}/${article.slug}.mdx` : `${baseDir}/${article.slug}.mdx`;

        try {
          const { data: fileData } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: filePath });

          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          const updatedContent = content.replace(
            /^result:.*$/m,
            `result: "${resultStatus}"`
          );

          const finalContent = updatedContent.includes('result:')
            ? updatedContent
            : updatedContent.replace('---\n\n', `---\nresult: "${resultStatus}"\n\n`);

          await octokit.repos.createOrUpdateFileContents({
            owner: OWNER, repo: REPO,
            path: filePath,
            message: `Update result: ${article.slug}`,
            content: Buffer.from(finalContent).toString('base64'),
            sha: fileData.sha
          });

          return true;
        } catch (e) {
          // File not found in this path, try next
        }
      }
    } catch (e) {
      // Sport dir not found
    }
  }
  return false;
}

async function runResultsAgent() {
  console.log('Results Agent starting...');
  console.log('Time:', new Date().toISOString());

  const yesterday = new Date(Date.now() - 24 * 3600000).toISOString().split('T')[0];

  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('result', 'pending')
    .lt('published_at', new Date().toISOString())
    .gte('published_at', new Date(Date.now() - 3 * 24 * 3600000).toISOString());

  if (error) { console.error('DB error:', error.message); return; }
  if (!articles?.length) { console.log('No pending results to check'); return; }

  console.log(`Checking results for ${articles.length} articles...`);

  let won = 0, lost = 0, pending = 0;

  for (const article of articles) {
    if (article.sport !== 'football') {
      pending++;
      continue;
    }

    const parts = article.slug.split('-vs-');
    if (parts.length < 2) continue;

    const homeTeam = parts[0].replace(/-/g, ' ');
    const awayTeam = parts[1].split('-prediction')[0].replace(/-/g, ' ');

    const result = await getMatchResult(homeTeam, awayTeam);

    if (!result) {
      pending++;
      continue;
    }

    const correct = checkPrediction(article.prediction, result);

    if (correct === null) {
      pending++;
      continue;
    }

    const resultStatus = correct ? 'won' : 'lost';
    console.log(`${article.slug.substring(0, 40)}: ${resultStatus} (${result.homeScore}-${result.awayScore})`);

    await supabase.from('articles')
      .update({ result: resultStatus })
      .eq('id', article.id);

    await updateArticleFile(article, resultStatus);

    if (correct) won++; else lost++;

    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nResults: ${won} won, ${lost} lost, ${pending} pending`);

  await supabase.from('agent_logs').insert({
    agent: 'results-agent',
    status: 'success',
    message: `Checked results: ${won} won, ${lost} lost, ${pending} pending`
  });

  console.log('Results Agent completed!');
}

runResultsAgent().catch(e => console.error('FATAL:', e.message));
