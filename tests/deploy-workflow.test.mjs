import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
const deployStart = workflow.indexOf('\n  deploy:\n');
assert.notEqual(deployStart, -1, 'production deploy job must exist');
const deployJob = workflow.slice(deployStart + 1);

test('production deployment is manual and restricted to main', () => {
  assert.match(workflow, /^on:\n  workflow_dispatch:\n  push:/m);
  assert.match(
    deployJob,
    /^    if: \$\{\{ github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main' \}\}$/m
  );
  assert.match(deployJob, /environment:\n      name: production/m);
});

test('all external workflow actions are pinned to immutable commit SHAs', () => {
  const refs = [...workflow.matchAll(/^\s+uses:\s*[^@\s]+@([^\s#]+)/gm)].map((match) => match[1]);
  assert.equal(refs.length, 4, 'expected the two checkout and two setup-node action references');
  for (const ref of refs) {
    assert.match(ref, /^[0-9a-f]{40}$/i, `action reference must be a full commit SHA: ${ref}`);
  }
});

test('checkout steps do not persist GitHub credentials', () => {
  const checkoutCount = (workflow.match(/uses: actions\/checkout@/g) || []).length;
  const isolatedCheckoutCount = (workflow.match(/persist-credentials: false/g) || []).length;
  assert.equal(checkoutCount, 2);
  assert.equal(isolatedCheckoutCount, checkoutCount);
});

test('Cloudflare credentials are checked before upload without printing preflight output', () => {
  const preflight = deployJob.indexOf('Verify Cloudflare deployment credentials');
  const upload = deployJob.indexOf('Upload standalone Cloudflare Worker');
  const cutover = deployJob.indexOf('Atomically cut over and verify production route');
  assert.ok(preflight >= 0 && upload > preflight, 'credential preflight must precede Worker upload');
  assert.ok(cutover > upload, 'route cutover must follow successful Worker upload');
  assert.match(deployJob, /wrangler whoami >"\$\{RUNNER_TEMP\}\/wrangler-whoami\.log" 2>&1/);
  assert.match(deployJob, /rm -f "\$whoami_log"/);
  assert.doesNotMatch(deployJob, /cat "\$whoami_log"/);
});
