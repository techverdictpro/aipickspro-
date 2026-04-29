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
  result?: string
  content: string
}

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽', basketball: '🏀', tennis: '🎾', nfl: '🏈'
}

const SPORT_COLOR: Record<string, string> = {
  football: '#4a9eff', basketball: '#e84545', tennis: '#2ecc8a', nfl: '#f39c12'
}

function getAllArticles(): Article[] {
  const sports = ['football', 'basketball', 'tennis', 'nfl']
  const articles: Article[] = []

  for (const sport of sports) {
    const baseDir = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(baseDir)) continue

    const entries = fs.readdirSync(baseDir)
    for (const entry of entries) {
      const entryPath = path.join(baseDir, entry)
      if (entry.endsWith('.mdx')) {
        const raw = fs.readFileSync(entryPath, 'utf-8')
        const { data, content } = matter(raw)
        articles.push({ ...data, sport, content } as Article)
      } else if (fs.statSync(entryPath).isDirectory()) {
        const files = fs.readdirSync(entryPath).filter(f => f.endsWith('.mdx'))
        for (const file of files) {
          const raw = fs.readFileSync(path.join(entryPath, file), 'utf-8')
          const { data, content } = matter(raw)
          articles.push({ ...data, sport, content } as Article)
        }
      }
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getPreview(content: string): string {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('---') && !l.startsWith('#') && !l.startsWith('*'))
  return lines[0]?.substring(0, 200) + '...' || ''
}

export default function TipsTodayPage() {
  const allArticles = getAllArticles()
  const today = new Date().toISOString().split('T')[0]

  const todayArticles = allArticles.filter(a => a.date === today)
  const pastArticles = allArticles.filter(a => a.date < today).slice(0, 20)

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
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 28px 32px; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .page-date { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #e8f042; margin-bottom: 10px; }
        .page-title { font-size: 38px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 14px; color: #8a8f99; }
        .page-stats { display: flex; gap: 28px; margin-top: 16px; flex-wrap: wrap; }
        .page-stat strong { color: #e8f042; font-size: 20px; font-weight: 900; display: block; }
        .page-stat span { font-size: 11px; color: #8a8f99; text-transform: uppercase; letter-spacing: 0.06em; }
        .main { max-width: 1200px; margin: 0 auto; padding: 32px; display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
        .tips-list { display: flex; flex-direction: column; gap: 14px; }
        .section-label { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 8px; }
        .tip-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; display: block; }
        .tip-card:hover { border-color: rgba(232,240,66,0.25); }
        .tip-card.won { border-left: 3px solid #2ecc8a; }
        .tip-card.lost { border-left: 3px solid #e84545; }
        .tip-header { padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); }
        .tip-sport-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 3px; }
        .tip-league { font-size: 11px; color: #8a8f99; }
        .result-badge { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 3px; letter-spacing: 0.05em; }
        .result-won { background: rgba(46,204,138,0.15); color: #2ecc8a; border: 1px solid rgba(46,204,138,0.3); }
        .result-lost { background: rgba(232,69,69,0.15); color: #e84545; border: 1px solid rgba(232,69,69,0.3); }
        .result-pending { background: rgba(255,255,255,0.05); color: #8a8f99; }
        .tip-body { padding: 16px 18px; }
        .tip-title { font-size: 16px; font-weight: 700; line-height: 1.3; margin-bottom: 8px; color: #f0ede6; }
        .tip-preview { font-size: 13px; color: #8a8f99; line-height: 1.6; margin-bottom: 12px; }
        .tip-pick { background: rgba(232,240,66,0.08); border: 1px solid rgba(232,240,66,0.2); border-radius: 4px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .tip-pick-label { font-size: 10px; color: #8a8f99; margin-bottom: 2px; }
        .tip-pick-val { font-size: 13px; font-weight: 800; color: #e8f042; }
        .tip-odds { font-size: 28px; font-weight: 900; color: #e8f042; }
        .tip-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
        .tip-date { font-size: 11px; color: #8a8f99; }
        .tip-btn { background: #e8f042; color: #000; font-size: 12px; font-weight: 800; padding: 7px 16px; border-radius: 4px; }
        .tip-btn:hover { background: #c8d435; }
        .no-tips { text-align: center; padding: 60px 32px; color: #8a8f99; }
        .no-tips h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }
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
        .past-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 12px; }
        .past-card { background: #111418; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; display: block; }
        .past-card:hover { border-color: rgba(255,255,255,0.15); }
        .past-card.won { border-left: 3px solid #2ecc8a; }
        .past-card.lost { border-left: 3px solid #e84545; }
        .past-date { font-size: 10px; color: #8a8f99; margin-bottom: 4px; }
        .past-title { font-size: 12px; font-weight: 600; line-height: 1.3; color: #f0ede6; }
        .past-result { font-size: 10px; font-weight: 700; margin-top: 4px; }
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
          <div className="page-date">&#128197; {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <h1 className="page-title">Today&apos;s <em>Free Tips</em></h1>
          <p className="page-subtitle">AI-analysed predictions across football, NBA, tennis and NFL. Updated daily at 9:00 AM.</p>
          <div className="page-stats">
            <div className="page-stat"><strong>{todayArticles.length}</strong><span>Tips today</span></div>
            <div className="page-stat"><strong>74%</strong><span>Win rate</span></div>
            <div className="page-stat"><strong>20+</strong><span>Competitions</span></div>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="tips-list">
          {todayArticles.length === 0 ? (
            <div className="no-tips">
              <h3>No predictions for today yet</h3>
              <p>Our AI agents publish new predictions daily at 9:00 AM. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="section-label">&#128994; Today&apos;s Predictions — {todayArticles.length} tips</div>
              {todayArticles.map(article => (
                <a key={article.slug} href={`/predictions/${article.slug}/`} className={`tip-card ${article.result || ''}`}>
                  <div className="tip-header">
                    <span className="tip-sport-badge" style={{ background: `${SPORT_COLOR[article.sport]}20`, color: SPORT_COLOR[article.sport], border: `1px solid ${SPORT_COLOR[article.sport]}40` }}>
                      {SPORT_EMOJI[article.sport]} {article.sport}
                    </span>
                    <span className="tip-league">{article.league}</span>
                    {article.result && article.result !== 'pending' && (
                      <span className={`result-badge result-${article.result}`}>
                        {article.result === 'won' ? '✓ WON' : '✗ LOST'}
                      </span>
                    )}
                  </div>
                  <div className="tip-body">
                    <div className="tip-title">{article.title}</div>
                    <div className="tip-preview">{getPreview(article.content)}</div>
                    <div className="tip-pick">
                      <div>
                        <div className="tip-pick-label">Our Pick</div>
                        <div className="tip-pick-val">{article.prediction?.split('@')[0]?.trim()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="tip-pick-label">Odds</div>
                        <div className="tip-odds">{article.odds}</div>
                      </div>
                    </div>
                    <div className="tip-footer">
                      <span className="tip-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      <span className="tip-btn">READ FULL ANALYSIS &rarr;</span>
                    </div>
                  </div>
                </a>
              ))}
            </>
          )}

          {pastArticles.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: '32px' }}>&#128197; Previous Predictions</div>
              <div className="past-grid">
                {pastArticles.map(article => (
                  <a key={article.slug} href={`/predictions/${article.slug}/`} className={`past-card ${article.result || ''}`}>
                    <div className="past-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {SPORT_EMOJI[article.sport]} {article.league}</div>
                    <div className="past-title">{article.title}</div>
                    {article.result && article.result !== 'pending' && (
                      <div className="past-result" style={{ color: article.result === 'won' ? '#2ecc8a' : '#e84545' }}>
                        {article.result === 'won' ? '✓ Won' : '✗ Lost'} · {article.prediction?.split('@')[0]?.trim()} @ {article.odds}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">Tips by Sport</div>
            {['football', 'basketball', 'tennis', 'nfl'].map(sport => {
              const count = todayArticles.filter(a => a.sport === sport).length
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
              { name: 'Bet365', bonus: 'Up to £100 bonus', url: 'https://www.bet365.com' },
              { name: 'DraftKings', bonus: '$200 bonus bets', url: 'https://www.draftkings.com' },
              { name: 'William Hill', bonus: '£30 free bet', url: 'https://www.williamhill.com' },
              { name: 'Betway', bonus: '€30 free bet', url: 'https://www.betway.com' },
            ].map(bm => (
              <div key={bm.name} className="bm-item">
                <div>
                  <div className="bm-name">{bm.name}</div>
                  <div className="bm-bonus">{bm.bonus}</div>
                </div>
                <a href={bm.url} target="_blank" rel="noopener noreferrer" className="bm-cta">Claim &rarr;</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rg-bar">
        <strong style={{color:'#fff'}}>&#9888; Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
