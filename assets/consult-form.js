/* Lighthouse Prep: the consult form, first-touch attribution and GA4, shared by the home page and
   the guides (DESIGN.md, "Consult form and tracking"). It loads with defer. Each page with a form
   also keeps a few inline lines that show the form's failure state, with the email link, if this
   file never runs, so a parent who asks for a consult always has a way through. */
(() => {
  /* every account ID lives here */
  const CONFIG = {
    // HubSpot portal 247619141 (na2), form "Website consult request"; unauthenticated Forms API v3
    submitUrl: 'https://api.hsforms.com/submissions/v3/integration/submit/247619141/f34783df-e4c8-4dd2-ac58-29d70cab6d3a',
    newsletterTypeId: 3812496382,   // HubSpot subscription type "Parent newsletter" (D7)
    ga4: 'G-G13HV1FBTM',
    liveHosts: ['thelighthouseprep.com', 'www.thelighthouseprep.com'],
    firstTouchKey: 'lp_first_touch',
    firstTouchDays: 30,
    minFillMs: 3000,   // a submit this soon after the page opened is treated as a bot
    timeoutMs: 15000
  };

  /* tests set window.lpTest before the page loads (and route HubSpot and GA4 to mocks) */
  const testing = window.lpTest === true;
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  /* ---- GA4, no GTM. Production hosts only, so local previews never reach the property, and off
     when the browser sends Global Privacy Control. gtag.js is big (about 170 KB on the wire, a
     250-300 ms task on a mid-range phone), so it loads 2 s after the page's load event, in idle
     time: never inside the hero's 1.65 s reveal and never before LCP. Events wait in dataLayer. */
  const gaOn = (CONFIG.liveHosts.includes(location.hostname) || testing) && navigator.globalPrivacyControl !== true;
  const sent = new Set();
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  /* params never carry form values; single: true for the once-per-page events */
  function track(name, params, single) {
    if (single) { if (sent.has(name)) return; sent.add(name); }
    if (gaOn) gtag('event', name, params || {});
  }
  if (gaOn) {
    const url = new URL(location.href), utm = new URLSearchParams();
    url.searchParams.forEach((v, k) => { if (/^utm_(source|medium|campaign|content|term)$/.test(k)) utm.append(k, v); });
    gtag('js', new Date());
    // only the UTMs survive into page_location: never anything else a link might carry
    gtag('set', {page_location: url.origin + url.pathname + (String(utm) ? '?' + utm : '')});
    gtag('config', CONFIG.ga4, {allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 395 * 86400});
    const load = () => {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4;
      document.head.appendChild(s);
    };
    const idle = () => setTimeout(() => window.requestIdleCallback ? requestIdleCallback(load, {timeout: 3000}) : load(), 2000);
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, {once: true});
  }
  window.lpTrack = track;
  (window.lpq || []).forEach(a => track(...a));   // anything the page's inline scripts queued before this ran

  /* placements tag their own links: data-cta (every click), data-booking and data-guide-cta (once) */
  document.addEventListener('click', e => {
    const t = e.target instanceof Element && e.target.closest('[data-cta],[data-booking],[data-guide-cta]');
    if (!t) return;
    if (t.dataset.cta) track('cta_click', {location: t.dataset.cta});
    else if (t.dataset.booking) track('booking_link_click', {location: t.dataset.booking}, true);
    else track('guide_cta_click', {guide_slug: t.dataset.guideCta}, true);
  });

  /* ---- first touch: the visit's UTMs, landing page and referring site, kept 30 days in this
     browser and sent only with the form. Every storage access is guarded: private modes and
     blocked storage throw, and then this visit simply counts as the first. */
  const DAY = 864e5;
  function readFirstTouch() {
    try {
      const ft = JSON.parse(localStorage.getItem(CONFIG.firstTouchKey));
      if (ft && typeof ft === 'object' && Date.now() - ft.ts < CONFIG.firstTouchDays * DAY) return ft;
    } catch (e) {}
    return null;
  }
  function captureFirstTouch() {
    const p = new URLSearchParams(location.search), cut = k => (p.get(k) || '').trim().slice(0, 200);
    let referrer = '';
    try { const r = new URL(document.referrer); if (r.hostname !== location.hostname) referrer = r.origin; } catch (e) {}   // the site, never its path
    const ft = {utm_source: cut('utm_source'), utm_medium: cut('utm_medium'), utm_campaign: cut('utm_campaign'), utm_content: cut('utm_content'),
      landing_page: location.origin + location.pathname, referrer, ts: Date.now()};
    try { localStorage.setItem(CONFIG.firstTouchKey, JSON.stringify(ft)); } catch (e) {}
    return ft;
  }
  const firstTouch = readFirstTouch() || captureFirstTouch();

  /* ---- the consult form (form.cf; data-form-location: home, guide-<slug>) ---- */
  const opened = Date.now();
  const MSG = {
    name: 'Please enter your name.',
    email: 'Please enter an email address we can reply to.',
    grade: "Please choose your student's grade.",
    goal: 'Please choose a main goal.',
    heard: 'Please choose how you heard about us.',
    badEmail: 'Please check this email address.'
  };
  const REQUIRED = ['name', 'email', 'grade', 'goal', 'heard'];
  const okEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  document.querySelectorAll('form.cf').forEach(form => {
    const el = n => form.elements.namedItem(n);
    const where = form.dataset.formLocation || 'home';
    const btn = form.querySelector('[type=submit]'), fail = form.querySelector('.cf-fail'), thanks = form.querySelector('.thanks');
    let sending = false;

    /* an error is text under the field (not colour alone), and stays until the field is fixed */
    function setError(f, msg) {
      const id = f.id + 'Err';
      let err = document.getElementById(id);
      if (msg) {
        if (!err) { err = document.createElement('p'); err.className = 'err'; err.id = id; (f.closest('.field') || f.parentNode).appendChild(err); }
        err.textContent = msg;
        f.setAttribute('aria-invalid', 'true');
        f.setAttribute('aria-describedby', id);
      } else if (err) {
        err.remove();
        f.removeAttribute('aria-invalid');
        f.removeAttribute('aria-describedby');
      }
    }
    function check(n) {
      const f = el(n), v = f.value.trim();
      const ok = n === 'email' ? okEmail(v) : !!v;
      setError(f, ok ? '' : MSG[n]);
      return ok;
    }

    const edited = e => {
      const f = e.target;
      if (!f.name || f.name === 'website') return;
      track('consult_form_start', {form_location: where}, true);
      if (f.getAttribute('aria-invalid') === 'true' && REQUIRED.includes(f.name)) check(f.name);
    };
    form.addEventListener('input', edited);
    form.addEventListener('change', edited);

    function payload() {
      const v = n => (el(n) ? el(n).value.trim() : '');
      const name = v('name'), cut = name.indexOf(' ');   // first and last name split at the first space
      const ft = firstTouch;
      const pairs = [
        ['email', v('email')],
        ['firstname', cut < 0 ? name : name.slice(0, cut)],
        ['lastname', cut < 0 ? '' : name.slice(cut + 1).trim()],
        ['student_grade', v('grade')], ['main_goal', v('goal')], ['how_heard', v('heard')],
        ['message', v('msg')],
        ['first_utm_source', ft.utm_source], ['first_utm_medium', ft.utm_medium],
        ['first_utm_campaign', ft.utm_campaign], ['first_utm_content', ft.utm_content],
        ['first_landing_page', ft.landing_page], ['first_referrer', ft.referrer]
      ];
      const consent = {consentToProcess: true, text: form.querySelector('.legal').textContent.trim()};
      const box = el('newsletter'), boxText = form.querySelector('.check');
      if (box && boxText) consent.communications = [{value: box.checked, subscriptionTypeId: CONFIG.newsletterTypeId, text: boxText.textContent.trim()}];
      return {
        fields: pairs.filter(p => p[1]).map(([n, value]) => ({objectTypeId: '0-1', name: n, value: String(value)})),
        context: {pageUri: location.origin + location.pathname, pageName: document.title},
        legalConsentOptions: {consent}
      };
    }

    function showFail() {
      fail.hidden = false;
      if (document.activeElement === document.body) btn.focus();   // the disabled button dropped focus
    }

    function done() {
      const first = el('name').value.trim().split(/\s+/)[0];
      const h = thanks.querySelector('h3');
      h.textContent = 'Thank you, ' + first + '.';
      thanks.classList.add('show');
      [...form.children].forEach(c => { if (c !== thanks) c.inert = true; });   // nothing behind the panel stays in the tab order
      h.tabIndex = -1;
      h.focus();
      track('generate_lead', {form_location: where}, true);
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;
      fail.hidden = true;
      const bad = REQUIRED.filter(n => !check(n));
      if (bad.length) { el(bad[0]).focus(); return; }
      // a filled honeypot or an instant submit is a bot: nothing goes to HubSpot. A person caught by
      // mistake still sees the failure state with the email link
      if ((el('website') && el('website').value) || Date.now() - opened < CONFIG.minFillMs) { showFail(); return; }
      if (local && !testing) {   // a local preview never sends a real inquiry
        console.info('consult-form: local preview, so nothing was sent to HubSpot. Tests set window.lpTest and mock the endpoint.');
        showFail();
        return;
      }
      sending = true;
      const label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      let res = null;
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), CONFIG.timeoutMs);
      try {
        res = await fetch(CONFIG.submitUrl, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload()), credentials: 'omit', signal: ctl.signal});
      } catch (err) {}
      clearTimeout(timer);
      sending = false;
      if (res && res.ok) return done();   // the thank-you only on a 2xx
      btn.disabled = false;
      btn.innerHTML = label;
      if (res && res.status === 400) {   // HubSpot's own check of the address is stricter than ours
        try {
          const body = await res.json();
          if ((body.errors || []).some(x => /^(INVALID|BLOCKED)_EMAIL$/.test(x.errorType))) setError(el('email'), MSG.badEmail);
        } catch (err) {}
      }
      showFail();
    });
    window.lpForm = true;   // tells the page's inline fallback that this file is in charge
  });
})();
