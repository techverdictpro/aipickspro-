import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Article {
  slug: string
  title: string
  league: string
  leagueSlug: string
  date: string
  prediction: string
  odds: string
  confidence: number
  excerpt: string
  content: string
}

const LEAGUE_META: Record<string, { label: string; flag: string; priority: number }> = {
  'champions-league':          { label: 'Champions League',        flag: '🏆', priority: 1 },
  'europa-league':             { label: 'Europa League',           flag: '🟠', priority: 2 },
  'conference-league':         { label: 'Conference League',       flag: '🟢', priority: 3 },
  'premier-league':            { label: 'Premier League',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 4 },
  'la-liga':                   { label: 'La Liga',                 flag: '🇪🇸', priority: 5 },
  'bundesliga':                { label: 'Bundesliga',              flag: '🇩🇪', priority: 6 },
  'serie-a':                   { label: 'Serie A',                 flag: '🇮🇹', priority: 7 },
  'ligue-1':                   { label: 'Ligue 1',                 flag: '🇫🇷', priority: 8 },
  'championship':              { label: 'Championship',            flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 9 },
  'la-liga-2':                 { label: 'La Liga 2',               flag: '🇪🇸', priority: 10 },
  'bundesliga-2':              { label: 'Bundesliga 2',            flag: '🇩🇪', priority: 11 },
  'serie-b':                   { label: 'Serie B',                 flag: '🇮🇹', priority: 12 },
  'ligue-2':                   { label: 'Ligue 2',                 flag: '🇫🇷', priority: 13 },
  'copa-libertadores':         { label: 'Copa Libertadores',       flag: '🌎', priority: 14 },
  'copa-sudamericana':         { label: 'Copa Sudamericana',       flag: '🌎', priority: 15 },
  'primeira-liga':             { label: 'Primeira Liga',           flag: '🇵🇹', priority: 16 },
  'eredivisie':                { label: 'Eredivisie',              flag: '🇳🇱', priority: 17 },
  'scottish-premiership':      { label: 'Scottish Premiership',    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', priority: 18 },
  'mls':                       { label: 'MLS',                     flag: '🇺🇸', priority: 19 },
  'liga-mx':                   { label: 'Liga MX',                 flag: '🇲🇽', priority: 20 },
  'super-lig':                 { label: 'Süper Lig',               flag: '🇹🇷', priority: 21 },
  'saudi-pro-league':          { label: 'Saudi Pro League',        flag: '🇸🇦', priority: 22 },
  'brasileirao':               { label: 'Brasileirão',            flag: '🇧🇷', priority: 23 },
  'primera-division-argentina':{ label: 'Primera División',        flag: '🇦🇷', priority: 24 },
  'league-one':                { label: 'League One',              flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 25 },
}

function getPreview(content: string): string {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('---') && !l.startsWith('#') && !l.startsWith('*'))
  return lines.slice(0, 2).join(' ').substring(0, 220) + '...'
}

function getAllFootballArticles(): Record<string, Article[]> {
  const baseDir = path.join(process.cwd(), 'content', 'predictions', 'football')
  if (!fs.existsSync(baseDir)) return {}

  const result: Record<string, Article[]> = {}
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]

  const leagueDirs = fs.readdirSync(baseDir).filter(f =>
    fs.statSync(path.join(baseDir, f)).isDirectory()
  )

  for (const leagueSlug of leagueDirs) {
    const dir = path.join(baseDir, leagueSlug)
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
    const articles: Article[] = []

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const { data, content } = matter(raw)
      if (data.date >= weekAgo) {
        articles.push({
          slug: file.replace('.mdx', ''),
          title: data.title || '',
          league: data.league || '',
          leagueSlug,
          date: data.date || '',
          prediction: data.prediction || '',
          odds: data.odds || '',
          confidence: data.confidence || 3,
          excerpt: data.excerpt || '',
          content,
        })
      }
    }

    if (articles.length > 0) {
      articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      result[leagueSlug] = articles
    }
  }

  // Also check old flat structure
  const oldFiles = fs.readdirSync(baseDir).filter(f => f.endsWith('.mdx'))
  for (const file of oldFiles) {
    const raw = fs.readFileSync(path.join(baseDir, file), 'utf-8')
    const { data, content } = matter(raw)
    if (data.date >= weekAgo) {
      const slug = 'other'
      if (!result[slug]) result[slug] = []
      result[slug].push({
        slug: file.replace('.mdx', ''),
        title: data.title || '',
        league: data.league || '',
        leagueSlug: 'other',
        date: data.date || '',
        prediction: data.prediction || '',
        odds: data.odds || '',
        confidence: data.confidence || 3,
        excerpt: data.excerpt || '',
        content,
      })
    }
  }

  return result
}

