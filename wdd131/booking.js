/**
 * booking.js — Live-price booking wizard
 *
 * PRICE ENGINE:
 *   Every selection updates a running total instantly.
 *   The floating badge in the top-right always shows the current estimate.
 *
 * PRICING RULES:
 *   Main flowers    = data-price × qty  (per stem)
 *   Filler flowers  = data-price × qty  (per stem, +$0.50 per extra colour variety)
 *   Foliage         = data-price × qty  (per sprig)
 *   Wrapping        = data-price flat   (one wrapping only)
 *   Step-3 add-ons  = data-price each
 *   Delivery        = standard $0 / express $9.99 / pickup $0
 *   Template base   = data-price on chosen tcard
 *   Surprise        = flat $45 base
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Helpers ────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);
  const QA = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ─── State ──────────────────────────────────────────── */
  // selections[value] = { price, qty, color, label }
  const SEL = {
    mainFlowers: {},   // { rose: { price, qty, color } }
    fillers:     {},
    foliage:     {},
    wrapping:    null, // { value, price, color }
    addons:      {},   // { 'greeting-card': price }
    delivery:    0,
    templateBase:0,
    orderType:   null,
  };

  /* ─── Price badge ────────────────────────────────────── */
  const badge    = $('priceBadge');
  const badgeAmt = $('priceBadgeAmt');

  const calcTotal = () => {
    let t = 0;

    if (SEL.orderType === 'template') {
      t += SEL.templateBase;
    } else if (SEL.orderType === 'surprise') {
      t += 45;
    } else {
      // Main flowers
      Object.values(SEL.mainFlowers).forEach(({ price, qty }) => t += price * qty);
      // Fillers
      Object.values(SEL.fillers).forEach(({ price, qty }) => t += price * qty);
      // Foliage
      Object.values(SEL.foliage).forEach(({ price, qty }) => t += price * qty);
    }

    // Wrapping
    if (SEL.wrapping) t += SEL.wrapping.price;

    // Add-ons
    Object.values(SEL.addons).forEach((p) => t += p);

    // Delivery
    t += SEL.delivery;

    return t;
  };

  const refreshBadge = () => {
    const total = calcTotal();
    badgeAmt.textContent = `$${total.toFixed(2)}`;
    // Bump animation
    badge.classList.remove('bump');
    void badge.offsetWidth; // reflow
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 250);
  };

  /* ─── Steps ──────────────────────────────────────────── */
  const STEPS = {
    'step1':      $('step1'),
    '2custom':    $('step2custom'),
    '2template':  $('step2template'),
    '2surprise':  $('step2surprise'),
    'step3':      $('step3'),
    'step4':      $('step4'),
    'success':    $('stepSuccess'),
  };
  let currentKey = 'step1';

  const showStep = (key) => {
    Object.values(STEPS).forEach((el) => { if (el) el.style.display = 'none'; });
    const el = STEPS[key];
    if (el) { el.style.display = ''; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    currentKey = String(key);
    updateProgress();
  };

  const updateProgress = () => {
    const map = {
      'step1':1, '2custom':2, '2template':2, '2surprise':2, 'step3':3, 'step4':4, 'success':4
    };
    const cur = map[currentKey] || 1;
    QA('.prog-step').forEach((btn) => {
      const n = +btn.dataset.step;
      btn.classList.toggle('active', n === cur);
      btn.classList.toggle('done',   n < cur);
    });
  };

  /* ─── Step 1 — Order type ────────────────────────────── */
  QA('.ot-card').forEach((card) => {
    card.addEventListener('click', () => {
      QA('.ot-card').forEach((c) => c.querySelector('input').checked = false);
      card.querySelector('input').checked = true;
      SEL.orderType = card.dataset.value;
      refreshBadge();
    });
  });

  $('step1Next')?.addEventListener('click', () => {
    if (!SEL.orderType) { alert('Please select an order type to continue.'); return; }
    showStep(SEL.orderType === 'custom' ? '2custom' : SEL.orderType === 'template' ? '2template' : '2surprise');
  });

  /* ─── Color filter swatches ──────────────────────────── */
  QA('.cfbtn').forEach((btn) => {
    const dot = document.createElement('span');
    dot.className = 'cdot';
    dot.style.background = btn.style.background;
    btn.style.background = '';
    btn.insertBefore(dot, btn.firstChild);
    btn.addEventListener('click', () => btn.classList.toggle('active'));
  });

  /* ─── Template cards ─────────────────────────────────── */
  QA('.tcard').forEach((card) => {
    card.querySelector('input').addEventListener('change', () => {
      SEL.templateBase = parseFloat(card.dataset.price) || 0;
      refreshBadge();
    });
  });

  /* ─── Generic nav ─────────────────────────────────────── */
  QA('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.next === 'step4') buildCheckoutSummary();
      showStep(btn.dataset.next);
    });
  });
  QA('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => showStep(btn.dataset.back));
  });
  $('step3Back')?.addEventListener('click', () => {
    showStep(SEL.orderType === 'custom' ? '2custom' : SEL.orderType === 'template' ? '2template' : '2surprise');
  });

  /* ═══════════════════════════════════════════════════════
     APICK CARDS — main flowers / fillers / foliage / wrapping
     Each card has:
       data-value   unique key
       data-price   price per unit (or flat for wrapping)
       data-colors  "Name:#hex|Name:#hex|…"
       data-type    'filler' | 'foliage' | 'wrap' | undefined (= main flower)
  ═══════════════════════════════════════════════════════ */

  const initApickCards = () => {
    QA('.apick').forEach((card) => {
      const val      = card.dataset.value;
      const unitPrice = parseFloat(card.dataset.price) || 0;
      const type     = card.dataset.type || (card.closest('.wrap-style-grid') ? 'wrap' : 'main');
      const colorStr = card.dataset.colors || '';

      // Build colour dots from data-colors="Name:#hex|Name:#hex"
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'apick-options';

      // Colour row
      const colorsDiv = document.createElement('div');
      colorsDiv.className = 'apick-colors';

      const colorDefs = colorStr.split('|').filter(Boolean).map((s) => {
        const [name, hex] = s.split(':');
        return { name: name.trim(), hex: (hex || '#ccc').trim() };
      });

      colorDefs.forEach(({ name, hex }, i) => {
        const dot = document.createElement('button');
        dot.className = 'apick-col';
        dot.dataset.c = name;
        dot.style.background = hex;
        // white needs a border
        if (hex === '#ffffff' || hex === '#fff') dot.style.border = '1.5px solid #D8D4CC';
        dot.title = name;
        dot.setAttribute('aria-label', name);
        if (i === 0) dot.classList.add('chosen'); // default first colour
        colorsDiv.appendChild(dot);
      });
      optionsDiv.appendChild(colorsDiv);

      // Qty stepper (wrapping has no qty)
      const isWrap = type === 'wrap';
      const unitLabel = type === 'foliage' ? 'sprigs' : isWrap ? '' : 'stems';

      if (!isWrap) {
        const qtyDiv = document.createElement('div');
        qtyDiv.className = 'apick-qty';
        qtyDiv.innerHTML = `
          <button class="qty-btn" data-dir="-1" type="button">−</button>
          <span class="qty-val">1</span>
          <button class="qty-btn" data-dir="1"  type="button">+</button>
          <span class="qty-unit">${unitLabel}</span>`;
        optionsDiv.appendChild(qtyDiv);
      }

      // Subtotal line
      const subEl = document.createElement('div');
      subEl.className = 'apick-subtotal';
      subEl.textContent = isWrap ? `$${unitPrice.toFixed(2)}` : `$${unitPrice.toFixed(2)}`;
      optionsDiv.appendChild(subEl);

      card.appendChild(optionsDiv);

      /* ── Helper to get current state of this card ── */
      const getState = () => {
        const chosenDot = card.querySelector('.apick-col.chosen');
        const qtyEl     = card.querySelector('.qty-val');
        const qty        = qtyEl ? (parseInt(qtyEl.textContent) || 1) : 1;
        const color      = chosenDot ? chosenDot.dataset.c : (colorDefs[0]?.name || '');
        return { price: unitPrice, qty, color, label: card.querySelector('.apick-label')?.textContent || val };
      };

      /* ── Update subtotal text ── */
      const updateSub = () => {
        const s = getState();
        subEl.textContent = isWrap
          ? `$${unitPrice.toFixed(2)}`
          : `${s.qty} × $${unitPrice.toFixed(2)} = $${(s.qty * unitPrice).toFixed(2)}`;
      };

      /* ── Write to SEL ── */
      const writeSel = (selected) => {
        const store = type === 'filler' ? SEL.fillers : type === 'foliage' ? SEL.foliage : type === 'wrap' ? null : SEL.mainFlowers;
        if (type === 'wrap') {
          SEL.wrapping = selected ? { value: val, price: unitPrice, color: getState().color } : null;
        } else if (store) {
          if (selected) store[val] = getState();
          else delete store[val];
        }
        refreshBadge();
      };

      /* ── Card click (toggle select) ── */
      card.addEventListener('click', (e) => {
        if (e.target.closest('.apick-col') || e.target.closest('.qty-btn')) return;

        // Wrapping: only one at a time
        if (type === 'wrap' && !card.classList.contains('selected')) {
          QA('.wrap-pick.selected').forEach((c) => {
            c.classList.remove('selected');
            SEL.wrapping = null;
          });
        }

        // Main flowers: max 3
        if (type === 'main' && !card.classList.contains('selected')) {
          const selectedCount = Object.keys(SEL.mainFlowers).length;
          if (selectedCount >= 3) { alert('You can choose up to 3 main flowers.'); return; }
        }

        const isSelected = card.classList.toggle('selected');
        writeSel(isSelected);
        updateSub();
      });

      /* ── Colour dot click ── */
      colorsDiv.querySelectorAll('.apick-col').forEach((dot) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          colorsDiv.querySelectorAll('.apick-col').forEach((d) => d.classList.remove('chosen'));
          dot.classList.add('chosen');
          if (card.classList.contains('selected')) writeSel(true);
        });
      });

      /* ── Qty stepper ── */
      if (!isWrap) {
        optionsDiv.querySelectorAll('.qty-btn').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const valEl  = card.querySelector('.qty-val');
            let cur      = parseInt(valEl.textContent) || 1;
            cur = Math.max(1, Math.min(20, cur + parseInt(btn.dataset.dir)));
            valEl.textContent = cur;
            if (card.classList.contains('selected')) writeSel(true);
            updateSub();
          });
        });
      }

      updateSub();
    }); // end forEach .apick
  };

  initApickCards();

  /* ─── Wrapping style buttons ─────────────────────────── */
  const initWrapBtns = () => {
    QA('.wrap-btn').forEach((btn) => {
      const val       = btn.dataset.value;
      const unitPrice = parseFloat(btn.dataset.price) || 0;
      const colorStr  = btn.dataset.colors || '';
      const colorRow  = btn.querySelector('.wrap-color-row');

      // Parse colour defs
      const colorDefs = colorStr.split('|').filter(Boolean).map((s) => {
        const idx = s.indexOf(':');
        const name = s.slice(0, idx).trim();
        const hex  = s.slice(idx + 1).trim();
        return { name, hex };
      });

      // Build dots into the colour row
      const label = document.createElement('span');
      label.className = 'wrap-color-chosen-label';
      label.textContent = colorDefs[0]?.name || '';

      colorDefs.forEach(({ name, hex }, i) => {
        const dot = document.createElement('button');
        dot.className = 'wrap-dot' + (i === 0 ? ' chosen' : '');
        dot.style.background = hex;
        if (hex === '#ffffff' || hex === '#fff' || hex === '#e8f4f8' || hex === '#dde8ef' || hex.startsWith('#f') && hex.length === 7)
          dot.style.border = '1.5px solid #D8D4CC';
        dot.title = name;
        dot.setAttribute('aria-label', name);
        dot.setAttribute('type', 'button');

        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          colorRow.querySelectorAll('.wrap-dot').forEach((d) => d.classList.remove('chosen'));
          dot.classList.add('chosen');
          label.textContent = name;
          // Update SEL
          if (btn.classList.contains('selected')) {
            SEL.wrapping = { value: val, price: unitPrice, color: name };
            refreshBadge();
          }
        });

        colorRow.appendChild(dot);
      });

      colorRow.appendChild(label);

      // Click on the button row to select/deselect
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.wrap-dot')) return; // handled above

        const alreadySelected = btn.classList.contains('selected');

        // Deselect all wrap buttons first
        QA('.wrap-btn').forEach((b) => b.classList.remove('selected'));
        SEL.wrapping = null;

        if (!alreadySelected) {
          btn.classList.add('selected');
          const chosenDot = colorRow.querySelector('.wrap-dot.chosen') || colorRow.querySelector('.wrap-dot');
          const color = chosenDot?.title || colorDefs[0]?.name || '';
          label.textContent = color;
          SEL.wrapping = { value: val, price: unitPrice, color };
        }
        refreshBadge();
      });
    });
  };

  initWrapBtns();

  QA('input[name="addon"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const price = parseFloat(cb.dataset.price) || 0;
      if (cb.checked) SEL.addons[cb.value] = price;
      else delete SEL.addons[cb.value];
      refreshBadge();
    });
  });

  /* ─── Greeting card panel toggle + character counter ─── */
  const cbGreeting    = $('cbGreeting');
  const greetingPanel = $('greetingPanel');
  const greetingText  = $('greetingText');
  const greetingCount = $('greetingCount');

  cbGreeting?.addEventListener('change', () => {
    if (cbGreeting.checked) {
      greetingPanel.classList.add('open');
      setTimeout(() => greetingText?.focus(), 50);
    } else {
      greetingPanel.classList.remove('open');
    }
  });

  greetingText?.addEventListener('input', () => {
    const len = greetingText.value.length;
    if (greetingCount) {
      greetingCount.textContent = len;
      greetingCount.parentElement.classList.toggle('warn', len > 180);
    }
    SEL.greetingMessage = greetingText.value;
  });

  /* ─── Delivery ───────────────────────────────────────── */
  QA('input[name="delivery"]').forEach((r) => {
    r.addEventListener('change', () => {
      SEL.delivery = r.value === 'express' ? 9.99 : 0;
      refreshBadge();
      buildCheckoutSummary();
    });
  });

  /* ─── Payment toggle ─────────────────────────────────── */
  QA('input[name="payment"]').forEach((r) => {
    r.addEventListener('change', () => {
      const cf = $('cardFields');
      if (cf) cf.style.display = r.value === 'credit' ? '' : 'none';
    });
  });

  /* ─── Checkout summary ───────────────────────────────── */
  const cap = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const buildCheckoutSummary = () => {
    const titleEl  = $('osSummaryTitle');
    const detailEl = $('osSummaryDetail');
    const linesEl  = $('osPriceLines');
    const totalEl  = $('osTotal');

    if (titleEl) {
      const t = { custom: 'Fully Customized Bouquet', template: 'Template Bouquet', surprise: 'Surprise Bouquet' };
      titleEl.textContent = t[SEL.orderType] || 'Your Bouquet';
    }

    // Detail description
    if (detailEl) {
      const parts = [];
      Object.entries(SEL.mainFlowers).forEach(([k, v]) => parts.push(`${cap(k)} (${v.color})`));
      Object.entries(SEL.fillers).forEach(([k,  v]) => parts.push(`${cap(k)}`));
      Object.entries(SEL.foliage).forEach(([k,  v]) => parts.push(`${cap(k)}`));
      if (SEL.wrapping) parts.push(`${cap(SEL.wrapping.value)} wrap`);
      detailEl.textContent = parts.join(' · ') || 'Your selections';
    }

    // Price lines
    if (linesEl) {
      linesEl.innerHTML = '';
      const line = (label, amt) => {
        const div = document.createElement('div');
        div.className = 'os-line';
        div.innerHTML = `<span>${label}</span><span>$${amt.toFixed(2)}</span>`;
        linesEl.appendChild(div);
      };

      if (SEL.orderType === 'template' && SEL.templateBase) {
        line('Template bouquet', SEL.templateBase);
      } else if (SEL.orderType === 'surprise') {
        line('Surprise bouquet', 45);
      } else {
        Object.entries(SEL.mainFlowers).forEach(([k, v]) => line(`${cap(k)} × ${v.qty}`, v.price * v.qty));
        Object.entries(SEL.fillers).forEach(([k,  v]) => line(`${cap(k)} × ${v.qty}`,   v.price * v.qty));
        Object.entries(SEL.foliage).forEach(([k,  v]) => line(`${cap(k)} × ${v.qty}`,   v.price * v.qty));
      }
      if (SEL.wrapping) line(`Wrapping (${cap(SEL.wrapping.value)})`, SEL.wrapping.price);
      Object.entries(SEL.addons).forEach(([k, p]) => line(cap(k === 'greeting-card' ? 'Greeting Card ✉' : k), p));
      if (SEL.delivery > 0) line('Express delivery', SEL.delivery);

      // Show greeting message preview if written
      if (SEL.addons['greeting-card'] && SEL.greetingMessage) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'os-line os-greeting-msg';
        msgDiv.innerHTML = `<span style="font-style:italic;color:var(--muted);font-size:11px;max-width:100%">"${SEL.greetingMessage}"</span>`;
        linesEl.appendChild(msgDiv);
      }
    }

    if (totalEl) totalEl.textContent = `$${calcTotal().toFixed(2)}`;
  };

  /* ─── Place Order ────────────────────────────────────── */
  $('placeOrderBtn')?.addEventListener('click', () => {
    const name  = document.querySelector('input[name="fullName"]')?.value.trim();
    const email = document.querySelector('input[name="email"]')?.value.trim();
    if (!name || !email) { alert('Please fill in your name and email to continue.'); return; }
    showStep('success');
  });

  /* ─── Boot ───────────────────────────────────────────── */
  showStep('step1');
  refreshBadge();
});