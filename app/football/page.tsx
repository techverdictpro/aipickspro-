import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Article {
  slug: string
  title: string
  league: string
  leagueSlug: string
  sport: string
  date: string
  match_date: string
  pick_code: string
  pick_odds: number | null
  odds: string
  confidence: number
  is_finished: boolean
  is_today: boolean
  pick_won: boolean | null
  result: string
  actual_home_score: number | null
  actual_away_score: number | null
  lifecycle: string
  reasoning: string
  excerpt: string
}

const LEAGUE_META: Record<string, { label: string; flag: string; priority: number }> = {
  'champions-league':     { label: 'Champions League',      flag: '🏆', priority: 1 },
  'europa-league':        { label: 'Europa League',         flag: '🟠', priority: 2 },
  'conference-league':    { label: 'Conference League',     flag: '🟢', priority: 3 },
  'premier-league':       { label: 'Premier League',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', priority: 4 },
  'la-liga':              { label: 'La Liga',               flag: '🇪🇸', priority: 5 },
  'bundesliga':           { label: 'Bundesliga',            flag: '🇩🇪', priority: 6 },
  'serie-a':              { label: 'Serie A',               flag: '🇮🇹', priority: 7 },
  'ligue-1':              { label: 'Ligue 1',               flag: '🇫🇷', priority: 8 },
  'primeira-liga':        { label: 'Primeira Liga',         flag: '🇵🇹', priority: 9 },
  'eredivisie':           { label: 'Eredivisie',            flag: '🇳🇱', priority: 10 },
  'scottish-premiership': { label: 'Scottish Premiership',  flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', priority: 11 },
  'belgian-pro-league':   { label: 'Belgian Pro League',   flag: '🇧🇪', priority: 12 },
  'super-lig':            { label: 'Süper Lig',             flag: '🇹🇷', priority: 13 },
  'mls':                  { label: 'MLS',                   flag: '🇺🇸', priority: 14 },
}

function getLeagueSlug(leagueFolder: string): string {
  return leagueFolder
}

function formatKickoff(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Sofia',
    }).format(new Date(iso))
  } catch { return iso.split('T')[0] }
}

function sofiaDay(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sofia', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso))
}

function getArticles(): Article[] {
  const base = path.join(process.cwd(), 'content', 'predictions', 'football')
  if (!fs.existsSync(base)) return []

  const arts: Article[] = []
  const seenSlugs = new Set<string>()

  const scan = (dir: string, leagueSlug: string) => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      if (fs.statSync(full).isDirectory()) { scan(full, entry); continue }
      if (!entry.endsWith('.mdx')) continue
      const slug = entry.replace('.mdx', '')
      if (seenSlugs.has(slug)) continue
      seenSlugs.add(slug)

      const { data } = matter(fs.readFileSync(full, 'utf-8'))

      arts.push({
        slug,
        title:             data.title || '',
        league:            data.league || '',
        leagueSlug,
        sport:             'football',
        date:              data.date || '',
        match_date:        data.match_date || data.date || '',
        pick_code:         data.pick_code || data.prediction?.split('@')[0]?.trim() || '',
        pick_odds:         data.pick_odds ?? null,
        odds:              data.odds || String(data.pick_odds || ''),
        confidence:        data.confidence || 3,
        is_finished:       data.is_finished === true || data.result === 'won' || data.result === 'lost',
        is_today:          data.is_today === true,
        pick_won:          data.pick_won === true ? true : data.pick_won === false ? false : null,
        result:            data.result || 'pending',
        actual_home_score: data.actual_home_score ?? null,
        actual_away_score: data.actual_away_score ?? null,
        lifecycle:         data.lifecycle || 'upcoming',
        reasoning:         data.reasoning || '',
        excerpt:           data.excerpt || '',
      })
    }
  }

  scan(base, 'other')
  return arts
}

function pickCodeLabel(code: string): string {
  const map: Record<string, string> = {
    '1': 'Home Win', 'X': 'Draw', '2': 'Away Win',
    'Over 2.5': 'Over 2.5', 'Under 2.5': 'Under 2.5',
    'BTTS Yes': 'BTTS Yes', 'BTTS No': 'BTTS No',
  }
  return map[code] || code
}

