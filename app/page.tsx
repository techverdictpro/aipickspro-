import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0a0c0f]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="font-bold text-2xl tracking-wide">
            Ai<span className="text-[#e8f042]">Picks</span>Pro
          </div>
          <div className="hidden items-center gap-7 text-sm font-medium text-[#8a8f99] md:flex">
            <Link href="/football" className="hover:text-white transition-colors">Football</Link>
            <Link href="/basketball" className="hover:text-white transition-colors">Basketball</Link>
            <Link href="/tennis" className="hover:text-white transition-colors">Tennis</Link>
            <Link href="/nfl" className="hover:text-white transition-colors">NFL</Link>
            <Link href="/tips-today" className="hover:text-white transition-colors">Today&apos;s Tips</Link>
          </div>
          <Link href="/tips-today" className="rounded bg-[#e8f042] px-4 py-2 text-sm font-bold text-black hover:bg-[#c8d435] transition-colors">
            FREE PICKS
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/[0.07] bg-[#0d1019]">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#e8f042]/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="inline-flex items-center gap-2 rounded border border-[#e8f042]/25 bg-[#e8f042]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e8f042] mb-8">
            AI-Powered · Live Analysis · Updated Daily
          </div>
          <h1 className="text-6xl font-black uppercase leading-none tracking-tight md:text-8xl mb-6">
            The <span className="text-[#e8f042]">Smarter</span><br />Way to Bet
          </h1>
          <p className="max-w-xl text-lg text-[#8a8f99] leading-relaxed mb-10">
            Our AI agents analyse thousands of data points — form, injuries,
            head-to-head, market movement — to deliver daily picks for football,
            NBA, tennis and more.
          </p>
          <Link href="/tips-today" className="rounded bg-[#e8f042] px-7 py-3.5 text-base font-bold text-black hover:bg-[#c8d435] transition-colors inline-block">
            TODAY&apos;S FREE TIPS →
          </Link>
          <div className="mt-16 flex gap-12 border-t border-white/[0.07] pt-10 flex-wrap">
            {[
              { val: '74%', label: 'Win rate (last 90 days)' },
              { val: '+2,840', label: 'Units profit (2025)' },
              { val: '12k+', label: 'Subscribers' },
              { val: '4', label: 'Sports covered' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-extrabold text-[#e8f042]">{s.val}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-[#8a8f99]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-baseline justify-between border-b border-white/[0.07] pb-4">
          <h2 className="text-3xl font-extrabold uppercase">Today&apos;s Tips</h2>
          <Link href="/tips-today" className="text-xs font-semibold tracking-widest text-[#e8f042]">ALL TIPS →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { sport: 'Football', emoji: '⚽', match: 'Man City vs Arsenal', tip: 'Man City Win', odds: '1.72', conf: 4, league: 'Premier League' },
            { sport: 'Basketball', emoji: '🏀', match: 'Lakers vs Celtics', tip: 'Over 224.5', odds: '1.90', conf: 3, league: 'NBA' },
            { sport: 'Tennis', emoji: '🎾', match: 'Djokovic vs Alcaraz', tip: 'Alcaraz Win', odds: '1.90', conf: 5, league: 'Roland Garros' },
            { sport: 'NFL', emoji: '🏈', match: 'Chiefs vs Eagles', tip: 'Chiefs -3.5', odds: '1.91', conf: 3, league: 'NFL' },
          ].map((pick) => (
            <div key={pick.match} className="rounded-lg border border-white/[0.07] bg-[#111418] p-5 hover:border-[#e8f042]/25 transition-colors cursor-pointer">
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8a8f99]">{pick.emoji} {pick.league}</div>
              <div className="mb-4 font-medium leading-snug">{pick.match}</div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#2ecc8a]/10 px-2 py-1 text-xs font-bold text-[#2ecc8a]">{pick.tip}</span>
                <span className="text-2xl font-extrabold text-[#e8f042]">{pick.odds}</span>
              </div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < pick.conf ? 'bg-[#e8f042]' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.07] bg-[#111418] mt-20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="font-bold text-xl mb-3">Ai<span className="text-[#e8f042]">Picks</span>Pro</div>
          <p className="text-sm text-[#8a8f99]">AI-powered sports predictions. Updated daily.</p>
          <div className="mt-8 text-xs text-[#8a8f99]">© 2026 AiPicksPro. All rights reserved.</div>
        </div>
      </footer>

      <div className="border-t border-red-900/30 bg-red-950/20 px-6 py-3 text-center text-xs text-[#8a8f99]">
        <strong className="text-white">⚠ Gamble Responsibly.</strong> 18+ only. Betting involves risk of loss.
      </div>
    </>
  )
}