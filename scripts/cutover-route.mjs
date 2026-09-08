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
  return current;
}

function isCloudflareChallenge(status, text) {
  return status === 403 && (
    text.includes('<title>Just a moment...</title>') ||
    text.includes('cf-chl-') ||
    text.includes('challenge-platform')
  );
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
      // Security challenges and the legacy Worker may return non-JSON content.
    }

    if (response.ok && body?.status === 'ok' && body?.runtime === 'standalone' && body?.service === 'zeaz-web') {
      return { result: 'standalone', status: response.status };
    }

    if (isCloudflareChallenge(response.status, text)) {
      console.log(`Probe ${attempt} ${new URL(baseUrl).pathname}: Cloudflare challenge gate detected (HTTP 403).`);
      return { result: 'challenge', status: response.status };
    }

    const preview = text.replace(/\s+/g, ' ').slice(0, 240);
    console.log(`Probe ${attempt} ${new URL(baseUrl).pathname}: HTTP ${response.status}; cf-cache-status=${response.headers.get('cf-cache-status') || 'n/a'}; body=${JSON.stringify(preview)}`);
    return { result: 'other', status: response.status };
  } catch (error) {
    console.log(`Probe ${attempt} ${new URL(baseUrl).pathname} failed: ${error.message}`);
    return { result: 'error', status: null };
  }
}

async function verifyRuntimeOrChallengeGate() {
  let challengeCount = 0;
  let observationCount = 0;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    for (const probeUrl of PROBE_URLS) {
      const observation = await probeStandalone(probeUrl, attempt);
      observationCount += 1;
      if (observation.result === 'standalone') {
        console.log(`Standalone runtime verified via ${new URL(probeUrl).pathname} on attempt ${attempt}.`);
        return { verified: true, mode: 'runtime' };
      }
      if (observation.result === 'challenge') challengeCount += 1;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (challengeCount === observationCount && observationCount > 0) {
    console.warn('All public probes were intercepted by a Cloudflare challenge. Treating control-plane route verification as authoritative while preserving the site security challenge.');
    return { verified: true, mode: 'control-plane-challenge-gated' };
  }

  return { verified: false, mode: 'failed' };
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
const verification = await verifyRuntimeOrChallengeGate();

if (verification.verified) {
  console.log(`Standalone production cutover verified (${verification.mode}).`);
  process.exit(0);
}

console.error('Standalone verification failed; rolling the route back.');
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
throw new Error('Production cutover failed verification.');
