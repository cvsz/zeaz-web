import { APPS } from './apps.js';
import { renderSite } from './site.js';

const SITE_ORIGIN = 'https://www.zeaz.dev';
const COMPANY = Object.freeze({
  legalName: 'ZEAZDEV Company Limited',
  taxId: '0125566009876',
  email: 'hello@zeaz.dev',
  businessEmail: 'business@zeaz.dev',
  phone: '+66 (0) 2 026 3588',
  address: '88/99 Moo 4, Chaengwattana Road, Khlong Kluea, Pak Kret, Nonthaburi 11120, Thailand',
  country: 'TH'
});

const PAGE_CONTENT = {
  '/about': ['About ZEAZDEV','เกี่ยวกับ ZEAZDEV','ZEAZDEV Company Limited is a Thailand-based technology company building AI systems, software platforms, cloud infrastructure, automation and digital products for real-world business operations.','ZEAZDEV Company Limited เป็นบริษัทเทคโนโลยีในประเทศไทยที่พัฒนาระบบ AI แพลตฟอร์มซอฟต์แวร์ โครงสร้างพื้นฐานคลาวด์ ระบบอัตโนมัติ และผลิตภัณฑ์ดิจิทัลสำหรับการใช้งานจริงในธุรกิจ'],
  '/services': ['Technology Services','บริการด้านเทคโนโลยี','Our capabilities span AI and automation, software engineering, APIs, cloud architecture, deployment automation, observability, secure connectivity and enterprise platform development.','ความเชี่ยวชาญของเราครอบคลุม AI และ Automation วิศวกรรมซอฟต์แวร์ API สถาปัตยกรรมคลาวด์ Deployment Automation Observability การเชื่อมต่อที่ปลอดภัย และการพัฒนาแพลตฟอร์มสำหรับองค์กร'],
  '/technology': ['Technology','เทคโนโลยี','ZEAZDEV engineers production systems with an emphasis on security, reliability, maintainability, automation and measurable operational outcomes.','ZEAZDEV ออกแบบและพัฒนาระบบ Production โดยให้ความสำคัญกับความปลอดภัย ความเชื่อถือได้ การดูแลรักษา Automation และผลลัพธ์ที่วัดผลได้ในการปฏิบัติงาน'],
  '/partners': ['Partners','พันธมิตร',`For technology, distribution, enterprise and product partnerships, contact ${COMPANY.businessEmail}.`,`สำหรับความร่วมมือด้านเทคโนโลยี การจัดจำหน่าย องค์กร และผลิตภัณฑ์ ติดต่อ ${COMPANY.businessEmail}`],
  '/developers': ['Developers','สำหรับนักพัฒนา','ZEAZDEV develops APIs, AI runtimes, automation systems and software platforms across the ZEAZ ecosystem.','ZEAZDEV พัฒนา API, AI Runtime, ระบบ Automation และแพลตฟอร์มซอฟต์แวร์ภายใน ZEAZ ecosystem']
};

function securityHeaders(nonce) {
  return {
    'Content-Security-Policy': `default-src 'self'; object-src 'none'; base-uri 'self'; script-src 'nonce-${nonce}' 'strict-dynamic' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-src https:; frame-ancestors 'none'; form-action 'self' mailto:`,
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site'
  };
}

function respond(request, body, options = {}) {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const headers = new Headers(options.headers || {});
  for (const [key, value] of Object.entries(securityHeaders(nonce))) headers.set(key, value);
  const rendered = typeof body === 'string' ? body.replaceAll('__CSP_NONCE__', nonce) : body;
  return new Response(request.method === 'HEAD' ? null : rendered, { ...options, headers });
}

