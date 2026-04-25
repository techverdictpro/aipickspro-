import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Props {
  params: Promise<{ slug: string }>
}

const AFFILIATES = [
  { name: 'Bet365', url: 'https://www.bet365.com', bonus: 'Up to £100 Welcome Bonus', regions: 'UK & Europe', color: '#00a651' },
  { name: 'William Hill', url: 'https://www.williamhill.com', bonus: '£30 Free Bet', regions: 'UK & Europe', color: '#6c2d8a' },
  { name: 'DraftKings', url: 'https://www.draftkings.com', bonus: '$200 Bonus Bets', regions: 'USA', color: '#53d337' },
  { name: 'FanDuel', url: 'https://www.fanduel.com', bonus: '$1000 No Sweat First Bet', regions: 'USA', color: '#1493ff' },
  { name: 'Betway', url: 'https://www.betway.com', bonus: '€30 Free Bet', regions: 'Europe', color: '#00a0ff' },
  { name: 'Unibet', url: 'https://www.unibet.com', bonus: '€40 Welcome Bonus', regions: 'Europe', color: '#147b45' },
]

function getArticle(slug: string) {
  const categories = ['football', 'basketball', 'tennis', 'nfl', 'general']
  for (const category of categories) {
    const filePath = path.join(process.cwd(), 'content', 'predictions', category, `${slug}.mdx`)
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      return { ...data, content, category } as any
    }
  }
  return null
}

export async function generateStaticParams() {
  const categories = ['football', 'basketball', 'tennis', 'nfl', 'general']
  const slugs: { slug: string }[] = []
  for (const category of categories) {
    const dir = path.join(process.cwd(), 'content', 'predictions', category)
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.mdx'))
      files.forEach((f: string) => slugs.push({ slug: f.replace('.mdx', '') }))
    }
  }
  return slugs
}

