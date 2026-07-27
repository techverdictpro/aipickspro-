import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Article {
  slug: string
  title: string
  league: string
  date: string
  prediction: string
  odds: string
  confidence: number
  result?: string
  content: string
}

function getPreview(content: string): string {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('---') && !l.startsWith('#') && !l.startsWith('*'))
  return lines[0]?.substring(0, 200) + '...' || ''
}

function getArticles(): Article[] {
  const baseDir = path.join(process.cwd(), 'content', 'predictions', 'nfl')
  if (!fs.existsSync(baseDir)) return []
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]
  const articles: Article[] = []

  const entries = fs.readdirSync(baseDir)
  for (const entry of entries) {
    const entryPath = path.join(baseDir, entry)
    if (entry.endsWith('.mdx')) {
      const raw = fs.readFileSync(entryPath, 'utf-8')
      const { data, content } = matter(raw)
      if (data.date >= weekAgo) articles.push({ slug: entry.replace('.mdx', ''), ...data, content } as Article)
    } else if (fs.statSync(entryPath).isDirectory()) {
      const files = fs.readdirSync(entryPath).filter(f => f.endsWith('.mdx'))
      for (const file of files) {
        const raw = fs.readFileSync(path.join(entryPath, file), 'utf-8')
        const { data, content } = matter(raw)
        if (data.date >= weekAgo) articles.push({ slug: file.replace('.mdx', ''), ...data, content } as Article)
      }
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function NFLPage() {
  const articles = getArticles()

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0c0f; color: #f0ede6; font-family: 'Segoe UI', Arial, sans-serif; }
        a { text-decoration: none; color: inherit; }
        nav { position: sticky; top: 0; z-index: 100; background: rgba(10,12,15,0.96); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; height: 58px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 22px; font-weight: 900; } .logo-accent { color: #e8f042; }
        .nav-links { display: flex; gap: 24px; font-size: 13px; color: #8a8f99; }
        .nav-links a:hover { color: #fff; } .nav-active { color: #e8f042 !important; }
        .nav-cta { background: #e8f042; color: #000; padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 800; }
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 28px 32px; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 10px; }
        .page-title { font-size: 38px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 14px; color: #8a8f99; }
        .main { max-width: 1200px; margin: 0 auto; padding: 32px; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid rgba(255,255,255,0.07); }
        .section-title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
        .section-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 10px; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .article-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.2s; }
        .article-card:hover { border-color: rgba(232,240,66,0.3); }
        .article-card.won { border-left: 3px solid #2ecc8a; }
        .article-card.lost { border-left: 3px solid #e84545; }
        .card-top { padding: 16px 18px 12px; flex: 1; }
        .card-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
        .result-won { color: #2ecc8a; font-weight: 800; }
        .result-lost { color: #e84545; font-weight: 800; }
        .card-title { font-size: 15px; font-weight: 700; line-height: 1.3; margin-bottom: 10px; color: #f0ede6; }
        .card-preview { font-size: 13px; color: #8a8f99; line-height: 1.6; margin-bottom: 12px; }
        .card-pick { background: rgba(232,240,66,0.1); border: 1px solid rgba(232,240,66,0.25); border-radius: 4px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .card-pick-label { font-size: 11px; color: #8a8f99; margin-bottom: 2px; }
        .card-pick-val { font-size: 13px; font-weight: 800; color: #e8f042; }
        .card-odds-val { font-size: 26px; font-weight: 900; color: #e8f042; }
        .card-conf { display: flex; gap: 3px; margin-bottom: 10px; }
        .cdot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: #e8f042; }
        .card-bottom { padding: 12px 18px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: space-between; }
        .card-date { font-size: 11px; color: #8a8f99; }
        .card-btn { background: #e8f042; color: #000; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 4px; }
        .no-articles { text-align: center; padding: 60px; color: #8a8f99; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 40px; }
        @media (max-width: 1000px) { .articles-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 650px) { .articles-grid { grid-template-columns: 1fr; } .nav-links { display: none; } }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/" className="nav-active">NFL</a>
          <a href="/tips-today/">Today&apos;s Tips</a>
          <a href="/results/">Results</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="breadcrumb"><a href="/">Home</a> &rsaquo; <span style={{color:'#e8f042'}}>&#127944; NFL Predictions</span></div>
          <h1 className="page-title">NFL <em>Predictions</em></h1>
          <p className="page-subtitle">AI-powered NFL picks with spread, moneyline and totals analysis — {articles.length} tips this week</p>
        </div>
      </div>

      <div className="main">
        {articles.length === 0 ? (
          <div className="no-articles"><h3>No predictions yet</h3><p>Check back at 9:00 AM for daily picks.</p></div>
        ) : (
          <>
            <div className="section-header">
              <div className="section-title">&#127944; NFL</div>
              <span className="section-count">{articles.length} tips</span>
            </div>
            <div className="articles-grid">
              {articles.map(article => (
                <div key={article.slug} className={`article-card ${article.result || ''}`}>
                  <div className="card-top">
                    <div className="card-badge">
                      <span>{article.league}</span>
                      {article.result === 'won' && <span className="result-won">&#10003; WON</span>}
                      {article.result === 'lost' && <span className="result-lost">&#10007; LOST</span>}
                    </div>
                    <div className="card-title">{article.title}</div>
                    <div className="card-preview">{getPreview(article.content)}</div>
                    <div className="card-pick">
                      <div>
                        <div className="card-pick-label">Our Pick</div>
                        <div className="card-pick-val">{article.prediction?.split('@')[0]?.trim()}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div className="card-pick-label">Odds</div>
                        <div className="card-odds-val">{article.odds}</div>
                      </div>
                    </div>
                    <div className="card-conf">{[1,2,3,4,5].map(i => <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />)}</div>
                  </div>
                  <div className="card-bottom">
                    <span className="card-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <a href={`/predictions/${article.slug}/`} className="card-btn">READ FULL ANALYSIS &rarr;</a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="rg-bar"><strong style={{color:'#fff'}}>&#9888; Gamble Responsibly.</strong> 18+ only.</div>
    </>
  )
}
