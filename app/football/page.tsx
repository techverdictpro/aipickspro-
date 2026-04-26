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
  excerpt: string
  home_team: string
  away_team: string
}

function getFootballArticles(): Article[] {
  const dir = path.join(process.cwd(), 'content', 'predictions', 'football')
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
      excerpt: data.excerpt || '',
      home_team: '',
      away_team: '',
    })
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const LEAGUE_ORDER = [
  'Champions League',
  'Europa League',
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
  'Conference League',
]

export default function FootballPage() {
  const articles = getFootballArticles()
  const today = new Date().toISOString().split('T')[0]

  const todayArticles = articles.filter(a => a.date === today)
  const pastArticles = articles.filter(a => a.date < today)

  const grouped = LEAGUE_ORDER.reduce((acc, league) => {
    const leagueArticles = todayArticles.filter(a => a.league === league)
    if (leagueArticles.length > 0) acc[league] = leagueArticles
    return acc
  }, {} as Record<string, Article[]>)

  const otherLeagues = todayArticles.filter(a => !LEAGUE_ORDER.includes(a.league))
  const otherGrouped = otherLeagues.reduce((acc, a) => {
    if (!acc[a.league]) acc[a.league] = []
    acc[a.league].push(a)
    return acc
  }, {} as Record<string, Article[]>)

  const allGrouped = { ...grouped, ...otherGrouped }

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
        .nav-active { color: #e8f042 !important; border-bottom: 2px solid #e8f042; padding-bottom: 2px; }
        .nav-cta { background: #e8f042; color: #000; padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 800; }
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 32px 32px 24px; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 10px; }
        .page-title { font-size: 42px; font-weight: 900; text-transform: uppercase; line-height: 1; margin-bottom: 8px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 14px; color: #8a8f99; }
        .tabs { background: #111418; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .tabs-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; display: flex; gap: 0; }
        .tab { padding: 14px 20px; font-size: 13px; font-weight: 600; color: #8a8f99; border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; }
        .tab:hover { color: #fff; }
        .tab-active { color: #e8f042; border-bottom-color: #e8f042; }
        .main { max-width: 1200px; margin: 0 auto; padding: 32px 32px; }
        .section-title { font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 10px; }
        .section-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 8px; }
        .article-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 16px; cursor: pointer; transition: border-color 0.2s; display: block; }
        .article-card:hover { border-color: rgba(232,240,66,0.3); }
        .card-league { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 6px; }
        .card-title { font-size: 14px; font-weight: 700; line-height: 1.3; margin-bottom: 10px; color: #f0ede6; }
        .card-bottom { display: flex; align-items: center; justify-content: space-between; }
        .card-tip { background: rgba(46,204,138,0.1); color: #2ecc8a; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 3px; }
        .card-odds { font-size: 22px; font-weight: 900; color: #e8f042; }
        .card-conf { display: flex; gap: 2px; margin-top: 8px; }
        .cdot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.15); }
        .cdot-on { background: #e8f042; }
        .no-articles { text-align: center; padding: 60px 32px; color: #8a8f99; }
        .no-articles h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }
        .past-section { margin-top: 40px; }
        .past-title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; color: #8a8f99; }
        .past-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .past-card { background: #111418; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 14px; display: block; opacity: 0.7; transition: opacity 0.2s; }
        .past-card:hover { opacity: 1; border-color: rgba(255,255,255,0.15); }
        .past-date { font-size: 10px; color: #8a8f99; margin-bottom: 4px; }
        .past-title-text { font-size: 12px; font-weight: 600; line-height: 1.3; color: #f0ede6; }
        .past-league { font-size: 10px; color: #8a8f99; margin-top: 4px; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 60px; }
        @media (max-width: 900px) { .articles-grid { grid-template-columns: repeat(2, 1fr); } .past-grid { grid-template-columns: repeat(2, 1fr); } .nav-links { display: none; } }
        @media (max-width: 600px) { .articles-grid { grid-template-columns: 1fr; } .past-grid { grid-template-columns: 1fr; } }
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
          <div className="breadcrumb"><a href="/">Home</a> › <span style={{color:'#e8f042'}}>⚽ Football Predictions</span></div>
          <h1 className="page-title">Football <em>Predictions</em></h1>
          <p className="page-subtitle">AI-powered tips across Premier League, Champions League, La Liga, Bundesliga, Serie A and more</p>
        </div>
      </div>

      <div className="tabs">
        <div className="tabs-inner">
          <div className="tab tab-active">Today&apos;s Predictions</div>
          <div className="tab">Champions League</div>
          <div className="tab">Premier League</div>
          <div className="tab">La Liga</div>
          <div className="tab">Bundesliga</div>
          <div className="tab">Serie A</div>
          <div className="tab">Ligue 1</div>
        </div>
      </div>

      <div className="main">
        {Object.keys(allGrouped).length === 0 ? (
          <div className="no-articles">
            <h3>No predictions for today yet</h3>
            <p>Our AI agents publish new predictions daily at 9:00 AM. Check back soon!</p>
          </div>
        ) : (
          Object.entries(allGrouped).map(([league, leagueArticles]) => (
            <div key={league}>
              <div className="section-title">
                {league}
                <span className="section-count">{leagueArticles.length} tips</span>
              </div>
              <div className="articles-grid">
                {leagueArticles.map(article => (
                  <a key={article.slug} href={`/predictions/${article.slug}/`} className="article-card">
                    <div className="card-league">{article.league}</div>
                    <div className="card-title">{article.title}</div>
                    <div className="card-bottom">
                      <span className="card-tip">{article.prediction?.split('@')[0]?.trim()}</span>
                      <span className="card-odds">{article.odds}</span>
                    </div>
                    <div className="card-conf">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}

        {pastArticles.length > 0 && (
          <div className="past-section">
            <div className="past-title">📁 Past Predictions</div>
            <div className="past-grid">
              {pastArticles.slice(0, 12).map(article => (
                <a key={article.slug} href={`/predictions/${article.slug}/`} className="past-card">
                  <div className="past-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                  <div className="past-title-text">{article.title}</div>
                  <div className="past-league">{article.league}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rg-bar">
        <strong style={{color:'#fff'}}>⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
