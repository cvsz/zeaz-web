const API = 'https://api.cloudflare.com/client/v4';
const ZONE_NAME = 'zeaz.dev';
const ROUTE_PATTERN = 'www.zeaz.dev/*';
const TARGET_SCRIPT = 'zeaz-web';
const PROBE_URLS = [
  'https://www.zeaz.dev/api/status',
  'https://www.zeaz.dev/healthz',
];

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!token || !accountId) {
  throw new Error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required.');
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function cloudflare(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    const errors = Array.isArray(payload.errors)
      ? payload.errors.map((error) => `${error.code ?? 'unknown'}: ${error.message ?? 'Cloudflare API error'}`).join('; ')
      : `HTTP ${response.status}`;
    throw new Error(`${options.method || 'GET'} ${path} failed: ${errors}`);
  }
  return payload.result;
}

async function resolveZone() {
  const query = new URLSearchParams({
    name: ZONE_NAME,
    'account.id': accountId,
    per_page: '50',
  });
  const zones = await cloudflare(`/zones?${query.toString()}`);
  const exact = zones.filter((zone) => zone.name === ZONE_NAME && zone.account?.id === accountId);
  if (exact.length !== 1) {
    throw new Error(`Expected exactly one ${ZONE_NAME} zone for the configured account; found ${exact.length}.`);
  }
  return exact[0];
}

async function verifyRouteAssignment(zoneId, routeId) {
  const current = await cloudflare(`/zones/${zoneId}/workers/routes/${routeId}`);
  if (current.pattern !== ROUTE_PATTERN || current.script !== TARGET_SCRIPT) {
    throw new Error(`Route API verification failed: expected ${ROUTE_PATTERN} -> ${TARGET_SCRIPT}, got ${current.pattern} -> ${current.script || 'no script'}.`);
  }
  console.log(`Route API confirms ${current.pattern} -> ${current.script}.`);
}

async function probeStandalone(baseUrl, attempt) {
  const nonce = `${Date.now()}-${attempt}-${crypto.randomUUID()}`;
  const url = `${baseUrl}?cutover=${encodeURIComponent(nonce)}`;
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'cache-control': 'no-cache, no-store, max-age=0',
        pragma: 'no-cache',
        'user-agent': 'zeaz-web-cutover/1.0',
      },
    });
    const text = await response.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      // The legacy Worker may return HTML or another non-JSON response.
    }
    const ok = response.ok && body?.status === 'ok' && body?.runtime === 'standalone' && body?.service === 'zeaz-web';
    if (!ok) {
      const preview = text.replace(/\s+/g, ' ').slice(0, 240);
      console.log(`Probe ${attempt} ${new URL(baseUrl).pathname}: HTTP ${response.status}; cf-cache-status=${response.headers.get('cf-cache-status') || 'n/a'}; body=${JSON.stringify(preview)}`);
    }
    return ok;
  } catch (error) {
    console.log(`Probe ${attempt} ${new URL(baseUrl).pathname} failed: ${error.message}`);
    return false;
  }
}

async function waitForStandaloneHealth() {
  for (let attempt = 1; attempt <= 18; attempt += 1) {
    for (const probeUrl of PROBE_URLS) {
      if (await probeStandalone(probeUrl, attempt)) {
        console.log(`Standalone runtime verified via ${new URL(probeUrl).pathname} on attempt ${attempt}.`);
        return true;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return false;
}

const zone = await resolveZone();
const routes = await cloudflare(`/zones/${zone.id}/workers/routes`);
let route = routes.find((candidate) => candidate.pattern === ROUTE_PATTERN);
const previousScript = route?.script ?? null;
const routeExisted = Boolean(route);

if (previousScript === TARGET_SCRIPT) {
  console.log(`${ROUTE_PATTERN} is already assigned to ${TARGET_SCRIPT}.`);
} else if (route) {
  route = await cloudflare(`/zones/${zone.id}/workers/routes/${route.id}`, {
    method: 'PUT',
    body: JSON.stringify({ pattern: ROUTE_PATTERN, script: TARGET_SCRIPT }),
  });
  console.log(`Reassigned ${ROUTE_PATTERN} from ${previousScript || 'no script'} to ${TARGET_SCRIPT}.`);
} else {
  route = await cloudflare(`/zones/${zone.id}/workers/routes`, {
    method: 'POST',
    body: JSON.stringify({ pattern: ROUTE_PATTERN, script: TARGET_SCRIPT }),
  });
  console.log(`Created ${ROUTE_PATTERN} for ${TARGET_SCRIPT}.`);
}

await verifyRouteAssignment(zone.id, route.id);

if (await waitForStandaloneHealth()) {
  console.log('Standalone production cutover verified.');
  process.exit(0);
}

console.error('Standalone health verification failed; rolling the route back.');
try {
  if (routeExisted) {
    const rollbackBody = previousScript
      ? { pattern: ROUTE_PATTERN, script: previousScript }
      : { pattern: ROUTE_PATTERN };
    await cloudflare(`/zones/${zone.id}/workers/routes/${route.id}`, {
      method: 'PUT',
      body: JSON.stringify(rollbackBody),
    });
    console.error(`Route restored to ${previousScript || 'no script'}.`);
  } else {
    await cloudflare(`/zones/${zone.id}/workers/routes/${route.id}`, { method: 'DELETE' });
    console.error('New route removed during rollback.');
  }
} catch (rollbackError) {
  console.error(`ROLLBACK FAILED: ${rollbackError.message}`);
}
throw new Error('Production cutover failed runtime verification.');
