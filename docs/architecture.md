# Architecture

ZEAZ Web is a public, read-mostly corporate and product-discovery surface deployed as a Cloudflare Worker on `www.zeaz.dev/*`.

## Components

- `src/site.js` — server-rendered bilingual homepage and app directory.
- `src/apps.js` — canonical 27-app public registry.
- `src/index.js` — request router, public API, legal pages, SEO routes, health checks and security headers.
- `scripts/validate.mjs` — source/contract validation.
- `scripts/smoke.mjs` — runtime route smoke tests.
- `wrangler.toml` — production Worker and route ownership.

## Request flow

```text
Client -> Cloudflare edge -> zeaz-web Worker
                         -> HTML / legal / SEO
                         -> public JSON APIs
```

No persistent application state is required for the corporate surface. Linked ZEAZ product applications remain independent services.

## Security

- GET/HEAD only; unsupported methods return 405.
- CSP with a per-request nonce.
- HSTS, X-Content-Type-Options, X-Frame-Options and strict referrer policy.
- COOP/CORP hardening.
- No deployment credentials in browser JavaScript.
- Public APIs expose only public company/application metadata.

## Availability

The Worker removes an origin-server dependency for the public website. `/health` exposes `runtime: standalone` to verify route ownership during cutover.
