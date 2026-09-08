# About ZEAZ Web

ZEAZ Web is the standalone public web application for **ZEAZDEV Company Limited** and the canonical website runtime for `www.zeaz.dev`.

## Purpose

- Present the ZEAZ operating model: **CREATE → WORK → BUILD**.
- Provide a bilingual Thai/English corporate experience.
- Publish the active ZEAZ application directory.
- Expose lightweight public status, application and company APIs.
- Serve legal, search-discovery and security metadata from the same edge runtime.

## Runtime

The application is deployed as the `zeaz-web` Cloudflare Worker and is intentionally independent from the larger `zeaz-platform` monorepo.

## Engineering goals

- Secure by default
- Small and dependency-light
- Fast edge delivery
- Testable and reproducible
- Explicit production ownership
- Safe rollback and migration
- No deployment credentials in source control

See `README.md`, `docs/architecture.md` and `MIGRATION.md` for implementation and operational details.
