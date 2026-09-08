# Contributing

Thanks for contributing to ZEAZ Web.

## Development workflow

1. Create a focused branch from `main`.
2. Keep UI/application-registry changes synchronized through `src/apps.js`.
3. Add or update validation for behavior changes.
4. Run `npm test` and `npm run deploy:dry`.
5. Update documentation and `CHANGELOG.md` for user-visible or operational changes.
6. Open a pull request with risk and rollback notes.

## Commit guidance

Prefer Conventional Commits, for example:

- `feat: add public application route`
- `fix: preserve CSP nonce on legal pages`
- `security: harden response headers`
- `docs: update production cutover guide`

## Security

Do not report exploitable vulnerabilities in public issues. Follow `SECURITY.md`. Never commit deployment values or other sensitive credentials.

Quality or security gates must not be weakened simply to obtain a passing build.