export default async function PredictionPage({ params }: Props) {
  const { slug } = await params
  const article = getArticle(slug)

  if (!article) {
    return (
      <div style={{ background: '#0a0c0f', color: '#f0ede6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900 }}>404</h1>
          <p style={{ color: '#8a8f99', marginTop: '12px' }}>Article not found</p>
          <a href="/" style={{ color: '#e8f042', marginTop: '20px', display: 'block' }}>Back to home</a>
        </div>
      </div>
    )
  }

  const confText = (c: number) => c >= 5 ? 'Very High' : c >= 4 ? 'High' : 'Medium'
  const confColor = (c: number) => c >= 5 ? '#2ecc8a' : c >= 4 ? '#e8f042' : '#f39c12'
  const sportEmoji: Record<string, string> = { football: '⚽', basketball: '🏀', tennis: '🎾', nfl: '🏈' }

  const paragraphs = article.content
    .split('\n')
    .filter((line: string) => line.trim() && !line.startsWith('---') && !line.startsWith('#'))
    .map((line: string) => line.trim())

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
        .page-wrap { max-width: 860px; margin: 0 auto; padding: 48px 32px 80px; }
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 24px; }
        .article-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .meta-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 3px; }
        .meta-sport { background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.3); }
        .meta-league { background: rgba(255,255,255,0.05); color: #8a8f99; }
        .meta-date { font-size: 12px; color: #8a8f99; }
        .article-title { font-size: 34px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; text-transform: uppercase; }
        .pick-box { background: rgba(232,240,66,0.05); border: 1px solid rgba(232,240,66,0.3); border-radius: 8px; padding: 20px 24px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .pick-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 6px; }
        .pick-val { font-size: 20px; font-weight: 900; color: #e8f042; }
        .pick-odds { font-size: 36px; font-weight: 900; color: #e8f042; }
        .conf-dots { display: flex; gap: 4px; align-items: center; }
        .cdot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .bet-btn { background: #e8f042; color: #000; font-size: 14px; font-weight: 800; padding: 12px 24px; border-radius: 4px; display: inline-block; }
        .article-body { font-size: 17px; line-height: 1.8; color: #d0cdc6; margin-bottom: 40px; }
        .article-body p { margin-bottom: 20px; }
        .article-body p:last-child { color: #f0ede6; font-weight: 600; border-left: 3px solid #e8f042; padding-left: 16px; }
        .aff-section { margin: 40px 0; }
        .aff-section-title { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .aff-section-sub { font-size: 13px; color: #8a8f99; margin-bottom: 20px; }
        .aff-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .aff-card { background: #111418; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s; }
        .aff-card:hover { border-color: rgba(255,255,255,0.2); }
        .aff-card-top { display: flex; align-items: center; justify-content: space-between; }
        .aff-card-name { font-size: 16px; font-weight: 800; }
        .aff-card-region { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 2px; }
        .aff-card-bonus { font-size: 13px; color: #2ecc8a; font-weight: 600; }
        .aff-card-btn { display: block; text-align: center; background: #e8f042; color: #000; font-size: 12px; font-weight: 800; padding: 8px; border-radius: 4px; letter-spacing: 0.05em; }
        .aff-card-btn:hover { background: #c8d435; }
        .aff-disclaimer { font-size: 10px; color: #8a8f99; margin-top: 12px; line-height: 1.5; }
        .inline-cta { background: linear-gradient(90deg, rgba(26,15,0,0.9), rgba(10,15,26,0.9)); border: 1px solid rgba(255,255,255,0.07); border-left: 3px solid #e8f042; border-radius: 6px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; margin: 32px 0; gap: 20px; flex-wrap: wrap; }
        .inline-cta-text { font-size: 18px; font-weight: 800; }
        .inline-cta-sub { font-size: 12px; color: #8a8f99; margin-top: 4px; }
        .disclaimer { font-size: 11px; color: #8a8f99; margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.07); line-height: 1.6; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 60px; }
        @media (max-width: 700px) { .article-title { font-size: 24px; } .nav-links { display: none; } .aff-grid { grid-template-columns: 1fr 1fr; } .pick-box { flex-direction: column; } }
        @media (max-width: 480px) { .aff-grid { grid-template-columns: 1fr; } }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/">Today&apos;s Tips</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-wrap">
        <div className="breadcrumb">
          <a href="/">Home</a> &rsaquo; <a href={`/${article.sport}/`}>{sportEmoji[article.sport]} {article.sport}</a> &rsaquo; <span style={{ color: '#e8f042' }}>Prediction</span>
        </div>

        <div className="article-meta">
          <span className="meta-badge meta-sport">{sportEmoji[article.sport]} {article.sport}</span>
          {article.league && <span className="meta-badge meta-league">{article.league}</span>}
          <span className="meta-date">{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <h1 className="article-title">{article.title}</h1>

        <div className="pick-box">
          <div>
            <div className="pick-label">Our Prediction</div>
            <div className="pick-val">{article.prediction}</div>
          </div>
          <div>
            <div className="pick-label">Odds</div>
            <div className="pick-odds">{article.odds}</div>
          </div>
          <div>
            <div className="pick-label">Confidence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: confColor(article.confidence) }}>
              <div className="conf-dots">
                {[1,2,3,4,5].map((i: number) => (
                  <div key={i} className="cdot" style={{ background: i <= article.confidence ? 'currentColor' : undefined }} />
                ))}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{confText(article.confidence)}</span>
            </div>
          </div>
          <a href={AFFILIATES[0].url} target="_blank" rel="noopener noreferrer" className="bet-btn">BET NOW &rarr;</a>
        </div>

        <div className="article-body">
          {paragraphs.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="inline-cta">
          <div>
            <div className="inline-cta-text">🎯 Best odds at Bet365</div>
            <div className="inline-cta-sub">Up to £100 Welcome Bonus · New customers only · 18+ T&Cs apply</div>
          </div>
          <a href="https://www.bet365.com" target="_blank" rel="noopener noreferrer" className="bet-btn">CLAIM BONUS &rarr;</a>
        </div>

        <div className="aff-section">
          <div className="aff-section-title">🏆 Best Bookmakers for This Match</div>
          <div className="aff-section-sub">Compare bonuses and claim your welcome offer</div>
          <div className="aff-grid">
            {AFFILIATES.map((bm) => (
              <div key={bm.name} className="aff-card">
                <div className="aff-card-top">
                  <div className="aff-card-name" style={{ color: bm.color }}>{bm.name}</div>
                  <div className="aff-card-region">{bm.regions}</div>
                </div>
                <div className="aff-card-bonus">{bm.bonus}</div>
                <a href={bm.url} target="_blank" rel="noopener noreferrer" className="aff-card-btn">CLAIM OFFER &rarr;</a>
              </div>
            ))}
          </div>
          <div className="aff-disclaimer">* 18+ only. New customers only. Bonus T&Cs apply. Please gamble responsibly. GamCare · BeGambleAware · NCPG (US: 1-800-GAMBLER)</div>
        </div>

        <div className="disclaimer">Odds correct at time of publication. This represents the opinion of our analysts only. AiPicksPro may receive commission from bookmakers listed on this page.</div>
      </div>

      <div className="rg-bar">
        <strong style={{ color: '#fff' }}>⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
