// ============================================================
// app/leagueFlags.ts — знаме/символ за всяка лига
// Национални лиги → знаме на държавата.
// Евротурнири и континентални → трофей/символ.
// Ползва се от всички страници за визуална ориентация.
// ============================================================
export const LEAGUE_FLAG: Record<string, string> = {
  // Англия
  'Premier League':        '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Championship':          '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  // Шотландия
  'Scottish Premiership':  '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  // Испания
  'La Liga':               '🇪🇸',
  'La Liga 2':             '🇪🇸',
  // Италия
  'Serie A':               '🇮🇹',
  'Serie B':               '🇮🇹',
  // Германия
  'Bundesliga':            '🇩🇪',
  'Bundesliga 2':          '🇩🇪',
  // Франция
  'Ligue 1':               '🇫🇷',
  'Ligue 2':               '🇫🇷',
  // Останала Европа
  'Eredivisie':            '🇳🇱',
  'Primeira Liga':         '🇵🇹',
  'Belgian Pro League':    '🇧🇪',
  'Super Lig':             '🇹🇷',
  'Greek Super League':    '🇬🇷',
  'Swiss Super League':    '🇨🇭',
  'Austrian Bundesliga':   '🇦🇹',
  'Danish Superliga':      '🇩🇰',
  'Norwegian Eliteserien': '🇳🇴',
  'Swedish Allsvenskan':   '🇸🇪',
  'Polish Ekstraklasa':    '🇵🇱',
  'Czech Liga':            '🇨🇿',
  'Romanian Liga 1':       '🇷🇴',
  // Америка
  'MLS':                   '🇺🇸',
  'Liga MX':               '🇲🇽',
  'Brasileirao':           '🇧🇷',
  'Argentine Primera':     '🇦🇷',
  'Copa Libertadores':     '🏆',
  'Copa Sudamericana':     '🏆',
  // Азия
  'J-League':              '🇯🇵',
  'K-League':              '🇰🇷',
  'Saudi Pro League':      '🇸🇦',
  // Евротурнири
  'Champions League':      '🏆',
  'Europa League':         '🏅',
  'Conference League':     '🎖️',
}

// Взима флага за дадена лига (или неутрален символ, ако е непозната)
export function leagueFlag(league: string): string {
  return LEAGUE_FLAG[league] || '⚽'
}

