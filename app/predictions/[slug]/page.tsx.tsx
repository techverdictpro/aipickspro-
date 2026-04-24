import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Props {
  params: { slug: string }
}

function getArticle(slug: string) {
  const categories = ['football', 'basketball', 'tennis', 'nfl', 'general']
  
  for (const category of categories) {
    const filePath = path.join(process.cwd(), 'content', 'predictions', category, `${slug}.mdx`)
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      return { ...data, content, category } as {
        title: string
        date: string
        sport: string
        league: string
        excerpt: string
        metaDescription: string
        prediction: string
        odds: string
        confidence: number
        bookmaker: string
        content: string
        category: string
      }
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
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
      files.forEach(f => slugs.push({ slug: f.replace('.mdx', '') }))
    }
  }

  return slugs
}

export default function PredictionPage({ params }: Props) {
  const article = getArticle(params.slug)

  if (!article) {
    return (
      <div style={{ background: '#0a0c0f', color: '#f0ede6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900 }}>404</h1>
          <p style={{ color: '#8a8f99', marginTop: '12px' }}>Article not found</p>
          <a href="/" style={{ color: '#e8f042', marginTop: '20px', display: 'block' }}>← Back to home</a>
        </div>
      </div>
    )
  }

  const confText = (c: number) => {
    if (c >= 5) return 'Very High'
    if (c >= 4) return 'High'
    return 'Medium'
  }

  const confColor = (c: number) => {
    if (c >= 5) return '#2ecc8a'
    if (c >= 4) return '#e8f042'
    return '#f39c12'
  }

  const sportEmoji: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    nfl: '🏈',
  }

  const paragraphs = article.content
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('---') && !line.startsWith('#'))
    .map(line => line.trim())

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
        .page-wrap { max-width: 800px; margin: 0 auto; padding: 48px 32px 80px; }
        .breadcrumb { font-size: 12px; color: #8a8f99; margin-bottom: 24px; }
        .breadcrumb a { color: #8a8f99; }
        .breadcrumb a:hover { color: #fff; }
        .article-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .meta-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 3px; }
        .meta-sport { background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.3); }
        .meta-league { background: rgba(255,255,255,0.05); color: #8a8f99; }
        .meta-date { font-size: 12px; color: #8a8f99; }
        .article-title { font-size: 36px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; text-transform: uppercase; }
        .pick-box { background: rgba(232,240,66,0.05); border: 1px solid rgba(232,240,66,0.3); border-radius: 8px; padding: 20px 24px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .pick-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8f99; margin-bottom: 6px; }
        .pick-val { font-size: 22px; font-weight: 900; color: #e8f042; }
        .pick-odds { font-size: 36px; font-weight: 900; color: #e8f042; }
        .pick-conf { display: flex; align-items: center; gap: 8px; }
        .conf-dots { display: flex; gap: 4px; }
        .cdot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .bet-btn { background: #e8f042; color: #000; font-size: 14px; font-weight: 800; padding: 12px 24px; border-radius: 4px; letter-spacing: 0.05em; display: inline-block; }
        .article-body { font-size: 17px; line-height: 1.8; color: #d0cdc6; }
        .article-body p { margin-bottom: 20px; }
        .article-body p:last-child { color: #f0ede6; font-weight: 600; border-left: 3px solid #e8f042; padding-left: 16px; }
        .sidebar-ad { background: rgba(232,240,66,0.04); border: 1px solid rgba(232,240,66,0.2); border-radius: 8px; padding: 20px; margin-top: 32px; }
        .sidebar-ad-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        .sidebar-ad-sub { font-size: 12px; color: #8a8f99; margin-bottom: 14px; }
        .disclaimer { font-size: 11px; color: #8a8f99; margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.07); line-height: 1.6; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; margin-top: 60px; }
        @media (max-width: 600px) {
          .article-title { font-size: 26px; }
          .nav-links { display: none; }
          .pick-box { flex-direction: column; }
        }
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
          <a href="/">Home</a> ›{' '}
          <a href={`/${article.sport}/`}>{sportEmoji[article.sport]} {article.sport.charAt(0).toUpperCase() + article.sport.slice(1)}</a> ›{' '}
          <span style={{ color: '#e8f042' }}>Prediction</span>
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
            <div className="pick-conf" style={{ color: confColor(article.confidence) }}>
              <div className="conf-dots">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="cdot" style={{ background: i <= article.confidence ? 'currentColor' : undefined }} />
                ))}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{confText(article.confidence)}</span>
            </div>
          </div>
          <a href="#" className="bet-btn">BET @ {article.bookmaker} →</a>
        </div>

        <div className="article-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="sidebar-ad">
          <div className="sidebar-ad-title">🎯 Best odds at {article.bookmaker}</div>
          <div className="sidebar-ad-sub">New customers only. Up to £100 welcome bonus. 18+ T&Cs apply.</div>
          <a href="#" className="bet-btn" style={{ fontSize: '13px', padding: '10px 20px' }}>CLAIM BONUS →</a>
        </div>

        <div className="disclaimer">
          * Odds correct at time of publication and subject to change. This article represents the opinion of our analysts only and should not be taken as financial advice. Please gamble responsibly. 18+ only.
        </div>
      </div>

      <div className="rg-bar">
        <strong style={{ color: '#fff' }}>⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}
