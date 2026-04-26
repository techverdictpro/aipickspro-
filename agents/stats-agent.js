require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_BASE = 'https://api.the-odds-api.com/v4';

const SPORTS = [
  { key: 'soccer_epl', sport: 'football', league: 'Premier League' },
  { key: 'soccer_spain_la_liga', sport: 'football', league: 'La Liga' },
  { key: 'soccer_germany_bundesliga', sport: 'football', league: 'Bundesliga' },
  { key: 'soccer_italy_serie_a', sport: 'football', league: 'Serie A' },
  { key: 'soccer_france_ligue_one', sport: 'football', league: 'Ligue 1' },
  { key: 'soccer_uefa_champs_league', sport: 'football', league: 'Champions League' },
  { key: 'basketball_nba', sport: 'basketball', league: 'NBA' },
  { key: 'americanfootball_nfl', sport: 'nfl', league: 'NFL' },
];

const TEAM_FORM = {
  'Manchester City': { form: 'W-W-W-D-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None significant' },
  'Arsenal': { form: 'W-W-D-W-L', goals_scored: 2.1, goals_conceded: 1.0, xg: 2.0, injuries: 'Odegaard doubtful' },
  'Liverpool': { form: 'W-W-W-W-D', goals_scored: 2.6, goals_conceded: 0.9, xg: 2.4, injuries: 'None' },
  'Chelsea': { form: 'W-D-W-L-W', goals_scored: 1.9, goals_conceded: 1.2, xg: 1.8, injuries: 'None' },
  'Manchester United': { form: 'L-W-D-W-L', goals_scored: 1.5, goals_conceded: 1.6, xg: 1.4, injuries: 'Several key players out' },
  'Tottenham': { form: 'L-W-D-W-L', goals_scored: 1.7, goals_conceded: 1.4, xg: 1.6, injuries: 'Son fit' },
  'Brentford': { form: 'W-D-L-W-D', goals_scored: 1.4, goals_conceded: 1.3, xg: 1.3, injuries: 'None' },
  'Newcastle United': { form: 'W-W-D-W-L', goals_scored: 1.8, goals_conceded: 1.0, xg: 1.7, injuries: 'None' },
  'Aston Villa': { form: 'W-D-W-W-D', goals_scored: 1.9, goals_conceded: 1.1, xg: 1.8, injuries: 'None' },
  'Real Madrid': { form: 'W-W-W-W-D', goals_scored: 2.5, goals_conceded: 0.9, xg: 2.3, injuries: 'None' },
  'Barcelona': { form: 'W-W-W-D-W', goals_scored: 3.1, goals_conceded: 0.7, xg: 2.9, injuries: 'Ter Stegen out' },
  'Atletico Madrid': { form: 'W-D-W-L-W', goals_scored: 1.8, goals_conceded: 0.9, xg: 1.7, injuries: 'None' },
  'Bayern Munich': { form: 'W-W-L-W-W', goals_scored: 2.9, goals_conceded: 1.2, xg: 2.7, injuries: 'None' },
  'Borussia Dortmund': { form: 'W-L-W-D-L', goals_scored: 1.9, goals_conceded: 1.5, xg: 1.8, injuries: 'None' },
  'Inter Milan': { form: 'W-W-W-D-W', goals_scored: 2.3, goals_conceded: 0.7, xg: 2.1, injuries: 'None' },
  'AC Milan': { form: 'L-W-D-W-L', goals_scored: 1.6, goals_conceded: 1.3, xg: 1.5, injuries: '3 forwards out' },
  'PSG': { form: 'W-W-W-W-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None' },
  'LA Lakers': { form: 'W-L-W-W-L', goals_scored: 113.2, goals_conceded: 109.8, xg: null, injuries: 'LeBron questionable' },
  'Boston Celtics': { form: 'W-W-W-L-W', goals_scored: 118.5, goals_conceded: 107.2, xg: null, injuries: 'None' },
  'Golden State Warriors': { form: 'L-W-L-W-W', goals_scored: 110.3, goals_conceded: 112.1, xg: null, injuries: 'Curry fit' },
  'Kansas City Chiefs': { form: 'W-W-L-W-W', goals_scored: 27.3, goals_conceded: 18.1, xg: null, injuries: 'None' },
  'Philadelphia Eagles': { form: 'W-L-W-W-L', goals_scored: 24.1, goals_conceded: 21.3, xg: null, injuries: '2 DBs out' },
};

