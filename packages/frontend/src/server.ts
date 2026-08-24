import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const angularApp = new AngularAppEngine();

/**
 * This is a request handler used by the Angular CLI (dev-server and during build).
 * We also proxy \/api requests to the local backend running on http:\/\/127.0.0.1:3020
 * so that E2E tests and local dev via Wrangler work seamlessly without CORS.
 */
export const reqHandler = createRequestHandler(async (req) => {
  const url = new URL(req.url);

  // Serve favicon from /public for common crawlers/browsers expectation at /favicon.ico
  if (url.pathname === '/favicon.ico') {
    // Response.redirect requires an absolute URL per the Fetch spec
    return Response.redirect(new URL('/public/favicon.ico', url.origin).toString(), 301);
  }

  // Serve robots.txt at the root for SEO
  if (url.pathname === '/robots.txt') {
    const origin = url.origin;
    const body = `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
    return new Response(body, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  // Serve a minimal sitemap for static, indexable pages
  if (url.pathname === '/sitemap.xml') {
    const origin = url.origin;
    const urls = ['/', '/privacy-policy'];
    const now = new Date().toISOString();
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls
        .map(
          (path) =>
            `<url>` +
            `<loc>${origin}${path}</loc>` +
            `<lastmod>${now}</lastmod>` +
            `<changefreq>weekly</changefreq>` +
            `<priority>${path === '/' ? '1.0' : '0.5'}</priority>` +
            `</url>`,
        )
        .join('') +
      `</urlset>`;
    return new Response(xml, {
      headers: { 'content-type': 'application/xml; charset=utf-8' },
    });
  }

  // Proxy API calls to the local backend when running with Wrangler in
  // development (same-origin cookies). Only honored on loopback origins so
  // production deployments never try to reach a local backend.
  if (url.pathname.startsWith('/api')) {
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(
      url.hostname,
    );
    if (!isLoopback) {
      return new Response('Not found', { status: 404 });
    }
    const backendOrigin = 'http://127.0.0.1:3020';
    const upstream = new URL(backendOrigin);
    // Rewrite path by stripping the /api prefix
    const rewrittenPath = url.pathname.replace(/^\/api/, '');
    upstream.pathname = rewrittenPath || '/';
    upstream.search = url.search;

    // Build proxied request
    const headers = new Headers(req.headers);
    headers.delete('host');

    const init: RequestInit = {
      method: req.method,
      headers,
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? (req as any).body
          : undefined,
      redirect: 'manual',
    };

    const backendResp = await fetch(upstream.toString(), init);

    // Return backend response as-is (including Set-Cookie headers)
    return new Response(backendResp.body, {
      status: backendResp.status,
      statusText: backendResp.statusText,
      headers: backendResp.headers,
    });
  }

  const res = await angularApp.handle(req);
  if (!res) return new Response('Page not found.', { status: 404 });

  // Mark OAuth callback pages as non-indexable at the HTTP level too
  if (url.pathname.startsWith('/oauth/callback/')) {
    const headers = new Headers(res.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }

  return res;
});

export default { fetch: reqHandler };
