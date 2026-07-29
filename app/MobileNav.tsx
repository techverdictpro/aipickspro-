'use client'

// ============================================================
// app/MobileNav.tsx — универсален мобилен хамбургер
// Не пипа отделните страници. Намира съществуващото .nav-links
// меню на всяка страница и на тесен екран добавя ☰ бутон,
// който го показва/скрива. Едно място за целия сайт.
// ============================================================
import { useEffect } from 'react'

export default function MobileNav() {
  useEffect(() => {
    // Добавяме глобални стилове само веднъж
    if (!document.getElementById('mobilenav-style')) {
      const st = document.createElement('style')
      st.id = 'mobilenav-style'
      st.textContent = `
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
      `
      document.head.appendChild(st)
    }

    // Намираме менюто и nav-а
    const nav = document.querySelector('nav')
    const links = document.querySelector('nav .nav-links, nav .site-links') as HTMLElement | null
    if (!nav || !links) return

    // Ако вече има бутон — не добавяме втори (при re-render)
    if (nav.querySelector('.mnav-burger')) return

    // Създаваме хамбургер бутона
    const burger = document.createElement('button')
    burger.className = 'mnav-burger'
    burger.setAttribute('aria-label', 'Меню')
    burger.innerHTML = '☰'
    burger.onclick = (e) => {
      e.stopPropagation()
      links.classList.toggle('mnav-open')
      burger.innerHTML = links.classList.contains('mnav-open') ? '✕' : '☰'
    }

    // Затваряне при клик извън менюто
    document.addEventListener('click', (e) => {
      if (!links.contains(e.target as Node) && e.target !== burger) {
        links.classList.remove('mnav-open')
        burger.innerHTML = '☰'
      }
    })

    // Затваряне при клик на връзка
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('mnav-open')
        burger.innerHTML = '☰'
      })
    })

    nav.appendChild(burger)
  }, [])

  return null
}
