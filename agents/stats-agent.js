require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = 'https://free-api-live-football-data.p.rapidapi.com';

const HEADERS = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
};

// Leagues to track with categories
const LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England', category: 'football', sport: 'football' },
  { id: 140, name: 'La Liga', country: 'Spain', category: 'football', sport: 'football' },
  { id: 78, name: 'Bundesliga', country: 'Germany', category: 'football', sport: 'football' },
  { id: 135, name: 'Serie A', country: 'Italy', category: 'football', sport: 'football' },
  { id: 61, name: 'Ligue 1', country: 'France', category: 'football', sport: 'football' },
  { id: 2, name: 'Champions League', country: 'Europe', category: 'football', sport: 'football' },
  { id: 3, name: 'Europa League', country: 'Europe', category: 'football', sport: 'football' },
  { id: 848, name: 'Conference League', country: 'Europe', category: 'football', sport: 'football' },
  { id: 172, name: 'Efbet Liga', country: 'Bulgaria', category: 'football', sport: 'football' },
];

async function fetchUpcomingMatches(leagueId, season) {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const from = today.toISOString().split('T')[0];
    const to = tomorrow.toISOString().split('T')[0];

    const url = `${BASE_URL}/fixtures?league=${leagueId}&season=${season}&from=${from}&to=${to}&status=NS`;

    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();

    if (!data.response || data.response.length === 0) return [];

    return data.response.map((fixture) => ({
      external_id: fixture.fixture.id.toString(),
      sport: 'football',
      league: fixture.league.name,
      league_id: leagueId.toString(),
      country: fixture.league.country,
      home_team: fixture.teams.home.name,
      away_team: fixture.teams.away.name,
      match_date: new Date(fixture.fixture.date).toISOString(),
      status: 'upcoming',
      home_odds: null,
      draw_odds: null,
      away_odds: null,
    }));
  } catch (err) {
    console.error(`Error fetching league ${leagueId}:`, err.message);
    return [];
  }
}

async function fetchOdds(fixtureId) {
  try {
    const url = `${BASE_URL}/odds?fixture=${fixtureId}&bookmaker=6`;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();

    if (!data.response || data.response.length === 0) return null;

    const bookmaker = data.response[0]?.bookmakers?.[0];
    if (!bookmaker) return null;

    const market = bookmaker.bets?.find(b => b.name === 'Match Winner');
    if (!market) return null;

    const home = market.values?.find(v => v.value === 'Home')?.odd;
    const draw = market.values?.find(v => v.value === 'Draw')?.odd;
    const away = market.values?.find(v => v.value === 'Away')?.odd;

    return {
      home_odds: home ? parseFloat(home) : null,
      draw_odds: draw ? parseFloat(draw) : null,
      away_odds: away ? parseFloat(away) : null,
    };
  } catch (err) {
    return null;
  }
}

