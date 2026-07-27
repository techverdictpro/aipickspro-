'use client'

import { useState } from 'react'

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
  preview: string
}

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽', basketball: '🏀', tennis: '🎾', nfl: '🏈'
}

const SPORT_COLOR: Record<string, string> = {
  football: '#4a9eff', basketball: '#e84545', tennis: '#2ecc8a', nfl: '#f39c12'
}

export default function TipsClient({ articles }: { articles: Article[] }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const leagues = Array.from(new Set(articles.map(a => a.league))).sort()
  const sports = Array.from(new Set(articles.map(a => a.sport)))

  const filtered = activeFilter === 'all'
    ? articles
    : articles.filter(a => a.league === activeFilter || a.sport === activeFilter)

  const grouped = leagues.reduce((acc: Record<string, Article[]>, league) => {
    const items = filtered.filter(a => a.league === league)
    if (items.length > 0) acc[league] = items
    return acc
  }, {})

  const wonCount = articles.filter(a => a.result === 'won').length
  const lostCount = articles.filter(a => a.result === 'lost').length

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
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 20px 32px; }
        .page-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .page-date { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #e8f042; margin-bottom: 4px; }
        .page-title { font-size: 28px; font-weight: 900; text-transform: uppercase; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-stats { display: flex; gap: 16px; }
        .page-stat { text-align: center; }
        .page-stat strong { font-size: 20px; font-weight: 900; display: block; color: #e8f042; }
        .page-stat span { font-size: 10px; color: #8a8f99; text-transform: uppercase; }
        .stat-won strong { color: #2ecc8a; }
        .stat-lost strong { color: #e84545; }
        .filters-bar { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; position: sticky; top: 58px; z-index: 90; }
        .filters-inner { max-width: 1100px; margin: 0 auto; display: flex; overflow-x: auto; padding-bottom: 1px; scrollbar-width: none; }
        .filters-inner::-webkit-scrollbar { display: none; }
        .filter-btn { padding: 11px 14px; font-size: 12px; font-weight: 600; color: #8a8f99; border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; background: none; border-top: none; border-left: none; border-right: none; font-family: inherit; }
        .filter-btn:hover { color: #fff; }
        .filter-btn.active { color: #e8f042; border-bottom-color: #e8f042; }
        .filter-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 8px; margin-left: 3px; }
        .filter-sep { width: 1px; background: rgba(255,255,255,0.07); margin: 8px 4px; flex-shrink: 0; }
        .main { max-width: 1100px; margin: 0 auto; padding: 20px 32px 80px; }
        .league-group { margin-bottom: 24px; }
        .league-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .league-name { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8f99; }
        .league-count { background: rgba(255,255,255,0.05); color: #8a8f99; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 8px; }
        .tip-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #111418; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; margin-bottom: 5px; text-decoration: none; color: inherit; transition: border-color 0.15s; }
        .tip-row:hover { border-color: rgba(232,240,66,0.3); }
        .tip-row.won { border-left: 3px solid #2ecc8a; }
        .tip-row.lost { border-left: 3px solid #e84545; }
        .tip-result { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; flex-shrink: 0; }
        .tip-result.won { background: rgba(46,204,138,0.15); color: #2ecc8a; }
        .tip-result.lost { background: rgba(232,69,69,0.15); color: #e84545; }
        .tip-result.pending { background: rgba(255,255,255,0.05); color: #8a8f99; font-size: 9px; }
        .tip-emoji { font-size: 14px; flex-shrink: 0; }
        .tip-main { flex: 1; min-width: 0; }
        .tip-title { font-size: 13px; font-weight: 700; color: #f0ede6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tip-preview { font-size: 11px; color: #8a8f99; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .tip-pick { flex-shrink: 0; text-align: right; min-width: 100px; }
        .tip-pick-val { font-size: 11px; font-weight: 700; color: #e8f042; }
        .tip-pick-odds { font-size: 16px; font-weight: 900; color: #e8f042; }
        .tip-conf { display: flex; gap: 2px; justify-content: flex-end; margin-top: 2px; }
        .cdot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: #e8f042; }
        .tip-arrow { color: #8a8f99; font-size: 14px; flex-shrink: 0; }
        .no-tips { text-align: center; padding: 60px; color: #8a8f99; }
        .no-tips h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 10px 32px; text-align: center; font-size: 11px; color: #8a8f99; }
        @media (max-width: 700px) { .nav-links { display: none; } .tip-preview { display: none; } .main { padding: 16px 16px 60px; } .filters-bar { padding: 0 16px; } .page-header { padding: 16px; } }
      `}</style>

      <nav>
        <a href="/" className="logo">Ai<span className="logo-accent">Picks</span>Pro</a>
        <div className="nav-links">
          <a href="/football/">Football</a>
          <a href="/basketball/">Basketball</a>
          <a href="/tennis/">Tennis</a>
          <a href="/nfl/">NFL</a>
          <a href="/tips-today/" className="nav-active">Today&apos;s Tips</a>
          <a href="/results/">Results</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="page-date">📅 {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <h1 className="page-title">Today&apos;s <em>Tips</em></h1>
          </div>
          <div className="page-stats">
            <div className="page-stat"><strong>{articles.length}</strong><span>Tips</span></div>
            {wonCount > 0 && <div className="page-stat stat-won"><strong>{wonCount}</strong><span>Won</span></div>}
            {lostCount > 0 && <div className="page-stat stat-lost"><strong>{lostCount}</strong><span>Lost</span></div>}
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-inner">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            All <span className="filter-count">{articles.length}</span>
          </button>
          {sports.map(sport => (
            <button key={sport} className={`filter-btn ${activeFilter === sport ? 'active' : ''}`} onClick={() => setActiveFilter(sport)}>
              {SPORT_EMOJI[sport]} {sport.charAt(0).toUpperCase() + sport.slice(1)} <span className="filter-count">{articles.filter(a => a.sport === sport).length}</span>
            </button>
          ))}
          <div className="filter-sep" />
          {leagues.map(league => (
            <button key={league} className={`filter-btn ${activeFilter === league ? 'active' : ''}`} onClick={() => setActiveFilter(league)}>
              {league} <span className="filter-count">{articles.filter(a => a.league === league).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="main">
        {articles.length === 0 ? (
          <div className="no-tips">
            <h3>No predictions for today yet</h3>
            <p>Our AI agents publish new predictions daily at 9:00 AM.</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="no-tips"><h3>No tips for this filter</h3></div>
        ) : (
          Object.entries(grouped).map(([league, items]) => {
            const sport = items[0]?.sport || 'football'
            return (
              <div key={league} className="league-group">
                <div className="league-header">
                  <span>{SPORT_EMOJI[sport]}</span>
                  <span className="league-name">{league}</span>
                  <span className="league-count">{items.length}</span>
                </div>
                {items.map(article => (
                  <a key={article.slug} href={`/predictions/${article.slug}/`} className={`tip-row ${article.result === 'won' ? 'won' : article.result === 'lost' ? 'lost' : ''}`}>
                    <div className={`tip-result ${article.result === 'won' ? 'won' : article.result === 'lost' ? 'lost' : 'pending'}`}>
                      {article.result === 'won' ? '✓' : article.result === 'lost' ? '✗' : '?'}
                    </div>
                    <div className="tip-emoji">{SPORT_EMOJI[sport]}</div>
                    <div className="tip-main">
                      <div className="tip-title">{article.title}</div>
                      {article.preview && <div className="tip-preview">{article.preview}</div>}
                    </div>
                    <div className="tip-pick">
                      <div className="tip-pick-val">{article.prediction?.split('@')[0]?.trim()}</div>
                      <div className="tip-pick-odds">{article.odds ? `@ ${article.odds}` : '—'}</div>
                      <div className="tip-conf">{[1,2,3,4,5].map(i => <div key={i} className={i <= article.confidence ? 'cdot cdot-on' : 'cdot'} />)}</div>
                    </div>
                    <div className="tip-arrow">›</div>
                  </a>
                ))}
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
