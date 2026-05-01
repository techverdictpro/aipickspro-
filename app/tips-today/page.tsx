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
  const today = new Date().toISOString().split('T')[0]

  for (const sport of sports) {
    const baseDir = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(baseDir)) continue

    const entries = fs.readdirSync(baseDir)
    for (const entry of entries) {
      const entryPath = path.join(baseDir, entry)
      if (entry.endsWith('.mdx')) {
        const raw = fs.readFileSync(entryPath, 'utf-8')
        const { data, content } = matter(raw)
        if (data.date === today) articles.push({ ...data, sport, slug: entry.replace('.mdx', ''), content } as Article)
      } else if (fs.statSync(entryPath).isDirectory()) {
        const files = fs.readdirSync(entryPath).filter(f => f.endsWith('.mdx'))
        for (const file of files) {
          const raw = fs.readFileSync(path.join(entryPath, file), 'utf-8')
          const { data, content } = matter(raw)
          if (data.date === today) articles.push({ ...data, sport, slug: file.replace('.mdx', ''), content } as Article)
        }
      }
    }
  }

  return articles.sort((a, b) => a.league.localeCompare(b.league))
}

function getOneLiner(content: string): string {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('---') && !l.startsWith('#') && !l.startsWith('*'))
  const first = lines[0] || ''
  // Skip title line if it appears in content
  const second = lines[1] || ''
  const text = second.length > 50 ? second : first
  return text.substring(0, 140) + (text.length > 140 ? '...' : '')
}

