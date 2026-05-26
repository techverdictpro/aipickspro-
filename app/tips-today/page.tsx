import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import TipsClient from './TipsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function sofiaDay(d: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sofia',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(typeof d === 'string' ? new Date(d) : d)
}

function getArticles() {
  const sports = ['football', 'basketball', 'tennis', 'nfl']
  const today  = sofiaDay(new Date())
  const arts: any[] = []

  for (const sport of sports) {
    const base = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(base)) continue

    const scan = (dir: string) => {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry)
        if (fs.statSync(full).isDirectory()) { scan(full); continue }
        if (!entry.endsWith('.mdx')) continue

        const { data, content } = matter(fs.readFileSync(full, 'utf-8'))

        // Skip validated matches (finished)
        if (data.pick_won === true || data.pick_won === false) continue
        if (data.result === 'won' || data.result === 'lost') continue

        // ALWAYS compute from match_date — NEVER trust is_today from MDX (stale)
        let isToday = false
        if (data.match_date) {
          isToday = sofiaDay(data.match_date as string) === today
        } else if (data.date) {
          isToday = data.date === today
        }
        if (!isToday) continue

        const excerpt = (data.excerpt || '')
          .toString().replace(/<[^>]+>/g, '').trim() ||
          content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)

        arts.push({
          slug:         entry.replace('.mdx', ''),
          title:        data.title || '',
          sport,
          league:       data.league || '',
          date:         data.date || '',
          match_date:   data.match_date || '',
          prediction:   data.prediction || '',
          pick_code:    data.pick_code || '',
          market:       data.market || '',
          odds:         data.odds || String(data.pick_odds || ''),
          pick_odds:    data.pick_odds ?? null,
          confidence:   data.confidence || 3,
          model_prob:   data.model_prob ?? null,
          implied_prob: data.implied_prob ?? null,
          edge:         data.edge ?? null,
          reasoning:    (data.reasoning || '').replace(/<[^>]+>/g, '').trim(),
          result:       data.result || 'pending',
          preview:      excerpt,
        })
      }
    }
    scan(base)
  }

  return arts.sort((a, b) => {
    if (a.league !== b.league) return a.league.localeCompare(b.league)
    return (a.match_date || '').localeCompare(b.match_date || '')
  })
}

export default function TipsTodayPage() {
  const articles = getArticles()
  return <TipsClient articles={articles} />
}
