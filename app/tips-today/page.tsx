import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import TipsClient from './TipsClient'

function getArticles() {
  const sports = ['football', 'basketball', 'tennis', 'nfl']
  const articles: any[] = []
  const today = new Date().toISOString().split('T')[0]

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
          if (data.date === today && data.odds && data.odds !== 'N/A' && data.odds !== 'null') {
            const lines = content.split('\n').filter((l: string) => l.trim() && !l.startsWith('---') && !l.startsWith('*'))
            const preview = lines[2]?.substring(0, 120) || lines[0]?.substring(0, 120) || ''
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
    }

    scan(baseDir)
  }

  return articles.sort((a, b) => a.league.localeCompare(b.league))
}

export default function TipsTodayPage() {
  const articles = getArticles()
  return <TipsClient articles={articles} />
}