async function fetchOddsForSport(sportKey, sportInfo) {
  try {
    const url = `${ODDS_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=eu,uk&markets=h2h&oddsFormat=decimal`;
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`  ${sportInfo.league}: API error ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`  ${sportInfo.league}: No matches`);
      return [];
    }

    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 3600000);

    const upcoming = data.filter(event => {
      const matchTime = new Date(event.commence_time);
      return matchTime >= now && matchTime <= in48h;
    });

    const toProcess = upcoming.length > 0 ? upcoming.slice(0, 4) : data.slice(0, 3);

    const matches = toProcess.map(event => {
      const bookmaker = event.bookmakers?.[0];
      const market = bookmaker?.markets?.find(m => m.key === 'h2h');
      const outcomes = market?.outcomes || [];

      const homeOdds = outcomes.find(o => o.name === event.home_team)?.price || null;
      const awayOdds = outcomes.find(o => o.name === event.away_team)?.price || null;
      const drawOdds = outcomes.find(o => o.name === 'Draw')?.price || null;

      return {
        sport: sportInfo.sport,
        league: sportInfo.league,
        league_id: sportKey,
        country: event.sport_title || sportInfo.league,
        home_team: event.home_team,
        away_team: event.away_team,
        match_date: new Date(event.commence_time).toISOString(),
        status: 'upcoming',
        home_odds: homeOdds ? parseFloat(homeOdds.toFixed(2)) : null,
        draw_odds: drawOdds ? parseFloat(drawOdds.toFixed(2)) : null,
        away_odds: awayOdds ? parseFloat(awayOdds.toFixed(2)) : null,
      };
    });

    console.log(`  ${sportInfo.league}: ${matches.length} matches`);
    return matches;

  } catch (err) {
    console.error(`  ${sportInfo.league} error:`, err.message);
    return [];
  }
}

async function saveTeamStats(teamName, sport) {
  const stats = TEAM_FORM[teamName] || {
    form: 'Unknown',
    goals_scored: null,
    goals_conceded: null,
    xg: null,
    injuries: 'Check latest news',
  };

  await supabase.from('team_stats').upsert({
    team_name: teamName,
    sport,
    ...stats,
    updated_at: new Date().toISOString()
  }, { onConflict: 'team_name,sport' });
}

async function runStatsAgent() {
  console.log('Stats Agent starting...');
  console.log('Time:', new Date().toISOString());
  console.log('Fetching real matches from The Odds API...\n');

  const allMatches = [];

  for (const sportInfo of SPORTS) {
    const matches = await fetchOddsForSport(sportInfo.key, sportInfo);
    allMatches.push(...matches);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nTotal matches found: ${allMatches.length}`);

  if (allMatches.length === 0) {
    console.log('No matches found from API');
    return;
  }

  for (const match of allMatches) {
    const { error } = await supabase.from('matches').upsert(match, {
      onConflict: 'home_team,away_team,league'
    });
    if (error) console.error(`Match error (${match.home_team} vs ${match.away_team}):`, error.message);
  }
  console.log(`Saved ${allMatches.length} matches`);

  const teams = new Set();
  allMatches.forEach(m => {
    teams.add(JSON.stringify({ name: m.home_team, sport: m.sport }));
    teams.add(JSON.stringify({ name: m.away_team, sport: m.sport }));
  });

  for (const teamJson of teams) {
    const { name, sport } = JSON.parse(teamJson);
    await saveTeamStats(name, sport);
  }
  console.log(`Saved stats for ${teams.size} teams`);

  await supabase.from('agent_logs').insert({
    agent: 'stats-agent',
    status: 'success',
    message: `Saved ${allMatches.length} real matches from The Odds API`
  });

  console.log('\nStats Agent completed!');
}

runStatsAgent().catch(e => console.error('FATAL:', e.message));
