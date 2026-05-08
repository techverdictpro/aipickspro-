require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const APISPORTS_KEY = process.env.APISPORTS_KEY;
const FOOTBALL_KEY = process.env.FOOTBALL_DATA_KEY;

// api-sports.io uses only 2 requests per run:
// 1. GET /fixtures?date=today (all football matches)
// 2. GET /fixtures?date=tomorrow
// That covers all leagues in one shot.

const LEAGUE_NAMES = {
  39: 'Premier League', 140: 'La Liga', 78: 'Bundesliga',
  135: 'Serie A', 61: 'Ligue 1', 2: 'Champions League',
  3: 'Europa League', 848: 'Conference League', 40: 'Championship',
  41: 'League One', 88: 'Eredivisie', 94: 'Primeira Liga',
  179: 'Scottish Premiership', 203: 'Super Lig Turkey',
  144: 'Belgian First Division', 197: 'Super League Greece',
  218: 'Austrian Bundesliga', 13: 'Copa Libertadores',
  11: 'Copa Sudamericana', 253: 'MLS', 262: 'Liga MX',
  71: 'Brasileirao', 128: 'Primera Division Argentina',
  307: 'Saudi Pro League',
};

const SPORT_MAP = {
  39: 'football', 140: 'football', 78: 'football', 135: 'football',
  61: 'football', 2: 'football', 3: 'football', 848: 'football',
  40: 'football', 41: 'football', 88: 'football', 94: 'football',
  179: 'football', 203: 'football', 144: 'football', 197: 'football',
  218: 'football', 13: 'football', 11: 'football', 253: 'football',
  262: 'football', 71: 'football', 128: 'football', 307: 'football',
};

const TEAM_FORM = {
  'Manchester City': { form: 'W-W-W-D-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None' },
  'Arsenal': { form: 'W-W-D-W-L', goals_scored: 2.1, goals_conceded: 1.0, xg: 2.0, injuries: 'Odegaard doubtful' },
  'Liverpool': { form: 'W-W-W-W-D', goals_scored: 2.6, goals_conceded: 0.9, xg: 2.4, injuries: 'None' },
  'Chelsea': { form: 'W-D-W-L-W', goals_scored: 1.9, goals_conceded: 1.2, xg: 1.8, injuries: 'None' },
  'Real Madrid': { form: 'W-W-W-W-D', goals_scored: 2.5, goals_conceded: 0.9, xg: 2.3, injuries: 'None' },
  'Barcelona': { form: 'W-W-W-D-W', goals_scored: 3.1, goals_conceded: 0.7, xg: 2.9, injuries: 'None' },
  'Bayern Munich': { form: 'W-W-L-W-W', goals_scored: 2.9, goals_conceded: 1.2, xg: 2.7, injuries: 'None' },
  'Atletico Madrid': { form: 'W-D-W-L-W', goals_scored: 1.8, goals_conceded: 0.9, xg: 1.7, injuries: 'None' },
  'Inter Milan': { form: 'W-W-W-D-W', goals_scored: 2.3, goals_conceded: 0.7, xg: 2.1, injuries: 'None' },
  'AC Milan': { form: 'L-W-D-W-L', goals_scored: 1.6, goals_conceded: 1.3, xg: 1.5, injuries: 'None' },
  'PSG': { form: 'W-W-W-W-W', goals_scored: 2.8, goals_conceded: 0.8, xg: 2.6, injuries: 'None' },
  'Borussia Dortmund': { form: 'W-L-W-D-L', goals_scored: 1.9, goals_conceded: 1.5, xg: 1.8, injuries: 'None' },
};

