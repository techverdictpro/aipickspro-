(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,68287,e=>{"use strict";var s=e.i(43476),t=e.i(71645);let a={football:"⚽",basketball:"🏀",tennis:"🎾",nfl:"🏈"};e.s(["default",0,function({allResults:e}){let[r,o]=(0,t.useState)([]),[i,n]=(0,t.useState)(!1);(0,t.useEffect)(()=>{let s=Date.now()-6048e5;o(e.filter(e=>{let t=new Date(e.match_date||e.validated_at).getTime();return isFinite(t)&&t>=s}).sort((e,s)=>new Date(s.match_date||s.validated_at).getTime()-new Date(e.match_date||e.validated_at).getTime())),n(!0)},[e]);let l=r.filter(e=>!0===e.pick_won).length,d=r.filter(e=>!1===e.pick_won).length,c=l+d,p=c?Math.round(l/c*100):0,x={};for(let e of r){let s=(e.match_date||e.validated_at).split("T")[0];(x[s]||=[]).push(e)}let g=Object.keys(x).sort((e,s)=>s.localeCompare(e));return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("style",{children:`
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
      `}),(0,s.jsxs)("nav",{children:[(0,s.jsxs)("a",{href:"/",className:"logo",children:["Ai",(0,s.jsx)("span",{className:"logo-accent",children:"Picks"}),"Pro"]}),(0,s.jsxs)("div",{className:"nav-links",children:[(0,s.jsx)("a",{href:"/football/",children:"Football"}),(0,s.jsx)("a",{href:"/basketball/",children:"Basketball"}),(0,s.jsx)("a",{href:"/tennis/",children:"Tennis"}),(0,s.jsx)("a",{href:"/nfl/",children:"NFL"}),(0,s.jsx)("a",{href:"/tips-today/",children:"Today's Tips"}),(0,s.jsx)("a",{href:"/results/",className:"nav-active",children:"Results"})]}),(0,s.jsx)("a",{href:"/tips-today/",className:"nav-cta",children:"FREE PICKS"})]}),(0,s.jsx)("div",{className:"page-header",children:(0,s.jsxs)("div",{className:"page-header-inner",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"page-label",children:"📊 Track Record"}),(0,s.jsxs)("h1",{className:"page-title",children:["Results & ",(0,s.jsx)("em",{children:"Verdicts"})]}),(0,s.jsxs)("p",{className:"page-sub",children:["Every settled prediction from the last ",7," days with the final score — win or lose, fully transparent."]})]}),(0,s.jsxs)("div",{className:"scoreboard",children:[(0,s.jsxs)("div",{className:"sb-item sb-won",children:[(0,s.jsx)("strong",{children:l}),(0,s.jsx)("span",{children:"Won"})]}),(0,s.jsxs)("div",{className:"sb-item sb-lost",children:[(0,s.jsx)("strong",{children:d}),(0,s.jsx)("span",{children:"Lost"})]}),(0,s.jsxs)("div",{className:"sb-item sb-rate",children:[(0,s.jsxs)("strong",{children:[p,"%"]}),(0,s.jsx)("span",{children:"Hit Rate"})]})]})]})}),(0,s.jsx)("div",{className:"main",children:i?0===g.length?(0,s.jsxs)("div",{className:"empty",children:[(0,s.jsx)("div",{className:"empty-title",children:"No settled results yet"}),(0,s.jsx)("div",{className:"empty-sub",children:"Once today's matches finish, verified results appear here with final scores."})]}):g.map(e=>(0,s.jsxs)("div",{className:"day-group",children:[(0,s.jsxs)("div",{className:"day-header",children:[new Date(e).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}),(0,s.jsxs)("span",{children:[x[e].filter(e=>e.pick_won).length,"W · ",x[e].filter(e=>!e.pick_won).length,"L"]})]}),x[e].map(e=>{let t=e.pick_won?"won":"lost";return(0,s.jsxs)("a",{href:`/predictions/${e.slug}/`,className:`result-row ${t}`,children:[(0,s.jsx)("div",{className:`r-badge ${t}`,children:e.pick_won?"✓":"✗"}),(0,s.jsxs)("div",{className:"r-main",children:[(0,s.jsx)("div",{className:"r-title",children:e.title}),(0,s.jsxs)("div",{className:"r-meta",children:[(0,s.jsx)("span",{children:a[e.sport]}),(0,s.jsx)("span",{className:"r-league",children:e.league}),(0,s.jsx)("span",{children:"·"}),(0,s.jsxs)("span",{className:"r-pick",children:[e.pick_code," @ ",e.odds]})]})]}),null!=e.actual_home_score&&(0,s.jsxs)("div",{className:`r-score ${t}`,children:[(0,s.jsxs)("strong",{children:[e.actual_home_score,"–",e.actual_away_score]}),(0,s.jsx)("span",{children:"Final"})]}),(0,s.jsxs)("div",{className:"r-odds",children:[(0,s.jsx)("strong",{children:e.odds}),(0,s.jsx)("span",{children:"Odds"})]})]},e.slug)})]},e)):null}),(0,s.jsxs)("div",{className:"rg-bar",children:[(0,s.jsx)("strong",{style:{color:"#fff"},children:"⚠ Gamble Responsibly."})," 18+ only. Past results do not guarantee future outcomes."]})]})}])}]);