export default function TipsTodayPage() {
  const tips = [
    {
      sport: 'Football',
      emoji: '⚽',
      league: 'Premier League',
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
      sport: 'Basketball',
      emoji: '🏀',
      league: 'NBA',
      time: 'Today 01:30',
      home: 'Lakers',
      away: 'Celtics',
      tip: 'Over 224.5',
      odds: '1.90',
      conf: 3,
      analysis: 'Both teams rank top-5 in offensive rating this season. Fast pace expected. Last 3 H2H games all went over 220.',
      bookmaker: 'DraftKings',
    },
    {
      sport: 'Tennis',
      emoji: '🎾',
      league: 'Roland Garros SF',
      time: 'Today 14:00',
      home: 'Djokovic',
      away: 'Alcaraz',
      tip: 'Alcaraz Win',
      odds: '1.90',
      conf: 5,
      analysis: 'Alcaraz holds 78% win rate on clay in 2025. Djokovic showing fatigue signs after 5-set QF. Surface strongly favours Alcaraz.',
      bookmaker: 'Betway',
    },
    {
      sport: 'NFL',
      emoji: '🏈',
      league: 'NFL',
      time: 'Today 22:00',
      home: 'Chiefs',
      away: 'Eagles',
      tip: 'Chiefs -3.5',
      odds: '1.91',
      conf: 3,
      analysis: 'Chiefs are 7-2 ATS at home this season. Mahomes has a 112.4 passer rating in prime time games. Eagles defense weakened by injuries.',
      bookmaker: 'FanDuel',
    },
    {
      sport: 'Football',
      emoji: '⚽',
      league: 'Champions League',
      time: 'Tomorrow 21:00',
      home: 'Real Madrid',
      away: 'Bayern',
      tip: 'Both Teams to Score',
      odds: '1.75',
      conf: 4,
      analysis: 'BTTS has landed in 9 of Real Madrid last 11 European home games. Bayern score in virtually every away game in Europe.',
      bookmaker: 'William Hill',
    },
    {
      sport: 'Football',
      emoji: '⚽',
      league: 'La Liga',
      time: 'Tomorrow 20:00',
      home: 'Barcelona',
      away: 'Atletico',
      tip: 'Over 2.5 Goals',
      odds: '1.85',
      conf: 3,
      analysis: 'Barcelona average 3.1 goals per home game this season. Last 5 meetings between these sides produced 3+ goals in 4 occasions.',
      bookmaker: 'Unibet',
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
        .nav-cta { background: #e8f042; color: #000; padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 800; }
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 40px 32px; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .page-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #e8f042; margin-bottom: 12px; }
        .page-title { font-size: 48px; font-weight: 900; text-transform: uppercase; line-height: 0.95; margin-bottom: 12px; }
        .page-subtitle { font-size: 15px; color: #8a8f99; }
        .page-stats { display: flex; gap: 32px; margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.07); flex-wrap: wrap; }
        .page-stat { font-size: 13px; color: #8a8f99; }
        .page-stat strong { color: #e8f042; font-size: 18px; font-weight: 900; display: block; }
        .main { max-width: 1200px; margin: 0 auto; padding: 40px 32px; display: grid; grid-template-columns: 1fr 320px; gap: 32px; }
        .tips-list { display: flex; flex-direction: column; gap: 16px; }
        .tip-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; }
        .tip-card:hover { border-color: rgba(232,240,66,0.25); }
        .tip-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; }
        .tip-sport { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; }
        .tip-time { font-size: 12px; color: #8a8f99; }
        .tip-body { padding: 20px; }
        .tip-match { font-size: 22px; font-weight: 900; margin-bottom: 16px; text-transform: uppercase; }
        .tip-main { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .tip-pick { background: rgba(232,240,66,0.1); border: 1px solid rgba(232,240,66,0.3); color: #e8f042; font-size: 14px; font-weight: 800; padding: 8px 18px; border-radius: 4px; letter-spacing: 0.05em; }
        .tip-odds-wrap { display: flex; align-items: baseline; gap: 6px; }
        .tip-odds-label { font-size: 12px; color: #8a8f99; }
        .tip-odds { font-size: 32px; font-weight: 900; color: #e8f042; }
        .tip-conf { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        .tip-conf-label { font-size: 11px; font-weight: 700; }
        .conf-dots { display: flex; gap: 3px; }
        .cdot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: currentColor; }
        .tip-analysis { font-size: 14px; color: #8a8f99; line-height: 1.6; margin-bottom: 16px; border-left: 2px solid rgba(232,240,66,0.3); padding-left: 14px; }
        .tip-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05); }
        .tip-bm { font-size: 12px; color: #8a8f99; }
        .tip-bm strong { color: #fff; }
        .tip-btn { background: #e8f042; color: #000; font-size: 12px; font-weight: 800; padding: 8px 18px; border-radius: 4px; letter-spacing: 0.05em; }
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
          <a href="#">Football</a>
          <a href="#">Basketball</a>
          <a href="#">Tennis</a>
          <a href="#">NFL</a>
          <a href="#">Today&apos;s Tips</a>
        </div>
        <a href="#" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-label">📅 {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <h1 className="page-title">Today&apos;s Free<br />Betting Tips</h1>
          <p className="page-subtitle">AI-analysed predictions across football, NBA, tennis and NFL. Updated every 6 hours.</p>
          <div className="page-stats">
            <div className="page-stat"><strong>6</strong>Tips today</div>
            <div className="page-stat"><strong>74%</strong>Win rate this month</div>
            <div className="page-stat"><strong>+312</strong>Units profit this month</div>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="tips-list">
          {tips.map((t) => (
            <div key={t.home} className="tip-card">
              <div className="tip-header">
                <div className="tip-sport">{t.emoji} {t.league}</div>
                <div className="tip-time">{t.time}</div>
              </div>
              <div className="tip-body">
                <div className="tip-match">{t.home} vs {t.away}</div>
                <div className="tip-main">
                  <div className="tip-pick">{t.tip}</div>
                  <div className="tip-odds-wrap">
                    <span className="tip-odds-label">Odds</span>
                    <span className="tip-odds">{t.odds}</span>
                  </div>
                  <div className="tip-conf" style={{ color: confColor(t.conf) }}>
                    <div className="conf-dots">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={i <= t.conf ? 'cdot cdot-on' : 'cdot'} />
                      ))}
                    </div>
                    <span className="tip-conf-label">{confText(t.conf)}</span>
                  </div>
                </div>
                <div className="tip-analysis">{t.analysis}</div>
                <div className="tip-footer">
                  <div className="tip-bm">Best odds at <strong>{t.bookmaker}</strong></div>
                  <a href="#" className="tip-btn">BET NOW →</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">This Month&apos;s Record</div>
            {[
              { sport: '⚽ Football', w: 18, l: 6 },
              { sport: '🏀 Basketball', w: 12, l: 5 },
              { sport: '🎾 Tennis', w: 9, l: 3 },
              { sport: '🏈 NFL', w: 7, l: 4 },
            ].map((r) => (
              <div key={r.sport} className="record-row">
                <span>{r.sport}</span>
                <span><span className="record-win">{r.w}W</span> / <span className="record-loss">{r.l}L</span></span>
              </div>
            ))}
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">Top Bookmakers</div>
            {[
              { name: 'Bet365', bonus: 'Up to £100 bonus' },
              { name: 'DraftKings', bonus: '$200 bonus bets' },
              { name: 'William Hill', bonus: '£30 free bet' },
              { name: 'Betway', bonus: '€30 free bet' },
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
              Join 12,000+ bettors who receive our AI picks every morning.
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