export default function FootballPage() {
  const all = getArticles()
  const now = new Date()

  // Split: upcoming (not finished, kickoff in future or today) vs results (finished)
  const upcoming = all
    .filter(a => !a.is_finished)
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

  const results = all
    .filter(a => a.is_finished)
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())

  // Group upcoming by league slug
  const upcomingByLeague: Record<string, Article[]> = {}
  for (const a of upcoming) {
    upcomingByLeague[a.leagueSlug] ||= []
    upcomingByLeague[a.leagueSlug].push(a)
  }
  const upLeagues = Object.keys(upcomingByLeague).sort((a, b) => {
    const pa = LEAGUE_META[a]?.priority ?? 99
    const pb = LEAGUE_META[b]?.priority ?? 99
    return pa - pb
  })

  const winsCount  = results.filter(a => a.pick_won === true).length
  const lossCount  = results.filter(a => a.pick_won === false).length
  const hitRate    = (winsCount + lossCount) > 0
    ? ((winsCount / (winsCount + lossCount)) * 100).toFixed(1)
    : null

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0a0c0f;color:#f0ede6;font-family:'Segoe UI',Arial,sans-serif}
        a{text-decoration:none;color:inherit}
        nav{position:sticky;top:0;z-index:100;background:rgba(10,12,15,0.97);border-bottom:1px solid rgba(255,255,255,0.07);padding:0 32px;height:58px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-size:22px;font-weight:900}.logo-accent{color:#e8f042}
        .nav-links{display:flex;gap:24px;font-size:13px;color:#8a8f99}
        .nav-links a:hover{color:#fff}.nav-active{color:#e8f042!important}
        .nav-cta{background:#e8f042;color:#000;padding:8px 20px;border-radius:4px;font-size:13px;font-weight:800}
        .header{background:#0d1019;border-bottom:1px solid rgba(255,255,255,0.07);padding:24px 32px}
        .header-inner{max-width:1200px;margin:0 auto}
        .breadcrumb{font-size:12px;color:#8a8f99;margin-bottom:8px}
        .page-title{font-size:34px;font-weight:900;text-transform:uppercase;margin-bottom:4px}
        .page-title em{color:#e8f042;font-style:normal}
        .page-sub{font-size:13px;color:#8a8f99}
        .stats-row{display:flex;gap:24px;margin-top:14px;flex-wrap:wrap}
        .stat strong{color:#e8f042;font-size:18px;font-weight:900;display:block}
        .stat span{font-size:10px;color:#8a8f99;text-transform:uppercase;letter-spacing:.06em}
        .main{max-width:1200px;margin:0 auto;padding:28px 32px 80px}

        /* Section headers */
        .section-head{display:flex;align-items:center;gap:12px;margin:32px 0 16px;padding-bottom:10px;border-bottom:2px solid rgba(255,255,255,0.08)}
        .section-title{font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
        .section-count{background:rgba(232,240,66,0.12);color:#e8f042;font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px}
        .section-badge-results{background:rgba(46,204,138,0.12);color:#2ecc8a;font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px}

        /* League sub-header */
        .league-head{display:flex;align-items:center;gap:8px;margin:20px 0 10px}
        .league-label{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#8a8f99}
        .league-count{font-size:11px;color:#555;margin-left:4px}

        /* Cards grid */
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .card{background:#111418;border:1px solid rgba(255,255,255,0.07);border-radius:8px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s}
        .card:hover{border-color:rgba(232,240,66,0.3)}
        .card.won{border-left:3px solid #2ecc8a}
        .card.lost{border-left:3px solid #e84545}
        .card-top{padding:14px;flex:1}
        .card-league{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a8f99;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
        .badge-won{color:#2ecc8a;font-size:11px;font-weight:800}
        .badge-lost{color:#e84545;font-size:11px;font-weight:800}
        .badge-today{background:rgba(232,240,66,0.15);color:#e8f042;font-size:10px;font-weight:700;padding:1px 6px;border-radius:3px}
        .badge-live{background:rgba(232,69,69,0.2);color:#e84545;font-size:10px;font-weight:700;padding:1px 6px;border-radius:3px;animation:pulse 1.5s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
        .card-title{font-size:13px;font-weight:700;line-height:1.35;margin-bottom:6px;color:#f0ede6}
        .card-time{font-size:11px;color:#555;margin-bottom:8px}
        .result-score{font-size:20px;font-weight:900;margin-bottom:6px;color:#f0ede6}
        .pick-box{background:rgba(232,240,66,0.07);border:1px solid rgba(232,240,66,0.18);border-radius:4px;padding:7px 10px;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .pick-label{font-size:9px;color:#8a8f99;text-transform:uppercase;letter-spacing:.06em}
        .pick-val{font-size:13px;font-weight:800;color:#e8f042;margin-top:2px}
        .odds-val{font-size:20px;font-weight:900;color:#e8f042}
        .conf{display:flex;gap:2px}
        .dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.1)}
        .dot-on{background:#e8f042}
        .card-bottom{padding:8px 14px;border-top:1px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.02);display:flex;align-items:center;justify-content:space-between}
        .card-date{font-size:10px;color:#8a8f99}
        .card-btn{background:#e8f042;color:#000;font-size:10px;font-weight:800;padding:5px 11px;border-radius:3px}
        .no-data{text-align:center;padding:60px;color:#8a8f99}
        .rg{background:rgba(232,69,69,0.05);border-top:1px solid rgba(232,69,69,0.12);padding:12px 32px;text-align:center;font-size:11px;color:#8a8f99;margin-top:40px}
        @media(max-width:1000px){.grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:650px){.grid{grid-template-columns:1fr}.nav-links{display:none}.page-title{font-size:26px}}
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

      <div className="header">
        <div className="header-inner">
          <div className="breadcrumb"><a href="/">Home</a> › <span style={{color:'#e8f042'}}>⚽ Football Predictions</span></div>
          <h1 className="page-title">Football <em>Predictions</em></h1>
          <p className="page-sub">Daily AI-powered tips — Premier League, Champions League, La Liga and more</p>
          <div className="stats-row">
            <div className="stat"><strong>{upcoming.length}</strong><span>Upcoming</span></div>
            <div className="stat"><strong>{results.length}</strong><span>Results</span></div>
            {hitRate && <div className="stat"><strong style={{color:'#2ecc8a'}}>{hitRate}%</strong><span>Hit Rate (7 days)</span></div>}
          </div>
        </div>
      </div>

      <div className="main">

        {/* ── UPCOMING PREDICTIONS ──────────────────────────── */}
        {upcoming.length > 0 && (
          <>
            <div className="section-head">
              <span className="section-title">📅 Upcoming Predictions</span>
              <span className="section-count">{upcoming.length} picks</span>
            </div>

            {upLeagues.map(ls => {
              const meta  = LEAGUE_META[ls]
              const label = meta?.label || ls.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
              const flag  = meta?.flag || '⚽'
              const arts  = upcomingByLeague[ls]
              return (
                <div key={ls}>
                  <div className="league-head">
                    <span style={{fontSize:'16px'}}>{flag}</span>
                    <span className="league-label">{label}</span>
                    <span className="league-count">{arts.length} tips</span>
                  </div>
                  <div className="grid">
                    {arts.map(a => (
                      <div key={a.slug} className="card">
                        <div className="card-top">
                          <div className="card-league">
                            <span>{a.league}</span>
                            {a.lifecycle === 'today' && <span className="badge-today">TODAY</span>}
                            {a.lifecycle === 'live'  && <span className="badge-live">● LIVE</span>}
                          </div>
                          <div className="card-title">{a.title}</div>
                          <div className="card-time">⏰ {formatKickoff(a.match_date)}</div>
                          {a.reasoning && <div style={{fontSize:'11px',color:'#8a8f99',marginBottom:'8px',fontStyle:'italic'}}>"{a.reasoning.replace(/<[^>]+>/g, '').trim()}"</div>}
                          <div className="pick-box">
                            <div>
                              <div className="pick-label">Our Pick</div>
                              <div className="pick-val">{pickCodeLabel(a.pick_code)}</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div className="pick-label">Odds</div>
                              <div className="odds-val">{a.odds || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="conf">{[1,2,3,4,5].map(i => <div key={i} className={i <= a.confidence ? 'dot dot-on' : 'dot'} />)}</div>
                        </div>
                        <div className="card-bottom">
                          <span className="card-date">{formatKickoff(a.match_date).split(',')[0]}</span>
                          <a href={`/predictions/${a.slug}/`} className="card-btn">VIEW TIP →</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ── RECENT RESULTS ────────────────────────────────── */}
        {results.length > 0 && (
          <>
            <div className="section-head" style={{marginTop:'48px'}}>
              <span className="section-title">📊 Recent Results</span>
              <span className="section-badge-results">{winsCount}W / {lossCount}L{hitRate ? ` · ${hitRate}% hit rate` : ''}</span>
            </div>
            <div className="grid">
              {results.map(a => (
                <div key={a.slug} className={`card ${a.pick_won === true ? 'won' : a.pick_won === false ? 'lost' : ''}`}>
                  <div className="card-top">
                    <div className="card-league">
                      <span>{a.league}</span>
                      {a.pick_won === true  && <span className="badge-won">✓ WON</span>}
                      {a.pick_won === false && <span className="badge-lost">✗ LOST</span>}
                    </div>
                    <div className="card-title">{a.title}</div>
                    {a.actual_home_score != null && (
                      <div className="result-score"
                        style={{color: a.pick_won === true ? '#2ecc8a' : a.pick_won === false ? '#e84545' : '#f0ede6'}}>
                        {a.actual_home_score} – {a.actual_away_score}
                      </div>
                    )}
                    <div className="pick-box" style={{borderColor: a.pick_won === true ? 'rgba(46,204,138,0.3)' : a.pick_won === false ? 'rgba(232,69,69,0.3)' : undefined}}>
                      <div>
                        <div className="pick-label">Our Pick</div>
                        <div className="pick-val" style={{color: a.pick_won === true ? '#2ecc8a' : a.pick_won === false ? '#e84545' : '#e8f042'}}>
                          {pickCodeLabel(a.pick_code)}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div className="pick-label">Odds</div>
                        <div className="odds-val" style={{fontSize:'18px'}}>{a.odds || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="conf">{[1,2,3,4,5].map(i => <div key={i} className={i <= a.confidence ? 'dot dot-on' : 'dot'} />)}</div>
                  </div>
                  <div className="card-bottom">
                    <span className="card-date">{a.date}</span>
                    <a href={`/predictions/${a.slug}/`} className="card-btn">VIEW →</a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {all.length === 0 && (
          <div className="no-data">
            <h3>No predictions yet</h3>
            <p>Check back at 09:00 for today&apos;s picks.</p>
          </div>
        )}
      </div>

      <div className="rg">
        <strong style={{color:'#fff'}}>⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss. If gambling affects you, visit <a href="https://www.begambleaware.org" style={{color:'#e8f042'}} target="_blank" rel="noopener">BeGambleAware.org</a>
      </div>
    </>
  )
}
