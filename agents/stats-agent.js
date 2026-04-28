require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FOOTBALL_KEY = process.env.FOOTBALL_DATA_KEY;
const ODDS_KEY = process.env.ODDS_API_KEY;

const FOOTBALL_DATA_COMPETITIONS = [
  { id: 'PL', name: 'Premier League', country: 'England' },
  { id: 'PD', name: 'La Liga', country: 'Spain' },
  { id: 'BL1', name: 'Bundesliga', country: 'Germany' },
  { id: 'SA', name: 'Serie A', country: 'Italy' },
  { id: 'FL1', name: 'Ligue 1', country: 'France' },
  { id: 'CL', name: 'Champions League', country: 'Europe' },
  { id: 'EL', name: 'Europa League', country: 'Europe' },
  { id: 'PPL', name: 'Primeira Liga', country: 'Portugal' },
  { id: 'DED', name: 'Eredivisie', country: 'Netherlands' },
  { id: 'BSA', name: 'Brasileirao', country: 'Brazil' },
];

const ODDS_API_SPORTS = [
  // Football
  { key: 'soccer_efl_champ', sport: 'football', league: 'Championship' },
  { key: 'soccer_england_league1', sport: 'football', league: 'League One' },
  { key: 'soccer_germany_bundesliga2', sport: 'football', league: 'Bundesliga 2' },
  { key: 'soccer_italy_serie_b', sport: 'football', league: 'Serie B' },
  { key: 'soccer_france_ligue_two', sport: 'football', league: 'Ligue 2' },
  { key: 'soccer_spain_segunda_division', sport: 'football', league: 'La Liga 2' },
  { key: 'soccer_uefa_europa_conference_league', sport: 'football', league: 'Conference League' },
  { key: 'soccer_conmebol_copa_libertadores', sport: 'football', league: 'Copa Libertadores' },
  { key: 'soccer_conmebol_copa_sudamericana', sport: 'football', league: 'Copa Sudamericana' },
  { key: 'soccer_turkey_super_league', sport: 'football', league: 'Super League Turkey' },
  { key: 'soccer_spl', sport: 'football', league: 'Scottish Premiership' },
  { key: 'soccer_netherlands_eredivisie', sport: 'football', league: 'Eredivisie' },
  { key: 'soccer_belgium_first_div', sport: 'football', league: 'Belgian First Division' },
  { key: 'soccer_usa_mls', sport: 'football', league: 'MLS' },
  { key: 'soccer_mexico_ligamx', sport: 'football', league: 'Liga MX' },
  { key: 'soccer_saudi_arabia_pro_league', sport: 'football', league: 'Saudi Pro League' },
  { key: 'soccer_brazil_campeonato', sport: 'football', league: 'Brasileirao' },
  { key: 'soccer_argentina_primera_division', sport: 'football', league: 'Primera Division Argentina' },
  { key: 'soccer_portugal_primeira_liga', sport: 'football', league: 'Primeira Liga' },
  { key: 'soccer_greece_super_league', sport: 'football', league: 'Super League Greece' },
  { key: 'soccer_austria_bundesliga', sport: 'football', league: 'Austrian Bundesliga' },
  { key: 'soccer_switzerland_superleague', sport: 'football', league: 'Swiss Super League' },
  // Basketball
  { key: 'basketball_nba', sport: 'basketball', league: 'NBA' },
  // NFL
  { key: 'americanfootball_nfl', sport: 'nfl', league: 'NFL' },
  // Tennis
  { key: 'tennis_atp_french_open', sport: 'tennis', league: 'Roland Garros ATP' },
  { key: 'tennis_wta_french_open', sport: 'tennis', league: 'Roland Garros WTA' },
];