function html(request, body, status = 200, cache = true) {
  return respond(request, body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cache ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' : 'no-store' } });
}
function text(request, body, type = 'text/plain; charset=utf-8', cache = 'public, max-age=3600') {
  return respond(request, body, { headers: { 'Content-Type': type, 'Cache-Control': cache } });
}
function json(request, data, cache = 'public, max-age=60, s-maxage=300', type = 'application/json; charset=utf-8') {
  return respond(request, JSON.stringify(data, null, 2), { headers: { 'Content-Type': type, 'Cache-Control': cache, 'Access-Control-Allow-Origin': '*' } });
}
function facts() {
  return `<div class="facts"><b>Legal name</b><span>${COMPANY.legalName}</span><b>Tax ID</b><span>${COMPANY.taxId}</span><b>Registered office</b><span>${COMPANY.address}</span><b>Phone</b><span>${COMPANY.phone}</span><b>Email</b><span><a href="mailto:${COMPANY.email}">${COMPANY.email}</a></span></div>`;
}
function page(title, titleTh, body, bodyTh, extra = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#05070b"><meta name="google-adsense-account" content="ca-pub-4971034675329740"><meta name="description" content="${body}"><title>${title} — ZEAZDEV Company Limited</title><script nonce="__CSP_NONCE__" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4971034675329740" crossorigin="anonymous"></script><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#05070b;color:#f7f9fc;font-family:Inter,"Noto Sans Thai","Segoe UI",system-ui,sans-serif;line-height:1.75}.w{width:min(calc(100% - 36px),980px);margin:auto}header{border-bottom:1px solid rgba(255,255,255,.12)}nav{min-height:72px;display:flex;align-items:center;justify-content:space-between}a{color:#65e6ff;text-decoration:none}main{padding:76px 0 110px}.eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#65e6ff;font-weight:800}h1{font-size:clamp(44px,8vw,74px);line-height:1.02;letter-spacing:-.045em;margin:12px 0}h2{font-size:26px;color:#dce5ef}.box{margin-top:30px;padding:30px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:rgba(255,255,255,.04)}p{color:#aab5c5;font-size:17px}.facts{display:grid;grid-template-columns:170px 1fr;gap:10px 20px;margin-top:22px}.facts b{color:#cbd6e4}.facts span{color:#98a7bb}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-flex;padding:10px 16px;border:1px solid rgba(255,255,255,.14);border-radius:12px;color:white}.primary{background:white;color:#07101a}@media(max-width:640px){.facts{grid-template-columns:1fr}}</style></head><body><header><nav class="w"><a href="/">ZEAZDEV</a><a href="/">← Home / หน้าแรก</a></nav></header><main class="w"><div class="eyebrow">${COMPANY.legalName}</div><h1>${title}</h1><h2>${titleTh}</h2><div class="box"><p>${body}</p><p lang="th">${bodyTh}</p>${extra}</div></main></body></html>`;
}

const PRIVACY = page('Privacy Policy','นโยบายความเป็นส่วนตัว','This corporate website is designed for public information and does not require an account. Basic technical logs may be processed by infrastructure and security providers to operate, secure and monitor the service.','เว็บไซต์บริษัทนี้จัดทำขึ้นเพื่อเผยแพร่ข้อมูลสาธารณะและไม่จำเป็นต้องมีบัญชีผู้ใช้ ผู้ให้บริการโครงสร้างพื้นฐานและความปลอดภัยอาจประมวลผลบันทึกทางเทคนิคพื้นฐานเพื่อให้บริการ รักษาความปลอดภัย และติดตามระบบ',facts());
const TERMS = page('Terms of Use','ข้อกำหนดการใช้งาน','Information on this website is provided for general corporate and product information. Product specifications, availability, pricing, roadmaps and launch dates may change before commercial release.','ข้อมูลบนเว็บไซต์นี้จัดทำเพื่อข้อมูลบริษัทและผลิตภัณฑ์โดยทั่วไป รายละเอียดผลิตภัณฑ์ การวางจำหน่าย ราคา Roadmap และวันเปิดตัวอาจเปลี่ยนแปลงก่อนการจำหน่ายเชิงพาณิชย์',facts());
const CONTACT = page('Contact ZEAZDEV','ติดต่อ ZEAZDEV','Contact ZEAZDEV Company Limited for business partnerships, technology projects, product enquiries and corporate communication.','ติดต่อ ZEAZDEV Company Limited สำหรับพันธมิตรทางธุรกิจ โครงการเทคโนโลยี สอบถามผลิตภัณฑ์ และการติดต่อบริษัท',facts()+`<div class="actions"><a class="btn primary" href="mailto:${COMPANY.businessEmail}">${COMPANY.businessEmail}</a><a class="btn" href="mailto:${COMPANY.email}">${COMPANY.email}</a></div>`);
const ZEAZ_ONE = page('ZEAZ One','ZEAZ One สำหรับธุรกิจ','ZEAZ One is a secure premium business smartphone concept under development, designed around productivity, privacy, dependable connectivity and a long software and security lifecycle.','ZEAZ One เป็นแนวคิดสมาร์ตโฟนธุรกิจระดับพรีเมียมที่อยู่ระหว่างการพัฒนา โดยเน้น Productivity ความเป็นส่วนตัว การเชื่อมต่อที่เชื่อถือได้ และวงจรการสนับสนุนซอฟต์แวร์และความปลอดภัยระยะยาว',`<div class="actions"><a class="btn primary" href="https://one.zeaz.dev/">Visit one.zeaz.dev</a><a class="btn" href="mailto:${COMPANY.businessEmail}">Business enquiry</a></div>`);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (!['GET', 'HEAD'].includes(request.method)) return respond(request, 'Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

    if (path === '/health' || path === '/healthz' || path === '/api/status') return json(request, { status: 'ok', service: 'zeaz-web', runtime: 'standalone', version: '1.0.0', company: COMPANY.legalName, canonical: SITE_ORIGIN, apps: APPS.length, timestamp: new Date().toISOString() }, 'no-store');
    if (path === '/api/apps' || path === '/apps-public-url-list.json') return json(request, { count: APPS.length, apps: APPS });
    if (path === '/api/company') return json(request, { ...COMPANY, website: SITE_ORIGIN });
    if (path === '/robots.txt') return text(request, `User-agent: *\nAllow: /\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
    if (path === '/ads.txt') return text(request, 'google.com, pub-4971034675329740, DIRECT, f08c47fec0942fa0\n');
    if (path === '/.well-known/security.txt') return text(request, `Contact: mailto:${COMPANY.email}\nCanonical: ${SITE_ORIGIN}/.well-known/security.txt\nExpires: 2027-09-09T00:00:00.000Z\nPreferred-Languages: th, en\nPolicy: https://github.com/cvsz/zeaz-web/blob/main/SECURITY.md\n`);
    if (path === '/sitemap.xml') {
      const routes = ['/','/about','/services','/technology','/partners','/developers','/privacy','/terms','/contact','/products/zeaz-one'];
      return text(request, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${SITE_ORIGIN}${route}</loc></url>`).join('')}</urlset>`, 'application/xml; charset=utf-8');
    }
    if (path === '/manifest.webmanifest') return json(request, { name: 'ZEAZDEV', short_name: 'ZEAZDEV', start_url: '/', display: 'standalone', background_color: '#05070b', theme_color: '#05070b' }, 'public, max-age=3600', 'application/manifest+json; charset=utf-8');
    if (path === '/') return html(request, renderSite(APPS));
    if (PAGE_CONTENT[path]) { const [enTitle, thTitle, enBody, thBody] = PAGE_CONTENT[path]; return html(request, page(enTitle, thTitle, enBody, thBody)); }
    if (path === '/privacy') return html(request, PRIVACY);
    if (path === '/terms') return html(request, TERMS);
    if (path === '/contact') return html(request, CONTACT);
    if (path === '/products/zeaz-one') return html(request, ZEAZ_ONE);
    return html(request, page('Page not found','ไม่พบหน้านี้','The requested page does not exist.','ไม่พบหน้าที่คุณต้องการ'),404,false);
  }
};
