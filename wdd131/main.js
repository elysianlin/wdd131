/**
 * flowers.js  —  Filter + pagination engine for M0re Than Flowers
 *
 * Filter logic:
 *   Within a group  →  OR  (any tick passes)
 *   Between groups  →  AND (must pass every active group)
 *
 * Pagination: PER_PAGE cards shown at once, JS builds buttons.
 * No hardcoded page buttons in HTML — only the › arrow is in HTML.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── constants ─────────────────────────────────────── */
  const PER_PAGE = 6;

  /* ─── state ─────────────────────────────────────────── */
  const S = {
    price:    [],   // [{ min, max }, …]
    category: [],   // ['bouquet', …]
    color:    [],   // ['pink', …]
    sort:     'default',
    page:     1,
  };

  /* ─── DOM ────────────────────────────────────────────── */
  const grid    = document.getElementById('flowersGrid');
  const countEl = document.getElementById('resultCount');
  const chipsEl = document.getElementById('activeFilters');
  const emptyEl = document.getElementById('emptyState');
  const pagNav  = document.getElementById('pagination');
  const sortEl  = document.getElementById('sortSelect');
  const nextBtn = document.getElementById('pageNext');

  /* Snapshot every card once at boot — order = original HTML order */
  const ALL = Array.from(grid.querySelectorAll('.flower-card'));

  /* ─── card data readers ──────────────────────────────── */
  const cardPrice    = (c) => parseFloat(c.dataset.price    || 0);
  const cardCat      = (c) => (c.dataset.category || '').trim();
  const cardColors   = (c) => (c.dataset.color    || '').split(/\s+/).filter(Boolean);
  const cardName     = (c) => (c.querySelector('.flower-name')?.textContent || '').trim();

  /* ─── filter predicate ───────────────────────────────── */
  const passes = (card) => {
    if (S.price.length) {
      const p = cardPrice(card);
      if (!S.price.some(({ min, max }) => p >= min && p <= max)) return false;
    }
    if (S.category.length) {
      if (!S.category.includes(cardCat(card))) return false;
    }
    if (S.color.length) {
      const cc = cardColors(card);
      if (!S.color.some((c) => cc.includes(c))) return false;
    }
    return true;
  };

  /* ─── sort ───────────────────────────────────────────── */
  const applySort = (arr) => {
    const a = [...arr];
    if (S.sort === 'price-asc')  return a.sort((x, y) => cardPrice(x) - cardPrice(y));
    if (S.sort === 'price-desc') return a.sort((x, y) => cardPrice(y) - cardPrice(x));
    if (S.sort === 'name-asc')   return a.sort((x, y) => cardName(x).localeCompare(cardName(y)));
    return a;
  };

  /* ─────────────────────────────────────────────────────
     RENDER  —  the single source of truth
     Called every time any filter/sort/page changes.
  ───────────────────────────────────────────────────── */
  const render = () => {
    /* 1. Work out which cards match and in what order */
    const matched   = applySort(ALL.filter(passes));
    const total     = matched.length;
    const pageStart = (S.page - 1) * PER_PAGE;
    const pageEnd   = pageStart + PER_PAGE;
    const visible   = matched.slice(pageStart, pageEnd);

    /* 2. Hide every card — only touch the class, not inline styles */
    ALL.forEach((c) => c.classList.add('card-hidden'));

    /* 3. Show and force-visible the cards for this page */
    visible.forEach((c) => {
      c.classList.remove('card-hidden');
      c.style.opacity    = '1';
      c.style.transform  = 'translateY(0)';
      c.style.transition = 'none';
    });

    /* 4. Reorder visible cards at the bottom of the grid (for sort) */
    visible.forEach((c) => grid.appendChild(c));

    /* 5. Result count text */
    countEl.textContent = total === 0
      ? 'No results'
      : `Showing ${pageStart + 1}–${Math.min(pageEnd, total)} of ${total} results`;

    /* 6. Empty state */
    emptyEl.hidden = total > 0;
    pagNav.hidden  = total === 0;

    /* 7. Rebuild pagination buttons */
    renderPagination(total);

    /* 8. Rebuild active-filter chips */
    renderChips();

    /* 9. Update count badges */
    renderCounts();
  };

  /* ─────────────────────────────────────────────────────
     PAGINATION
  ───────────────────────────────────────────────────── */
  const renderPagination = (total) => {
    const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

    /* Remove old numbered buttons (class page-btn but not page-next) */
    pagNav.querySelectorAll('.page-btn:not(.page-next)').forEach((b) => b.remove());

    /* Add numbered buttons before the › arrow */
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className   = 'page-btn' + (i === S.page ? ' active' : '');
      btn.textContent = i;
      if (i === S.page) btn.setAttribute('aria-current', 'page');

      btn.addEventListener('click', () => {
        S.page = i;
        render();
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      pagNav.insertBefore(btn, nextBtn);
    }

    /* Update › arrow */
    if (nextBtn) {
      nextBtn.disabled = S.page >= totalPages;
      nextBtn.onclick  = () => {
        if (S.page < totalPages) {
          S.page++;
          render();
          grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    }
  };

  /* ─────────────────────────────────────────────────────
     ACTIVE FILTER CHIPS  (removable tags above the grid)
  ───────────────────────────────────────────────────── */
  const cap    = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const plabel = ({ min, max }) => max >= 999 ? `$${min}+` : `$${min}–$${max}`;

  const renderChips = () => {
    chipsEl.innerHTML = '';

    const addChip = (label, onRemove) => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.innerHTML = `${label} <span aria-hidden="true">×</span>`;
      btn.setAttribute('aria-label', `Remove filter: ${label}`);
      btn.addEventListener('click', () => { onRemove(); S.page = 1; render(); });
      chipsEl.appendChild(btn);
    };

    S.price.forEach(({ min, max }) =>
      addChip(plabel({ min, max }), () => {
        S.price = S.price.filter((r) => !(r.min === min && r.max === max));
        document.querySelectorAll('input[name="price"]').forEach((cb) => {
          if (+cb.dataset.min === min && +cb.dataset.max === max) cb.checked = false;
        });
      })
    );

    S.category.forEach((cat) =>
      addChip(cap(cat), () => {
        S.category = S.category.filter((c) => c !== cat);
        const cb = document.querySelector(`input[name="category"][value="${cat}"]`);
        if (cb) cb.checked = false;
      })
    );

    S.color.forEach((col) =>
      addChip(cap(col), () => {
        S.color = S.color.filter((c) => c !== col);
        const sw = document.querySelector(`.color-swatch[data-color="${col}"]`);
        if (sw) { sw.classList.remove('active'); sw.setAttribute('aria-pressed', 'false'); }
      })
    );

    chipsEl.style.display = chipsEl.children.length ? 'flex' : 'none';
  };

  /* ─────────────────────────────────────────────────────
     LIVE COUNT BADGES
     Each group's counts are calculated while temporarily
     ignoring that group's own filter — shows realistic
     "how many are available" numbers.
  ───────────────────────────────────────────────────── */
  const renderCounts = () => {
    /* Category counts — run filter with category reset */
    const prevCat = S.category;
    S.category = [];
    const forCat = ALL.filter(passes);
    S.category = prevCat;

    document.querySelectorAll('.filter-count[data-category]').forEach((badge) => {
      const n = forCat.filter((c) => cardCat(c) === badge.dataset.category).length;
      badge.textContent  = n;
      badge.style.opacity = n === 0 ? '0.35' : '1';
    });

    /* Color counts — run filter with color reset */
    const prevCol = S.color;
    S.color = [];
    const forCol = ALL.filter(passes);
    S.color = prevCol;

    document.querySelectorAll('.filter-count[data-color]').forEach((badge) => {
      const n = forCol.filter((c) => cardColors(c).includes(badge.dataset.color)).length;
      badge.textContent  = n;
      badge.style.opacity = n === 0 ? '0.35' : '1';
    });
  };

  /* ─────────────────────────────────────────────────────
     ACCORDION  (expand / collapse filter groups)
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('.filter-group-header').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      const body = document.getElementById(btn.getAttribute('aria-controls'));
      if (body) body.classList.toggle('collapsed', open);
    });
  });

  /* ─────────────────────────────────────────────────────
     PRICE CHECKBOXES
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('input[name="price"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const min = +cb.dataset.min, max = +cb.dataset.max;
      if (cb.checked) {
        S.price.push({ min, max });
      } else {
        S.price = S.price.filter((r) => !(r.min === min && r.max === max));
      }
      S.page = 1;
      render();
    });
  });

  /* ─────────────────────────────────────────────────────
     CATEGORY CHECKBOXES
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('input[name="category"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        if (!S.category.includes(cb.value)) S.category.push(cb.value);
      } else {
        S.category = S.category.filter((v) => v !== cb.value);
      }
      S.page = 1;
      render();
    });
  });

  /* ─────────────────────────────────────────────────────
     COLOR SWATCHES  (whole row is clickable)
  ───────────────────────────────────────────────────── */
  document.querySelectorAll('.swatch-item').forEach((row) => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      const sw  = row.querySelector('.color-swatch');
      if (!sw) return;
      const col    = sw.dataset.color;
      const active = sw.classList.toggle('active');
      sw.setAttribute('aria-pressed', String(active));

      if (active) {
        if (!S.color.includes(col)) S.color.push(col);
      } else {
        S.color = S.color.filter((c) => c !== col);
      }
      S.page = 1;
      render();
    });
  });

  /* ─────────────────────────────────────────────────────
     SORT
  ───────────────────────────────────────────────────── */
  sortEl?.addEventListener('change', () => {
    S.sort  = sortEl.value;
    S.page  = 1;
    render();
  });

  /* ─────────────────────────────────────────────────────
     CLEAR ALL
  ───────────────────────────────────────────────────── */
  const clearAll = () => {
    S.price = []; S.category = []; S.color = [];
    S.sort  = 'default'; S.page = 1;
    document.querySelectorAll('.filter-check input').forEach((cb) => cb.checked = false);
    document.querySelectorAll('.color-swatch').forEach((sw) => {
      sw.classList.remove('active');
      sw.setAttribute('aria-pressed', 'false');
    });
    if (sortEl) sortEl.value = 'default';
    render();
  };

  document.getElementById('filterClear')?.addEventListener('click', clearAll);
  document.getElementById('emptyStateClear')?.addEventListener('click', clearAll);

  /* ─────────────────────────────────────────────────────
     MOBILE SIDEBAR DRAWER
  ───────────────────────────────────────────────────── */
  const sidebar   = document.getElementById('sidebar');
  const mobileBtn = document.getElementById('mobileFilterBtn');
  const bg        = Object.assign(document.createElement('div'),
                      { className: 'sidebar-overlay' });
  document.body.appendChild(bg);

  const open  = () => { sidebar?.classList.add('open');    bg.classList.add('active');    document.body.style.overflow = 'hidden'; };
  const close = () => { sidebar?.classList.remove('open'); bg.classList.remove('active'); document.body.style.overflow = '';       };

  mobileBtn?.addEventListener('click', open);
  bg.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  /* ─────────────────────────────────────────────────────
     BOOT  —  run once on page load
  ───────────────────────────────────────────────────── */
  render();
});