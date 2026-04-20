export default function HomePage() {
  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0a0c0f;color:#f0ede6;font-family:'Segoe UI',sans-serif}
        a{text-decoration:none;color:inherit}
        nav{position:sticky;top:0;z-index:100;background:rgba(10,12,15,0.95);border-bottom:1px solid rgba(255,255,255,0.07);padding:0 32px;height:56px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-size:22px;font-weight:900;letter-spacing:0.02em}
        .logo span{color:#e8f042}
        .nav-links{display:flex;gap:24px;font-size:13px;color:#8a8f99}
        .nav-links a:hover{color:#fff}
        .nav-cta{background:#e8f042;color:#000;padding:8px 20px;border-radius:4px;font-size:13px;font-weight:800;letter-spacing:0.05em}
        .hero{background:linear-gradient(135deg,#0d1019 0%,#0a1528 100%);padding:64px 32px 56px;border-bottom:1px solid rgba(255,255,255,0.07);position:relative;overflow:hidden}
        .hero-label{display:inline-flex;align-items:center;gap:8px;background:rgba(232,240,66,0.1);border:1px solid rgba(232,240,66,0.25);color:#e8f042;font-size:11px;font-weight:700;letter-spacing:0.12em;padding:5px 14px;border-radius:2px;margin-bottom:24px;text-transform:uppercase}
        .hero h1{font-size:72px;font-weight:900;line-height:0.9;text-transform:uppercase;margin-bottom:20px;max-width:700px}
        .hero h1 em{color:#e8f042;font-style:normal}
        .hero p{font-size:17px;color:#8a8f99;max-width:520px;line-height:1.7;margin-bottom:32px}
        .btn-primary{background:#e8f042;color:#000;padding:14px 32px;border-radius:4px;font-size:15px;font-weight:800;letter-spacing:0.05em;display:inline-block}
        .btn-secondary{border:1px solid rgba(255,255,255,0.2);color:#fff;padding:14px 32px;border-radius:4px;font-size:15px;font-weight:500;display:inline-block;margin-left:12px}
        .hero-stats{display:flex;gap:48px;margin-top:48px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.07);flex-wrap:wrap}
        .stat-val{font-size:40px;font-weight:900;color:#e8f042;line-height:1}
        .stat-label{font-size:11px;color:#8a8f99;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px}
        .section{max-width:1200px;margin:0 auto;padding:48px 32px}
        .section-header{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.07);padding-bottom:12px;margin-bottom:24px}
        .section-title{font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:0.02em}
        .section-link{font-size:12px;color:#e8f042;font-weight:700;letter-spacing:0.08em}
        .picks-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .pick-card{background:#111418;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:20px;transition:border-color 0.2s;cursor:pointer}
        .pick-card:hover{border-color:rgba(232,240,66,0.3)}
        .pick-card.featured{border-color:rgba(232,240,66,0.4);background:rgba(232,240,66,0.03)}
        .pick-sport{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8a8f99;margin-bottom:8px}
        .pick-match{font-size:15px;font-weight:600;margin-bottom:14px;line-height:1.3}
        .pick-bottom{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .pick-tip{background:rgba(46,204,138,0.1);color:#2ecc8a;font-size:11px;font-weight:700;padding:4px 10px;border-radius:3px}
        .pick-odds{font-size:26px;font-weight:900;color:#e8f042}
        .conf-bar{display:flex;gap:3px;margin-top:8px}
        .conf-dot{height:4px;flex:1;border-radius:2px;background:rgba(255,255,255,0.1)}
        .conf-dot.on{background:#e8f042}
        .conf-label{font-size:11px;color:#8a8f99;margin-top:5px;text-align:right}
        .aff-strip{background:#111418;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);padding:16px 32px;display:flex;align-items:center;gap:20px;overflow-x:auto}
        .aff-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8a8f99;white-space:nowrap;flex-shrink:0}
        .aff-item{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:10px 16px;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:border-color 0.2s}
        .aff-item:hover{border-color:rgba(255,255,255,0.18)}
        .aff-name{font-size:14px;font-weight:700}
        .aff-bonus{font-size:11px;color:#2ecc8a;font-weight:600}
        .aff-btn{background:#e8f042;color:#000;font-size:11px;font-weight:800;padding:5px 12px;border-radius:3px;letter-spacing:0.05em}
        .odds-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:40px}
        .odds-card{background:#111418;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:20px;text-align:center}
        .odds-sport{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8a8f99;margin-bottom:8px}
        .odds-match{font-size:14px;font-weight:600;margin-bottom:14px;line-height:1.3}
        .odds-row{display:flex;justify-content:center;gap:8px;margin-bottom:12px}
        .odd-box{background:#1e232c;border:1px solid rgba(255,255,255,0.07);border-radius:4px;padding:8px 12px;min-width:56px}
        .odd-box.active{border-color:rgba(232,240,66,0.5);background:rgba(232,240,66,0.06)}
        .odd-label{font-size:9px;text-transform:uppercase;color:#8a8f99;letter-spacing:0.08em}
        .odd-val{font-size:20px;font-weight:900;color:#f0ede6}
        .odd-box.active .odd-val{color:#e8f042}
        .odds-tip{font-size:11px;font-weight:700;color:#2ecc8a;text-transform:uppercase;letter-spacing:0.06em}
        .aff-inline{background:linear-gradient(90deg,rgba(26,15,0,0.9),rgba(10,15,26,0.9));border:1px solid rgba(255,255,255,0.07);border-left:3px solid #e8f042;border-radius:6px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;margin:32px 0;gap:20px}
        .aff-inline-text{font-size:20px;font-weight:800}
        .aff-inline-sub{font-size:12px;color:#8a8f99;margin-top:4px}
        .aff-disclaimer{font-size:10px;color:#8a8f99;margin-top:4px}
        footer{background:#111418;border-top:1px solid rgba(255,255,255,0.07);padding:48px 32px 32px;margin-top:60px}
        .footer-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
        .footer-logo{font-size:20px;font-weight:900}
        .footer-about{font-size:13px;color:#8a8f99;line-height:1.7;margin-top:10px}
        .footer-col-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8a8f99;margin-bottom:14px}
        .footer-links{display:flex;flex-direction:column;gap:8px;font-size:13px;color:#8a8f99}
        .footer-links a:hover{color:#fff}
        .footer-bottom{max-width:1200px;margin:28px auto 0;border-top:1px solid rgba(255,255,255,0.07);padding-top:20px;display:flex;justify-content:space-between;font-size:11px;color:#8a8f99;flex-wrap:wrap;gap:8px}
        .rg-bar{background:rgba(232,69,69,0.05);border-top:1px solid rgba(232,69,69,0.15);padding:12px 32px;text-align:center;font-size:11px;color:#8a8f99}
        @media(max-width:900px){.picks-grid,.odds-grid{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:48px}.nav-links{display:none}.footer-grid{grid-template-columns:1fr 1fr}}
        @media(max-width:600px){.picks-grid,.odds-grid{grid-template-columns:1fr}.hero h1{font-size:36px}.hero-stats{gap:24px}}
      `}</style>

      <nav>
        <div className="logo">Ai<span>Picks</span>Pro</div>
        <div className="nav-links">
          <a href="#">Football</a>
          <a href="#">Basketball</a>
          <a href="#">Tennis</a>
          <a href="#">NFL</a>
          <a href="#">Today&apos;s Tips</a>
          <a href="#">Stats</a>
        </div>
        <a href="#" className="nav-cta">FREE PICKS</a>
      </nav>

      <div className="hero">
        <div className="hero-label">● AI-Powered · Live Analysis · Updated Daily</div>
        <h1>The <em>Smarter</em><br/>Way to Bet</h1>
        <p>Our AI agents analyse thousands of data points — form, injuries, head-to-head, market movement — to deliver daily picks for football, NBA, tennis and more.</p>
        <a href="#" className="btn-primary">TODAY&apos;S FREE TIPS →</a>
        <a href="#" className="btn-secondary">View Track Record</a>
        <div className="hero-stats">
          {[['74%','Win rate (last 90 days)'],['+2,840','Units profit (2025)'],['12k+','Subscribers'],['4','Sports covered']].map(([v,l])=>(
            <div key={l}><div className="stat-val">{v}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="aff-strip">
        <div className="aff-label">Trusted Partners</div>
        {[['Bet365','Up to £100 bonus'],['William Hill','£30 free bet'],['DraftKings','$200 bonus bets'],['FanDuel','$1000 no sweat'],['Betway','€30 free bet'],['Unibet','€40 bonus']].map(([n,b])=>(
          <div key={n} className="aff-item">
            <div><div className="aff-name">{n}</div><div className="aff-bonus">{b}</div></div>
            <div className="aff-btn">Claim →</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Today&apos;s Top Picks</div>
          <a href="#" className="section-link">ALL PICKS →</a>
        </div>
        <div className="picks-grid">
          {[
            {sport:'⚽ Premier League · 20:45',match:'Man City vs Arsenal',tip:'Man City Win',odds:'1.72',conf:4,featured:true},
            {sport:'🏀 NBA · 01:30',match:'Lakers vs Celtics',tip:'Over 224.5',odds:'1.90',conf:3,featured:false},
            {sport:'🎾 Roland Garros · 14:00',match:'Djokovic vs Alcaraz',tip:'Alcaraz Win',odds:'1.90',conf:5,featured:false},
            {sport:'🏈 NFL · 22:00',match:'Chiefs vs Eagles',tip:'Chiefs -3.5',odds:'1.91',conf:3,featured:false},
          ].map((p)=>(
            <div key={p.match} className={`pick-card${p.featured?' featured':''}`}>
              <div className="pick-sport">{p.sport}</div>
              <div className="pick-match">{p.match}</div>
              <div className="pick-bottom">
                <span className="pick-tip">{p.tip}</span>
<span className="pick-odds">{p.odds}</span>