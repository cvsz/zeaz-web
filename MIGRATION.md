# Migration: zeaz-platform → zeaz-web

## Goal

Make `cvsz/zeaz-web` the only repository responsible for the production route `www.zeaz.dev/*`.

## Cutover

1. Validate this repository with `npm test` and `npm run deploy:dry`.
2. Configure the GitHub `production` Environment with the Cloudflare account identifier and scoped Worker deployment token.
3. Run `Deploy www.zeaz.dev`.
4. Confirm `https://www.zeaz.dev/health` returns `service: zeaz-web` and `runtime: standalone`.
5. Check `/`, `/privacy`, `/terms`, `/contact`, `/api/apps`, `/robots.txt`, `/sitemap.xml` and `/ads.txt`.
6. Only after successful verification, disable/remove the old `zeaz-platform/workers/zeaz-loading` deployment ownership for `www.zeaz.dev/*`.

## Rollback

If standalone production is unhealthy, redeploy the last known-good `zeaz-loading` Worker from `zeaz-platform` and restore its route. DNS changes are not required for a normal Worker-to-Worker rollback.

## Steady-state ownership

Exactly one deployable repository should own `www.zeaz.dev/*`: `cvsz/zeaz-web`.
