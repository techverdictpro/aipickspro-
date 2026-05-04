require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FOOTBALL_KEY = process.env.FOOTBALL_DATA_KEY;
const ODDS_KEY = process.env.ODDS_API_KEY;

// All sports from The Odds API with odds
const ODDS_API_SPORTS = [
  // Top Football
  { key: 'soccer_epl', sport: 'football', league: 'Premier League' },
  { key: 'soccer_spain_la_liga', sport: 'football', league: 'La Liga' },
  { key: 'soccer_germany_bundesliga', sport: 'football', league: 'Bundesliga' },
  { key: 'soccer_italy_serie_a', sport: 'football', league: 'Serie A' },
  { key: 'soccer_france_ligue_one', sport: 'football', league: 'Ligue 1' },
  { key: 'soccer_uefa_champs_league', sport: 'football', league: 'Champions League' },
  { key: 'soccer_uefa_europa_league', sport: 'football', league: 'Europa League' },
  { key: 'soccer_uefa_europa_conference_league', sport: 'football', league: 'Conference League' },
  // Lower divisions
  { key: 'soccer_efl_champ', sport: 'football', league: 'Championship' },
  { key: 'soccer_england_league1', sport: 'football', league: 'League One' },
  { key: 'soccer_germany_bundesliga2', sport: 'football', league: 'Bundesliga 2' },
  { key: 'soccer_italy_serie_b', sport: 'football', league: 'Serie B' },
  { key: 'soccer_france_ligue_two', sport: 'football', league: 'Ligue 2' },
  { key: 'soccer_spain_segunda_division', sport: 'football', league: 'La Liga 2' },
  // Other European
  { key: 'soccer_portugal_primeira_liga', sport: 'football', league: 'Primeira Liga' },
  { key: 'soccer_netherlands_eredivisie', sport: 'football', league: 'Eredivisie' },
  { key: 'soccer_spl', sport: 'football', league: 'Scottish Premiership' },
  { key: 'soccer_turkey_super_league', sport: 'football', league: 'Super Lig Turkey' },
  { key: 'soccer_belgium_first_div', sport: 'football', league: 'Belgian First Division' },
  { key: 'soccer_greece_super_league', sport: 'football', league: 'Super League Greece' },
  { key: 'soccer_austria_bundesliga', sport: 'football', league: 'Austrian Bundesliga' },
  // Americas
  { key: 'soccer_conmebol_copa_libertadores', sport: 'football', league: 'Copa Libertadores' },
  { key: 'soccer_conmebol_copa_sudamericana', sport: 'football', league: 'Copa Sudamericana' },
  { key: 'soccer_usa_mls', sport: 'football', league: 'MLS' },
  { key: 'soccer_mexico_ligamx', sport: 'football', league: 'Liga MX' },
  { key: 'soccer_brazil_campeonato', sport: 'football', league: 'Brasileirao' },
  { key: 'soccer_argentina_primera_division', sport: 'football', league: 'Primera Division Argentina' },
  // Middle East / Asia
  { key: 'soccer_saudi_arabia_pro_league', sport: 'football', league: 'Saudi Pro League' },
  // Other Sports
  { key: 'basketball_nba', sport: 'basketball', league: 'NBA' },
  { key: 'americanfootball_nfl', sport: 'nfl', league: 'NFL' },
  { key: 'tennis_atp_french_open', sport: 'tennis', league: 'Roland Garros ATP' },
  { key: 'tennis_wta_french_open', sport: 'tennis', league: 'Roland Garros WTA' },
];

// Football competitions from football-data.org (backup for matches without odds)
const FOOTBALL_DATA_COMPS = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL', 'EL', 'PPL', 'DED', 'BSA', 'CLI'];

