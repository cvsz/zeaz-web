# ZEAZ Web Implementation Checklist

## Runtime

- [x] Standalone `src/index.js` Worker
- [x] Server-rendered `src/site.js` frontend
- [x] Canonical public registry in `src/apps.js`
- [x] Cloudflare Worker route configuration
- [x] Health/status endpoints
- [x] 404 and method handling

## Product

- [x] CREATE / WORK / BUILD model
- [x] Thai/English interface
- [x] 27-app ecosystem directory
- [x] Search/filter UI
- [x] Company/legal/contact pages
- [x] Ad publisher integration

## Security and discovery

- [x] CSP nonce model
- [x] HSTS and browser hardening headers
- [x] `robots.txt`
- [x] `sitemap.xml`
- [x] `ads.txt`
- [x] `/.well-known/security.txt`

## Engineering

- [x] Contract validation
- [x] Runtime smoke tests
- [x] GitHub Actions CI
- [x] CodeQL / Dependency Review
- [x] Dependabot for npm, Actions and Docker
- [x] Docker local development
- [x] Migration and rollback documentation

## Operator-required

- [ ] Configure valid Cloudflare production deployment settings
- [ ] Complete production deploy from this repository
- [ ] Confirm live `/health` reports `runtime: standalone`
- [ ] Retire old monorepo route/deploy ownership after cutover
