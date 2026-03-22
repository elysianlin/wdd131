/**
 * flowers.js — Filter + pagination engine
 *
 * Key design decisions to avoid past bugs:
 *  1. Cards use class "fcard" with data-cat (not data-category).
 *     No "reveal" classes on cards — zero conflict with main.js.
 *  2. Visibility = style.display only. No card-hidden class.
 *  3. Color rows use data-color on the row div itself (not a child button).
 *     One click handler per row. No double-fire risk.
 *  4. Pagination: only the › arrow is in HTML. Numbers are JS-built.
 *  5. buildCounts does NOT mutate S. It runs separate passes with
 *     explicit override arguments.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Config ───────────────────────────────────────── */
  const PER_PAGE = 6;

  /* ── State ────────────────────────────────────────── */
  const S = {
    price:    [],        // [{ min, max }, …]
    category: [],        // ['bouquet', …]
    color:    [],        // ['pink', …]  always lowercase
    sort:     'default',
    page:     1,
  };

  /* ── DOM ──────────────────────────────────────────── */
  const grid     = document.getElementById('flowersGrid');
  const countEl  = document.getElementById('resultCount');
  const chipsRow = document.getElementById('chipsRow');
  const emptyEl  = document.getElementById('emptyState');
  const pagNav   = document.getElementById('pagination');
  const nextBtn  = document.getElementById('pageNext');
  const sortEl   = document.getElementById('sortSelect');

  /* All cards — frozen snapshot of original HTML order */
  const ALL = Array.from(grid.querySelectorAll('.fcard'));

  /* ── Helpers to read card data ─────────────────────── */
  const price  = (c) => parseFloat(c.dataset.price || 0);
  const cat    = (c) => (c.dataset.cat   || '').toLowerCase().trim();
  const colors = (c) => (c.dataset.color || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  const name   = (c) => (c.querySelector('.fcard-name')?.textContent || '').trim();

  /* ── Filter predicate ─────────────────────────────── */
  // overrides allow buildCounts to test without a specific group
  const passes = (card, { skipPrice = false, skipCat = false, skipColor = false } = {}) => {
    if (!skipPrice && S.price.length) {
      const p = price(card);
      if (!S.price.some(({ min, max }) => p >= min && p <= max)) return false;
    }
    if (!skipCat && S.category.length) {
      if (!S.category.includes(cat(card))) return false;
    }
    if (!skipColor && S.color.length) {
      if (!S.color.some((col) => colors(card).includes(col))) return false;
    }
    return true;
  };

  /* ── Sort ─────────────────────────────────────────── */
  const sort = (arr) => {
    const a = [...arr];
    if (S.sort === 'price-asc')  return a.sort((x, y) => price(x) - price(y));
    if (S.sort === 'price-desc') return a.sort((x, y) => price(y) - price(x));
    if (S.sort === 'name-asc')   return a.sort((x, y) => name(x).localeCompare(name(y)));
    return a;
  };

  /* ── RENDER ───────────────────────────────────────── */
  const render = () => {
    const matched   = sort(ALL.filter((c) => passes(c)));
    const total     = matched.length;
    const pageStart = (S.page - 1) * PER_PAGE;
    const pageEnd   = Math.min(pageStart + PER_PAGE, total);
    const visible   = new Set(matched.slice(pageStart, pageEnd));

    /* Show / hide — pure style.display, no class tricks */
    ALL.forEach((c) => {
      c.style.display = visible.has(c) ? '' : 'none';
    });

    /* Count text */
    countEl.textContent = total === 0
      ? 'No results'
      : `Showing ${pageStart + 1}–${pageEnd} of ${total} results`;

    /* Empty state */
    emptyEl.style.display = total === 0 ? 'block' : 'none';
    pagNav.style.display  = total === 0 ? 'none'  : 'flex';

    buildPages(total);
    buildChips();
    buildCounts();
  };

  /* ── Pagination ───────────────────────────────────── */
  const buildPages = (total) => {
    const pages = Math.max(Math.ceil(total / PER_PAGE), 1);

    /* Remove only the JS-generated number buttons */
    pagNav.querySelectorAll('.page-btn:not(.page-next)').forEach((b) => b.remove());

    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement('button');
      btn.className   = 'page-btn' + (i === S.page ? ' active' : '');
      btn.textContent = i;
      if (i === S.page) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => { S.page = i; render(); });
      pagNav.insertBefore(btn, nextBtn);
    }

    nextBtn.disabled = S.page >= pages;
    nextBtn.onclick  = () => { if (S.page < pages) { S.page++; render(); } };
  };

  /* ── Chips ────────────────────────────────────────── */
  const cap    = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const plabel = ({ min, max }) => max >= 999 ? `$${min}+` : `$${min}–$${max}`;

  const buildChips = () => {
    chipsRow.innerHTML = '';

    const addChip = (label, onRemove) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.innerHTML = `${label} <span class="chip-x" aria-hidden="true">×</span>`;
      b.addEventListener('click', () => { onRemove(); S.page = 1; render(); });
      chipsRow.appendChild(b);
    };

    S.price.forEach(({ min, max }) =>
      addChip(plabel({ min, max }), () => {
        S.price = S.price.filter((r) => !(r.min === min && r.max === max));
        document.querySelectorAll('input[name="price"]').forEach((cb) => {
          if (+cb.dataset.min === min && +cb.dataset.max === max) cb.checked = false;
        });
      })
    );

    S.category.forEach((v) =>
      addChip(cap(v), () => {
        S.category = S.category.filter((x) => x !== v);
        const cb = document.querySelector(`input[name="category"][value="${v}"]`);
        if (cb) cb.checked = false;
      })
    );

    S.color.forEach((col) =>
      addChip(cap(col), () => {
        S.color = S.color.filter((x) => x !== col);
        const row = document.querySelector(`.color-row[data-color="${col}"]`);
        if (row) row.classList.remove('selected');
      })
    );
  };

  /* ── Count badges ─────────────────────────────────── */
  const buildCounts = () => {
    /* Category badges: skip category filter, keep price + color */
    document.querySelectorAll('.fcount[data-cat]').forEach((badge) => {
      const target = badge.dataset.cat;
      const n = ALL.filter((c) => passes(c, { skipCat: true }) && cat(c) === target).length;
      badge.textContent   = n;
      badge.style.opacity = n === 0 ? '0.3' : '1';
    });

    /* Color badges: skip color filter, keep price + category */
    document.querySelectorAll('.fcount[data-col]').forEach((badge) => {
      const target = badge.dataset.col;
      const n = ALL.filter((c) => passes(c, { skipColor: true }) && colors(c).includes(target)).length;
      badge.textContent   = n;
      badge.style.opacity = n === 0 ? '0.3' : '1';
    });
  };

  /* ── Accordion ────────────────────────────────────── */
  document.querySelectorAll('.filter-header').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      const body = document.getElementById(btn.getAttribute('aria-controls'));
      if (body) body.classList.toggle('closed', isOpen);
    });
  });

  /* ── Price checkboxes ─────────────────────────────── */
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

  /* ── Category checkboxes ──────────────────────────── */
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

  /* ── Color rows ───────────────────────────────────── */
  document.querySelectorAll('.color-row').forEach((row) => {
    row.addEventListener('click', () => {
      const col = row.dataset.color; // already lowercase in HTML
      const isSelected = row.classList.toggle('selected');

      if (isSelected) {
        if (!S.color.includes(col)) S.color.push(col);
      } else {
        S.color = S.color.filter((v) => v !== col);
      }
      S.page = 1;
      render();
    });
  });

  /* ── Sort ─────────────────────────────────────────── */
  sortEl?.addEventListener('change', () => {
    S.sort = sortEl.value;
    S.page = 1;
    render();
  });

  /* ── Clear all ────────────────────────────────────── */
  const clearAll = () => {
    S.price = []; S.category = []; S.color = []; S.sort = 'default'; S.page = 1;
    document.querySelectorAll('input[name="price"], input[name="category"]')
      .forEach((cb) => cb.checked = false);
    document.querySelectorAll('.color-row').forEach((r) => r.classList.remove('selected'));
    if (sortEl) sortEl.value = 'default';
    render();
  };
  document.getElementById('filterClear')?.addEventListener('click', clearAll);
  document.getElementById('emptyStateClear')?.addEventListener('click', clearAll);

  /* ── Mobile drawer ────────────────────────────────── */
  const sidebar   = document.getElementById('sidebar');
  const mobileBtn = document.getElementById('mobileFilterBtn');
  const overlay   = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  const openSidebar  = () => { sidebar?.classList.add('open');    overlay.classList.add('visible');    document.body.style.overflow = 'hidden'; };
  const closeSidebar = () => { sidebar?.classList.remove('open'); overlay.classList.remove('visible'); document.body.style.overflow = '';       };

  mobileBtn?.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

  /* ── Boot ─────────────────────────────────────────── */
  render();
});