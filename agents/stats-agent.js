require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const matches = [
  {
    sport: 'football',
    league: 'Premier League',
    home_team: 'Manchester City',
    away_team: 'Arsenal',
    match_date: new Date(Date.now() + 3600000).toISOString(),
    home_odds: 1.72,
    draw_odds: 3.90,
    away_odds: 4.20,
    status: 'upcoming'
  },
  {
    sport: 'football',
    league: 'Champions League',
    home_team: 'Real Madrid',
    away_team: 'Bayern Munich',
    match_date: new Date(Date.now() + 86400000).toISOString(),
    home_odds: 1.95,
    draw_odds: 3.50,
    away_odds: 3.80,
    status: 'upcoming'
  },
  {
    sport: 'football',
    league: 'La Liga',
    home_team: 'Barcelona',
    away_team: 'Atletico Madrid',
    match_date: new Date(Date.now() + 86400000).toISOString(),
    home_odds: 1.85,
    draw_odds: 3.60,
    away_odds: 4.10,
    status: 'upcoming'
  },
  {
    sport: 'basketball',
    league: 'NBA',
    home_team: 'LA Lakers',
    away_team: 'Boston Celtics',
    match_date: new Date(Date.now() + 7200000).toISOString(),
    home_odds: 2.45,
    draw_odds: null,
    away_odds: 1.60,
    status: 'upcoming'
  },
  {
    sport: 'tennis',
    league: 'Roland Garros',
    home_team: 'Novak Djokovic',
    away_team: 'Carlos Alcaraz',
    match_date: new Date(Date.now() + 50400000).toISOString(),
    home_odds: 1.95,
    draw_odds: null,
    away_odds: 1.90,
    status: 'upcoming'
  },
  {
    sport: 'nfl',
    league: 'NFL',
    home_team: 'Kansas City Chiefs',
    away_team: 'Philadelphia Eagles',
    match_date: new Date(Date.now() + 79200000).toISOString(),
    home_odds: 1.91,
    draw_odds: null,
    away_odds: 1.91,
    status: 'upcoming'
  }
];

const teamStats = [
  { team_name: 'Manchester City', sport: 'football', form: 'W-W-W-D-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None significant' },
  { team_name: 'Arsenal', sport: 'football', form: 'W-W-D-W-L', goals_scored: 2.1, goals_conceded: 1.0, xg: 2.0, injuries: 'Odegaard doubtful' },
  { team_name: 'Real Madrid', sport: 'football', form: 'W-W-W-W-D', goals_scored: 2.5, goals_conceded: 0.9, xg: 2.3, injuries: 'None' },
  { team_name: 'Bayern Munich', sport: 'football', form: 'W-W-L-W-W', goals_scored: 2.9, goals_conceded: 1.2, xg: 2.7, injuries: 'Neuer fit' },
  { team_name: 'Barcelona', sport: 'football', form: 'W-W-W-D-W', goals_scored: 3.1, goals_conceded: 0.7, xg: 2.9, injuries: 'Ter Stegen out' },
  { team_name: 'LA Lakers', sport: 'basketball', form: 'W-L-W-W-L', goals_scored: 113.2, goals_conceded: 109.8, xg: null, injuries: 'LeBron questionable' },
  { team_name: 'Boston Celtics', sport: 'basketball', form: 'W-W-W-L-W', goals_scored: 118.5, goals_conceded: 107.2, xg: null, injuries: 'None' },
  { team_name: 'Novak Djokovic', sport: 'tennis', form: 'W-W-W-L-W', goals_scored: null, goals_conceded: null, xg: null, injuries: 'Knee slight concern' },
  { team_name: 'Carlos Alcaraz', sport: 'tennis', form: 'W-W-W-W-W', goals_scored: null, goals_conceded: null, xg: null, injuries: 'None' },
  { team_name: 'Kansas City Chiefs', sport: 'nfl', form: 'W-W-L-W-W', goals_scored: 27.3, goals_conceded: 18.1, xg: null, injuries: 'None significant' },
  { team_name: 'Philadelphia Eagles', sport: 'nfl', form: 'W-L-W-W-L', goals_scored: 24.1, goals_conceded: 21.3, xg: null, injuries: '2 DBs out' },
];

async function runStatsAgent() {
  console.log('Stats Agent starting...');

  try {
    // Save matches
    console.log('Saving matches to Supabase...');
    const { error: matchError } = await supabase
      .from('matches')
      .upsert(matches, { onConflict: 'home_team,away_team,match_date' });

    if (matchError) {
      console.error('Match error:', matchError.message);
    } else {
      console.log(`Saved ${matches.length} matches`);
    }

    // Save team stats
    console.log('Saving team stats...');
    for (const stat of teamStats) {
      const { error } = await supabase
        .from('team_stats')
        .upsert(stat, { onConflict: 'team_name,sport' });
      if (error) console.error('Stat error:', error.message);
    }
    console.log(`Saved ${teamStats.length} team stats`);

    // Log success
    await supabase.from('agent_logs').insert({
      agent: 'stats-agent',
      status: 'success',
      message: `Saved ${matches.length} matches and ${teamStats.length} team stats`
    });

    console.log('Stats Agent completed successfully!');

  } catch (err) {
    console.error('Stats Agent failed:', err.message);
    await supabase.from('agent_logs').insert({
      agent: 'stats-agent',
      status: 'error',
      message: err.message
    });
  }
}

runStatsAgent();