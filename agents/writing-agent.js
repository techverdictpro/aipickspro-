require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// No Claude API needed - pure algorithmic predictions

function generateSlug(home, away, league) {
  const date = new Date().toISOString().split('T')[0];
  const clean = s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${clean(home)}-vs-${clean(away)}-${clean(league)}-prediction-${date}`;
}

function determinePrediction(match, homeStats, awayStats) {
  const homeOdds = match.home_odds;
  const awayOdds = match.away_odds;
  const drawOdds = match.draw_odds;

  // No odds available
  if (!homeOdds && !awayOdds) {
    return { pick: `${match.home_team} Win`, odds: 'N/A', confidence: 2 };
  }

  // Form-based scoring
  let homeScore = 0;
  let awayScore = 0;

  if (homeStats?.form) {
    const form = homeStats.form.split('-');
    form.forEach(r => { if (r === 'W') homeScore += 3; else if (r === 'D') homeScore += 1; });
  }
  if (awayStats?.form) {
    const form = awayStats.form.split('-');
    form.forEach(r => { if (r === 'W') awayScore += 3; else if (r === 'D') awayScore += 1; });
  }

  // Goals scoring
  if (homeStats?.goals_scored) homeScore += homeStats.goals_scored * 2;
  if (homeStats?.goals_conceded) homeScore -= homeStats.goals_conceded;
  if (awayStats?.goals_scored) awayScore += awayStats.goals_scored * 2;
  if (awayStats?.goals_conceded) awayScore -= awayStats.goals_conceded;

  // Home advantage
  homeScore += 2;

  // Odds-based value check
  let pick, odds, confidence;

  if (homeOdds && awayOdds) {
    const impliedHome = 1 / homeOdds;
    const impliedAway = 1 / awayOdds;

    if (homeScore > awayScore + 3) {
      pick = `${match.home_team} Win`;
      odds = homeOdds;
      confidence = homeOdds < 1.6 ? 5 : homeOdds < 2.0 ? 4 : 3;
    } else if (awayScore > homeScore + 2) {
      pick = `${match.away_team} Win`;
      odds = awayOdds;
      confidence = awayOdds < 1.8 ? 4 : 3;
    } else if (drawOdds && Math.abs(homeScore - awayScore) < 2) {
      pick = 'Draw';
      odds = drawOdds;
      confidence = 3;
    } else if (impliedHome > impliedAway) {
      pick = `${match.home_team} Win`;
      odds = homeOdds;
      confidence = homeOdds < 1.7 ? 4 : 3;
    } else {
      pick = `${match.away_team} Win`;
      odds = awayOdds;
      confidence = awayOdds < 1.7 ? 4 : 3;
    }
  } else {
    pick = homeScore >= awayScore ? `${match.home_team} Win` : `${match.away_team} Win`;
    odds = homeOdds || awayOdds || 'N/A';
    confidence = 2;
  }

  return { pick, odds, confidence };
}

function generateAnalysis(match, homeStats, awayStats, prediction) {
  const lines = [];

  // Form
  if (homeStats?.form && awayStats?.form) {
    lines.push(`${match.home_team} form: ${homeStats.form} | ${match.away_team} form: ${awayStats.form}.`);
  }

  // Goals
  if (homeStats?.goals_scored && awayStats?.goals_scored) {
    lines.push(`Avg goals: ${match.home_team} scores ${homeStats.goals_scored}/game, concedes ${homeStats.goals_conceded || '?'}; ${match.away_team} scores ${awayStats.goals_scored}/game, concedes ${awayStats.goals_conceded || '?'}.`);
  }

  // Injuries
  if (homeStats?.injuries && homeStats.injuries !== 'None reported' && homeStats.injuries !== 'Check latest news') {
    lines.push(`${match.home_team} injuries: ${homeStats.injuries}.`);
  }
  if (awayStats?.injuries && awayStats.injuries !== 'None reported' && awayStats.injuries !== 'Check latest news') {
    lines.push(`${match.away_team} injuries: ${awayStats.injuries}.`);
  }

  // Verdict
  lines.push(`VERDICT: ${prediction.pick} @ ${prediction.odds} — confidence ${prediction.confidence}/5.`);

  return lines.join(' ');
}

function generateTitle(match, prediction) {
  const pick = prediction.pick;
  const titles = [
    `${match.home_team} vs ${match.away_team}: Prediction & Tip — ${match.league}`,
    `${pick} — ${match.home_team} vs ${match.away_team} ${match.league} Preview`,
    `${match.league}: ${match.home_team} vs ${match.away_team} — Best Bet & Odds`,
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

async function runWritingAgent() {
  console.log('Writing Agent starting (lightweight mode — no AI API)...');
  console.log('Time:', new Date().toISOString());

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true });

  if (error) { console.error('DB error:', error.message); return; }
  if (!matches?.length) { console.log('No matches found'); return; }

  const today = new Date().toISOString().split('T')[0];
  const todayStart = `${today}T00:00:00.000Z`;

  const { data: existingArticles } = await supabase
    .from('articles')
    .select('slug')
    .gte('published_at', todayStart);

  const existingSlugs = new Set((existingArticles || []).map(a => a.slug));

  const toWrite = matches.filter(m => {
    const slug = generateSlug(m.home_team, m.away_team, m.league);
    return !existingSlugs.has(slug);
  });

  if (toWrite.length === 0) {
    console.log('All matches already have predictions for today');
    return;
  }

  console.log(`Generating ${toWrite.length} predictions...\n`);

  let saved = 0;

  for (const match of toWrite) {
    const { data: homeStats } = await supabase
      .from('team_stats').select('*')
      .eq('team_name', match.home_team).single();

    const { data: awayStats } = await supabase
      .from('team_stats').select('*')
      .eq('team_name', match.away_team).single();

    const prediction = determinePrediction(match, homeStats, awayStats);
    const title = generateTitle(match, prediction);
    const slug = generateSlug(match.home_team, match.away_team, match.league);
    const analysis = generateAnalysis(match, homeStats, awayStats, prediction);
    const excerpt = `${prediction.pick} @ ${prediction.odds}`;
    const metaDesc = `${match.home_team} vs ${match.away_team} prediction for ${match.league}. Our tip: ${prediction.pick} at odds ${prediction.odds}.`;

    const matchDate = new Date(match.match_date).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const content = `${title}

${match.home_team} vs ${match.away_team} — ${match.league}
Kick-off: ${matchDate}

Odds: ${match.home_team} ${match.home_odds || 'N/A'} | Draw ${match.draw_odds || 'N/A'} | ${match.away_team} ${match.away_odds || 'N/A'}

${analysis}

VERDICT: ${prediction.pick} @ ${prediction.odds}`;

    const { error: err } = await supabase.from('articles').upsert({
      match_id: match.id,
      title,
      slug,
      sport: match.sport,
      league: match.league,
      content,
      excerpt,
      meta_description: metaDesc,
      prediction: `${prediction.pick} @ ${prediction.odds}`,
      odds: String(prediction.odds),
      confidence: prediction.confidence,
      bookmaker: 'Bet365',
      status: 'published',
      result: 'pending',
      published_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (err) {
      console.error(`Error (${match.home_team} vs ${match.away_team}):`, err.message);
    } else {
      console.log(`✓ ${match.home_team} vs ${match.away_team} — ${prediction.pick} @ ${prediction.odds}`);
      saved++;
    }
  }

  await supabase.from('agent_logs').insert({
    agent: 'writing-agent',
    status: 'success',
    message: `Generated ${saved} predictions (lightweight mode, no AI API)`
  });

  console.log(`\nWriting Agent completed! Generated ${saved} predictions.`);
}

runWritingAgent().catch(e => console.error('FATAL:', e.message));