export default function TipsTodayPage() {
  const allArticles = getAllArticles()
  const today = new Date().toISOString().split('T')[0]

  const leagues = Array.from(new Set(allArticles.map(a => a.league))).sort()
  const sports = Array.from(new Set(allArticles.map(a => a.sport)))

  const wonCount = allArticles.filter(a => a.result === 'won').length
  const lostCount = allArticles.filter(a => a.result === 'lost').length

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
        .page-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .page-date { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #e8f042; margin-bottom: 6px; }
        .page-title { font-size: 32px; font-weight: 900; text-transform: uppercase; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-stats { display: flex; gap: 20px; }
        .page-stat { text-align: center; }
        .page-stat strong { color: #e8f042; font-size: 22px; font-weight: 900; display: block; }
        .page-stat span { font-size: 10px; color: #8a8f99; text-transform: uppercase; letter-spacing: 0.06em; }
        .stat-won strong { color: #2ecc8a; }
        .stat-lost strong { color: #e84545; }

        .filters-bar { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; position: sticky; top: 58px; z-index: 90; }
        .filters-inner { max-width: 1100px; margin: 0 auto; display: flex; gap: 0; overflow-x: auto; padding-bottom: 1px; }
        .filter-btn { padding: 12px 16px; font-size: 12px; font-weight: 600; color: #8a8f99; border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; background: none; border-top: none; border-left: none; border-right: none; font-family: inherit; transition: color 0.15s; }
        .filter-btn:hover { color: #fff; }
        .filter-btn.active { color: #e8f042; border-bottom-color: #e8f042; }
        .filter-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 8px; margin-left: 4px; }

        .main { max-width: 1100px; margin: 0 auto; padding: 24px 32px 80px; }

        .league-group { margin-bottom: 28px; }
        .league-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .league-name { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8f99; }
        .league-count { background: rgba(255,255,255,0.05); color: #8a8f99; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 8px; }

        .tip-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #111418; border: 1px solid rgba(255,255,255,0.06); border-radius: 7px; margin-bottom: 6px; transition: border-color 0.15s; text-decoration: none; color: inherit; }
        .tip-row:hover { border-color: rgba(232,240,66,0.25); }
        .tip-row.won { border-left: 3px solid #2ecc8a; }
        .tip-row.lost { border-left: 3px solid #e84545; }

        .tip-result { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; flex-shrink: 0; }
        .tip-result.won { background: rgba(46,204,138,0.15); color: #2ecc8a; }
        .tip-result.lost { background: rgba(232,69,69,0.15); color: #e84545; }
        .tip-result.pending { background: rgba(255,255,255,0.05); color: #8a8f99; font-size: 10px; }

        .tip-sport { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }

        .tip-main { flex: 1; min-width: 0; }
        .tip-title { font-size: 14px; font-weight: 700; color: #f0ede6; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tip-preview { font-size: 12px; color: #8a8f99; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .tip-pick { flex-shrink: 0; text-align: right; min-width: 120px; }
        .tip-pick-val { font-size: 12px; font-weight: 800; color: #e8f042; margin-bottom: 2px; }
        .tip-pick-odds { font-size: 18px; font-weight: 900; color: #e8f042; }

        .tip-conf { display: flex; gap: 2px; justify-content: flex-end; margin-top: 3px; }
        .cdot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: #e8f042; }

        .tip-arrow { color: #8a8f99; font-size: 16px; flex-shrink: 0; }

        .no-tips { text-align: center; padding: 60px; color: #8a8f99; }
        .no-tips h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }

        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 40px; }

        @media (max-width: 700px) {
          .nav-links { display: none; }
          .page-header-inner { flex-direction: column; align-items: flex-start; }
          .tip-preview { display: none; }
          .tip-pick { min-width: 80px; }
          .main { padding: 16px 16px 60px; }
          .filters-bar { padding: 0 16px; }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        function filterTips(league) {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          event.target.classList.add('active');
          document.querySelectorAll('.league-group').forEach(g => {
            if (league === 'all') {
              g.style.display = '';
            } else {
              g.style.display = g.dataset.league === league ? '' : 'none';
            }
          });
        }
      `}} />

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
          <div>
            <div className="page-date">&#128197; {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <h1 className="page-title">Today&apos;s <em>Free Tips</em></h1>
          </div>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{allArticles.length}</strong>
              <span>Tips today</span>
            </div>
            {wonCount > 0 && (
              <div className="page-stat stat-won">
                <strong>{wonCount}</strong>
                <span>Won</span>
              </div>
            )}
            {lostCount > 0 && (
              <div className="page-stat stat-lost">
                <strong>{lostCount}</strong>
                <span>Lost</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-inner">
          <button className="filter-btn active" onClick={() => { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); (event!.target as HTMLElement).classList.add('active'); document.querySelectorAll('.league-group').forEach((g: any) => g.style.display = ''); }}>
            All <span className="filter-count">{allArticles.length}</span>
          </button>
          {sports.map(sport => {
            const count = allArticles.filter(a => a.sport === sport).length
            return (
              <button key={sport} className="filter-btn" onClick={() => { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); (event!.target as HTMLElement).classList.add('active'); document.querySelectorAll('.league-group').forEach((g: any) => { g.style.display = g.dataset.sport === sport ? '' : 'none'; }); }}>
                {SPORT_EMOJI[sport]} {sport.charAt(0).toUpperCase() + sport.slice(1)} <span className="filter-count">{count}</span>
              </button>
            )
          })}
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', margin: '8px 4px', display: 'inline-block', height: '30px' }} />
          {leagues.map(league => {
            const count = allArticles.filter(a => a.league === league).length
            return (
              <button key={league} className="filter-btn" onClick={() => { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); (event!.target as HTMLElement).classList.add('active'); document.querySelectorAll('.league-group').forEach((g: any) => { g.style.display = g.dataset.league === league ? '' : 'none'; }); }}>
                {league} <span className="filter-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="main">
        {allArticles.length === 0 ? (
          <div className="no-tips">
            <h3>No predictions for today yet</h3>
            <p>Our AI agents publish new predictions daily at 9:00 AM. Check back soon!</p>
          </div>
        ) : (
          leagues.map(league => {
            const leagueArticles = allArticles.filter(a => a.league === league)
            const sport = leagueArticles[0]?.sport || 'football'
            return (
              <div key={league} className="league-group" data-league={league} data-sport={sport}>
                <div className="league-header">
                  <span style={{ fontSize: '16px' }}>{SPORT_EMOJI[sport]}</span>
                  <span className="league-name">{league}</span>
                  <span className="league-count">{leagueArticles.length}</span>
                </div>
                {leagueArticles.map(article => (
                  <a key={article.slug} href={`/predictions/${article.slug}/`} className={`tip-row ${article.result === 'won' ? 'won' : article.result === 'lost' ? 'lost' : ''}`}>
                    <div className={`tip-result ${article.result === 'won' ? 'won' : article.result === 'lost' ? 'lost' : 'pending'}`}>
                      {article.result === 'won' ? '✓' : article.result === 'lost' ? '✗' : '?'}
                    </div>
                    <div className="tip-sport" style={{ background: `${SPORT_COLOR[article.sport]}15` }}>
                      {SPORT_EMOJI[article.sport]}
                    </div>
                    <div className="tip-main">
                      <div className="tip-title">{article.title}</div>
                      <div className="tip-preview">{getOneLiner(article.content)}</div>
                    </div>
                    <div className="tip-pick">
                      <div className="tip-pick-val">{article.prediction?.split('@')[0]?.trim()}</div>
                      <div className="tip-pick-odds">@ {article.odds}</div>
                      <div className="tip-conf">
                        {[1,2,3,4,5].map(i => <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />)}
                      </div>
                    </div>
                    <div className="tip-arrow">&rsaquo;</div>
                  </a>
                ))}
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
