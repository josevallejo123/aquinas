/* Lighthouse Prep: online enrollment (DESIGN.md, "Enrollment"). On the home page each program's
   Enroll button opens one native <dialog>, the pay chooser (#enroll), whose two options are Stripe
   payment links. On /thanks/, where Stripe sends the family back, it reports the purchase. It loads
   with defer, after consult-form.js, whose window.lpTrack carries both events to GA4.
   The chooser works without this file: its options are plain links to Stripe in the markup, and the
   buttons open the dialog through commandfor wherever the browser supports it, with all three
   programs listed. This file shows the chosen program's two options, adds client_reference_id from
   the first touch, and sends begin_checkout and purchase. No event carries anything about the family. */
(() => {
  /* every Stripe payment link (S1, portal/scripts/stripe/catalog.live.json). The anchors in index.html
     carry the same URLs, so paying works without JavaScript: change both together */
  const LINKS = {
    accelerator: {full: 'https://buy.stripe.com/00wfZgdgz9mEeUubIfdMI00', three: 'https://buy.stripe.com/00w6oG4K3aqI6nY27FdMI01'},
    flagship: {full: 'https://buy.stripe.com/9B6cN42BVcyQaEefYvdMI02', three: 'https://buy.stripe.com/8x24gy0tN42k9Aa7rZdMI03'},
    premier: {full: 'https://buy.stripe.com/cNibJ02BVeGYbIi5jRdMI04', three: 'https://buy.stripe.com/3cI7sK90j6ascMm5jRdMI05'}
  };
  const CONFIG = {
    /* each program's name, its price paid in full (5% off) and one of its three monthly payments, in dollars */
    programs: {
      accelerator: {name: 'SAT Accelerator', full: 4180, three: 1466.66},
      flagship: {name: 'Flagship Program', full: 7220, three: 2533.33},
      premier: {name: 'Premier Program', full: 8740, three: 3066.66}
    },
    currency: 'USD',
    firstTouchKey: 'lp_first_touch',   // consult-form.js keeps it, 30 days
    firstTouchDays: 30,
    session: /^cs_(live|test)_[A-Za-z0-9]{8,}$/   // a Checkout Session id, as Stripe puts it in the thanks URL
  };

  /* GA4 through assets/consult-form.js; until it has run, calls wait in window.lpq */
  const track = (...a) => window.lpTrack ? window.lpTrack(...a) : (window.lpq = window.lpq || []).push(a);
  const program = p => Object.prototype.hasOwnProperty.call(CONFIG.programs, p) ? CONFIG.programs[p] : null;
  const money = n => '$' + n.toLocaleString('en-US', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2});
  /* what the family pays for the program: the price in full, or the three payments together */
  const total = (p, m) => m === 'full' ? program(p).full : Math.round(program(p).three * 300) / 100;
  /* begin_checkout and purchase share these; item_id is the price's Stripe lookup key */
  const params = (p, m) => {
    const value = total(p, m);
    return {program: p, pay_mode: m, value, currency: CONFIG.currency, items: [{item_id: p + '_' + m, item_name: program(p).name, price: value, quantity: 1}]};
  };

  /* client_reference_id (enrollment §3.5): the first touch's UTMs, so each enrollment in Stripe says which
     link brought the family: s-<source>_m-<medium>_c-<campaign>_n-<content>. Each part keeps only
     A-Z, a-z, 0-9, _ and - (anything else becomes a dash) and at most 40 characters; empty parts are
     dropped, and so is any value with an @, so an email address can never ride along */
  function firstTouch() {
    try {
      const ft = JSON.parse(localStorage.getItem(CONFIG.firstTouchKey));
      if (ft && typeof ft === 'object' && Date.now() - ft.ts < CONFIG.firstTouchDays * 864e5) return ft;
    } catch (e) {}
    /* no record (storage blocked, or consult-form.js never ran): this visit counts as the first, as there */
    const q = new URLSearchParams(location.search);
    return {utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign'), utm_content: q.get('utm_content')};
  }
  function reference() {
    const ft = firstTouch();
    const part = v => {
      v = typeof v === 'string' ? v.trim() : '';
      return v.includes('@') ? '' : v.replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 40).replace(/^-+|-+$/g, '');
    };
    return [['s', 'utm_source'], ['m', 'utm_medium'], ['c', 'utm_campaign'], ['n', 'utm_content']]
      .map(([k, f]) => [k, part(ft[f])]).filter(([, v]) => v).map(([k, v]) => k + '-' + v).join('_').slice(0, 200);
  }

  /* ---- the chooser (home page) ---- */
  const dlg = document.getElementById('enroll');
  if (dlg && typeof dlg.showModal === 'function') {
    const heading = document.getElementById('enrollH'), groups = [...dlg.querySelectorAll('[data-program]')];
    const ref = reference();
    let opener = null, leaving = false, downOutside = false;

    /* the options: the URL from LINKS (the markup's should match), with the first touch appended */
    groups.forEach(g => g.querySelectorAll('a[data-pay]').forEach(a => {
      const url = (LINKS[g.dataset.program] || {})[a.dataset.pay];
      if (!url) return;
      const u = new URL(url);
      if (ref) u.searchParams.set('client_reference_id', ref);
      a.href = u.href;
    }));

    /* a button shows its program's two options; the native command would show all three programs */
    document.querySelectorAll('[data-enroll]').forEach(btn => btn.addEventListener('click', e => {
      const p = btn.dataset.enroll, c = program(p);
      if (!c) return;
      e.preventDefault();
      opener = btn;
      groups.forEach(g => { g.hidden = g.dataset.program !== p; });
      dlg.classList.add('one');
      heading.textContent = 'Enroll in the ' + c.name + '.';
      if (!dlg.open) dlg.showModal();
    }));

    /* begin_checkout on every option click (a family may come back from Stripe and pick the other one);
       the link itself goes on to Stripe. A link to a section of this page closes the dialog first, and
       focus then starts from that section rather than going back to the Enroll button */
    const option = e => e.target instanceof Element && e.target.closest('a[data-pay]');
    const begin = a => track('begin_checkout', params(a.closest('[data-program]').dataset.program, a.dataset.pay));
    const outside = e => {
      const r = dlg.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    dlg.addEventListener('pointerdown', e => { downOutside = e.target === dlg && outside(e); });
    dlg.addEventListener('click', e => {
      const a = e.target instanceof Element && e.target.closest('a[href]');
      if (!a) {   // a press that starts and ends on the backdrop closes it, as Escape and the close button do
        if (downOutside && e.target === dlg && outside(e)) dlg.close();
        return;
      }
      if (option(e)) return begin(a);
      if (a.hash && a.origin === location.origin && a.pathname === location.pathname) {
        leaving = true;
        dlg.close();
        if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      }
    });
    dlg.addEventListener('auxclick', e => { if (e.button === 1 && option(e)) begin(option(e)); });   // a middle click opens Stripe in a new tab

    /* Tab and Shift+Tab stay inside the dialog (the page behind is inert while it is open) */
    dlg.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = [...dlg.querySelectorAll('a[href], button:not([disabled])')].filter(el => el.getClientRects().length);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], at = document.activeElement;
      if (e.shiftKey && (at === first || at === dlg)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
    });

    /* focus goes back to the button that opened it (Safari never focuses a clicked button, so the
       browser's own return finds nothing there) */
    dlg.addEventListener('close', () => {
      if (leaving) { leaving = false; return; }
      const at = document.activeElement;
      if (opener && opener.isConnected && (!at || at === document.body)) opener.focus({preventScroll: true});
    });
  }

  /* ---- the thanks page (/thanks/?program=<slug>&pay=<full|three>&session_id=<id>) ---- */
  const thanks = document.querySelector('[data-thanks]');
  if (thanks) {
    const q = new URLSearchParams(location.search), p = q.get('program'), m = q.get('pay'), sid = q.get('session_id') || '';
    const c = program(p), known = !!c && (m === 'full' || m === 'three');
    const order = document.getElementById('order');
    if (known && order) {   // the program and the way to pay; nothing program-specific otherwise
      const name = document.createElement('b'), amount = document.createElement('b');
      name.textContent = c.name;
      amount.textContent = money(m === 'full' ? c.full : c.three);
      if (m === 'full') order.append('You enrolled in the ', name, ' and paid ', amount, ' in full.');
      else order.append('You enrolled in the ', name, ' with three monthly payments of ', amount, ': the first today, the next two on the same day of the next two months, then nothing more.');
      order.hidden = false;
    }
    /* purchase, once: transaction_id is the Checkout Session id. The id then leaves the address bar, so
       a reload never reports it twice (GA4 also drops a repeated transaction_id) */
    if (known && CONFIG.session.test(sid)) track('purchase', Object.assign({transaction_id: sid}, params(p, m)), true);
    if (q.has('session_id')) {
      q.delete('session_id');
      try { history.replaceState(history.state, '', location.pathname + (String(q) ? '?' + q : '') + location.hash); } catch (e) {}
    }
  }
})();
