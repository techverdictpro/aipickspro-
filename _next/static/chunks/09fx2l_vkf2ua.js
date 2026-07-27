(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,68287,e=>{"use strict";var a=e.i(43476),s=e.i(71645);let r={"Premier League":"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Championship:"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Scottish Premiership":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","La Liga":"🇪🇸","La Liga 2":"🇪🇸","Serie A":"🇮🇹","Serie B":"🇮🇹",Bundesliga:"🇩🇪","Bundesliga 2":"🇩🇪","Ligue 1":"🇫🇷","Ligue 2":"🇫🇷",Eredivisie:"🇳🇱","Primeira Liga":"🇵🇹","Belgian Pro League":"🇧🇪","Super Lig":"🇹🇷","Greek Super League":"🇬🇷","Swiss Super League":"🇨🇭","Austrian Bundesliga":"🇦🇹","Danish Superliga":"🇩🇰","Norwegian Eliteserien":"🇳🇴","Swedish Allsvenskan":"🇸🇪","Polish Ekstraklasa":"🇵🇱","Czech Liga":"🇨🇿","Romanian Liga 1":"🇷🇴",MLS:"🇺🇸","Liga MX":"🇲🇽",Brasileirao:"🇧🇷","Argentine Primera":"🇦🇷","Copa Libertadores":"🏆","Copa Sudamericana":"🏆","J-League":"🇯🇵","K-League":"🇰🇷","Saudi Pro League":"🇸🇦","Champions League":"🏆","Europa League":"🏅","Conference League":"🎖️"};e.s(["default",0,function({allResults:e}){let[t,i]=(0,s.useState)([]),[o,n]=(0,s.useState)(!1);(0,s.useEffect)(()=>{let a=Date.now()-6048e5;i(e.filter(e=>{let s=new Date(e.match_date||e.validated_at).getTime();return isFinite(s)&&s>=a}).sort((e,a)=>new Date(a.match_date||a.validated_at).getTime()-new Date(e.match_date||e.validated_at).getTime())),n(!0)},[e]);let l=t.filter(e=>!0===e.pick_won).length,d=t.filter(e=>!1===e.pick_won).length,c=l+d,p=c?Math.round(l/c*100):0,g={};for(let e of t){let a=(e.match_date||e.validated_at).split("T")[0];(g[a]||=[]).push(e)}let x=Object.keys(g).sort((e,a)=>a.localeCompare(e));return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("style",{children:`
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
      `}),(0,a.jsxs)("nav",{children:[(0,a.jsxs)("a",{href:"/",className:"logo",children:["Ai",(0,a.jsx)("span",{className:"logo-accent",children:"Picks"}),"Pro"]}),(0,a.jsxs)("div",{className:"nav-links",children:[(0,a.jsx)("a",{href:"/football/",children:"Football"}),(0,a.jsx)("a",{href:"/basketball/",children:"Basketball"}),(0,a.jsx)("a",{href:"/tennis/",children:"Tennis"}),(0,a.jsx)("a",{href:"/nfl/",children:"NFL"}),(0,a.jsx)("a",{href:"/tips-today/",children:"Today's Tips"}),(0,a.jsx)("a",{href:"/results/",className:"nav-active",children:"Results"})]}),(0,a.jsx)("a",{href:"/tips-today/",className:"nav-cta",children:"FREE PICKS"})]}),(0,a.jsx)("div",{className:"page-header",children:(0,a.jsxs)("div",{className:"page-header-inner",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("div",{className:"page-label",children:"📊 Track Record"}),(0,a.jsxs)("h1",{className:"page-title",children:["Results & ",(0,a.jsx)("em",{children:"Verdicts"})]}),(0,a.jsxs)("p",{className:"page-sub",children:["Every settled prediction from the last ",7," days with the final score — win or lose, fully transparent."]})]}),(0,a.jsxs)("div",{className:"scoreboard",children:[(0,a.jsxs)("div",{className:"sb-item sb-won",children:[(0,a.jsx)("strong",{children:l}),(0,a.jsx)("span",{children:"Won"})]}),(0,a.jsxs)("div",{className:"sb-item sb-lost",children:[(0,a.jsx)("strong",{children:d}),(0,a.jsx)("span",{children:"Lost"})]}),(0,a.jsxs)("div",{className:"sb-item sb-rate",children:[(0,a.jsxs)("strong",{children:[p,"%"]}),(0,a.jsx)("span",{children:"Hit Rate"})]})]})]})}),(0,a.jsx)("div",{className:"main",children:o?0===x.length?(0,a.jsxs)("div",{className:"empty",children:[(0,a.jsx)("div",{className:"empty-title",children:"No settled results yet"}),(0,a.jsx)("div",{className:"empty-sub",children:"Once today's matches finish, verified results appear here with final scores."})]}):x.map(e=>(0,a.jsxs)("div",{className:"day-group",children:[(0,a.jsxs)("div",{className:"day-header",children:[new Date(e).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}),(0,a.jsxs)("span",{children:[g[e].filter(e=>e.pick_won).length,"W · ",g[e].filter(e=>!e.pick_won).length,"L"]})]}),g[e].map(e=>{let s=e.pick_won?"won":"lost";return(0,a.jsxs)("a",{href:`/predictions/${e.slug}/`,className:`result-row ${s}`,children:[(0,a.jsx)("div",{className:`r-badge ${s}`,children:e.pick_won?"✓":"✗"}),(0,a.jsxs)("div",{className:"r-main",children:[(0,a.jsx)("div",{className:"r-title",children:e.title}),(0,a.jsxs)("div",{className:"r-meta",children:[(0,a.jsx)("span",{children:r[e.league]||"⚽"}),(0,a.jsx)("span",{className:"r-league",children:e.league}),(0,a.jsx)("span",{children:"·"}),(0,a.jsxs)("span",{className:"r-pick",children:[e.pick_code," @ ",e.odds]})]})]}),null!=e.actual_home_score&&(0,a.jsxs)("div",{className:`r-score ${s}`,children:[(0,a.jsxs)("strong",{children:[e.actual_home_score,"–",e.actual_away_score]}),(0,a.jsx)("span",{children:"Final"})]}),(0,a.jsxs)("div",{className:"r-odds",children:[(0,a.jsx)("strong",{children:e.odds}),(0,a.jsx)("span",{children:"Odds"})]})]},e.slug)})]},e)):null}),(0,a.jsxs)("div",{className:"rg-bar",children:[(0,a.jsx)("strong",{style:{color:"#fff"},children:"⚠ Gamble Responsibly."})," 18+ only. Past results do not guarantee future outcomes."]})]})}],68287)}]);