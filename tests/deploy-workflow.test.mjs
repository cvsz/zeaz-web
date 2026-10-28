import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
const deployStart = workflow.indexOf('\n  deploy:\n');
assert.notEqual(deployStart, -1, 'production deploy job must exist');
const deployJob = workflow.slice(deployStart + 1);

test('production cutover requires the exact dispatched main SHA before checkout', () => {
  assert.match(
    workflow,
    /expected_sha:\n\s+description:.*\n\s+required: true\n\s+type: string/m
  );

  const shaGate = deployJob.indexOf('Verify exact main commit SHA before accessing deployment credentials');
  const checkout = deployJob.indexOf('uses: actions/checkout@');
  const credentials = deployJob.indexOf('Verify Cloudflare deployment credentials');
  assert.ok(shaGate >= 0 && checkout > shaGate, 'exact-SHA gate must precede checkout');
  assert.ok(credentials > checkout, 'credential preflight must follow exact-SHA validation');
  assert.ok(deployJob.includes('EXPECTED_SHA: ${{ inputs.expected_sha }}'));
  assert.ok(deployJob.includes('[[ "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]]'));
  assert.ok(deployJob.includes('[[ "$EXPECTED_SHA" == "$GITHUB_SHA" ]]'));
});

test('production deployment requires an explicit confirmation from main', () => {
  assert.match(workflow, /^on:\n  workflow_dispatch:\n    inputs:\n      confirm_production_deploy:/m);
  assert.match(
    workflow,
    /confirm_production_deploy:\n\s+description:.*\n\s+required: true\n\s+type: boolean\n\s+default: false/m
  );
  assert.match(
    deployJob,
    /^    if: \$\{\{ github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main' && inputs\.confirm_production_deploy == true \}\}$/m
  );
  assert.match(deployJob, /environment:\n      name: production/m);
});

test('all external workflow actions are pinned to immutable commit SHAs', () => {
  const refs = [...workflow.matchAll(/^[ \t]*-[ \t]+uses:[ \t]*[^@\s]+@([^\s#]+)/gm)].map((match) => match[1]);
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
  assert.match(deployJob, /whoami_log="\$\{RUNNER_TEMP\}\/wrangler-whoami\.log"/);
  assert.match(deployJob, /wrangler whoami >"\$whoami_log" 2>&1/);
  assert.match(deployJob, /rm -f "\$whoami_log"/);
  assert.doesNotMatch(deployJob, /cat "\$whoami_log"/);
});
