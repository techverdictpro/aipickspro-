require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function generateSlug(home, away, league) {
  const date = new Date().toISOString().split('T')[0];
  const clean = s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${clean(home)}-vs-${clean(away)}-${clean(league)}-prediction-${date}`;
}

function determinePrediction(match, homeStats, awayStats) {
  const homeOdds = match.home_odds ? parseFloat(match.home_odds) : null;
  const awayOdds = match.away_odds ? parseFloat(match.away_odds) : null;
  const drawOdds = match.draw_odds ? parseFloat(match.draw_odds) : null;

  // Score based on stats
  let homeScore = 5; // home advantage
  let awayScore = 0;

  if (homeStats?.form) {
    homeStats.form.split('-').forEach(r => {
      if (r === 'W') homeScore += 3;
      else if (r === 'D') homeScore += 1;
    });
  }
  if (awayStats?.form) {
    awayStats.form.split('-').forEach(r => {
      if (r === 'W') awayScore += 3;
      else if (r === 'D') awayScore += 1;
    });
  }
  if (homeStats?.goals_scored) homeScore += parseFloat(homeStats.goals_scored) * 2;
  if (homeStats?.goals_conceded) homeScore -= parseFloat(homeStats.goals_conceded);
  if (awayStats?.goals_scored) awayScore += parseFloat(awayStats.goals_scored) * 2;
  if (awayStats?.goals_conceded) awayScore -= parseFloat(awayStats.goals_conceded);

  let pick, odds, confidence;

  // Use odds if available for pick
  if (homeOdds && awayOdds) {
    if (homeScore > awayScore + 3) {
      pick = `${match.home_team} Win`;
      odds = homeOdds.toFixed(2);
      confidence = homeOdds < 1.5 ? 5 : homeOdds < 1.8 ? 4 : 3;
    } else if (awayScore > homeScore + 2) {
      pick = `${match.away_team} Win`;
      odds = awayOdds.toFixed(2);
      confidence = awayOdds < 1.8 ? 4 : 3;
    } else if (drawOdds && Math.abs(homeScore - awayScore) < 2) {
      pick = 'Draw';
      odds = drawOdds.toFixed(2);
      confidence = 3;
    } else if (homeOdds <= awayOdds) {
      pick = `${match.home_team} Win`;
      odds = homeOdds.toFixed(2);
      confidence = homeOdds < 1.6 ? 4 : 3;
    } else {
      pick = `${match.away_team} Win`;
      odds = awayOdds.toFixed(2);
      confidence = awayOdds < 1.6 ? 4 : 3;
    }
  } else {
    // No odds - use stats only
    if (homeScore > awayScore + 3) {
      pick = `${match.home_team} Win`;
      confidence = 4;
    } else if (awayScore > homeScore + 2) {
      pick = `${match.away_team} Win`;
      confidence = 3;
    } else {
      pick = `${match.home_team} Win`;
      confidence = 2;
    }
    odds = null;
  }

  return { pick, odds, confidence };
}

function buildContent(match, homeStats, awayStats, prediction) {
  const matchDate = new Date(match.match_date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });

  const lines = [
    `${match.home_team} vs ${match.away_team} — ${match.league}`,
    `Kick-off: ${matchDate} UTC`,
    ``,
  ];

  if (match.home_odds && match.away_odds) {
    lines.push(`Odds: ${match.home_team} @ ${match.home_odds} | Draw @ ${match.draw_odds || 'N/A'} | ${match.away_team} @ ${match.away_odds}`);
    lines.push('');
  }

  if (homeStats?.form && homeStats.form !== 'Unknown' && awayStats?.form && awayStats.form !== 'Unknown') {
    lines.push(`Form: ${match.home_team} ${homeStats.form} | ${match.away_team} ${awayStats.form}`);
  }

  if (homeStats?.goals_scored && awayStats?.goals_scored) {
    lines.push(`Goals/game: ${match.home_team} ${homeStats.goals_scored} scored, ${homeStats.goals_conceded || '?'} conceded | ${match.away_team} ${awayStats.goals_scored} scored, ${awayStats.goals_conceded || '?'} conceded`);
  }

  if (homeStats?.injuries && !['None reported', 'Check latest news', 'Check news', 'None'].includes(homeStats.injuries)) {
    lines.push(`${match.home_team} injuries: ${homeStats.injuries}`);
  }

  if (awayStats?.injuries && !['None reported', 'Check latest news', 'Check news', 'None'].includes(awayStats.injuries)) {
    lines.push(`${match.away_team} injuries: ${awayStats.injuries}`);
  }

  lines.push('');
  if (prediction.odds) {
    lines.push(`VERDICT: ${prediction.pick} @ ${prediction.odds} — Confidence: ${prediction.confidence}/5`);
  } else {
    lines.push(`VERDICT: ${prediction.pick} — Confidence: ${prediction.confidence}/5`);
  }

  return lines.join('\n');
}

async function runWritingAgent() {
  console.log('Writing Agent starting...');
  console.log('Time:', new Date().toISOString());

  // Get ALL upcoming matches (with or without odds)
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true });

  if (error) { console.error('DB error:', error.message); return; }
  if (!matches?.length) { console.log('No matches found'); return; }

  console.log(`Found ${matches.length} matches`);

  const today = new Date().toISOString().split('T')[0];
  const todayStart = `${today}T00:00:00.000Z`;

  const { data: existing } = await supabase
    .from('articles')
    .select('slug')
    .gte('published_at', todayStart);

  const existingSlugs = new Set((existing || []).map(a => a.slug));

  const toWrite = matches.filter(m => {
    const slug = generateSlug(m.home_team, m.away_team, m.league);
    return !existingSlugs.has(slug);
  });

  if (toWrite.length === 0) {
    console.log('All matches already have predictions for today');
    return;
  }

  console.log(`Generating ${toWrite.length} new predictions...\n`);
  let saved = 0;

  for (const match of toWrite) {
    const { data: homeStats } = await supabase
      .from('team_stats').select('*').eq('team_name', match.home_team).single();
    const { data: awayStats } = await supabase
      .from('team_stats').select('*').eq('team_name', match.away_team).single();

    const prediction = determinePrediction(match, homeStats, awayStats);
    const slug = generateSlug(match.home_team, match.away_team, match.league);
    const title = `${match.home_team} vs ${match.away_team} Prediction — ${match.league}`;
    const content = buildContent(match, homeStats, awayStats, prediction);

    const predStr = prediction.odds
      ? `${prediction.pick} @ ${prediction.odds}`
      : prediction.pick;

    const { error: err } = await supabase.from('articles').upsert({
      match_id: match.id,
      title,
      slug,
      sport: match.sport,
      league: match.league,
      content,
      excerpt: predStr,
      meta_description: `${match.home_team} vs ${match.away_team} prediction — ${match.league}. Tip: ${predStr}.`,
      prediction: predStr,
      odds: prediction.odds || null,
      confidence: prediction.confidence,
      bookmaker: 'Bet365',
      status: 'published',
      result: 'pending',
      github_published: false,
      published_at: new Date().toISOString()
    }, { onConflict: 'slug' });

    if (!err) {
      console.log(`✓ ${match.home_team} vs ${match.away_team} — ${predStr}`);
      saved++;
    } else {
      console.error(`✗ ${err.message}`);
    }
  }

  await supabase.from('agent_logs').insert({
    agent: 'writing-agent',
    status: 'success',
    message: `Generated ${saved} predictions`
  });

  console.log(`\nCompleted! Generated ${saved} predictions.`);
}

runWritingAgent().catch(e => console.error('FATAL:', e.message));
