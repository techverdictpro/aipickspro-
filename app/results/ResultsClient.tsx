'use client'

import { useState, useEffect } from 'react'
import { leagueFlag } from '../leagueFlags'

interface Result {
  slug: string
  title: string
  sport: string
  league: string
  match_date: string
  pick_code: string
  market: string
  odds: string
  pick_odds: number | null
  confidence: number
  pick_won: boolean
  actual_home_score: number | null
  actual_away_score: number | null
  validated_at: string
}

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽', basketball: '🏀', tennis: '🎾', nfl: '🏈',
}

const KEEP_DAYS = 7

export default function ResultsClient({ allResults }: { allResults: Result[] }) {
  const [results, setResults] = useState<Result[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Пазим само мачове от последните 7 дни (реална браузър-дата)
    const cutoff = Date.now() - KEEP_DAYS * 24 * 3600 * 1000

    const recent = allResults
      .filter(r => {
        const t = new Date(r.match_date || r.validated_at).getTime()
        return isFinite(t) && t >= cutoff
      })
      .sort((a, b) =>
        new Date(b.match_date || b.validated_at).getTime() -
        new Date(a.match_date || a.validated_at).getTime()
      )

    setResults(recent)
    setReady(true)
  }, [allResults])

  const won = results.filter(r => r.pick_won === true).length
  const lost = results.filter(r => r.pick_won === false).length
  const total = won + lost
  const hitRate = total ? Math.round((won / total) * 100) : 0

  // Групиране по ден
  const byDay: Record<string, Result[]> = {}
  for (const r of results) {
    const day = (r.match_date || r.validated_at).split('T')[0]
    ;(byDay[day] ||= []).push(r)
  }
  const days = Object.keys(byDay).sort((a, b) => b.localeCompare(a))

  const fmtDay = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

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
        .page-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #e8f042; margin-bottom: 4px; }
        .page-title { font-size: 30px; font-weight: 900; text-transform: uppercase; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-sub { font-size: 13px; color: #8a8f99; margin-top: 6px; max-width: 480px; line-height: 1.5; }
        .scoreboard { display: flex; gap: 12px; }
        .sb-item { background: #111418; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px 20px; text-align: center; min-width: 78px; }
        .sb-item strong { font-size: 26px; font-weight: 900; display: block; line-height: 1; }
        .sb-item span { font-size: 10px; color: #8a8f99; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; display: block; }
        .sb-won strong { color: #2ecc8a; }
        .sb-lost strong { color: #e84545; }
        .sb-rate strong { color: #e8f042; }
        .main { max-width: 1100px; margin: 0 auto; padding: 28px 32px 80px; }
        .day-group { margin-bottom: 32px; }
        .day-header { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #f0ede6; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .day-header span { color: #8a8f99; font-weight: 600; margin-left: 8px; }
        .result-row { display: grid; grid-template-columns: 48px 1fr auto auto; gap: 14px; align-items: center; background: #111418; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; transition: border-color 0.15s; }
        .result-row:hover { border-color: rgba(255,255,255,0.15); }
        .result-row.won { border-left: 3px solid #2ecc8a; }
        .result-row.lost { border-left: 3px solid #e84545; }
        .r-badge { font-size: 22px; font-weight: 900; text-align: center; }
        .r-badge.won { color: #2ecc8a; }
        .r-badge.lost { color: #e84545; }
        .r-main { min-width: 0; }
        .r-title { font-size: 14px; font-weight: 700; line-height: 1.3; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; }
        .r-meta { font-size: 11px; color: #8a8f99; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .r-league { color: #8a8f99; }
        .r-pick { color: #e8f042; font-weight: 700; }
        .r-score { text-align: center; }
        .r-score strong { font-size: 20px; font-weight: 900; display: block; line-height: 1; }
        .r-score.won strong { color: #2ecc8a; }
        .r-score.lost strong { color: #e84545; }
        .r-score span { font-size: 9px; color: #8a8f99; text-transform: uppercase; }
        .r-odds { text-align: right; }
        .r-odds strong { font-size: 17px; font-weight: 900; color: #f0ede6; display: block; }
        .r-odds span { font-size: 9px; color: #8a8f99; text-transform: uppercase; }
        .empty { text-align: center; padding: 80px 20px; }
        .empty-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .empty-sub { font-size: 14px; color: #8a8f99; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 12px 32px; text-align: center; font-size: 11px; color: #8a8f99; }
        @media (max-width: 640px) {
          .nav-links { display: none; }
          .result-row { grid-template-columns: 38px 1fr auto; }
          .r-odds { display: none; }
          .page-title { font-size: 24px; }
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
          <a href="/results/" className="nav-active">Results</a>
        </div>
        <a href="/tips-today/" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="page-label">&#128202; Track Record</div>
            <h1 className="page-title">Results &amp; <em>Verdicts</em></h1>
            <p className="page-sub">Every settled prediction from the last {KEEP_DAYS} days with the final score — win or lose, fully transparent.</p>
          </div>
          <div className="scoreboard">
            <div className="sb-item sb-won"><strong>{won}</strong><span>Won</span></div>
            <div className="sb-item sb-lost"><strong>{lost}</strong><span>Lost</span></div>
            <div className="sb-item sb-rate"><strong>{hitRate}%</strong><span>Hit Rate</span></div>
          </div>
        </div>
      </div>

      <div className="main">
        {!ready ? null : days.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No settled results yet</div>
            <div className="empty-sub">Once today&apos;s matches finish, verified results appear here with final scores.</div>
          </div>
        ) : (
          days.map(day => (
            <div key={day} className="day-group">
              <div className="day-header">
                {fmtDay(day)}
                <span>
                  {byDay[day].filter(r => r.pick_won).length}W&nbsp;·&nbsp;
                  {byDay[day].filter(r => !r.pick_won).length}L
                </span>
              </div>
              {byDay[day].map(r => {
                const cls = r.pick_won ? 'won' : 'lost'
                return (
                  <a key={r.slug} href={`/predictions/${r.slug}/`} className={`result-row ${cls}`}>
                    <div className={`r-badge ${cls}`}>{r.pick_won ? '✓' : '✗'}</div>
                    <div className="r-main">
                      <div className="r-title">{r.title}</div>
                      <div className="r-meta">
                        <span>{leagueFlag(r.league)}</span>
                        <span className="r-league">{r.league}</span>
                        <span>·</span>
                        <span className="r-pick">{r.pick_code} @ {r.odds}</span>
                      </div>
                    </div>
                    {r.actual_home_score != null && (
                      <div className={`r-score ${cls}`}>
                        <strong>{r.actual_home_score}–{r.actual_away_score}</strong>
                        <span>Final</span>
                      </div>
                    )}
                    <div className="r-odds">
                      <strong>{r.odds}</strong>
                      <span>Odds</span>
                    </div>
                  </a>
                )
              })}
            </div>
          ))
        )}
      </div>

      <div className="rg-bar">
        <strong style={{ color: '#fff' }}>&#9888; Gamble Responsibly.</strong> 18+ only. Past results do not guarantee future outcomes.
      </div>
    </>
  )
}
