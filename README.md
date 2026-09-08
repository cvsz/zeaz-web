# ZEAZ Web

Standalone full-stack edge website for **ZEAZDEV Company Limited** at **https://www.zeaz.dev/**.

The repository combines a bilingual public website with a Cloudflare Worker API, health endpoints, legal/SEO routes, validation, Docker-based local development and GitHub Actions automation.

## System

ZEAZ Web presents the ecosystem as **CREATE → WORK → BUILD** and renders the public 27-app directory from a single registry shared with the API.

## Stack

- Cloudflare Workers / Wrangler 4
- JavaScript ES modules
- Node.js 22+
- Server-rendered HTML at the edge
- Public JSON API
- Docker / Docker Compose for local development
- GitHub Actions, CodeQL, Dependency Review and Dependabot

## Public endpoints

| Endpoint | Purpose |
| --- | --- |
| `/` | Bilingual CREATE / WORK / BUILD website |
| `/health`, `/healthz` | Standalone runtime health |
| `/api/status` | Runtime status |
| `/api/apps` | 27-app catalog |
| `/api/company` | Public company metadata |
| `/privacy`, `/terms`, `/contact` | Legal/contact pages |
| `/robots.txt`, `/sitemap.xml` | Search discovery |
| `/ads.txt` | Ad publisher declaration |
| `/.well-known/security.txt` | Security contact |

## Development

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:8787`.

Docker:

```bash
docker compose up --build
curl http://localhost:8787/health
```

## Quality gates

```bash
npm run check
npm test
npm run deploy:dry
make ci
```

Validation checks runtime syntax, the 27-app contract, UI/API parity, corporate/legal markers, CSP support and deployment configuration.

## Production

Production deployment is defined in `.github/workflows/deploy.yml` and targets the Cloudflare Worker route `www.zeaz.dev/*`.

After deployment, `https://www.zeaz.dev/health` must report:

```json
{
  "service": "zeaz-web",
  "runtime": "standalone"
}
```

See [MIGRATION.md](MIGRATION.md) for the cutover from the previous monorepo Worker.

## License

MIT. See [LICENSE](LICENSE).
