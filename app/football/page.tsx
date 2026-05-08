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
  result?: string
  preview: string
}

const LEAGUE_META: Record<string, { label: string; flag: string; priority: number }> = {
  'champions-league':           { label: 'Champions League',        flag: '🏆', priority: 1 },
  'europa-league':              { label: 'Europa League',           flag: '🟠', priority: 2 },
  'conference-league':          { label: 'Conference League',       flag: '🟢', priority: 3 },
  'premier-league':             { label: 'Premier League',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 4 },
  'la-liga':                    { label: 'La Liga',                 flag: '🇪🇸', priority: 5 },
  'bundesliga':                 { label: 'Bundesliga',              flag: '🇩🇪', priority: 6 },
  'serie-a':                    { label: 'Serie A',                 flag: '🇮🇹', priority: 7 },
  'ligue-1':                    { label: 'Ligue 1',                 flag: '🇫🇷', priority: 8 },
  'championship':               { label: 'Championship',            flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 9 },
  'la-liga-2':                  { label: 'La Liga 2',               flag: '🇪🇸', priority: 10 },
  'bundesliga-2':               { label: 'Bundesliga 2',            flag: '🇩🇪', priority: 11 },
  'serie-b':                    { label: 'Serie B',                 flag: '🇮🇹', priority: 12 },
  'ligue-2':                    { label: 'Ligue 2',                 flag: '🇫🇷', priority: 13 },
  'copa-libertadores':          { label: 'Copa Libertadores',       flag: '🌎', priority: 14 },
  'copa-sudamericana':          { label: 'Copa Sudamericana',       flag: '🌎', priority: 15 },
  'primeira-liga':              { label: 'Primeira Liga',           flag: '🇵🇹', priority: 16 },
  'eredivisie':                 { label: 'Eredivisie',              flag: '🇳🇱', priority: 17 },
  'scottish-premiership':       { label: 'Scottish Premiership',    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', priority: 18 },
  'mls':                        { label: 'MLS',                     flag: '🇺🇸', priority: 19 },
  'liga-mx':                    { label: 'Liga MX',                 flag: '🇲🇽', priority: 20 },
  'super-lig':                  { label: 'Süper Lig',               flag: '🇹🇷', priority: 21 },
  'saudi-pro-league':           { label: 'Saudi Pro League',        flag: '🇸🇦', priority: 22 },
  'brasileirao':                { label: 'Brasileirão',            flag: '🇧🇷', priority: 23 },
  'primera-division-argentina': { label: 'Primera División',        flag: '🇦🇷', priority: 24 },
  'primera-division':           { label: 'Primera División',        flag: '🇦🇷', priority: 24 },
  'league-one':                 { label: 'League One',              flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 25 },
  'belgian-first-division':     { label: 'Belgian Pro League',      flag: '🇧🇪', priority: 26 },
  'austrian-bundesliga':        { label: 'Austrian Bundesliga',     flag: '🇦🇹', priority: 27 },
  'super-league-greece':        { label: 'Super League Greece',     flag: '🇬🇷', priority: 28 },
}

function getPreview(content: string): string {
  const lines = content.split('\n').filter(l =>
    l.trim() &&
    !l.startsWith('---') &&
    !l.startsWith('*') &&
    !l.includes('Kick-off:') &&
    !l.includes('Odds:') &&
    !l.includes('Form:') &&
    !l.includes('Goals/game:')
  )
  const verdict = lines.find(l => l.includes('VERDICT:'))
  if (verdict) return verdict.replace('VERDICT:', '').trim().substring(0, 160)
  return lines.slice(1).find(l => l.length > 20)?.substring(0, 160) || ''
}

function getArticles(): Record<string, Article[]> {
  const baseDir = path.join(process.cwd(), 'content', 'predictions', 'football')
  if (!fs.existsSync(baseDir)) return {}

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]
  const result: Record<string, Article[]> = {}
  const seenSlugs = new Set<string>()

  const scan = (dir: string, leagueSlug: string) => {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir)
    for (const entry of entries) {
      const fullPath = path.join(dir, entry)
      if (fs.statSync(fullPath).isDirectory()) {
        scan(fullPath, entry)
      } else if (entry.endsWith('.mdx')) {
        const slug = entry.replace('.mdx', '')
        if (seenSlugs.has(slug)) continue
        seenSlugs.add(slug)

        const raw = fs.readFileSync(fullPath, 'utf-8')
        const { data, content } = matter(raw)

        // Only filter by date - show all predictions regardless of odds
        if (!data.date || data.date < weekAgo) continue

        if (!result[leagueSlug]) result[leagueSlug] = []
        result[leagueSlug].push({
          slug,
          title: data.title || '',
          league: data.league || '',
          leagueSlug,
          date: data.date || '',
          prediction: data.prediction || '',
          odds: data.odds || '',
          confidence: data.confidence || 3,
          result: data.result,
          preview: getPreview(content),
        })
      }
    }
  }

  scan(baseDir, 'other')

  for (const key of Object.keys(result)) {
    result[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    // Remove 'other' key entries into their league if we have their real league
    if (key === 'other') {
      result[key] = result[key].filter(a => a.league)
    }
  }

  // Remove empty groups
  for (const key of Object.keys(result)) {
    if (result[key].length === 0) delete result[key]
  }

  return result
}

