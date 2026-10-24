// POST /api/meta-event: the server copy of the consult form's Lead, for Meta's Conversions API
// (marketing/paid/meta-round2-2026-10, §3.4). The browser sends the event id, the page and the
// parent's email and name, normalized but not hashed. This adds the visitor's IP address, browser
// and Meta's _fbp/_fbc cookies, hashes every identifier (SHA-256) and posts the event to Meta after
// answering. It answers 204 whatever Meta says (400 only for a body it can't use; 405 for anything
// but POST), and never logs, stores or returns what it was sent. A request from another site's page
// (its Origin or Sec-Fetch-Site says so) gets 204 and sends nothing. Without the pixel ID (wrangler.jsonc vars) or the token (the
// secret META_CAPI_TOKEN, set in the dashboard) it sends nothing.

// Meta's Marketing API versions expire (v24.0 on Nov 10 2026, v25.0 on Feb 23 2027; see its
// changelog): move to the current version before this one's date
const GRAPH = 'https://graph.facebook.com/v26.0';
const HOSTS = ['thelighthouseprep.com', 'www.thelighthouseprep.com'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HASHED = /^[0-9a-f]{64}$/;
const ANSWER = /^[\w-]{1,40}$/;   // a dropdown's value, such as 12th, essays_applications or counselor
const MAX_BODY = 4096;            // a Lead is about 600 bytes

// Meta's normalization as the pixel applies it, so this copy and the browser's hash alike: the email
// trimmed and lower-case; a name lower-case without spaces or punctuation; an id without spaces
const name = (v) => v.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '').normalize('NFC');
// the pixel's own email pattern (fbevents.js): an address it drops, this copy drops too
const EMAIL = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
export const normalize = {
  em: (v) => { const e = v.trim().toLowerCase(); return EMAIL.test(e) || HASHED.test(e) ? e : ''; },
  fn: name,
  ln: name,
  external_id: (v) => v.replace(/\s+/g, '').toLowerCase(),
};

export async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function metaEvent(request, env, ctx) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  const body = await readJson(request);
  const page = body && siteUrl(body.event_source_url);
  if (!page || body.event_name !== 'Lead' || typeof body.event_id !== 'string' || !UUID.test(body.event_id)) {
    return new Response(null, { status: 400 });
  }
  // another site's page can't make a visitor's browser send a Lead: it would carry that site's Origin
  const origin = request.headers.get('Origin');
  const sameSite = (!origin || origin === new URL(request.url).origin) && /^(same-origin)?$/.test(request.headers.get('Sec-Fetch-Site') || '');
  if (env.META_PIXEL_ID && env.META_CAPI_TOKEN && sameSite) {
    const h = request.headers;
    ctx.waitUntil(send(env, body, page, { ip: h.get('CF-Connecting-IP'), ua: h.get('User-Agent'), cookie: h.get('Cookie') }));
  }
  return new Response(null, { status: 204 });
}

// The body, if it is a JSON object of at most MAX_BODY bytes; null otherwise.
async function readJson(request) {
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return null;
  if (Number(request.headers.get('Content-Length')) > MAX_BODY || !request.body) return null;
  const reader = request.body.getReader(), parts = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { reader.cancel().catch(() => {}); return null; }
    parts.push(value);
  }
  try {
    const json = JSON.parse(await new Blob(parts).text());
    return json && typeof json === 'object' && !Array.isArray(json) ? json : null;
  } catch {
    return null;
  }
}

// The page, if it is on this site: its origin and path with only its UTMs, as the browser sends it.
function siteUrl(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== 'https:' || !HOSTS.includes(url.hostname)) return null;
  const utm = new URLSearchParams();
  url.searchParams.forEach((v, k) => { if (/^utm_(source|medium|campaign|content|term)$/.test(k)) utm.append(k, v); });
  return url.origin + url.pathname + (String(utm) ? '?' + utm : '');
}

async function send(env, body, page, who) {
  const user = {};
  if (who.ip) user.client_ip_address = who.ip;
  if (who.ua) user.client_user_agent = who.ua;
  for (const part of (who.cookie || '').split(';')) {
    const i = part.indexOf('='), key = part.slice(0, i).trim(), value = part.slice(i + 1).trim();
    if ((key === '_fbp' || key === '_fbc') && value.length <= 500 && /^fb\.\d\.\d+\.\S+$/.test(value)) user[key.slice(1)] = value;
  }
  const fields = body.user_data && typeof body.user_data === 'object' ? body.user_data : {};
  for (const key of Object.keys(normalize)) {
    if (typeof fields[key] !== 'string' || fields[key].length > 500) continue;
    const value = normalize[key](fields[key]);
    if (value) user[key] = HASHED.test(value) ? value : await sha256(value);
  }
  const answers = body.custom_data && typeof body.custom_data === 'object' ? body.custom_data : {};
  const custom = {};
  for (const key of ['student_grade', 'main_goal', 'heard_about']) {
    if (typeof answers[key] === 'string' && ANSWER.test(answers[key])) custom[key] = answers[key];
  }
  const payload = {
    data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: body.event_id, event_source_url: page, action_source: 'website', user_data: user, custom_data: custom }],
    access_token: env.META_CAPI_TOKEN,
  };
  if (typeof body.test_event_code === 'string' && /^[A-Za-z0-9]{1,40}$/.test(body.test_event_code)) payload.test_event_code = body.test_event_code;
  try {
    const res = await fetch(`${GRAPH}/${env.META_PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) { await res.body?.cancel(); return; }
    // Meta's error code and trace id only: its message can quote what was sent
    const { error = {} } = await res.json().catch(() => ({}));
    console.error(JSON.stringify({ message: 'meta-event rejected', status: res.status, code: error.code, subcode: error.error_subcode, trace: error.fbtrace_id }));
  } catch (e) {
    console.error(JSON.stringify({ message: 'meta-event not sent', error: e.name }));
  }
}
