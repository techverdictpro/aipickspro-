(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,20895,e=>{"use strict";var t=e.i(43476),i=e.i(71645);let a={football:"⚽",basketball:"🏀",tennis:"🎾",nfl:"🏈"};function s({articles:e}){let[r,n]=(0,i.useState)("all"),o=Array.from(new Set(e.map(e=>e.league))).sort(),l=Array.from(new Set(e.map(e=>e.sport))),p="all"===r?e:e.filter(e=>e.league===r||e.sport===r),d=o.reduce((e,t)=>{let i=p.filter(e=>e.league===t);return i.length>0&&(e[t]=i),e},{}),c=e.filter(e=>"won"===e.result).length,x=e.filter(e=>"lost"===e.result).length;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:`
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
        .page-header { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 20px 32px; }
        .page-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .page-date { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #e8f042; margin-bottom: 4px; }
        .page-title { font-size: 28px; font-weight: 900; text-transform: uppercase; }
        .page-title em { color: #e8f042; font-style: normal; }
        .page-stats { display: flex; gap: 16px; }
        .page-stat { text-align: center; }
        .page-stat strong { font-size: 20px; font-weight: 900; display: block; color: #e8f042; }
        .page-stat span { font-size: 10px; color: #8a8f99; text-transform: uppercase; }
        .stat-won strong { color: #2ecc8a; }
        .stat-lost strong { color: #e84545; }
        .filters-bar { background: #0d1019; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; position: sticky; top: 58px; z-index: 90; }
        .filters-inner { max-width: 1100px; margin: 0 auto; display: flex; overflow-x: auto; padding-bottom: 1px; scrollbar-width: none; }
        .filters-inner::-webkit-scrollbar { display: none; }
        .filter-btn { padding: 11px 14px; font-size: 12px; font-weight: 600; color: #8a8f99; border-bottom: 2px solid transparent; cursor: pointer; white-space: nowrap; background: none; border-top: none; border-left: none; border-right: none; font-family: inherit; }
        .filter-btn:hover { color: #fff; }
        .filter-btn.active { color: #e8f042; border-bottom-color: #e8f042; }
        .filter-count { background: rgba(232,240,66,0.1); color: #e8f042; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 8px; margin-left: 3px; }
        .filter-sep { width: 1px; background: rgba(255,255,255,0.07); margin: 8px 4px; flex-shrink: 0; }
        .main { max-width: 1100px; margin: 0 auto; padding: 20px 32px 80px; }
        .league-group { margin-bottom: 24px; }
        .league-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .league-name { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8f99; }
        .league-count { background: rgba(255,255,255,0.05); color: #8a8f99; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 8px; }
        .tip-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #111418; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; margin-bottom: 5px; text-decoration: none; color: inherit; transition: border-color 0.15s; }
        .tip-row:hover { border-color: rgba(232,240,66,0.3); }
        .tip-row.won { border-left: 3px solid #2ecc8a; }
        .tip-row.lost { border-left: 3px solid #e84545; }
        .tip-result { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; flex-shrink: 0; }
        .tip-result.won { background: rgba(46,204,138,0.15); color: #2ecc8a; }
        .tip-result.lost { background: rgba(232,69,69,0.15); color: #e84545; }
        .tip-result.pending { background: rgba(255,255,255,0.05); color: #8a8f99; font-size: 9px; }
        .tip-emoji { font-size: 14px; flex-shrink: 0; }
        .tip-main { flex: 1; min-width: 0; }
        .tip-title { font-size: 13px; font-weight: 700; color: #f0ede6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tip-preview { font-size: 11px; color: #8a8f99; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .tip-pick { flex-shrink: 0; text-align: right; min-width: 100px; }
        .tip-pick-val { font-size: 11px; font-weight: 700; color: #e8f042; }
        .tip-pick-odds { font-size: 16px; font-weight: 900; color: #e8f042; }
        .tip-conf { display: flex; gap: 2px; justify-content: flex-end; margin-top: 2px; }
        .cdot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.1); }
        .cdot-on { background: #e8f042; }
        .tip-arrow { color: #8a8f99; font-size: 14px; flex-shrink: 0; }
        .no-tips { text-align: center; padding: 60px; color: #8a8f99; }
        .no-tips h3 { font-size: 20px; margin-bottom: 8px; color: #f0ede6; }
        .rg-bar { background: rgba(232,69,69,0.05); border-top: 1px solid rgba(232,69,69,0.15); padding: 10px 32px; text-align: center; font-size: 11px; color: #8a8f99; }
        @media (max-width: 700px) { .nav-links { display: none; } .tip-preview { display: none; } .main { padding: 16px 16px 60px; } .filters-bar { padding: 0 16px; } .page-header { padding: 16px; } }
      `}),(0,t.jsxs)("nav",{children:[(0,t.jsxs)("a",{href:"/",className:"logo",children:["Ai",(0,t.jsx)("span",{className:"logo-accent",children:"Picks"}),"Pro"]}),(0,t.jsxs)("div",{className:"nav-links",children:[(0,t.jsx)("a",{href:"/football/",children:"Football"}),(0,t.jsx)("a",{href:"/basketball/",children:"Basketball"}),(0,t.jsx)("a",{href:"/tennis/",children:"Tennis"}),(0,t.jsx)("a",{href:"/nfl/",children:"NFL"}),(0,t.jsx)("a",{href:"/tips-today/",className:"nav-active",children:"Today's Tips"})]}),(0,t.jsx)("a",{href:"/tips-today/",className:"nav-cta",children:"FREE PICKS"})]}),(0,t.jsx)("div",{className:"page-header",children:(0,t.jsxs)("div",{className:"page-header-inner",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"page-date",children:["📅 ",new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})]}),(0,t.jsxs)("h1",{className:"page-title",children:["Today's ",(0,t.jsx)("em",{children:"Tips"})]})]}),(0,t.jsxs)("div",{className:"page-stats",children:[(0,t.jsxs)("div",{className:"page-stat",children:[(0,t.jsx)("strong",{children:e.length}),(0,t.jsx)("span",{children:"Tips"})]}),c>0&&(0,t.jsxs)("div",{className:"page-stat stat-won",children:[(0,t.jsx)("strong",{children:c}),(0,t.jsx)("span",{children:"Won"})]}),x>0&&(0,t.jsxs)("div",{className:"page-stat stat-lost",children:[(0,t.jsx)("strong",{children:x}),(0,t.jsx)("span",{children:"Lost"})]})]})]})}),(0,t.jsx)("div",{className:"filters-bar",children:(0,t.jsxs)("div",{className:"filters-inner",children:[(0,t.jsxs)("button",{className:`filter-btn ${"all"===r?"active":""}`,onClick:()=>n("all"),children:["All ",(0,t.jsx)("span",{className:"filter-count",children:e.length})]}),l.map(i=>(0,t.jsxs)("button",{className:`filter-btn ${r===i?"active":""}`,onClick:()=>n(i),children:[a[i]," ",i.charAt(0).toUpperCase()+i.slice(1)," ",(0,t.jsx)("span",{className:"filter-count",children:e.filter(e=>e.sport===i).length})]},i)),(0,t.jsx)("div",{className:"filter-sep"}),o.map(i=>(0,t.jsxs)("button",{className:`filter-btn ${r===i?"active":""}`,onClick:()=>n(i),children:[i," ",(0,t.jsx)("span",{className:"filter-count",children:e.filter(e=>e.league===i).length})]},i))]})}),(0,t.jsx)("div",{className:"main",children:0===e.length?(0,t.jsxs)("div",{className:"no-tips",children:[(0,t.jsx)("h3",{children:"No predictions for today yet"}),(0,t.jsx)("p",{children:"Our AI agents publish new predictions daily at 9:00 AM."})]}):0===Object.keys(d).length?(0,t.jsx)("div",{className:"no-tips",children:(0,t.jsx)("h3",{children:"No tips for this filter"})}):Object.entries(d).map(([e,i])=>{let s=i[0]?.sport||"football";return(0,t.jsxs)("div",{className:"league-group",children:[(0,t.jsxs)("div",{className:"league-header",children:[(0,t.jsx)("span",{children:a[s]}),(0,t.jsx)("span",{className:"league-name",children:e}),(0,t.jsx)("span",{className:"league-count",children:i.length})]}),i.map(e=>(0,t.jsxs)("a",{href:`/predictions/${e.slug}/`,className:`tip-row ${"won"===e.result?"won":"lost"===e.result?"lost":""}`,children:[(0,t.jsx)("div",{className:`tip-result ${"won"===e.result?"won":"lost"===e.result?"lost":"pending"}`,children:"won"===e.result?"✓":"lost"===e.result?"✗":"?"}),(0,t.jsx)("div",{className:"tip-emoji",children:a[s]}),(0,t.jsxs)("div",{className:"tip-main",children:[(0,t.jsx)("div",{className:"tip-title",children:e.title}),e.preview&&(0,t.jsx)("div",{className:"tip-preview",children:e.preview})]}),(0,t.jsxs)("div",{className:"tip-pick",children:[(0,t.jsx)("div",{className:"tip-pick-val",children:e.prediction?.split("@")[0]?.trim()}),(0,t.jsx)("div",{className:"tip-pick-odds",children:e.odds?`@ ${e.odds}`:"—"}),(0,t.jsx)("div",{className:"tip-conf",children:[1,2,3,4,5].map(i=>(0,t.jsx)("div",{className:i<=e.confidence?"cdot cdot-on":"cdot"},i))})]}),(0,t.jsx)("div",{className:"tip-arrow",children:"›"})]},e.slug))]},e)})}),(0,t.jsxs)("div",{className:"rg-bar",children:[(0,t.jsx)("strong",{style:{color:"#fff"},children:"⚠ Gamble Responsibly."})," 18+ only. Betting involves risk of loss."]})]})}function r(e){return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Sofia",year:"numeric",month:"2-digit",day:"2-digit"}).format(e)}e.s(["default",0,function({allArticles:e}){let[a,n]=(0,i.useState)([]);return(0,i.useEffect)(()=>{let t=r(new Date);n(e.filter(e=>!0!==e.pick_won&&!1!==e.pick_won&&"won"!==e.result&&"lost"!==e.result&&(e.match_date?r(new Date(e.match_date))===t:!!e.date&&e.date===t)))},[e]),(0,t.jsx)(s,{articles:a})}],20895)}]);