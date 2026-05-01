import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

function getOneLiner(content: string): string {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('---') && !l.startsWith('#') && !l.startsWith('*'))
  const text = lines[1]?.length > 50 ? lines[1] : lines[0] || ''
  return text.substring(0, 140) + (text.length > 140 ? '...' : '')
}

export async function GET() {
  const sports = ['football', 'basketball', 'tennis', 'nfl']
  const articles = []
  const today = new Date().toISOString().split('T')[0]

  for (const sport of sports) {
    const baseDir = path.join(process.cwd(), 'content', 'predictions', sport)
    if (!fs.existsSync(baseDir)) continue

    const entries = fs.readdirSync(baseDir)
    for (const entry of entries) {
      const entryPath = path.join(baseDir, entry)
      if (entry.endsWith('.mdx')) {
        const raw = fs.readFileSync(entryPath, 'utf-8')
        const { data, content } = matter(raw)
        if (data.date === today) {
          articles.push({ ...data, sport, slug: entry.replace('.mdx', ''), preview: getOneLiner(content) })
        }
      } else if (fs.statSync(entryPath).isDirectory()) {
        const files = fs.readdirSync(entryPath).filter(f => f.endsWith('.mdx'))
        for (const file of files) {
          const raw = fs.readFileSync(path.join(entryPath, file), 'utf-8')
          const { data, content } = matter(raw)
          if (data.date === today) {
            articles.push({ ...data, sport, slug: file.replace('.mdx', ''), preview: getOneLiner(content) })
          }
        }
      }
    }
  }

  articles.sort((a: any, b: any) => a.league.localeCompare(b.league))
  return NextResponse.json(articles)
}
