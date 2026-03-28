/**
 * M0re Than Flowers — main.js
 * Fixes: reveal hidden by default only after JS loads,
 *        search overlay uses display:none toggle,
 *        hamburger, tabs, cart badge, parallax
 */

/* ── 1. Mark body as JS-loaded (enables reveal hiding) ─── */
// This runs immediately — before DOMContentLoaded —
// so CSS .js-loaded .reveal { opacity: 0 } kicks in early.
document.documentElement.classList.add('js-loaded');
// Apply to body once available
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-loaded');
});


/* ── 2. Scroll Reveal ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  els.forEach((el) => io.observe(el));
});


/* ── 3. Sticky nav shadow on scroll ───────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 2px 16px rgba(44,44,44,0.07)'
      : 'none';
  }, { passive: true });
});


/* ── 4. Mobile hamburger ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  const close = () => {
    nav.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
  });

  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') &&
        !nav.contains(e.target) &&
        !btn.contains(e.target)) close();
  });
});


/* ── 5. Search overlay ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle  = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  const input   = overlay?.querySelector('.search-input');
  if (!toggle || !overlay) return;

  const open = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => input?.focus(), 50);
  };
  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };

  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  // Close on clicking the overlay background itself
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
});


/* ── 6. Tab switcher ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const tabBar = document.querySelector('.tab-bar');
  if (!tabBar) return;

  const tabs   = tabBar.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });

      panels.forEach((panel) => {
        const match = panel.id === `panel-${tab.dataset.tab}`;
        panel.classList.toggle('active', match);
        match ? panel.removeAttribute('hidden') : panel.setAttribute('hidden', '');

        if (match) {
          panel.querySelectorAll('.reveal:not(.visible)')
               .forEach((el) => el.classList.add('visible'));
        }
      });
    });
  });
});


/* ── 7. Cart badge ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;

  let count = parseInt(sessionStorage.getItem('cartCount') || '0', 10);

  const update = () => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  };
  update();

  // Pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes badgePop {
      0%   { transform: scale(1); }
      45%  { transform: scale(1.5); }
      100% { transform: scale(1); }
    }
    .cart-badge.pop { animation: badgePop 0.35s ease; }
  `;
  document.head.appendChild(style);

  window.addToCart = (qty = 1) => {
    count += qty;
    sessionStorage.setItem('cartCount', count);
    update();
    badge.classList.remove('pop');
    void badge.offsetWidth;
    badge.classList.add('pop');
  };
});


/* ── 8. Hero slide counter rotation ───────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.querySelector('.hero-count');
  if (!countEl) return;

  let current = 1;
  const total = 7;

  setInterval(() => {
    current = current < total ? current + 1 : 1;
    countEl.textContent = `${current} / ${total}`;
  }, 4000);
});


/* ── 9. Subtle hero parallax ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const img = document.querySelector('.hero-img');
  if (!img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    img.style.transform = `translateY(${window.scrollY * 0.1}px)`;
  }, { passive: true });
});