export default function FootballPage() {
  const grouped = getArticles()

  const sortedLeagues = Object.keys(grouped).sort((a, b) => {
    const pa = LEAGUE_META[a]?.priority ?? 99
    const pb = LEAGUE_META[b]?.priority ?? 99
    return pa - pb
  })

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
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 24px 32px; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 8px; }
        .page-title { font-size: 34px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-subtitle { font-size: 13px; color: #8a8f99; }
        .page-stats { display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap; }
        .page-stat strong { color: #e8f042; font-size: 18px; font-weight: 900; display: block; }
        .page-stat span { font-size: 10px; color: #8a8f99; text-transform: uppercase; letter-spacing: 0.06em; }
        .main { max-width: 1200px; margin: 0 auto; padding: 24px 32px 80px; }
        .league-section { margin-bottom: 32px; }
        .league-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid rgba(255,255,255,0.07); }
        .league-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 8px; }
        .league-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 10px; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .article-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.2s; }
        .article-card:hover { border-color: rgba(232,240,66,0.3); }
        .article-card.won { border-left: 3px solid #2ecc8a; }
        .article-card.lost { border-left: 3px solid #e84545; }
        .card-top { padding: 12px 14px 10px; flex: 1; }
        .card-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8f99; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
        .result-won { color: #2ecc8a; font-weight: 800; }
        .result-lost { color: #e84545; font-weight: 800; }
        .card-title { font-size: 13px; font-weight: 700; line-height: 1.3; margin-bottom: 8px; color: #f0ede6; }
        .card-preview { font-size: 11px; color: #8a8f99; line-height: 1.5; margin-bottom: 8px; }
        .card-pick { background: rgba(232,240,66,0.08); border: 1px solid rgba(232,240,66,0.2); border-radius: 4px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .card-pick-label { font-size: 9px; color: #8a8f99; margin-bottom: 1px; text-transform: uppercase; letter-spacing: 0.06em; }
        .card-pick-val { font-size: 12px; font-weight: 800; color: #e8f042; }
        .card-odds-val { font-size: 20px; font-weight: 900; color: #e8f042; }
        .card-conf { display: flex; gap: 2px; }
        .cdot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: #e8f042; }
        .card-bottom { padding: 8px 14px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: space-between; }
        .card-date { font-size: 10px; color: #8a8f99; }
        .card-btn { background: #e8f042; color: #000; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 3px; }
        .no-articles { text-align: center; padding: 60px; color: #8a8f99; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 10px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 40px; }
        @media (max-width: 1000px) { .articles-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 650px) { .articles-grid { grid-template-columns: 1fr; } .nav-links { display: none; } .page-title { font-size: 26px; } }
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
          <div className="breadcrumb"><a href="/">Home</a> &rsaquo; <span style={{color:'#e8f042'}}>⚽ Football Predictions</span></div>
          <h1 className="page-title">Football <em>Predictions</em></h1>
          <p className="page-subtitle">Daily tips across {sortedLeagues.length} competitions — Premier League, Champions League, Copa Libertadores and more</p>
          <div className="page-stats">
            <div className="page-stat"><strong>{totalArticles}</strong><span>Tips this week</span></div>
            <div className="page-stat"><strong>{sortedLeagues.length}</strong><span>Competitions</span></div>
          </div>
        </div>
      </div>

      <div className="main">
        {sortedLeagues.length === 0 ? (
          <div className="no-articles"><h3>No predictions yet</h3><p>Check back at 9:00 AM for daily picks.</p></div>
        ) : (
          sortedLeagues.map(leagueSlug => {
            const meta = LEAGUE_META[leagueSlug]
            const label = meta?.label || leagueSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
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
                    <div key={article.slug} className={`article-card ${article.result === 'won' ? 'won' : article.result === 'lost' ? 'lost' : ''}`}>
                      <div className="card-top">
                        <div className="card-badge">
                          <span>{article.league}</span>
                          {article.result === 'won' && <span className="result-won">✓ WON</span>}
                          {article.result === 'lost' && <span className="result-lost">✗ LOST</span>}
                        </div>
                        <div className="card-title">{article.title}</div>
                        {article.preview && <div className="card-preview">{article.preview}</div>}
                        <div className="card-pick">
                          <div>
                            <div className="card-pick-label">Our Pick</div>
                            <div className="card-pick-val">{article.prediction?.split('@')[0]?.trim()}</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div className="card-pick-label">Odds</div>
                            <div className="card-odds-val">{article.odds || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="card-conf">{[1,2,3,4,5].map(i => <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />)}</div>
                      </div>
                      <div className="card-bottom">
                        <span className="card-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <a href={`/predictions/${article.slug}/`} className="card-btn">VIEW TIP →</a>
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
        <strong style={{color:'#fff'}}>⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
