# Development

## Requirements

- Node.js 22+
- npm
- Wrangler is installed as a pinned development dependency

## Start

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:8787`.

## Change rules

1. Keep all public apps in `src/apps.js`; the UI and `/api/apps` both consume this registry.
2. Preserve corporate/legal markers unless there is an explicit business change.
3. Keep the AdSense loader idempotent: one publisher script in the primary document.
4. Do not weaken security headers to make a feature pass.
5. Do not commit local deployment values.
6. Run `npm test` before pushing.

## Docker

```bash
docker compose up --build
curl http://localhost:8787/health
```

Docker is a local portability path; Cloudflare Workers remains the production target.