const TEAM_FORM = {
  'Manchester City FC': { form: 'W-W-W-D-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None significant' },
  'Arsenal FC': { form: 'W-W-D-W-L', goals_scored: 2.1, goals_conceded: 1.0, xg: 2.0, injuries: 'Odegaard doubtful' },
  'Liverpool FC': { form: 'W-W-W-W-D', goals_scored: 2.6, goals_conceded: 0.9, xg: 2.4, injuries: 'None' },
  'Chelsea FC': { form: 'W-D-W-L-W', goals_scored: 1.9, goals_conceded: 1.2, xg: 1.8, injuries: 'None' },
  'Manchester United FC': { form: 'L-W-D-W-L', goals_scored: 1.5, goals_conceded: 1.6, xg: 1.4, injuries: 'Several out' },
  'Tottenham Hotspur FC': { form: 'L-W-D-W-L', goals_scored: 1.7, goals_conceded: 1.4, xg: 1.6, injuries: 'Son fit' },
  'Newcastle United FC': { form: 'W-W-D-W-L', goals_scored: 1.8, goals_conceded: 1.0, xg: 1.7, injuries: 'None' },
  'Aston Villa FC': { form: 'W-D-W-W-D', goals_scored: 1.9, goals_conceded: 1.1, xg: 1.8, injuries: 'None' },
  'Brentford FC': { form: 'W-D-L-W-D', goals_scored: 1.4, goals_conceded: 1.3, xg: 1.3, injuries: 'None' },
  'Real Madrid CF': { form: 'W-W-W-W-D', goals_scored: 2.5, goals_conceded: 0.9, xg: 2.3, injuries: 'None' },
  'FC Barcelona': { form: 'W-W-W-D-W', goals_scored: 3.1, goals_conceded: 0.7, xg: 2.9, injuries: 'None' },
  'Club Atlético de Madrid': { form: 'W-D-W-L-W', goals_scored: 1.8, goals_conceded: 0.9, xg: 1.7, injuries: 'None' },
  'FC Bayern München': { form: 'W-W-L-W-W', goals_scored: 2.9, goals_conceded: 1.2, xg: 2.7, injuries: 'None' },
  'Borussia Dortmund': { form: 'W-L-W-D-L', goals_scored: 1.9, goals_conceded: 1.5, xg: 1.8, injuries: 'None' },
  'FC Internazionale Milano': { form: 'W-W-W-D-W', goals_scored: 2.3, goals_conceded: 0.7, xg: 2.1, injuries: 'None' },
  'AC Milan': { form: 'L-W-D-W-L', goals_scored: 1.6, goals_conceded: 1.3, xg: 1.5, injuries: 'None' },
  'Juventus FC': { form: 'W-D-W-W-D', goals_scored: 1.7, goals_conceded: 0.8, xg: 1.6, injuries: 'None' },
  'Paris Saint-Germain FC': { form: 'W-W-W-W-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None' },
};

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

    const matches = upcoming.map(event => {
      const bookmaker = event.bookmakers?.[0];
      const market = bookmaker?.markets?.find(m => m.key === 'h2h');
      const outcomes = market?.outcomes || [];

      const homeOdds = outcomes.find(o => o.name === event.home_team)?.price || null;
      const awayOdds = outcomes.find(o => o.name === event.away_team)?.price || null;
      const drawOdds = outcomes.find(o => o.name === 'Draw')?.price || null;

      return {
        sport: sportInfo.sport,
        league: sportInfo.league,
        league_id: sportInfo.key,
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

    if (matches.length > 0) console.log(`  ${sportInfo.league}: ${matches.length} matches with odds`);
    return matches;

  } catch (err) {
    return [];
  }
}

async function fetchFootballDataMatches(existingKeys) {
  const today = new Date().toISOString().split('T')[0];
  const in48h = new Date(Date.now() + 2 * 24 * 3600000).toISOString().split('T')[0];

  try {
    const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${in48h}&status=SCHEDULED,TIMED`;
    const response = await fetch(url, { headers: { 'X-Auth-Token': FOOTBALL_KEY } });
    const data = await response.json();

    if (!data.matches?.length) return [];

    // Only add matches NOT already covered by The Odds API
    const newMatches = data.matches.filter(m => {
      const key = `${m.homeTeam?.name}|${m.awayTeam?.name}`;
      return !existingKeys.has(key);
    });

    console.log(`  football-data.org: ${newMatches.length} additional matches (no odds)`);

    return newMatches.map(m => ({
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
  console.log('Cleared old matches\n');

  const allMatches = [];

  // Step 1: Fetch from The Odds API (with real odds)
  console.log('Fetching matches with odds from The Odds API...');
  for (const sportInfo of ODDS_API_SPORTS) {
    const matches = await fetchOddsApiSport(sportInfo);
    allMatches.push(...matches);
    await new Promise(r => setTimeout(r, 150));
  }

  // Step 2: Fetch from football-data.org (fills in matches without odds)
  const existingKeys = new Set(allMatches.map(m => `${m.home_team}|${m.away_team}`));
  console.log('\nFetching additional matches from football-data.org...');
  const fdMatches = await fetchFootballDataMatches(existingKeys);
  allMatches.push(...fdMatches);

  // Deduplicate
  const seen = new Set();
  const unique = allMatches.filter(m => {
    const key = `${m.home_team}|${m.away_team}|${m.league}`;
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

  // Save team stats
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
    message: `Saved ${saved} matches (${allMatches.filter(m => m.home_odds).length} with odds)`
  });

  console.log('\nStats Agent completed!');
}

runStatsAgent().catch(e => console.error('FATAL:', e.message));
