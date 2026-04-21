export default function FootballPage() {
  const matches = [
    {
      league: 'Premier League',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      time: 'Today 20:45',
      home: 'Man City',
      away: 'Arsenal',
      tip: 'Man City Win',
      odds: '1.72',
      conf: 4,
      analysis: 'Man City have won 8 of their last 10 home games. Arsenal missing key midfielder. xG advantage clearly with the hosts.',
      bookmaker: 'Bet365',
    },
    {
      league: 'Champions League',
      flag: '🇪🇺',
      time: 'Tomorrow 21:00',
      home: 'Real Madrid',
      away: 'Bayern Munich',
      tip: 'Both Teams to Score',
      odds: '1.75',
      conf: 4,
      analysis: 'BTTS has landed in 9 of Real Madrid last 11 European home games. Bayern score in virtually every away game in Europe.',
      bookmaker: 'William Hill',
    },
    {
      league: 'La Liga',
      flag: '🇪🇸',
      time: 'Tomorrow 20:00',
      home: 'Barcelona',
      away: 'Atletico Madrid',
      tip: 'Over 2.5 Goals',
      odds: '1.85',
      conf: 3,
      analysis: 'Barcelona average 3.1 goals per home game this season. Last 5 meetings produced 3+ goals in 4 occasions.',
      bookmaker: 'Unibet',
    },
    {
      league: 'Bundesliga',
      flag: '🇩🇪',
      time: 'Tomorrow 18:30',
      home: 'Bayern Munich',
      away: 'Dortmund',
      tip: 'Bayern Win & Over 2.5',
      odds: '2.10',
      conf: 3,
      analysis: 'Der Klassiker rarely disappoints. Bayern are 12 points clear at the top. Dortmund have conceded 2+ in last 5 away games.',
      bookmaker: 'Betway',
    },
    {
      league: 'Serie A',
      flag: '🇮🇹',
      time: 'Sat 20:45',
      home: 'Inter Milan',
      away: 'AC Milan',
      tip: 'Inter Win',
      odds: '1.95',
      conf: 4,
      analysis: 'Inter have won 6 consecutive derbies. AC Milan missing 3 key attackers through injury. Inter at home are formidable.',
      bookmaker: 'Bet365',
    },
    {
      league: 'Ligue 1',
      flag: '🇫🇷',
      time: 'Sat 21:00',
      home: 'PSG',
      away: 'Monaco',
      tip: 'PSG Win',
      odds: '1.45',
      conf: 5,
      analysis: 'PSG have won 14 of 15 home games this season. Monaco are in poor form — 1 win in last 6. Mbappe back from suspension.',
      bookmaker: 'DraftKings',
    },
  ]

  const confText = (c: number) => {
    if (c >= 5) return 'Very High'
    if (c >= 4) return 'High'
    return 'Medium'
  }

  const confColor = (c: number) => {
    if (c >= 5) return '#2ecc8a'
    if (c >= 4) return '#e8f042'
    return '#f39c12'
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0c0f; color: #f0ede6; font-family: 'Segoe UI', Arial, sans-serif; }
        a { text-decoration: none; color: inherit; }
        nav { position: sticky; top: 0; z-index: 100; background: rgba(10,12,15,0.96); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; height: 58px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 22px; font-weight: 900; }
        .logo-accent { color: #e8f042; }
        .nav-links { display: flex; gap: 24px; font-size: 13px; color: #8a8f99; }
        .nav-links a:hover { color: #fff; }
        .nav-active { color: #e8f042 !important; }
        .nav-cta { background: #e8f042; color: #000; padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 800; }
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 40px 32px; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 12px; }
        .breadcrumb a { color: #8a8f99; }
        .breadcrumb a:hover { color: #fff; }
        .breadcrumb span { color: #e8f042; }
        .page-title { font-size: 48px; font-weight: 900; text-transform: uppercase; line-height: 0.95; margin-bottom: 12px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 15px; color: #8a8f99; max-width: 600px; line-height: 1.6; }
        .leagues-bar { background: #111418; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; display: flex; gap: 0; overflow-x: auto; }
        .league-tab { padding: 14px 20px; font-size: 13px; font-weight: 600; color: #8a8f99; border-bottom: 2px solid transparent; white-space: nowrap; cursor: pointer; }
        .league-tab:hover { color: #fff; }
        .league-tab-active { color: #e8f042; border-bottom-color: #e8f042; }
        .main { max-width: 1200px; margin: 0 auto; padding: 40px 32px; display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
        .matches-list { display: flex; flex-direction: column; gap: 16px; }
        .league-header { display: flex; align-items: center; gap: 10px; margin: 24px 0 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .league-header:first-child { margin-top: 0; }
        .league-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8f99; }
        .match-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; }
        .match-card:hover { border-color: rgba(232,240,66,0.25); }
        .match-header { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); }
        .match-league { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; }
        .match-time { font-size: 12px; color: #8a8f99; background: rgba(255,255,255,0.05); padding: 3px 10px; border-radius: 3px; }
        .match-body { padding: 20px; }
        .match-teams { font-size: 24px; font-weight: 900; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.02em; }
        .match-vs { color: #8a8f99; font-size: 16px; margin: 0 8px; }
        .match-main { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .match-tip { background: rgba(232,240,66,0.1); border: 1px solid rgba(232,240,66,0.3); color: #e8f042; font-size: 14px; font-weight: 800; padding: 8px 18px; border-radius: 4px; }
        .match-odds-wrap { display: flex; align-items: baseline; gap: 6px; }
        .match-odds-label { font-size: 12px; color: #8a8f99; }
        .match-odds { font-size: 32px; font-weight: 900; color: #e8f042; }
        .match-conf { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        .match-conf-label { font-size: 11px; font-weight: 700; }
        .conf-dots { display: flex; gap: 3px; }
        .cdot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: currentColor; }
        .match-analysis { font-size: 14px; color: #8a8f99; line-height: 1.6; margin-bottom: 16px; border-left: 2px solid rgba(232,240,66,0.3); padding-left: 14px; }
        .match-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05); }
        .match-bm { font-size: 12px; color: #8a8f99; }
        .match-bm strong { color: #fff; }
        .match-btn { background: #e8f042; color: #000; font-size: 12px; font-weight: 800; padding: 8px 18px; border-radius: 4px; }
        .sidebar { display: flex; flex-direction: column; gap: 16px; }
        .sidebar-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px; }
        .sidebar-title { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8f99; margin-bottom: 16px; }
        .record-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .record-row:last-child { border-bottom: none; }
        .record-win { color: #2ecc8a; font-weight: 700; }
        .record-loss { color: #e84545; font-weight: 700; }
        .bm-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .bm-item:last-child { border-bottom: none; }
        .bm-name { font-size: 14px; font-weight: 700; }
        .bm-bonus { font-size: 11px; color: #2ecc8a; }
        .bm-cta { background: #e8f042; color: #000; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 3px; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 40px; }
        @media (max-width: 900px) {
          .main { grid-template-columns: 1fr; }
          .nav-links { display: none; }
          .page-title { font-size: 32px; }
        }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/" className="nav-active">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/">Today&apos;s Tips</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="breadcrumb">
            <a href="/">Home</a> › <span>Football Predictions</span>
          </div>
          <h1 className="page-title">Football<br /><em>Predictions</em></h1>
          <p className="page-subtitle">AI-powered football tips across Premier League, Champions League, La Liga, Bundesliga, Serie A and more. Updated every 6 hours.</p>
        </div>
      </div>

      <div className="leagues-bar">
        {['All Leagues', 'Premier League', 'Champions League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'].map((l, i) => (
          <div key={l} className={i === 0 ? 'league-tab league-tab-active' : 'league-tab'}>{l}</div>
        ))}
      </div>

      <div className="main">
        <div className="matches-list">
          {matches.map((m) => (
            <div key={m.home + m.away} className="match-card">
              <div className="match-header">
                <div className="match-league">{m.flag} {m.league}</div>
                <div className="match-time">{m.time}</div>
              </div>
              <div className="match-body">
                <div className="match-teams">
                  {m.home} <span className="match-vs">vs</span> {m.away}
                </div>
                <div className="match-main">
                  <div className="match-tip">{m.tip}</div>
                  <div className="match-odds-wrap">
                    <span className="match-odds-label">Odds</span>
                    <span className="match-odds">{m.odds}</span>
                  </div>
                  <div className="match-conf" style={{ color: confColor(m.conf) }}>
                    <div className="conf-dots">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={i <= m.conf ? 'cdot cdot-on' : 'cdot'} />
                      ))}
                    </div>
                    <span className="match-conf-label">{confText(m.conf)}</span>
                  </div>
                </div>
                <div className="match-analysis">{m.analysis}</div>
                <div className="match-footer">
                  <div className="match-bm">Best odds at <strong>{m.bookmaker}</strong></div>
                  <a href="#" className="match-btn">BET NOW →</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">Football Record</div>
            {[
              { league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League', w: 18, l: 6 },
              { league: '🇪🇺 Champions League', w: 11, l: 3 },
              { league: '🇪🇸 La Liga', w: 14, l: 5 },
              { league: '🇩🇪 Bundesliga', w: 9, l: 4 },
              { league: '🇮🇹 Serie A', w: 12, l: 5 },
            ].map((r) => (
              <div key={r.league} className="record-row">
                <span style={{ fontSize: '12px' }}>{r.league}</span>
                <span><span className="record-win">{r.w}W</span> / <span className="record-loss">{r.l}L</span></span>
              </div>
            ))}
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">Top Bookmakers</div>
            {[
              { name: 'Bet365', bonus: 'Up to £100 bonus' },
              { name: 'William Hill', bonus: '£30 free bet' },
              { name: 'Betway', bonus: '€30 free bet' },
              { name: 'Unibet', bonus: '€40 bonus' },
            ].map((bm) => (
              <div key={bm.name} className="bm-item">
                <div>
                  <div className="bm-name">{bm.name}</div>
                  <div className="bm-bonus">{bm.bonus}</div>
                </div>
                <a href="#" className="bm-cta">Claim →</a>
              </div>
            ))}
          </div>

          <div className="sidebar-card" style={{ background: 'rgba(232,240,66,0.04)', borderColor: 'rgba(232,240,66,0.2)' }}>
            <div className="sidebar-title" style={{ color: '#e8f042' }}>Get Daily Tips Free</div>
            <p style={{ fontSize: '13px', color: '#8a8f99', marginBottom: '14px', lineHeight: '1.6' }}>
              Join 12,000+ bettors receiving our AI football picks every morning.
            </p>
            <input
              type="email"
              placeholder="your@email.com"
              style={{ width: '100%', background: '#0a0c0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '10px 14px', color: '#fff', fontSize: '14px', marginBottom: '10px' }}
            />
            <a href="#" style={{ display: 'block', background: '#e8f042', color: '#000', textAlign: 'center', padding: '10px', borderRadius: '4px', fontWeight: '800', fontSize: '13px', letterSpacing: '0.05em' }}>
              SUBSCRIBE FREE →
            </a>
          </div>
        </div>
      </div>

      <div className="rg-bar">
        <strong style={{ color: '#fff' }}>⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
