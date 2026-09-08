# Security Policy

ZEAZ Web is a public Cloudflare Worker application serving `www.zeaz.dev`.

## Reporting a vulnerability

Do not disclose exploitable vulnerabilities in public issues, pull requests, discussions, or commit messages. Use GitHub private vulnerability reporting/security advisories when available, or contact the repository owner through a private channel.

Include the affected route or commit, reproduction details, impact, prerequisites and suggested remediation when possible.

## Supported version

The supported production version is the revision currently deployed from `main` to the `zeaz-web` Cloudflare Worker.

## Security controls

- CSP with a per-request nonce.
- HSTS and browser hardening headers.
- GET/HEAD-only public route model.
- CodeQL and Dependency Review in GitHub Actions.
- Dependabot for npm, GitHub Actions and Docker.
- Deployment values remain outside source control.
- Public APIs expose only public company/application metadata.
- Security checks must be fixed, not bypassed, when they fail.

## Incident response

Contain the affected deployment, identify the last known-good commit, validate the fix with `npm test` and the Wrangler dry-run, redeploy, then verify `/health` and affected routes. Use the migration rollback procedure if the issue occurs during standalone cutover.
