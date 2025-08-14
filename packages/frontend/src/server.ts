import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const angularApp = new AngularAppEngine();

/**
 * This is a request handler used by the Angular CLI (dev-server and during build).
 * We also proxy \/api requests to the local backend running on http:\/\/127.0.0.1:3020
 * so that E2E tests and local dev via Wrangler work seamlessly without CORS.
 */
export const reqHandler = createRequestHandler(async (req) => {
  const url = new URL(req.url);

  // Proxy API calls to the backend
  if (url.pathname.startsWith('/api')) {
    const backendUrl = new URL(req.url);
    backendUrl.protocol = 'http:';
    backendUrl.hostname = '127.0.0.1';
    backendUrl.port = '3020';

    // Clone the incoming request for the backend, preserving method, headers and body
    const init: RequestInit = {
      method: req.method,
      headers: new Headers(req.headers),
      body:
        req.method === 'GET' || req.method === 'HEAD'
          ? undefined
          : await req.clone().arrayBuffer(),
      redirect: 'manual',
    };

    const backendResponse = await fetch(backendUrl, init);

    // Return backend response as-is, including status, headers and body
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: backendResponse.headers,
    });
  }

  const res = await angularApp.handle(req);
  return res ?? new Response('Page not found.', { status: 404 });
});

export default { fetch: reqHandler };
