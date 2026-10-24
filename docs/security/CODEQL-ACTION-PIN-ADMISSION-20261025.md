# CodeQL Action Version Consistency — 2026-10-25

## Finding

`zeaz-web` Dependabot PRs #28 and #29 separately update the `analyze` and `init` actions from CodeQL Action v4.38.0 to v4.39.0. Hosted CodeQL run `39505759735` on PR #29 failed with:

> Loaded a configuration file for version '4.39.0', but running version '4.38.0'

The failure is caused by mixed `init` and `analyze` action versions, not by a confirmed application security finding.

## Candidate remediation

Pin both `github/codeql-action/init` and `github/codeql-action/analyze` to the same reviewed immutable v4.39.0 commit (`6f2ac81f5cd81fe351a197ba0b00d91d03cd2aee`). Preserve the workflow's language coverage, triggers, least-privilege permissions, and SARIF upload. Add a Node test that fails when the pins diverge. Do not disable CodeQL or change production deployment.

## Verification

```bash
node --test tests/codeql-action-pin.test.mjs
npm test
npm run deploy:dry
```

The first command is locally reproducible without dependencies. Full npm checks and hosted CodeQL analysis must pass on the **exact PR head** before review/merge. Do not merge Dependabot PRs #28/#29 independently while they contain mismatched action pins; reconcile or close only after a verified replacement lands.

## Rollback and admission

Before merge, close the draft candidate without changing `main`. After merge, use a reviewed revert to a previously working **matching pair** of CodeQL action pins; never revert only one action. Retain CodeQL as a required check. No production deployment, Cloudflare change, DNS cutover, or payment activity is authorized by this PR.
