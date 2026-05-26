'use client'
import { useState, useEffect } from 'react'
import TipsClient from './TipsClient'

// Runs in the BROWSER — uses real current date, not build date
function sofiaDay(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sofia',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d)
}

export default function TipsPageWrapper({ allArticles }: { allArticles: any[] }) {
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    // This runs in the browser with the REAL current date
    const today = sofiaDay(new Date())

    const filtered = allArticles.filter(a => {
      // Skip validated/finished matches
      if (a.pick_won === true || a.pick_won === false) return false
      if (a.result === 'won' || a.result === 'lost') return false

      // Check if kickoff is TODAY in Sofia timezone
      if (a.match_date) return sofiaDay(new Date(a.match_date)) === today
      if (a.date) return a.date === today
      return false
    })

    setArticles(filtered)
  }, [allArticles])

  return <TipsClient articles={articles} />
}