async function fetchTeamStats(teamId, leagueId, season) {
  try {
    const url = `${BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();

    if (!data.response) return null;

    const stats = data.response;
    const played = stats.fixtures?.played?.home + stats.fixtures?.played?.away || 1;
    const goalsScored = stats.goals?.for?.total?.total || 0;
    const goalsConceded = stats.goals?.against?.total?.total || 0;

    const form = stats.form ? stats.form.slice(-5) : 'UNKNOWN';

    return {
      goals_scored: parseFloat((goalsScored / played).toFixed(2)),
      goals_conceded: parseFloat((goalsConceded / played).toFixed(2)),
      form: form,
      xg: null,
      injuries: 'Check latest team news',
    };
  } catch (err) {
    return null;
  }
}

// Fallback static data when API limits reached
const STATIC_MATCHES = [
  {
    sport: 'football', league: 'Premier League', league_id: '39', country: 'England',
    home_team: 'Manchester City', away_team: 'Arsenal',
    match_date: new Date(Date.now() + 3600000 * 8).toISOString(),
    home_odds: 1.72, draw_odds: 3.90, away_odds: 4.20, status: 'upcoming'
  },
  {
    sport: 'football', league: 'Champions League', league_id: '2', country: 'Europe',
    home_team: 'Real Madrid', away_team: 'Bayern Munich',
    match_date: new Date(Date.now() + 3600000 * 32).toISOString(),
    home_odds: 1.95, draw_odds: 3.50, away_odds: 3.80, status: 'upcoming'
  },
  {
    sport: 'football', league: 'La Liga', league_id: '140', country: 'Spain',
    home_team: 'Barcelona', away_team: 'Atletico Madrid',
    match_date: new Date(Date.now() + 3600000 * 30).toISOString(),
    home_odds: 1.85, draw_odds: 3.60, away_odds: 4.10, status: 'upcoming'
  },
  {
    sport: 'football', league: 'Bundesliga', league_id: '78', country: 'Germany',
    home_team: 'Bayern Munich', away_team: 'Borussia Dortmund',
    match_date: new Date(Date.now() + 3600000 * 48).toISOString(),
    home_odds: 1.55, draw_odds: 4.20, away_odds: 5.50, status: 'upcoming'
  },
  {
    sport: 'football', league: 'Serie A', league_id: '135', country: 'Italy',
    home_team: 'Inter Milan', away_team: 'AC Milan',
    match_date: new Date(Date.now() + 3600000 * 48).toISOString(),
    home_odds: 1.95, draw_odds: 3.40, away_odds: 3.80, status: 'upcoming'
  },
  {
    sport: 'basketball', league: 'NBA', league_id: 'nba', country: 'USA',
    home_team: 'LA Lakers', away_team: 'Boston Celtics',
    match_date: new Date(Date.now() + 3600000 * 12).toISOString(),
    home_odds: 2.45, draw_odds: null, away_odds: 1.60, status: 'upcoming'
  },
  {
    sport: 'tennis', league: 'ATP Tour', league_id: 'atp', country: 'International',
    home_team: 'Novak Djokovic', away_team: 'Carlos Alcaraz',
    match_date: new Date(Date.now() + 3600000 * 16).toISOString(),
    home_odds: 1.95, draw_odds: null, away_odds: 1.90, status: 'upcoming'
  },
  {
    sport: 'nfl', league: 'NFL', league_id: 'nfl', country: 'USA',
    home_team: 'Kansas City Chiefs', away_team: 'Philadelphia Eagles',
    match_date: new Date(Date.now() + 3600000 * 24).toISOString(),
    home_odds: 1.91, draw_odds: null, away_odds: 1.91, status: 'upcoming'
  },
];

const STATIC_TEAM_STATS = [
  { team_name: 'Manchester City', sport: 'football', form: 'W-W-W-D-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None significant' },
  { team_name: 'Arsenal', sport: 'football', form: 'W-W-D-W-L', goals_scored: 2.1, goals_conceded: 1.0, xg: 2.0, injuries: 'Odegaard doubtful' },
  { team_name: 'Real Madrid', sport: 'football', form: 'W-W-W-W-D', goals_scored: 2.5, goals_conceded: 0.9, xg: 2.3, injuries: 'None' },
  { team_name: 'Bayern Munich', sport: 'football', form: 'W-W-L-W-W', goals_scored: 2.9, goals_conceded: 1.2, xg: 2.7, injuries: 'Neuer fit' },
  { team_name: 'Barcelona', sport: 'football', form: 'W-W-W-D-W', goals_scored: 3.1, goals_conceded: 0.7, xg: 2.9, injuries: 'Ter Stegen out' },
  { team_name: 'Atletico Madrid', sport: 'football', form: 'W-D-W-L-W', goals_scored: 1.8, goals_conceded: 0.9, xg: 1.7, injuries: 'None' },
  { team_name: 'Inter Milan', sport: 'football', form: 'W-W-W-D-W', goals_scored: 2.3, goals_conceded: 0.7, xg: 2.1, injuries: 'None' },
  { team_name: 'AC Milan', sport: 'football', form: 'L-W-D-W-L', goals_scored: 1.6, goals_conceded: 1.3, xg: 1.5, injuries: '3 forwards out' },
  { team_name: 'Borussia Dortmund', sport: 'football', form: 'W-L-W-D-L', goals_scored: 1.9, goals_conceded: 1.5, xg: 1.8, injuries: 'None' },
  { team_name: 'LA Lakers', sport: 'basketball', form: 'W-L-W-W-L', goals_scored: 113.2, goals_conceded: 109.8, xg: null, injuries: 'LeBron questionable' },
  { team_name: 'Boston Celtics', sport: 'basketball', form: 'W-W-W-L-W', goals_scored: 118.5, goals_conceded: 107.2, xg: null, injuries: 'None' },
  { team_name: 'Novak Djokovic', sport: 'tennis', form: 'W-W-W-L-W', goals_scored: null, goals_conceded: null, xg: null, injuries: 'Knee slight concern' },
  { team_name: 'Carlos Alcaraz', sport: 'tennis', form: 'W-W-W-W-W', goals_scored: null, goals_conceded: null, xg: null, injuries: 'None' },
  { team_name: 'Kansas City Chiefs', sport: 'nfl', form: 'W-W-L-W-W', goals_scored: 27.3, goals_conceded: 18.1, xg: null, injuries: 'None significant' },
  { team_name: 'Philadelphia Eagles', sport: 'nfl', form: 'W-L-W-W-L', goals_scored: 24.1, goals_conceded: 21.3, xg: null, injuries: '2 DBs out' },
];

async function tryRealAPI() {
  if (!API_KEY) {
    console.log('No API key — using static data');
    return false;
  }

  try {
    const season = new Date().getFullYear();
    const url = `${BASE_URL}/fixtures?league=39&season=${season}&next=3`;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.log('API error — using static data:', JSON.stringify(data.errors));
      return false;
    }

    if (!data.response || data.response.length === 0) {
      console.log('No API data — using static data');
      return false;
    }

    return true;
  } catch (err) {
    console.log('API unavailable — using static data');
    return false;
  }
}

async function runStatsAgent() {
  console.log('Stats Agent starting...');
  console.log('Time:', new Date().toISOString());

  const useRealAPI = await tryRealAPI();

  if (useRealAPI) {
    console.log('Using REAL API data...');
    const season = new Date().getFullYear();
    const allMatches = [];

    for (const league of LEAGUES) {
      console.log(`Fetching ${league.name}...`);
      const matches = await fetchUpcomingMatches(league.id, season);
      allMatches.push(...matches);
      await new Promise(r => setTimeout(r, 500));
    }

    if (allMatches.length > 0) {
      const { error } = await supabase.from('matches').upsert(allMatches, { onConflict: 'external_id' });
      if (error) console.error('Match upsert error:', error.message);
      else console.log(`Saved ${allMatches.length} real matches`);
    }
  } else {
    console.log('Using STATIC data...');

    const { error: matchError } = await supabase
      .from('matches')
      .upsert(STATIC_MATCHES, { onConflict: 'home_team,away_team,league' });

    if (matchError) console.error('Match error:', matchError.message);
    else console.log(`Saved ${STATIC_MATCHES.length} static matches`);

    for (const stat of STATIC_TEAM_STATS) {
      const { error } = await supabase
        .from('team_stats')
        .upsert(stat, { onConflict: 'team_name,sport' });
      if (error) console.error('Stat error:', error.message);
    }
    console.log(`Saved ${STATIC_TEAM_STATS.length} team stats`);
  }

  await supabase.from('agent_logs').insert({
    agent: 'stats-agent',
    status: 'success',
    message: `Stats Agent completed. API: ${useRealAPI}`
  });

  console.log('Stats Agent completed!');
}

runStatsAgent().catch(e => console.error('FATAL:', e.message));