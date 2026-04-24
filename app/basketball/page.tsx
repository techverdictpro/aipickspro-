import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

function getArticles() {
  const dir = path.join(process.cwd(), 'content', 'predictions', 'basketball')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8')
      const { data } = matter(raw)
      return { ...data, slug: f.replace('.mdx', '') } as any
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function BasketballPage() {
  const articles = getArticles()

  const confText = (c: number) => c >= 5 ? 'Very High' : c >= 4 ? 'High' : 'Medium'
  const confColor = (c: number) => c >= 5 ? '#2ecc8a' : c >= 4 ? '#e8f042' : '#f39c12'

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
        .main { max-width: 1200px; margin: 0 auto; padding: 40px 32px; display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
        .articles-list { display: flex; flex-direction: column; gap: 16px; }
        .article-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; display: block; }
        .article-card:hover { border-color: rgba(232,240,66,0.25); }
        .card-header { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); }
        .card-league { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; }
        .card-date { font-size: 12px; color: #8a8f99; }
        .card-body { padding: 20px; }
        .card-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; line-height: 1.3; }
        .card-main { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
        .card-tip { background: rgba(232,240,66,0.1); border: 1px solid rgba(232,240,66,0.3); color: #e8f042; font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: 4px; }
        .card-odds { font-size: 28px; font-weight: 900; color: #e8f042; }
        .card-conf { display: flex; align-items: center; gap: 6px; margin-left: auto; }
        .conf-dots { display: flex; gap: 3px; }
        .cdot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .card-excerpt { font-size: 13px; color: #8a8f99; line-height: 1.6; }
        .empty-state { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 48px; text-align: center; color: #8a8f99; }
        .sidebar { display: flex; flex-direction: column; gap: 16px; }
        .sidebar-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px; }
        .sidebar-title { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8f99; margin-bottom: 16px; }
        .bm-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .bm-item:last-child { border-bottom: none; }
        .bm-name { font-size: 14px; font-weight: 700; }
        .bm-bonus { font-size: 11px; color: #2ecc8a; }
        .bm-cta { background: #e8f042; color: #000; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 3px; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 40px; }
        @media (max-width: 900px) { .main { grid-template-columns: 1fr; } .nav-links { display: none; } .page-title { font-size: 32px; } }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/" className="nav-active">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/">Today&apos;s Tips</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="breadcrumb">
            <a href="/">Home</a> › <span>Basketball Predictions</span>
          </div>
          <h1 className="page-title">Basketball<br /><em>Predictions</em></h1>
          <p className="page-subtitle">AI-powered NBA & basketball tips. Expert analysis on spreads, totals, and moneylines. Updated daily.</p>
        </div>
      </div>

      <div className="main">
        <div className="articles-list">
          {articles.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏀</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Predictions coming soon</div>
              <div>Our AI agents are analysing upcoming NBA matchups. Check back shortly.</div>
            </div>
          ) : articles.map((a: any) => (
            <a key={a.slug} href={`/predictions/${a.slug}/`} className="article-card">
              <div className="card-header">
                <div className="card-league">🏀 {a.league}</div>
                <div className="card-date">{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div className="card-body">
                <div className="card-title">{a.title}</div>
                <div className="card-main">
                  <div className="card-tip">{a.prediction}</div>
                  <div className="card-odds">{a.odds}</div>
                  <div className="card-conf" style={{ color: confColor(a.confidence) }}>
                    <div className="conf-dots">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="cdot" style={{ background: i <= a.confidence ? 'currentColor' : undefined }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{confText(a.confidence)}</span>
                  </div>
                </div>
                {a.excerpt && <div className="card-excerpt">{a.excerpt}</div>}
              </div>
            </a>
          ))}
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">Top Bookmakers</div>
            {[
              { name: 'DraftKings', bonus: '$200 bonus bets' },
              { name: 'FanDuel', bonus: '$1000 no sweat' },
              { name: 'Bet365', bonus: 'Up to £100 bonus' },
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
              Join 12,000+ bettors receiving our AI basketball picks every morning.
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
