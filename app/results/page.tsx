// ============================================================
// app/results/page.tsx — секция РЕЗУЛТАТИ
// Показва ЗАВЪРШИЛИТЕ прогнози (WON/LOST) с краен резултат.
// Пази ги 7 дни след мача, после падат (агентът ги трие от GitHub).
// Датата се филтрира клиентски (реалната браузър-дата).
// ============================================================
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ResultsClient from './ResultsClient'

function getFinishedArticles() {
  const sports = ['football', 'basketball', 'tennis', 'nfl']
  const arts: any[] = []

  for (const sport of sports) {
    const base = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(base)) continue

    const scan = (dir: string) => {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry)
        if (fs.statSync(full).isDirectory()) { scan(full); continue }
        if (!entry.endsWith('.mdx')) continue

        const { data } = matter(fs.readFileSync(full, 'utf-8'))

        // Само завършили и валидирани прогнози
        const finished = data.pick_won === true || data.pick_won === false
        if (!finished) continue

        arts.push({
          slug:              entry.replace('.mdx', ''),
          title:             data.title || '',
          sport,
          league:            data.league || '',
          date:              data.date || '',
          match_date:        data.match_date || '',
          pick_code:         data.pick_code || '',
          market:            data.market || '',
          odds:              data.odds || String(data.pick_odds || ''),
          pick_odds:         data.pick_odds ?? null,
          confidence:        data.confidence || 3,
          pick_won:          data.pick_won,
          actual_home_score: data.actual_home_score ?? null,
          actual_away_score: data.actual_away_score ?? null,
          validated_at:      data.validated_at || '',
        })
      }
    }
    scan(base)
  }

  return arts
}

export default function ResultsPage() {
  const finished = getFinishedArticles()
  return <ResultsClient allResults={finished} />
}
