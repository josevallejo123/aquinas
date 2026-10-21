// The site is static assets; this Worker runs first only for /media/* (wrangler.jsonc, run_worker_first).
// Workers static assets answer a Range request with the whole file (200), and Safari will not play a
// <video> without byte ranges (206); seeking (the How it works chapters) needs them everywhere too. So
// for /media/* this serves the requested range of the asset, and passes every other response through.

const sizes = new Map();   // path|ETag -> bytes, for this instance

export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const range = request.headers.get('Range');
    // already partial (should the assets server ever answer ranges itself), an error, or a plain request
    if (res.status !== 200 || (request.method !== 'GET' && request.method !== 'HEAD')) return res;
    if (!range) {
      const out = new Response(res.body, res);
      out.headers.set('Accept-Ranges', 'bytes');
      return out;
    }
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    // one range only; anything else (several ranges, other units) gets the whole file, as before
    if (!m || (m[1] === '' && m[2] === '')) return res;
    // the assets binding answers without a Content-Length, so a file's size is measured from its body once
    // per instance and remembered by its ETag (a new file has a new ETag); later ranges stream straight away
    const key = new URL(request.url).pathname + '|' + (res.headers.get('ETag') || '');
    let size = Number(res.headers.get('Content-Length')) || sizes.get(key) || 0, whole = null;
    if (!(size > 0)) {
      // a HEAD response has no body to measure: measure the GET instead
      const full = request.method === 'HEAD' ? await env.ASSETS.fetch(new Request(request.url, { headers: request.headers })) : res;
      whole = new Uint8Array(await full.arrayBuffer());
      size = whole.byteLength;
      if (!size) return new Response(whole, res);
      if (sizes.size > 200) sizes.clear();
      sizes.set(key, size);
    }
    let start, end;
    if (m[1] === '') {                       // bytes=-N: the last N bytes
      start = Math.max(0, size - Number(m[2]));
      end = size - 1;
    } else {
      start = Number(m[1]);
      end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
    }
    if (start >= size || start > end) {
      if (!whole) res.body?.cancel();
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' } });
    }
    const headers = new Headers(res.headers);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    headers.set('Accept-Ranges', 'bytes');
    if (request.method === 'HEAD') {
      if (!whole) res.body?.cancel();
      return new Response(null, { status: 206, headers });
    }
    const part = whole ? whole.subarray(start, end + 1) : slice(res.body, start, end - start + 1);
    return new Response(part, { status: 206, headers });
  },
};

// The bytes [skip, skip + take) of a stream; stops reading the asset once they have been sent.
function slice(body, skip, take) {
  const reader = body.getReader();
  return new ReadableStream({
    async pull(controller) {
      while (take > 0) {
        const { done, value } = await reader.read();
        if (done) break;
        let chunk = value;
        if (skip >= chunk.byteLength) { skip -= chunk.byteLength; continue; }
        if (skip > 0) { chunk = chunk.subarray(skip); skip = 0; }
        if (chunk.byteLength > take) chunk = chunk.subarray(0, take);
        take -= chunk.byteLength;
        controller.enqueue(chunk);
        return;
      }
      controller.close();
      reader.cancel().catch(() => {});
    },
    cancel(reason) { return reader.cancel(reason); },
  });
}
