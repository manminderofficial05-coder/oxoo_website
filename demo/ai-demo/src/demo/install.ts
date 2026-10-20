import { handleApi } from './api';
import { DEMO_EMAIL, DEMO_PASSWORD, startDemoSession, endDemoSession } from './session';

declare global { interface Window { __hospitalCartDemoInstalled?: boolean } }

/**
 * Replaces window.fetch for same-origin /api/* calls so the UI (unchanged from the
 * original product) is served entirely from the in-browser demo dataset.
 * No request ever leaves the browser for these paths.
 */
export function installDemoApi() {
  if (typeof window === 'undefined' || window.__hospitalCartDemoInstalled) return;
  window.__hospitalCartDemoInstalled = true;
  const realFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const reqUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    let url: URL;
    try { url = new URL(reqUrl, window.location.origin); } catch { return realFetch(input, init); }
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return realFetch(input, init);

    const method = (init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET') || 'GET').toUpperCase();
    let body: any = undefined;
    const raw = init?.body;
    if (typeof raw === 'string') { try { body = JSON.parse(raw); } catch { body = raw; } }

    // Small artificial latency so loading states are visible like in the real product.
    await new Promise((r) => setTimeout(r, 120 + Math.random() * 180));

    let res;
    if (url.pathname === '/api/auth/signin' && method === 'POST') {
      const okCreds = String(body?.email ?? '').trim().toLowerCase() === DEMO_EMAIL && String(body?.password ?? '') === DEMO_PASSWORD;
      if (okCreds) { startDemoSession(); res = { status: 200, body: { success: true } }; }
      else res = { status: 401, body: { error: 'Invalid email or password. Use the demo credentials shown on this page.' } };
    } else if (url.pathname === '/api/auth/signout') {
      endDemoSession(); res = { status: 200, body: { success: true } };
    } else {
      res = handleApi(method, url.pathname + url.search, body);
    }
    return new Response(JSON.stringify(res.body), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  };
}