function sortedLeagues(grouped: Record<string, Article[]>) {
  return Object.keys(grouped).sort((a, b) => {
    const pa = LEAGUE_META[a]?.priority ?? 99
    const pb = LEAGUE_META[b]?.priority ?? 99
    return pa - pb
  })
}

export default function FootballPage() {
  const grouped = getAllFootballArticles()
  const leagues = sortedLeagues(grouped)
  const totalArticles = Object.values(grouped).reduce((s, a) => s + a.length, 0)

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
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 10px; }
        .page-title { font-size: 38px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 14px; color: #8a8f99; }
        .page-stats { display: flex; gap: 28px; margin-top: 16px; flex-wrap: wrap; }
        .page-stat strong { color: #e8f042; font-size: 20px; font-weight: 900; display: block; }
        .page-stat span { font-size: 11px; color: #8a8f99; text-transform: uppercase; letter-spacing: 0.06em; }
        .main { max-width: 1200px; margin: 0 auto; padding: 32px; }
        .league-section { margin-bottom: 40px; }
        .league-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2px solid rgba(255,255,255,0.07); }
        .league-title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 8px; }
        .league-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 10px; }
        .league-link { font-size: 12px; color: #8a8f99; }
        .league-link:hover { color: #e8f042; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .article-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; display: flex; flex-direction: column; }
        .article-card:hover { border-color: rgba(232,240,66,0.3); }
        .card-top { padding: 16px 18px 12px; flex: 1; }
        .card-league-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 8px; }
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
        .card-btn { background: #e8f042; color: #000; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 4px; letter-spacing: 0.04em; }
        .card-btn:hover { background: #c8d435; }
        .no-articles { text-align: center; padding: 60px; color: #8a8f99; }
        .no-articles h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 40px; }
        @media (max-width: 1000px) { .articles-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 650px) { .articles-grid { grid-template-columns: 1fr; } .nav-links { display: none; } .page-title { font-size: 28px; } }
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
          <div className="breadcrumb"><a href="/">Home</a> &rsaquo; <span style={{color:'#e8f042'}}>&#9917; Football Predictions</span></div>
          <h1 className="page-title">Football <em>Predictions</em></h1>
          <p className="page-subtitle">Expert AI analysis across {leagues.length} competitions — Premier League, Champions League, Copa Libertadores and more</p>
          <div className="page-stats">
            <div className="page-stat"><strong>{totalArticles}</strong><span>Tips this week</span></div>
            <div className="page-stat"><strong>{leagues.length}</strong><span>Competitions</span></div>
            <div className="page-stat"><strong>74%</strong><span>Win rate</span></div>
          </div>
        </div>
      </div>

      <div className="main">
        {leagues.length === 0 ? (
          <div className="no-articles">
            <h3>No predictions yet</h3>
            <p>Our AI agents publish new predictions daily at 9:00 AM.</p>
          </div>
        ) : (
          leagues.map(leagueSlug => {
            const meta = LEAGUE_META[leagueSlug]
            const label = meta?.label || leagueSlug
            const flag = meta?.flag || '⚽'
            const articles = grouped[leagueSlug]

            return (
              <div key={leagueSlug} className="league-section">
                <div className="league-header">
                  <div className="league-title">
                    <span>{flag}</span>
                    <span>{label}</span>
                    <span className="league-count">{articles.length} tips</span>
                  </div>
                </div>
                <div className="articles-grid">
                  {articles.map(article => (
                    <div key={article.slug} className="article-card">
                      <div className="card-top">
                        <div className="card-league-badge">{article.league}</div>
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
                        <div className="card-conf">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />
                          ))}
                        </div>
                      </div>
                      <div className="card-bottom">
                        <span className="card-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <a href={`/predictions/${article.slug}/`} className="card-btn">READ FULL ANALYSIS &rarr;</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="rg-bar">
        <strong style={{color:'#fff'}}>&#9888; Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