const TEAM_FORM = {
  'Manchester City FC': { form: 'W-W-W-D-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None significant' },
  'Arsenal FC': { form: 'W-W-D-W-L', goals_scored: 2.1, goals_conceded: 1.0, xg: 2.0, injuries: 'Odegaard doubtful' },
  'Liverpool FC': { form: 'W-W-W-W-D', goals_scored: 2.6, goals_conceded: 0.9, xg: 2.4, injuries: 'None' },
  'Chelsea FC': { form: 'W-D-W-L-W', goals_scored: 1.9, goals_conceded: 1.2, xg: 1.8, injuries: 'None' },
  'Manchester United FC': { form: 'L-W-D-W-L', goals_scored: 1.5, goals_conceded: 1.6, xg: 1.4, injuries: 'Several out' },
  'Tottenham Hotspur FC': { form: 'L-W-D-W-L', goals_scored: 1.7, goals_conceded: 1.4, xg: 1.6, injuries: 'Son fit' },
  'Newcastle United FC': { form: 'W-W-D-W-L', goals_scored: 1.8, goals_conceded: 1.0, xg: 1.7, injuries: 'None' },
  'Aston Villa FC': { form: 'W-D-W-W-D', goals_scored: 1.9, goals_conceded: 1.1, xg: 1.8, injuries: 'None' },
  'Real Madrid CF': { form: 'W-W-W-W-D', goals_scored: 2.5, goals_conceded: 0.9, xg: 2.3, injuries: 'None' },
  'FC Barcelona': { form: 'W-W-W-D-W', goals_scored: 3.1, goals_conceded: 0.7, xg: 2.9, injuries: 'Ter Stegen out' },
  'Club Atlético de Madrid': { form: 'W-D-W-L-W', goals_scored: 1.8, goals_conceded: 0.9, xg: 1.7, injuries: 'None' },
  'FC Bayern München': { form: 'W-W-L-W-W', goals_scored: 2.9, goals_conceded: 1.2, xg: 2.7, injuries: 'None' },
  'Borussia Dortmund': { form: 'W-L-W-D-L', goals_scored: 1.9, goals_conceded: 1.5, xg: 1.8, injuries: 'None' },
  'FC Internazionale Milano': { form: 'W-W-W-D-W', goals_scored: 2.3, goals_conceded: 0.7, xg: 2.1, injuries: 'None' },
  'AC Milan': { form: 'L-W-D-W-L', goals_scored: 1.6, goals_conceded: 1.3, xg: 1.5, injuries: '3 forwards out' },
  'Juventus FC': { form: 'W-D-W-W-D', goals_scored: 1.7, goals_conceded: 0.8, xg: 1.6, injuries: 'None' },
  'Paris Saint-Germain FC': { form: 'W-W-W-W-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None' },
  'Southampton FC': { form: 'L-L-L-D-L', goals_scored: 0.8, goals_conceded: 2.1, xg: 0.9, injuries: 'Multiple out' },
  'Ipswich Town FC': { form: 'L-D-L-W-L', goals_scored: 1.0, goals_conceded: 1.8, xg: 1.0, injuries: 'None' },
  'Brentford FC': { form: 'W-D-L-W-D', goals_scored: 1.4, goals_conceded: 1.3, xg: 1.3, injuries: 'None' },
};

async function fetchFootballDataMatches() {
  const today = new Date().toISOString().split('T')[0];
  const in48h = new Date(Date.now() + 2 * 24 * 3600000).toISOString().split('T')[0];

  try {
    const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${in48h}&status=SCHEDULED,TIMED`;
    const response = await fetch(url, { headers: { 'X-Auth-Token': FOOTBALL_KEY } });
    const data = await response.json();

    if (!data.matches?.length) return [];

    console.log(`  football-data.org: ${data.matches.length} matches`);

    return data.matches.map(m => ({
      sport: 'football',
      league: m.competition?.name || 'Football',
      league_id: m.competition?.code || 'FOOT',
      country: m.competition?.area?.name || 'Unknown',
      home_team: m.homeTeam?.name || 'Unknown',
      away_team: m.awayTeam?.name || 'Unknown',
      match_date: new Date(m.utcDate).toISOString(),
      status: 'upcoming',
      home_odds: null,
      draw_odds: null,
      away_odds: null,
    }));
  } catch (err) {
    console.error('  football-data.org error:', err.message);
    return [];
  }
}

async function fetchOddsApiSport(sportInfo) {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sportInfo.key}/odds/?apiKey=${ODDS_KEY}&regions=eu,uk&markets=h2h&oddsFormat=decimal`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return [];

    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 3600000);

    const upcoming = data.filter(e => {
      const t = new Date(e.commence_time);
      return t >= now && t <= in72h;
    });

    if (upcoming.length === 0) return [];

    console.log(`  ${sportInfo.league}: ${upcoming.length} matches`);

    return upcoming.map(event => {
      const bookmaker = event.bookmakers?.[0];
      const market = bookmaker?.markets?.find(m => m.key === 'h2h');
      const outcomes = market?.outcomes || [];

      return {
        sport: sportInfo.sport,
        league: sportInfo.league,
        league_id: sportInfo.key,
        country: event.sport_title || sportInfo.league,
        home_team: event.home_team,
        away_team: event.away_team,
        match_date: new Date(event.commence_time).toISOString(),
        status: 'upcoming',
        home_odds: outcomes.find(o => o.name === event.home_team)?.price || null,
        draw_odds: outcomes.find(o => o.name === 'Draw')?.price || null,
        away_odds: outcomes.find(o => o.name === event.away_team)?.price || null,
      };
    });
  } catch (err) {
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

  await supabase.from('matches').delete().eq('status', 'upcoming');
  console.log('Cleared old upcoming matches\n');

  const allMatches = [];

  console.log('Fetching football matches from football-data.org...');
  const fdMatches = await fetchFootballDataMatches();
  allMatches.push(...fdMatches);

  console.log('\nFetching additional leagues from The Odds API...');
  for (const sportInfo of ODDS_API_SPORTS) {
    const matches = await fetchOddsApiSport(sportInfo);
    allMatches.push(...matches);
    await new Promise(r => setTimeout(r, 200));
  }

  // Remove duplicates by home_team + away_team
  const seen = new Set();
  const unique = allMatches.filter(m => {
    const key = `${m.home_team}|${m.away_team}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\nTotal unique matches: ${unique.length}`);

  let saved = 0;
  for (const match of unique) {
    const { error } = await supabase.from('matches').upsert(match, {
      onConflict: 'home_team,away_team,league'
    });
    if (!error) saved++;
  }
  console.log(`Saved ${saved} matches`);

  const teams = new Set();
  unique.forEach(m => {
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
    message: `Saved ${saved} matches from football-data.org + The Odds API`
  });

  console.log('\nStats Agent completed!');
}

runStatsAgent().catch(e => console.error('FATAL:', e.message));
