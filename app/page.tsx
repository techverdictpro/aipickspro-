export default function HomePage() {
  const picks = [
    { sport: '⚽ Premier League · 20:45', match: 'Man City vs Arsenal', tip: 'Man City Win', odds: '1.72', conf: 4, featured: true },
    { sport: '🏀 NBA · 01:30', match: 'Lakers vs Celtics', tip: 'Over 224.5', odds: '1.90', conf: 3, featured: false },
    { sport: '🎾 Roland Garros · 14:00', match: 'Djokovic vs Alcaraz', tip: 'Alcaraz Win', odds: '1.90', conf: 5, featured: false },
    { sport: '🏈 NFL · 22:00', match: 'Chiefs vs Eagles', tip: 'Chiefs -3.5', odds: '1.91', conf: 3, featured: false },
  ]

  const bookmakers = [
    { name: 'Bet365', bonus: 'Up to £100 bonus' },
    { name: 'William Hill', bonus: '£30 free bet' },
    { name: 'DraftKings', bonus: '$200 bonus bets' },
    { name: 'FanDuel', bonus: '$1000 no sweat' },
    { name: 'Betway', bonus: '€30 free bet' },
    { name: 'Unibet', bonus: '€40 bonus' },
  ]

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0c0f; color: #f0ede6; font-family: 'Segoe UI', Arial, sans-serif; }
        a { text-decoration: none; color: inherit; }
        nav { position: sticky; top: 0; z-index: 100; background: rgba(10,12,15,0.96); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; height: 58px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 22px; font-weight: 900; letter-spacing: 0.02em; }
        .logo-accent { color: #e8f042; }
        .nav-links { display: flex; gap: 24px; font-size: 13px; color: #8a8f99; }
        .nav-links a:hover { color: #fff; }
        .nav-cta { background: #e8f042; color: #000; padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 800; letter-spacing: 0.05em; }
        .hero { background: #0d1019; padding: 64px 32px 56px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .hero-label { display: inline-block; background: rgba(232,240,66,0.1); border: 1px solid rgba(232,240,66,0.25); color: #e8f042; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; padding: 5px 14px; border-radius: 2px; margin-bottom: 24px; text-transform: uppercase; }
        .hero h1 { font-size: 72px; font-weight: 900; line-height: 0.9; text-transform: uppercase; margin-bottom: 20px; max-width: 700px; }
        .hero-accent { color: #e8f042; }
        .hero p { font-size: 17px; color: #8a8f99; max-width: 520px; line-height: 1.7; margin-bottom: 32px; }
        .btn-primary { background: #e8f042; color: #000; padding: 14px 32px; border-radius: 4px; font-size: 15px; font-weight: 800; letter-spacing: 0.05em; display: inline-block; }
        .btn-secondary { border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 14px 32px; border-radius: 4px; font-size: 15px; display: inline-block; margin-left: 12px; }
        .hero-stats { display: flex; gap: 48px; margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.07); flex-wrap: wrap; }
        .stat-val { font-size: 40px; font-weight: 900; color: #e8f042; line-height: 1; }
        .stat-label { font-size: 11px; color: #8a8f99; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
        .aff-strip { background: #111418; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 16px 32px; display: flex; align-items: center; gap: 20px; overflow-x: auto; }
        .aff-strip-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #8a8f99; white-space: nowrap; flex-shrink: 0; }
        .aff-item { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 10px 16px; white-space: nowrap; flex-shrink: 0; cursor: pointer; }
        .aff-item:hover { border-color: rgba(255,255,255,0.18); }
        .aff-name { font-size: 14px; font-weight: 700; }
        .aff-bonus { font-size: 11px; color: #2ecc8a; font-weight: 600; }
        .aff-btn { background: #e8f042; color: #000; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 3px; }
        .section { max-width: 1200px; margin: 0 auto; padding: 48px 32px; }
        .section-header { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 12px; margin-bottom: 24px; }
        .section-title { font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; }
        .section-link { font-size: 12px; color: #e8f042; font-weight: 700; letter-spacing: 0.08em; }
        .picks-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .pick-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 20px; cursor: pointer; transition: border-color 0.2s; display: block; }
        .pick-card:hover { border-color: rgba(232,240,66,0.3); }
        .pick-card-featured { background: rgba(232,240,66,0.03); border-color: rgba(232,240,66,0.35); }
        .pick-sport { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 8px; }
        .pick-match { font-size: 15px; font-weight: 600; margin-bottom: 14px; line-height: 1.3; color: #f0ede6; }
        .pick-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .pick-tip { background: rgba(46,204,138,0.1); color: #2ecc8a; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 3px; }
        .pick-odds { font-size: 26px; font-weight: 900; color: #e8f042; }
        .conf-bar { display: flex; gap: 3px; }
        .conf-dot { height: 4px; flex: 1; border-radius: 2px; background: rgba(255,255,255,0.1); }
        .conf-dot-on { background: #e8f042; }
        .conf-text { font-size: 11px; color: #8a8f99; margin-top: 5px; text-align: right; }
        .aff-inline { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-left: 3px solid #e8f042; border-radius: 6px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; margin: 32px 0; gap: 20px; }
        .aff-inline-title { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
        .aff-inline-sub { font-size: 12px; color: #8a8f99; }
        .aff-inline-disclaimer { font-size: 10px; color: #8a8f99; margin-top: 4px; }
        footer { background: #111418; border-top: 1px solid rgba(255,255,255,0.07); padding: 48px 32px 32px; margin-top: 60px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
        .footer-logo { font-size: 20px; font-weight: 900; margin-bottom: 10px; }
        .footer-about { font-size: 13px; color: #8a8f99; line-height: 1.7; }
        .footer-col-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 14px; }
        .footer-links { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #8a8f99; }
        .footer-links a:hover { color: #fff; }
        .footer-bottom { max-width: 1200px; margin: 28px auto 0; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #8a8f99; flex-wrap: wrap; gap: 8px; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; }
        @media (max-width: 900px) {
          .picks-grid { grid-template-columns: repeat(2, 1fr); }
          .hero h1 { font-size: 48px; }
          .nav-links { display: none; }
          .footer-inner { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .picks-grid { grid-template-columns: 1fr; }
          .hero h1 { font-size: 36px; }
          .hero-stats { gap: 24px; }
          .aff-inline { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <nav>
        <div className="logo">Ai<span className="logo-accent">Picks</span>Pro</div>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/">Today&apos;s Tips</a>
          <a href="/stats/">Stats</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="hero">
        <div className="hero-label">● AI-Powered · Live Analysis · Updated Daily</div>
        <h1>The <span className="hero-accent">Smarter</span><br />Way to Bet</h1>
        <p>Our AI agents analyse thousands of data points — form, injuries, head-to-head, market movement — to deliver daily picks for football, NBA, tennis and more.</p>
        <a href="/tips-today/" className="btn-primary">TODAY&apos;S FREE TIPS →</a>
        <a href="/track-record/" className="btn-secondary">View Track Record</a>
        <div className="hero-stats">
          <div><div className="stat-val">74%</div><div className="stat-label">Win rate (last 90 days)</div></div>
          <div><div className="stat-val">+2,840</div><div className="stat-label">Units profit (2025)</div></div>
          <div><div className="stat-val">12k+</div><div className="stat-label">Subscribers</div></div>
          <div><div className="stat-val">4</div><div className="stat-label">Sports covered</div></div>
        </div>
      </div>

      <div className="aff-strip">
        <div className="aff-strip-label">Trusted Partners</div>
        {bookmakers.map((bm) => (
          <div key={bm.name} className="aff-item">
            <div>
              <div className="aff-name">{bm.name}</div>
              <div className="aff-bonus">{bm.bonus}</div>
            </div>
            <div className="aff-btn">Claim →</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Today&apos;s Top Picks</div>
          <a href="/tips-today/" className="section-link">ALL PICKS →</a>
        </div>
        <div className="picks-grid">
          {picks.map((p) => (
            <a href="/tips-today/" key={p.match} className={p.featured ? 'pick-card pick-card-featured' : 'pick-card'}>
              <div className="pick-sport">{p.sport}</div>
              <div className="pick-match">{p.match}</div>
              <div className="pick-row">
                <span className="pick-tip">{p.tip}</span>
                <span className="pick-odds">{p.odds}</span>
              </div>
              <div className="conf-bar">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={i <= p.conf ? 'conf-dot conf-dot-on' : 'conf-dot'} />
                ))}
              </div>
              <div className="conf-text">
                {p.conf >= 5 ? 'Very high confidence' : p.conf >= 4 ? 'High confidence' : 'Medium confidence'}
              </div>
            </a>
          ))}
        </div>

        <div className="aff-inline">
          <div>
            <div className="aff-inline-title">🎯 Bet365 — Up to £100 Welcome Bonus</div>
            <div className="aff-inline-sub">Use our picks + the bonus for maximum value. New customers only.</div>
            <div className="aff-inline-disclaimer">18+ · Gamble Responsibly · T&Cs apply</div>
          </div>
          <a href="#" className="btn-primary">CLAIM BONUS →</a>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-logo">Ai<span className="logo-accent">Picks</span>Pro</div>
            <p className="footer-about">AI-powered sports predictions for football, basketball, tennis and American football. Updated daily by our AI agents.</p>
          </div>
          <div>
            <div className="footer-col-title">Sports</div>
            <div className="footer-links">
              <a href="/football/">Football</a>
              <a href="/basketball/">Basketball</a>
              <a href="/tennis/">Tennis</a>
              <a href="/nfl/">NFL</a>
              <a href="#">Ice Hockey</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Resources</div>
            <div className="footer-links">
              <a href="/tips-today/">Today&apos;s Tips</a>
              <a href="/track-record/">Track Record</a>
              <a href="#">Bookmaker Reviews</a>
              <a href="#">Betting Guides</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Info</div>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Affiliate Disclosure</a>
              <a href="#">Responsible Gambling</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 AiPicksPro. All rights reserved.</span>
          <span>Affiliate disclosure: We earn commissions from partner bookmakers.</span>
        </div>
      </footer>

      <div className="rg-bar">
        <strong style={{ color: '#fff' }}>⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.{' '}
        <a href="#" style={{ color: '#8a8f99', textDecoration: 'underline' }}>GamCare (UK) · NCPG (US)</a>
      </div>
    </>
  )
}
