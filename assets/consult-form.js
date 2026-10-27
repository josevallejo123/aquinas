/* Lighthouse Prep: the consult form, first-touch attribution, GA4 and the Meta Pixel, shared by the
   home page and the guides (DESIGN.md, "Consult form and tracking"). It loads with defer. Each page
   with a form also keeps a few inline lines that show the form's failure state, with the email
   link, if this file never runs, so a parent who asks for a consult always has a way through. */
(() => {
  /* every account ID lives here */
  const CONFIG = {
    // HubSpot portal 247619141 (na2), form "Website consult request"; unauthenticated Forms API v3
    submitUrl: 'https://api.hsforms.com/submissions/v3/integration/submit/247619141/f34783df-e4c8-4dd2-ac58-29d70cab6d3a',
    newsletterTypeId: 3812496382,   // HubSpot subscription type "Parent newsletter" (D7)
    ga4: 'G-G13HV1FBTM',
    metaPixel: '1446939640735109',   // Meta dataset "Lighthouse Prep website"; also META_PIXEL_ID in wrangler.jsonc
    metaEvent: '/api/meta-event',    // the site's Worker sends Lead's server copy (_worker/meta.js)
    browserIdKey: 'lp_browser_id',   // the external_id Meta gets with Lead, one per browser
    liveHosts: ['thelighthouseprep.com', 'www.thelighthouseprep.com'],
    firstTouchKey: 'lp_first_touch',
    firstTouchDays: 30,
    minFillMs: 3000,   // a submit this soon after the page opened is treated as a bot
    timeoutMs: 15000
  };

  /* tests set window.lpTest before the page loads (and route HubSpot and GA4 to mocks); a test that also
     routes Meta's hosts sets window.lpTestMeta, so no other suite can reach the real pixel */
  const testing = window.lpTest === true;
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  /* ---- GA4, no GTM. Production hosts only, so local previews never reach the property, and off
     when the browser sends Global Privacy Control. gtag.js is big (about 170 KB on the wire, a
     250-300 ms task on a mid-range phone), so it loads 2 s after the page's load event, in idle
     time: never inside the hero's 1.65 s reveal and never before LCP. Events wait in dataLayer.
     Google signals and ad personalization are on (marketing R2-13; the privacy page says so). */
  const gaOn = (CONFIG.liveHosts.includes(location.hostname) || testing) && navigator.globalPrivacyControl !== true;
  const sent = new Set();
  // the page's address with only its UTMs: all that GA4's page_location and Meta's server copy of Lead get of it
  const pageUrl = (() => {
    const url = new URL(location.href), utm = new URLSearchParams();
    url.searchParams.forEach((v, k) => { if (/^utm_(source|medium|campaign|content|term)$/.test(k)) utm.append(k, v); });
    return url.origin + url.pathname + (String(utm) ? '?' + utm : '');
  })();
  // GA4's and the pixel's scripts: 2 s after the load event, then idle time
  function later(src) {
    const load = () => {
      const s = document.createElement('script');
      s.async = true;
      s.src = src;
      document.head.appendChild(s);
    };
    const idle = () => setTimeout(() => window.requestIdleCallback ? requestIdleCallback(load, {timeout: 3000}) : load(), 2000);
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, {once: true});
  }
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  /* params never carry form values; single: true for the once-per-page events */
  function track(name, params, single) {
    if (single) { if (sent.has(name)) return; sent.add(name); }
    if (gaOn) gtag('event', name, params || {});
  }
  if (gaOn) {
    gtag('js', new Date());
    // only the UTMs survive into page_location: never anything else a link might carry
    gtag('set', {page_location: pageUrl});
    gtag('config', CONFIG.ga4, {allow_google_signals: true, allow_ad_personalization_signals: true, cookie_expires: 395 * 86400});
    later('https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4);
  }
  window.lpTrack = track;
  (window.lpq || []).forEach(a => track(...a));   // anything the page's inline scripts queued before this ran

  /* ---- the Meta Pixel (marketing meta-round2, R2-2 and R2-3): GA4's hosts, Global Privacy Control
     rule and timing. Meta's standard fbq stub goes in first, so a Lead sent before fbevents.js
     arrives waits in its queue. autoConfig stays on: Meta's automatic events (button clicks, page
     metadata). The page's first init carries no user data on purpose: the pixel ignores a second
     init of the same ID once one has user data ("Duplicate Pixel ID"), and the init before Lead
     (metaLead) has to be the one that brings the parent's email and name. */
  const fbq = gaOn && CONFIG.metaPixel && (!testing || window.lpTestMeta === true) ? (window.fbq || (() => {
    const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    return n;
  })()) : null;
  if (fbq) {
    fbq('init', CONFIG.metaPixel);
    fbq('track', 'PageView');
    later('https://connect.facebook.net/en_US/fbevents.js');
  }
  /* a page's own Meta event, under the pixel's gates (fbq exists only once they passed): /book/ sends
     Schedule when HubSpot's scheduler reports a booking (booking round 1, BK-6). Browser only, no
     server copy; params never carry anything about the family */
  window.lpMeta = (name, params) => { if (fbq) fbq('track', name, params || {}); };
  const uuid = () => crypto.randomUUID ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  // the id Meta gets as external_id: made at this browser's first Lead and kept, like the first touch
  function browserId() {
    let id = '';
    try { id = localStorage.getItem(CONFIG.browserIdKey) || ''; } catch (e) {}
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
      id = uuid();
      try { localStorage.setItem(CONFIG.browserIdKey, id); } catch (e) {}
    }
    return id;
  }
  /* the matching fields, normalized as the pixel does it, so the two copies of Lead hash alike (and
     non-ASCII punctuation such as a curly apostrophe goes too): the email trimmed and lower-case,
     a name lower-case without spaces or punctuation */
  const metaEmail = v => v.trim().toLowerCase();
  const metaName = v => v.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '').normalize('NFC');
  const metaTest = new URLSearchParams(location.search).get('meta_test') || '';   // a code from Events Manager's Test events
  /* Lead goes twice with one event id, so Meta counts it once: from the pixel, and from the site's
     Worker, which adds the IP, the browser and Meta's cookies and hashes the fields before Meta
     gets them. The three answers ride along as plain values: they identify nobody */
  function metaLead({email, name, grade, goal, heard}) {
    if (!fbq || sent.has('meta:Lead')) return;
    sent.add('meta:Lead');
    const cut = name.indexOf(' ');   // first and last name split at the first space, as for HubSpot
    const user = {em: metaEmail(email), fn: metaName(cut < 0 ? name : name.slice(0, cut)), ln: metaName(cut < 0 ? '' : name.slice(cut + 1)), external_id: browserId()};
    Object.keys(user).forEach(k => { if (!user[k]) delete user[k]; });
    const custom = {student_grade: grade, main_goal: goal, heard_about: heard};
    const eventId = uuid();
    fbq('init', CONFIG.metaPixel, Object.assign({}, user));
    fbq('track', 'Lead', Object.assign({}, custom), {eventID: eventId});
    const body = {event_name: 'Lead', event_id: eventId, event_source_url: pageUrl, user_data: user, custom_data: custom};
    if (/^[A-Za-z0-9]{1,40}$/.test(metaTest)) body.test_event_code = metaTest;
    fetch(CONFIG.metaEvent, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body), keepalive: true, credentials: 'same-origin'}).catch(() => {});
  }

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
      metaLead({email: el('email').value, name: el('name').value.trim(), grade: el('grade').value, goal: el('goal').value, heard: el('heard').value});
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