async function fetchFixturesByDate(date) {
  try {
    const url = `https://v3.football.api-sports.io/fixtures?date=${date}`;
    const res = await fetch(url, {
      headers: {
        'x-apisports-key': APISPORTS_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const remaining = res.headers.get('x-ratelimit-requests-remaining');
    console.log(`  API requests remaining today: ${remaining}`);

    const data = await res.json();
    if (!data.response?.length) return [];

    const matches = [];
    for (const f of data.response) {
      const leagueId = f.league?.id;
      const leagueName = LEAGUE_NAMES[leagueId];
      if (!leagueName) continue; // skip unknown leagues

      const sport = SPORT_MAP[leagueId] || 'football';
      const status = f.fixture?.status?.short;

      // Only scheduled matches
      if (!['NS', 'TBD'].includes(status)) continue;

      const homeOdds = f.odds?.bookmakers?.[0]?.bets?.find(b => b.name === 'Match Winner')?.values?.find(v => v.value === 'Home')?.odd;
      const drawOdds = f.odds?.bookmakers?.[0]?.bets?.find(b => b.name === 'Match Winner')?.values?.find(v => v.value === 'Draw')?.odd;
      const awayOdds = f.odds?.bookmakers?.[0]?.bets?.find(b => b.name === 'Match Winner')?.values?.find(v => v.value === 'Away')?.odd;

      matches.push({
        sport,
        league: leagueName,
        league_id: String(leagueId),
        country: f.league?.country || '',
        home_team: f.teams?.home?.name || '',
        away_team: f.teams?.away?.name || '',
        match_date: new Date(f.fixture?.date).toISOString(),
        status: 'upcoming',
        home_odds: homeOdds ? parseFloat(homeOdds) : null,
        draw_odds: drawOdds ? parseFloat(drawOdds) : null,
        away_odds: awayOdds ? parseFloat(awayOdds) : null,
      });
    }

    return matches;
  } catch (err) {
    console.error(`  API error for ${date}:`, err.message);
    return [];
  }
}

async function fetchFromFootballData(existingKeys) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const in48h = new Date(Date.now() + 2 * 24 * 3600000).toISOString().split('T')[0];
    const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${in48h}&status=SCHEDULED,TIMED`;
    const res = await fetch(url, { headers: { 'X-Auth-Token': FOOTBALL_KEY } });
    const data = await res.json();

    if (!data.matches?.length) return [];

    const matches = [];
    for (const m of data.matches) {
      const key = `${m.homeTeam?.name}|${m.awayTeam?.name}`;
      if (existingKeys.has(key)) continue;

      matches.push({
        sport: 'football',
        league: m.competition?.name || 'Football',
        league_id: m.competition?.code || 'FOOT',
        country: m.competition?.area?.name || '',
        home_team: m.homeTeam?.name || '',
        away_team: m.awayTeam?.name || '',
        match_date: new Date(m.utcDate).toISOString(),
        status: 'upcoming',
        home_odds: null,
        draw_odds: null,
        away_odds: null,
      });
    }

    console.log(`  football-data.org: ${matches.length} extra matches`);
    return matches;
  } catch (err) {
    console.error('  football-data.org error:', err.message);
    return [];
  }
}

async function saveTeamStats(teamName, sport) {
  const stats = TEAM_FORM[teamName] || {
    form: 'Unknown', goals_scored: null, goals_conceded: null, xg: null, injuries: 'Check news',
  };
  await supabase.from('team_stats').upsert(
    { team_name: teamName, sport, ...stats, updated_at: new Date().toISOString() },
    { onConflict: 'team_name,sport' }
  );
}

async function runStatsAgent() {
  console.log('Stats Agent starting...');
  console.log('Time:', new Date().toISOString());

  // Clear only old upcoming matches
  const cutoff = new Date(Date.now() - 3 * 3600000).toISOString(); // older than 3 hours
  await supabase.from('matches').delete().eq('status', 'upcoming').lt('created_at', cutoff);
  console.log('Cleared old upcoming matches\n');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 3600000).toISOString().split('T')[0];

  console.log(`Fetching fixtures for ${today} and ${tomorrow}...`);

  // Only 2 API calls total for api-sports.io
  const todayMatches = await fetchFixturesByDate(today);
  await new Promise(r => setTimeout(r, 1000));
  const tomorrowMatches = await fetchFixturesByDate(tomorrow);

  const allApiMatches = [...todayMatches, ...tomorrowMatches];
  console.log(`  api-sports.io: ${allApiMatches.length} matches found`);

  // Backup: football-data.org for extra matches
  const existingKeys = new Set(allApiMatches.map(m => `${m.home_team}|${m.away_team}`));
  const fdMatches = await fetchFromFootballData(existingKeys);

  const allMatches = [...allApiMatches, ...fdMatches];

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
    if (!match.home_team || !match.away_team) continue;
    const { error } = await supabase.from('matches').upsert(match, {
      onConflict: 'home_team,away_team,league'
    });
    if (!error) saved++;
  }
  console.log(`Saved ${saved} matches`);

  // Save team stats
  const teams = new Set();
  unique.forEach(m => {
    if (m.home_team) teams.add(JSON.stringify({ name: m.home_team, sport: m.sport }));
    if (m.away_team) teams.add(JSON.stringify({ name: m.away_team, sport: m.sport }));
  });

  for (const t of teams) {
    const { name, sport } = JSON.parse(t);
    await saveTeamStats(name, sport);
  }
  console.log(`Saved stats for ${teams.size} teams`);

  await supabase.from('agent_logs').insert({
    agent: 'stats-agent',
    status: 'success',
    message: `Saved ${saved} matches. API requests used: 2`
  });

  console.log('\nStats Agent completed! Used only 2 API requests.');
}

runStatsAgent().catch(e => console.error('FATAL:', e.message));
