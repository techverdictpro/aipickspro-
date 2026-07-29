(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,43923,e=>{"use strict";var n=e.i(71645);e.s(["default",0,function(){return(0,n.useEffect)(()=>{if(!document.getElementById("mobilenav-style")){let e=document.createElement("style");e.id="mobilenav-style",e.textContent=`
        .mnav-burger { display: none; }
        @media (max-width: 720px) {
          .mnav-burger {
            display: flex; align-items: center; justify-content: center;
            background: none; border: none; color: #f0ede6;
            font-size: 26px; cursor: pointer; padding: 4px 10px;
            line-height: 1; order: 3;
          }
          /* Показваме менюто като вертикален панел, когато е отворено */
          nav .nav-links.mnav-open,
          nav .site-links.mnav-open {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 58px; left: 0; right: 0;
            background: #0d1019;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 12px 20px 18px;
            gap: 16px !important;
            z-index: 200;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          }
          nav .nav-links.mnav-open a,
          nav .site-links.mnav-open a {
            font-size: 16px !important;
            padding: 6px 0;
          }
          nav { position: relative; }
        }
      `,document.head.appendChild(e)}let e=document.querySelector("nav"),n=document.querySelector("nav .nav-links, nav .site-links");if(!e||!n||e.querySelector(".mnav-burger"))return;let t=document.createElement("button");t.className="mnav-burger",t.setAttribute("aria-label","Меню"),t.innerHTML="☰",t.onclick=e=>{e.stopPropagation(),n.classList.toggle("mnav-open"),t.innerHTML=n.classList.contains("mnav-open")?"✕":"☰"},document.addEventListener("click",e=>{n.contains(e.target)||e.target===t||(n.classList.remove("mnav-open"),t.innerHTML="☰")}),n.querySelectorAll("a").forEach(e=>{e.addEventListener("click",()=>{n.classList.remove("mnav-open"),t.innerHTML="☰"})}),e.appendChild(t)},[]),null}])}]);