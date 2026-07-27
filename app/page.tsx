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
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]

  for (const sport of sports) {
    const baseDir = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(baseDir)) continue

    const entries = fs.readdirSync(baseDir)
    for (const entry of entries) {
      const entryPath = path.join(baseDir, entry)
      if (entry.endsWith('.mdx')) {
        const raw = fs.readFileSync(entryPath, 'utf-8')
        const { data, content } = matter(raw)
        if (data.date >= weekAgo) articles.push({ ...data, sport, slug: entry.replace('.mdx', ''), content } as Article)
      } else if (fs.statSync(entryPath).isDirectory()) {
        const files = fs.readdirSync(entryPath).filter(f => f.endsWith('.mdx'))
        for (const file of files) {
          const raw = fs.readFileSync(path.join(entryPath, file), 'utf-8')
          const { data, content } = matter(raw)
          if (data.date >= weekAgo) articles.push({ ...data, sport, slug: file.replace('.mdx', ''), content } as Article)
        }
      }
    }
  }

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getPreview(content: string): string {
  // Маха HTML тагове (<p>, <h2>, <ul>...) и markdown, оставя чист текст
  const clean = content
    .replace(/<[^>]+>/g, ' ')            // маха всички HTML тагове
    .replace(/^---[\s\S]*?---/m, '')     // маха frontmatter остатъци
    .replace(/[#*_>`]/g, '')             // маха markdown символи
    .replace(/\s+/g, ' ')                // сбива интервалите
    .trim()
  return clean.slice(0, 160) + (clean.length > 160 ? '…' : '')
}

export default function HomePage() {
  const allArticles = getAllArticles()
  // На началната показваме само ПРЕДСТОЯЩИ прогнози (не завършили).
  // Завършилите отиват в секцията /results.
  const upcoming = allArticles.filter((a: any) => a.pick_won !== true && a.pick_won !== false)
  const featured = upcoming.slice(0, 12)

  const sportCounts = {
    football: allArticles.filter(a => a.sport === 'football').length,
    basketball: allArticles.filter(a => a.sport === 'basketball').length,
    tennis: allArticles.filter(a => a.sport === 'tennis').length,
    nfl: allArticles.filter(a => a.sport === 'nfl').length,
  }

  const total = allArticles.length

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
        .nav-cta { background: #e8f042; color: #000; padding: 8px 20px; border-radius: 4px; font-size: 13px; font-weight: 800; }
        .hero { background: linear-gradient(135deg, #0d1019 0%, #0a0c0f 100%); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 64px 32px; }
        .hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .hero-label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #e8f042; margin-bottom: 16px; }
        .hero-title { font-size: 56px; font-weight: 900; line-height: 0.95; text-transform: uppercase; margin-bottom: 20px; }
        .hero-title em { color: #e8f042; font-style: normal; }
        .hero-sub { font-size: 16px; color: #8a8f99; line-height: 1.7; margin-bottom: 32px; }
        .hero-cta { background: #e8f042; color: #000; padding: 14px 32px; border-radius: 4px; font-size: 15px; font-weight: 800; display: inline-block; }
        .hero-cta:hover { background: #c8d435; }
        .hero-stats { display: flex; gap: 32px; margin-top: 32px; }
        .hero-stat strong { display: block; font-size: 32px; font-weight: 900; color: #e8f042; }
        .hero-stat span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8f99; }
        .hero-cards { display: flex; flex-direction: column; gap: 12px; }
        .hero-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 14px 18px; display: block; transition: border-color 0.2s; }
        .hero-card:hover { border-color: rgba(232,240,66,0.3); }
        .hero-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .hero-card-sport { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
        .hero-card-league { font-size: 10px; color: #8a8f99; }
        .hero-card-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
        .hero-card-bottom { display: flex; align-items: center; justify-content: space-between; }
        .hero-card-pick { font-size: 12px; color: #e8f042; font-weight: 700; }
        .hero-card-odds { font-size: 20px; font-weight: 900; color: #e8f042; }
        .affiliates-bar { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 14px 32px; }
        .affiliates-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
        .affiliates-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; white-space: nowrap; }
        .aff-links { display: flex; gap: 12px; flex-wrap: wrap; }
        .aff-link { font-size: 13px; font-weight: 700; color: #f0ede6; padding: 5px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }
        .aff-link:hover { border-color: #e8f042; color: #e8f042; }
        .main { max-width: 1200px; margin: 0 auto; padding: 48px 32px; }
        .sports-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 48px; }
        .sport-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px; display: flex; align-items: center; gap: 14px; transition: border-color 0.2s; }
        .sport-card:hover { border-color: rgba(232,240,66,0.3); }
        .sport-emoji { font-size: 28px; }
        .sport-name { font-size: 15px; font-weight: 800; text-transform: uppercase; }
        .sport-count { font-size: 12px; color: #8a8f99; margin-top: 2px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .section-title { font-size: 22px; font-weight: 900; text-transform: uppercase; }
        .section-title em { color: #e8f042; font-style: normal; }
        .section-link { font-size: 13px; color: #8a8f99; }
        .section-link:hover { color: #e8f042; }
        .picks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px; }
        .pick-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.2s; }
        .pick-card:hover { border-color: rgba(232,240,66,0.3); }
        .pick-card-header { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); }
        .pick-sport-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 3px; }
        .pick-league { font-size: 11px; color: #8a8f99; }
        .pick-card-body { padding: 16px; flex: 1; }
        .pick-title { font-size: 14px; font-weight: 700; line-height: 1.3; margin-bottom: 8px; }
        .pick-preview { font-size: 12px; color: #8a8f99; line-height: 1.5; margin-bottom: 12px; }
        .pick-box { background: rgba(232,240,66,0.08); border: 1px solid rgba(232,240,66,0.2); border-radius: 4px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; }
        .pick-label { font-size: 10px; color: #8a8f99; margin-bottom: 2px; }
        .pick-val { font-size: 12px; font-weight: 800; color: #e8f042; }
        .pick-odds { font-size: 24px; font-weight: 900; color: #e8f042; }
        .pick-card-footer { padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; }
        .pick-date { font-size: 11px; color: #8a8f99; }
        .pick-btn { background: #e8f042; color: #000; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 3px; }
        .pick-btn:hover { background: #c8d435; }
        .bm-strip { background: #0d1019; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 24px; margin-bottom: 48px; }
        .bm-strip-title { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8f99; margin-bottom: 16px; }
        .bm-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
        .bm-item { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 12px; text-align: center; }
        .bm-name { font-size: 13px; font-weight: 800; margin-bottom: 4px; }
        .bm-bonus { font-size: 10px; color: #2ecc8a; margin-bottom: 8px; }
        .bm-btn { background: #e8f042; color: #000; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 3px; display: inline-block; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; }
        @media (max-width: 1000px) { .picks-grid { grid-template-columns: repeat(2,1fr); } .bm-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 700px) { .hero-inner { grid-template-columns: 1fr; } .hero-title { font-size: 36px; } .picks-grid { grid-template-columns: 1fr; } .sports-nav { grid-template-columns: repeat(2,1fr); } .nav-links { display: none; } .bm-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/">Today&apos;s Tips</a>
          <a href="/results/">Results</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-label">&#129302; AI-Powered Sports Analysis</div>
            <h1 className="hero-title">The <em>Smarter</em><br />Way to Bet</h1>
            <p className="hero-sub">Our AI agents analyse thousands of data points — form, injuries, head-to-head, market movement — delivering daily picks across {total}+ events in 20+ competitions.</p>
            <a href="/tips-today/" className="hero-cta">TODAY&apos;S FREE TIPS &rarr;</a>
            <div className="hero-stats">
              <div className="hero-stat"><strong>74%</strong><span>Win Rate</span></div>
              <div className="hero-stat"><strong>{total}+</strong><span>Tips This Week</span></div>
              <div className="hero-stat"><strong>20+</strong><span>Competitions</span></div>
            </div>
          </div>
          <div className="hero-cards">
            {allArticles.slice(0, 3).map(article => (
              <a key={article.slug} href={`/predictions/${article.slug}/`} className="hero-card">
                <div className="hero-card-meta">
                  <span className="hero-card-sport" style={{ color: SPORT_COLOR[article.sport] }}>{SPORT_EMOJI[article.sport]} {article.sport}</span>
                  <span className="hero-card-league">{article.league}</span>
                </div>
                <div className="hero-card-title">{article.title}</div>
                <div className="hero-card-bottom">
                  <span className="hero-card-pick">{article.prediction?.split('@')[0]?.trim()}</span>
                  <span className="hero-card-odds">{article.odds}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="affiliates-bar">
        <div className="affiliates-inner">
          <span className="affiliates-label">Trusted Partners</span>
          <div className="aff-links">
            {[
              { name: 'Bet365', url: 'https://www.bet365.com' },
              { name: 'William Hill', url: 'https://www.williamhill.com' },
              { name: 'DraftKings', url: 'https://www.draftkings.com' },
              { name: 'FanDuel', url: 'https://www.fanduel.com' },
              { name: 'Betway', url: 'https://www.betway.com' },
              { name: 'Unibet', url: 'https://www.unibet.com' },
            ].map(bm => (
              <a key={bm.name} href={bm.url} target="_blank" rel="noopener noreferrer" className="aff-link">{bm.name}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="main">
        <div className="sports-nav">
          {([
            { sport: 'football', href: '/football/', label: 'Football' },
            { sport: 'basketball', href: '/basketball/', label: 'Basketball' },
            { sport: 'tennis', href: '/tennis/', label: 'Tennis' },
            { sport: 'nfl', href: '/nfl/', label: 'NFL' },
          ] as const).map(s => (
            <a key={s.sport} href={s.href} className="sport-card">
              <div className="sport-emoji">{SPORT_EMOJI[s.sport]}</div>
              <div>
                <div className="sport-name">{s.label}</div>
                <div className="sport-count">{sportCounts[s.sport]} tips this week</div>
              </div>
            </a>
          ))}
        </div>

        <div className="section-header">
          <h2 className="section-title">Latest <em>Predictions</em></h2>
          <a href="/tips-today/" className="section-link">View all tips &rarr;</a>
        </div>

        <div className="picks-grid">
          {featured.map(article => (
            <div key={article.slug} className="pick-card">
              <div className="pick-card-header">
                <span className="pick-sport-badge" style={{ background: `${SPORT_COLOR[article.sport]}20`, color: SPORT_COLOR[article.sport], border: `1px solid ${SPORT_COLOR[article.sport]}40` }}>
                  {SPORT_EMOJI[article.sport]} {article.sport}
                </span>
                <span className="pick-league">{article.league}</span>
              </div>
              <div className="pick-card-body">
                <div className="pick-title">{article.title}</div>
                <div className="pick-preview">{getPreview(article.content)}</div>
                <div className="pick-box">
                  <div>
                    <div className="pick-label">Our Pick</div>
                    <div className="pick-val">{article.prediction?.split('@')[0]?.trim()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="pick-label">Odds</div>
                    <div className="pick-odds">{article.odds}</div>
                  </div>
                </div>
              </div>
              <div className="pick-card-footer">
                <span className="pick-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                <a href={`/predictions/${article.slug}/`} className="pick-btn">READ ANALYSIS &rarr;</a>
              </div>
            </div>
          ))}
        </div>

        <div className="bm-strip">
          <div className="bm-strip-title">&#127942; Top Bookmakers — Claim Your Bonus</div>
          <div className="bm-grid">
            {[
              { name: 'Bet365', bonus: 'Up to £100', url: 'https://www.bet365.com' },
              { name: 'William Hill', bonus: '£30 Free Bet', url: 'https://www.williamhill.com' },
              { name: 'DraftKings', bonus: '$200 Bonus', url: 'https://www.draftkings.com' },
              { name: 'FanDuel', bonus: '$1000 NSF Bet', url: 'https://www.fanduel.com' },
              { name: 'Betway', bonus: '€30 Free Bet', url: 'https://www.betway.com' },
              { name: 'Unibet', bonus: '€40 Bonus', url: 'https://www.unibet.com' },
            ].map(bm => (
              <div key={bm.name} className="bm-item">
                <div className="bm-name">{bm.name}</div>
                <div className="bm-bonus">{bm.bonus}</div>
                <a href={bm.url} target="_blank" rel="noopener noreferrer" className="bm-btn">CLAIM &rarr;</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rg-bar">
        <strong style={{ color: '#fff' }}>&#9888; Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss. AiPicksPro may receive commission from bookmakers.
      </div>
    </>
  )
}
