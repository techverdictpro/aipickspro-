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
}

function getArticles(sport: string): Article[] {
  const dir = path.join(process.cwd(), 'content', 'predictions', sport)
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
  const articles: Article[] = []
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
    const { data } = matter(raw)
    articles.push({
      slug: file.replace('.mdx', ''),
      title: data.title || '',
      league: data.league || '',
      date: data.date || '',
      prediction: data.prediction || '',
      odds: data.odds || '',
      confidence: data.confidence || 3,
    })
  }
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function TennisPage() {
  const articles = getArticles('tennis')
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]
  const recent = articles.filter(a => a.date >= weekAgo)
  const past = articles.filter(a => a.date < weekAgo)

  const grouped = recent.reduce((acc: Record<string, Article[]>, a) => {
    if (!acc[a.league]) acc[a.league] = []
    acc[a.league].push(a)
    return acc
  }, {})

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
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 10px; }
        .page-title { font-size: 42px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 14px; color: #8a8f99; }
        .main { max-width: 1200px; margin: 0 auto; padding: 32px; }
        .section-title { font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 10px; }
        .section-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .article-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 16px; display: block; transition: border-color 0.2s; }
        .article-card:hover { border-color: rgba(232,240,66,0.3); }
        .card-league { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 6px; }
        .card-title { font-size: 14px; font-weight: 700; line-height: 1.3; margin-bottom: 10px; color: #f0ede6; }
        .card-bottom { display: flex; align-items: center; justify-content: space-between; }
        .card-tip { background: rgba(46,204,138,0.1); color: #2ecc8a; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 3px; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .card-odds { font-size: 22px; font-weight: 900; color: #e8f042; }
        .card-conf { display: flex; gap: 2px; margin-top: 8px; }
        .cdot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.15); }
        .cdot-on { background: #e8f042; }
        .card-date { font-size: 10px; color: #8a8f99; margin-top: 6px; }
        .no-articles { text-align: center; padding: 60px 32px; color: #8a8f99; }
        .no-articles h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }
        .past-section { margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.07); }
        .past-title { font-size: 18px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; color: #8a8f99; }
        .past-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .past-card { background: #111418; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 14px; display: block; opacity: 0.7; }
        .past-card:hover { opacity: 1; }
        .past-date { font-size: 10px; color: #8a8f99; margin-bottom: 4px; }
        .past-title-text { font-size: 12px; font-weight: 600; line-height: 1.3; color: #f0ede6; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 60px; }
        @media (max-width: 900px) { .articles-grid { grid-template-columns: repeat(2,1fr); } .nav-links { display: none; } }
        @media (max-width: 600px) { .articles-grid { grid-template-columns: 1fr; } }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/" className="nav-active">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/">Today&apos;s Tips</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="breadcrumb"><a href="/">Home</a> &rsaquo; <span style={{color:'#e8f042'}}>&#127934; Tennis Predictions</span></div>
          <h1 className="page-title">Tennis <em>Predictions</em></h1>
          <p className="page-subtitle">AI-powered tennis picks for ATP, WTA and Grand Slams</p>
        </div>
      </div>

      <div className="main">
        {Object.keys(grouped).length === 0 ? (
          <div className="no-articles">
            <h3>No predictions yet</h3>
            <p>Our AI agents publish new predictions daily at 9:00 AM.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([league, leagueArticles]) => (
            <div key={league}>
              <div className="section-title">{league}<span className="section-count">{leagueArticles.length} tips</span></div>
              <div className="articles-grid">
                {leagueArticles.map(article => (
                  <a key={article.slug} href={`/predictions/${article.slug}/`} className="article-card">
                    <div className="card-league">{article.league}</div>
                    <div className="card-title">{article.title}</div>
                    <div className="card-bottom">
                      <span className="card-tip">{article.prediction?.split('@')[0]?.trim()}</span>
                      <span className="card-odds">{article.odds}</span>
                    </div>
                    <div className="card-conf">{[1,2,3,4,5].map(i => <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />)}</div>
                    <div className="card-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
        {past.length > 0 && (
          <div className="past-section">
            <div className="past-title">&#128193; Past Predictions</div>
            <div className="past-grid">
              {past.slice(0, 12).map(article => (
                <a key={article.slug} href={`/predictions/${article.slug}/`} className="past-card">
                  <div className="past-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                  <div className="past-title-text">{article.title}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="rg-bar"><strong style={{color:'#fff'}}>&#9888; Gamble Responsibly.</strong> 18+ only.</div>
    </>
  )
}
