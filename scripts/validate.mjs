import fs from 'node:fs';
import { APPS } from '../src/apps.js';
import { renderSite } from '../src/site.js';

const worker = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
const wrangler = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const cutover = fs.readFileSync(new URL('./cutover-route.mjs', import.meta.url), 'utf8');
const site = renderSite(APPS);

for (const marker of ['ZEAZDEV Company Limited','0125566009876','88/99 Moo 4','CREATE','WORK','BUILD','ca-pub-4971034675329740','data-th','one.zeaz.dev','www.zeaz.dev']) {
  if (!site.includes(marker)) throw new Error(`Missing site marker: ${marker}`);
}
for (const marker of ['/health','/api/apps','/api/company','/privacy','/terms','/contact','/ads.txt','/.well-known/security.txt','Content-Security-Policy']) {
  if (!worker.includes(marker)) throw new Error(`Missing Worker marker: ${marker}`);
}
for (const marker of ['name = "zeaz-web"','workers_dev = false']) {
  if (!wrangler.includes(marker)) throw new Error(`Missing Wrangler marker: ${marker}`);
}
for (const marker of ["ROUTE_PATTERN = 'www.zeaz.dev/*'", "TARGET_SCRIPT = 'zeaz-web'", 'workers/routes', 'rolling the route back']) {
  if (!cutover.includes(marker)) throw new Error(`Missing route cutover marker: ${marker}`);
}
if (/^\s*routes?\s*=/m.test(wrangler)) {
  throw new Error('Production route must be managed by scripts/cutover-route.mjs, not wrangler.toml.');
}
if (APPS.length !== 27) throw new Error(`Expected 27 apps, found ${APPS.length}`);
for (const app of APPS) if (!site.includes(app.url)) throw new Error(`App missing from rendered UI: ${app.url}`);
const publisherMatches = site.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-4971034675329740/g) || [];
if (publisherMatches.length !== 1) throw new Error(`Expected one AdSense loader, found ${publisherMatches.length}`);
console.log(`Validation passed: ${APPS.length} apps, UI/API parity, corporate/security/deploy markers present.`);
