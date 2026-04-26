import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Article {
  slug: string
  title: string
  sport: string
  league: string
  date: string
  prediction: string
  odds: string
  confidence: number
  excerpt: string
}

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  nfl: '🏈',
}

const SPORT_COLOR: Record<string, string> = {
  football: '#4a9eff',
  basketball: '#e84545',
  tennis: '#2ecc8a',
  nfl: '#f39c12',
}

function getAllArticles(): Article[] {
  const sports = ['football', 'basketball', 'tennis', 'nfl']
  const articles: Article[] = []

  for (const sport of sports) {
    const dir = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const { data } = matter(raw)
      articles.push({
        slug: file.replace('.mdx', ''),
        title: data.title || '',
        sport,
        league: data.league || '',
        date: data.date || '',
        prediction: data.prediction || '',
        odds: data.odds || '',
        confidence: data.confidence || 3,
        excerpt: data.excerpt || '',
      })
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function TipsTodayPage() {
  const allArticles = getAllArticles()
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]

  const todayArticles = allArticles.filter(a => a.date === today)
  const recentArticles = allArticles.filter(a => a.date >= weekAgo && a.date < today)
  const pastArticles = allArticles.filter(a => a.date < weekAgo)

  const totalRecent = todayArticles.length + recentArticles.length

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
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 32px; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .page-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #e8f042; margin-bottom: 10px; }
        .page-title { font-size: 42px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 14px; color: #8a8f99; }
        .page-stats { display: flex; gap: 32px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.07); flex-wrap: wrap; }
        .page-stat strong { color: #e8f042; font-size: 22px; font-weight: 900; display: block; }
        .page-stat span { font-size: 12px; color: #8a8f99; text-transform: uppercase; letter-spacing: 0.06em; }
        .sport-filter { background: #111418; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; display: flex; gap: 0; overflow-x: auto; }
        .filter-tab { padding: 14px 20px; font-size: 13px; font-weight: 600; color: #8a8f99; border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; }
        .filter-tab:hover { color: #fff; }
        .filter-active { color: #e8f042; border-bottom-color: #e8f042; }
        .main { max-width: 1200px; margin: 0 auto; padding: 32px; display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
        .tips-list { display: flex; flex-direction: column; gap: 14px; }
        .section-label { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .section-label:first-child { margin-top: 0; }
        .tip-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; display: block; }
        .tip-card:hover { border-color: rgba(232,240,66,0.25); }
        .tip-header { padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); }
        .tip-sport-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 3px; }
        .tip-league { font-size: 11px; color: #8a8f99; }
        .tip-body { padding: 16px 18px; }
        .tip-title { font-size: 16px; font-weight: 700; line-height: 1.3; margin-bottom: 12px; color: #f0ede6; }
        .tip-main { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; flex-wrap: wrap; }
        .tip-pick { background: rgba(232,240,66,0.1); border: 1px solid rgba(232,240,66,0.3); color: #e8f042; font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: 4px; }
        .tip-odds-label { font-size: 11px; color: #8a8f99; }
        .tip-odds { font-size: 28px; font-weight: 900; color: #e8f042; }
        .tip-conf { display: flex; align-items: center; gap: 6px; margin-left: auto; }
        .conf-dots { display: flex; gap: 3px; }
        .cdot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: currentColor; }
        .tip-excerpt { font-size: 13px; color: #8a8f99; line-height: 1.5; border-left: 2px solid rgba(232,240,66,0.3); padding-left: 12px; margin-bottom: 12px; }
        .tip-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
        .tip-date { font-size: 11px; color: #8a8f99; }
        .tip-btn { background: #e8f042; color: #000; font-size: 12px; font-weight: 800; padding: 7px 16px; border-radius: 4px; }
        .sidebar { display: flex; flex-direction: column; gap: 16px; }
        .sidebar-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 18px; }
        .sidebar-title { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 14px; }
        .sport-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
        .sport-row:last-child { border-bottom: none; }
        .sport-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
        .bm-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .bm-item:last-child { border-bottom: none; }
        .bm-name { font-size: 14px; font-weight: 700; }
        .bm-bonus { font-size: 11px; color: #2ecc8a; }
        .bm-cta { background: #e8f042; color: #000; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 3px; }
        .email-box { background: rgba(232,240,66,0.04); border: 1px solid rgba(232,240,66,0.2); border-radius: 8px; padding: 16px; }
        .email-title { font-size: 13px; font-weight: 700; color: #e8f042; margin-bottom: 8px; }
        .email-sub { font-size: 12px; color: #8a8f99; margin-bottom: 12px; line-height: 1.5; }
        .email-input { width: 100%; background: #0a0c0f; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 9px 12px; color: #fff; font-size: 13px; margin-bottom: 8px; }
        .email-btn { display: block; background: #e8f042; color: #000; text-align: center; padding: 9px; border-radius: 4px; font-weight: 800; font-size: 12px; letter-spacing: 0.05em; }
        .no-tips { text-align: center; padding: 60px 32px; color: #8a8f99; }
        .no-tips h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }
        .past-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.07); }
        .past-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px; }
        .past-card { background: #111418; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; display: block; opacity: 0.7; }
        .past-card:hover { opacity: 1; }
        .past-date { font-size: 10px; color: #8a8f99; margin-bottom: 4px; }
        .past-title { font-size: 12px; font-weight: 600; line-height: 1.3; color: #f0ede6; }
        .past-sport { font-size: 10px; color: #8a8f99; margin-top: 4px; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 60px; }
        @media (max-width: 900px) { .main { grid-template-columns: 1fr; } .nav-links { display: none; } }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/" className="nav-active">Today&apos;s Tips</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-label">&#128197; {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <h1 className="page-title">Today&apos;s <em>Free Tips</em></h1>
          <p className="page-subtitle">AI-analysed predictions across football, NBA, tennis and NFL. Updated daily at 9:00 AM.</p>
          <div className="page-stats">
            <div className="page-stat"><strong>{totalRecent}</strong><span>Tips this week</span></div>
            <div className="page-stat"><strong>74%</strong><span>Win rate</span></div>
            <div className="page-stat"><strong>6</strong><span>Sports covered</span></div>
          </div>
        </div>
      </div>

      <div className="sport-filter">
        <div className="filter-tab filter-active">All Sports</div>
        <div className="filter-tab">&#9917; Football</div>
        <div className="filter-tab">&#127936; Basketball</div>
        <div className="filter-tab">&#127934; Tennis</div>
        <div className="filter-tab">&#127944; NFL</div>
      </div>

      <div className="main">
        <div className="tips-list">
          {todayArticles.length > 0 && (
            <div className="section-label">&#128994; Today&apos;s Predictions — {todayArticles.length} tips</div>
          )}
          {todayArticles.map(article => (
            <a key={article.slug} href={`/predictions/${article.slug}/`} className="tip-card">
              <div className="tip-header">
                <span className="tip-sport-badge" style={{ background: `${SPORT_COLOR[article.sport]}20`, color: SPORT_COLOR[article.sport], border: `1px solid ${SPORT_COLOR[article.sport]}40` }}>
                  {SPORT_EMOJI[article.sport]} {article.sport}
                </span>
                <span className="tip-league">{article.league}</span>
              </div>
              <div className="tip-body">
                <div className="tip-title">{article.title}</div>
                <div className="tip-main">
                  <span className="tip-pick">{article.prediction?.split('@')[0]?.trim()}</span>
                  <div>
                    <div className="tip-odds-label">Odds</div>
                    <span className="tip-odds">{article.odds}</span>
                  </div>
                  <div className="tip-conf" style={{ color: article.confidence >= 5 ? '#2ecc8a' : article.confidence >= 4 ? '#e8f042' : '#f39c12' }}>
                    <div className="conf-dots">
                      {[1,2,3,4,5].map(i => <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />)}
                    </div>
                  </div>
                </div>
                {article.excerpt && <div className="tip-excerpt">{article.excerpt}</div>}
                <div className="tip-footer">
                  <span className="tip-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <span className="tip-btn">READ ANALYSIS &rarr;</span>
                </div>
              </div>
            </a>
          ))}

          {recentArticles.length > 0 && (
            <div className="section-label">&#128197; This Week — {recentArticles.length} tips</div>
          )}
          {recentArticles.map(article => (
            <a key={article.slug} href={`/predictions/${article.slug}/`} className="tip-card">
              <div className="tip-header">
                <span className="tip-sport-badge" style={{ background: `${SPORT_COLOR[article.sport]}20`, color: SPORT_COLOR[article.sport], border: `1px solid ${SPORT_COLOR[article.sport]}40` }}>
                  {SPORT_EMOJI[article.sport]} {article.sport}
                </span>
                <span className="tip-league">{article.league}</span>
              </div>
              <div className="tip-body">
                <div className="tip-title">{article.title}</div>
                <div className="tip-main">
                  <span className="tip-pick">{article.prediction?.split('@')[0]?.trim()}</span>
                  <div>
                    <div className="tip-odds-label">Odds</div>
                    <span className="tip-odds">{article.odds}</span>
                  </div>
                  <div className="tip-conf" style={{ color: article.confidence >= 5 ? '#2ecc8a' : article.confidence >= 4 ? '#e8f042' : '#f39c12' }}>
                    <div className="conf-dots">
                      {[1,2,3,4,5].map(i => <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />)}
                    </div>
                  </div>
                </div>
                <div className="tip-footer">
                  <span className="tip-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <span className="tip-btn">READ ANALYSIS &rarr;</span>
                </div>
              </div>
            </a>
          ))}

          {todayArticles.length === 0 && recentArticles.length === 0 && (
            <div className="no-tips">
              <h3>No predictions yet</h3>
              <p>Our AI agents publish new predictions daily at 9:00 AM.</p>
            </div>
          )}

          {pastArticles.length > 0 && (
            <div className="past-section">
              <div className="section-label">&#128193; Past Predictions</div>
              <div className="past-grid">
                {pastArticles.slice(0, 12).map(article => (
                  <a key={article.slug} href={`/predictions/${article.slug}/`} className="past-card">
                    <div className="past-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                    <div className="past-title">{article.title}</div>
                    <div className="past-sport">{SPORT_EMOJI[article.sport]} {article.league}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">Tips by Sport</div>
            {['football', 'basketball', 'tennis', 'nfl'].map(sport => {
              const count = allArticles.filter(a => a.sport === sport && a.date >= new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]).length
              return (
                <div key={sport} className="sport-row">
                  <a href={`/${sport}/`}>{SPORT_EMOJI[sport]} {sport.charAt(0).toUpperCase() + sport.slice(1)}</a>
                  <span className="sport-count">{count}</span>
                </div>
              )
            })}
          </div>

          <div className="sidebar-card">
            <div className="sidebar-title">Top Bookmakers</div>
            {[
              { name: 'Bet365', bonus: 'Up to £100 bonus' },
              { name: 'DraftKings', bonus: '$200 bonus bets' },
              { name: 'William Hill', bonus: '£30 free bet' },
              { name: 'Betway', bonus: '€30 free bet' },
            ].map(bm => (
              <div key={bm.name} className="bm-item">
                <div>
                  <div className="bm-name">{bm.name}</div>
                  <div className="bm-bonus">{bm.bonus}</div>
                </div>
                <a href="#" className="bm-cta">Claim &rarr;</a>
              </div>
            ))}
          </div>

          <div className="email-box">
            <div className="email-title">Get Daily Tips Free</div>
            <div className="email-sub">Join 12,000+ bettors receiving our AI picks every morning.</div>
            <input type="email" placeholder="your@email.com" className="email-input" />
            <a href="#" className="email-btn">SUBSCRIBE FREE &rarr;</a>
          </div>
        </div>
      </div>

      <div className="rg-bar">
        <strong style={{color:'#fff'}}>&#9888; Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
