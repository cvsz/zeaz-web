import worker from '../src/index.js';

const cases = [
  ['/', 200, 'text/html'],
  ['/health', 200, 'application/json'],
  ['/api/status', 200, 'application/json'],
  ['/api/apps', 200, 'application/json'],
  ['/api/company', 200, 'application/json'],
  ['/privacy', 200, 'text/html'],
  ['/terms', 200, 'text/html'],
  ['/contact', 200, 'text/html'],
  ['/robots.txt', 200, 'text/plain'],
  ['/ads.txt', 200, 'text/plain'],
  ['/.well-known/security.txt', 200, 'text/plain'],
  ['/sitemap.xml', 200, 'application/xml'],
  ['/manifest.webmanifest', 200, 'application/manifest+json'],
  ['/missing', 404, 'text/html']
];

for (const [path, status, type] of cases) {
  const response = await worker.fetch(new Request(`https://www.zeaz.dev${path}`));
  if (response.status !== status) throw new Error(`${path}: expected ${status}, got ${response.status}`);
  if (!(response.headers.get('content-type') || '').includes(type)) throw new Error(`${path}: wrong content type`);
  if (!response.headers.get('content-security-policy')) throw new Error(`${path}: missing CSP`);
}
const apps = await (await worker.fetch(new Request('https://www.zeaz.dev/api/apps'))).json();
if (apps.count !== 27 || apps.apps.length !== 27) throw new Error('API app catalog must contain 27 apps');
const health = await (await worker.fetch(new Request('https://www.zeaz.dev/health'))).json();
if (health.runtime !== 'standalone' || health.service !== 'zeaz-web') throw new Error('Standalone health contract failed');
const method = await worker.fetch(new Request('https://www.zeaz.dev/', { method: 'POST' }));
if (method.status !== 405) throw new Error('POST must return 405');
console.log(`Smoke passed: ${cases.length} routes, 27-app API, health and method contracts.`);
