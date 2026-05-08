import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import TipsClient from './TipsClient'

function getSofiaDate() {
  const now = new Date()
  const sofiaOffset = 3 * 60
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const sofia = new Date(utc + sofiaOffset * 60000)
  return sofia.toISOString().split('T')[0]
}

function getArticles() {
  const sports = ['football', 'basketball', 'tennis', 'nfl']
  const articles: any[] = []
  const today = getSofiaDate()

  for (const sport of sports) {
    const baseDir = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(baseDir)) continue

    const scan = (dir: string) => {
      const entries = fs.readdirSync(dir)
      for (const entry of entries) {
        const fullPath = path.join(dir, entry)
        if (fs.statSync(fullPath).isDirectory()) {
          scan(fullPath)
        } else if (entry.endsWith('.mdx')) {
          const raw = fs.readFileSync(fullPath, 'utf-8')
          const { data, content } = matter(raw)

          // Only today's date
          if (data.date !== today) continue

          const lines = content.split('\n').filter((l: string) =>
            l.trim() && !l.startsWith('---') && !l.startsWith('*') &&
            !l.includes('Kick-off:') && !l.includes('Odds:') &&
            !l.includes('Form:') && !l.includes('Goals/game:')
          )
          const verdict = lines.find((l: string) => l.includes('VERDICT:'))
          const preview = verdict
            ? verdict.replace('VERDICT:', '').trim().substring(0, 120)
            : lines.slice(1).find((l: string) => l.length > 20)?.substring(0, 120) || ''

          articles.push({
            slug: entry.replace('.mdx', ''),
            title: data.title || '',
            sport,
            league: data.league || '',
            date: data.date || '',
            prediction: data.prediction || '',
            odds: data.odds || '',
            confidence: data.confidence || 3,
            result: data.result || 'pending',
            preview,
          })
        }
      }
    }

    scan(baseDir)
  }

  return articles.sort((a: any, b: any) => a.league.localeCompare(b.league))
}

export default function TipsTodayPage() {
  const articles = getArticles()
  return <TipsClient articles={articles} />
}
