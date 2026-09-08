# Release and Deployment

## Main branch

Changes merged to `main` run CI. Runtime-affecting paths also trigger `.github/workflows/deploy.yml`.

## Production configuration

GitHub Environment: `production`.

It must contain the Cloudflare account identifier and a scoped token that can deploy the Worker and manage the `www.zeaz.dev/*` Worker route.

## Gates

1. JavaScript syntax and project contract validation.
2. Worker route smoke tests.
3. `wrangler deploy --dry-run`.
4. Cloudflare deployment.
5. Live health verification for `runtime: standalone`.

## Rollback

Redeploy a known-good `zeaz-web` revision. During migration, `zeaz-platform/workers/zeaz-loading` remains the emergency rollback source until standalone ownership is confirmed and the old route ownership is retired.
