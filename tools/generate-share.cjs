/* WYK — générateur des pages de partage produit (aperçu WhatsApp / Facebook / Messenger / iMessage…)
 *
 * Pour chaque produit actif du catalogue, crée :
 *   produit/<id>.html   page légère avec les balises Open Graph (titre, prix, description, image)
 *                       -> adresse partagée : https://wykht.com/produit/<id>
 *                       -> les visiteurs sont renvoyés tout de suite vers /?p=<id> (la vraie fiche)
 *   og/<id>.jpg         image de partage 1200x630 : photo, nom, prix, promo, bouton WhatsApp
 * et supprime les fichiers des produits retirés. Seuls les produits modifiés sont regénérés.
 *
 * Lancement : node tools/generate-share.cjs        (automatique via .github/workflows/share-pages.yml)
 * Test local : CATALOG_FILE=catalog.json node tools/generate-share.cjs
 * Image par défaut du site (og/default.png) : node tools/generate-share.cjs --default
 */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
function getChromium() {
  try { return require('playwright').chromium; }
  catch (e) { return require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright').chromium; }
}

const ROOT = path.join(__dirname, '..');
const SITE = 'https://wykht.com';
const SUPA = 'https://byrklytqoucdskzvcoau.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cmtseXRxb3VjZHNrenZjb2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTQ0ODcsImV4cCI6MjA5NDI3MDQ4N30.nH7LKYevuBd9jGmFmv7KMNoJu3X_rDaY1BHXZR1v3wM';
const WA = '50940300966';
const PDIR = path.join(ROOT, 'produit'), ODIR = path.join(ROOT, 'og');
const MANIFEST = path.join(ODIR, 'manifest.json');

const clean = t => String(t == null ? '' : t).replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/[ \t]{2,}/g, ' ').trim();
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n).toLocaleString('fr').replace(/[\u202f\u00a0]/g, ' ') + ' HTG';
const cut = (t, n) => { t = String(t).replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; };
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);

async function loadCatalog() {
  if (process.env.CATALOG_FILE) return JSON.parse(fs.readFileSync(process.env.CATALOG_FILE, 'utf8'));
  try {
    const r = await fetch(SUPA + '/storage/v1/object/public/public-data/catalog.json', { cache: 'no-store' });
    if (r.ok) { const j = await r.json(); if (j && Array.isArray(j.products)) return j; }
  } catch (e) { console.warn('catalog.json indisponible, essai direct sur la base :', e.message); }
  const r = await fetch(SUPA + '/rest/v1/products?select=*,categories(*),product_images(url,position)&active=eq.true', { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } });
  if (!r.ok) throw new Error('Impossible de lire le catalogue (' + r.status + ')');
  return { products: await r.json() };
}

function norm(p) {
  const imgs = (p.product_images || []).slice().sort((a, b) => (a.position || 0) - (b.position || 0)).map(i => i.url).filter(Boolean);
  const all = imgs.length ? imgs : (p._imgs || []);
  const price = Number(p.price), old = Number(p.old_price) || 0, off = old > price ? Math.round((1 - price / old) * 100) : 0;
  const b = p.badge, badge = off ? '-' + off + '%' : b === 'new' ? 'NOUVEAU' : b === 'promo' ? 'PROMO' : (b === 'pop' || b === 'popular') ? 'POPULAIRE' : '';
  const cat = p.categories || p.cat || null;
  return {
    id: String(p.id), name: clean(p.name) || 'Produit WYK', price, old: off ? old : 0, off, badge,
    cat: cat ? clean(cat.name) : '', desc: clean(p.description || ''), img: all[0] || '',
    stock: p.stock == null ? null : Number(p.stock)
  };
}

async function toDataUri(url) {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(r.status);
    const type = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
    return 'data:' + type + ';base64,' + Buffer.from(await r.arrayBuffer()).toString('base64');
  } catch (e) { console.warn('  image illisible :', url, e.message); return ''; }
}

const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Inter:wght@500;600;700&display=swap">';
const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{font-family:'Inter',system-ui,sans-serif;background:#0d0d0c;color:#fff;position:relative;-webkit-font-smoothing:antialiased}
.fd{font-family:'Bricolage Grotesque','Inter',system-ui,sans-serif;letter-spacing:-.025em}
.glow{position:absolute;inset:0;background:radial-gradient(620px 420px at 100% 0%,rgba(232,25,44,.38),transparent 70%),radial-gradient(520px 380px at 0% 100%,rgba(245,200,66,.10),transparent 70%)}
.logo{font-size:54px;font-weight:800;line-height:1}.logo b{color:#e8192c;font-weight:800}
.grain{position:absolute;inset:0;background:linear-gradient(135deg,#141413 0%,#0d0d0c 55%,#1a0e10 100%)}`;

function productHtml(p, photo) {
  const nameSize = p.name.length > 52 ? 46 : p.name.length > 34 ? 56 : 70;
  const stockTxt = p.stock != null && p.stock <= 0 ? 'Rupture de stock' : p.stock != null && p.stock <= 5 ? 'Plus que ' + p.stock + ' en stock' : 'En stock';
  const stockCol = p.stock != null && p.stock <= 0 ? '#ff6b78' : p.stock != null && p.stock <= 5 ? '#f5c842' : '#3ddc84';
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
.left{position:absolute;left:0;top:0;width:610px;height:630px;overflow:hidden;background:#1b1b19}
.left .bg{position:absolute;inset:-40px;background:center/cover no-repeat;filter:blur(30px) saturate(1.2) brightness(.6);transform:scale(1.15)}
.left .card{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.left .card img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 12px 30px rgba(0,0,0,.45))}
.left .card .ph{font-size:150px;opacity:.15;color:#000}
.badge{position:absolute;left:26px;top:26px;background:linear-gradient(120deg,#e8192c,#ff4b5c);color:#fff;font-weight:800;font-size:34px;letter-spacing:.02em;padding:12px 24px;border-radius:40px;box-shadow:0 8px 22px rgba(232,25,44,.5)}
.right{position:absolute;left:610px;top:0;right:0;bottom:0;padding:44px 44px 40px 38px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between}
.pill{font-size:23px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#ffb3ba;background:rgba(232,25,44,.16);border:1px solid rgba(232,25,44,.4);padding:8px 18px;border-radius:30px;max-width:330px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
h1{font-size:${nameSize}px;font-weight:800;line-height:1.04;margin-top:30px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.price{margin-top:auto;display:flex;align-items:baseline;gap:18px;flex-wrap:wrap}
.price b{font-size:84px;font-weight:800;line-height:1;color:#fff}
.price s{font-size:32px;color:rgba(255,255,255,.5);font-weight:500}
.stock{margin-top:14px;font-size:27px;font-weight:600;color:${stockCol};display:flex;align-items:center;gap:10px}
.stock i{width:13px;height:13px;border-radius:50%;background:${stockCol};box-shadow:0 0 12px ${stockCol}}
.cta{margin-top:26px;display:flex;align-items:center;justify-content:space-between}
.wa{background:#25d366;color:#04230f;font-weight:700;font-size:29px;padding:17px 30px;border-radius:50px;display:flex;align-items:center;gap:12px;white-space:nowrap;box-shadow:0 10px 28px rgba(37,211,102,.35)}
.wa svg{width:34px;height:34px}
.url{font-size:23px;font-weight:600;color:rgba(255,255,255,.55);letter-spacing:.02em}
</style></head><body><div class="grain"></div><div class="glow"></div>
<div class="left"><div class="bg" style="${photo ? 'background-image:url(' + photo + ')' : ''}"></div>
<div class="card">${photo ? '<img src="' + photo + '" alt="">' : '<div class="ph fd">WYK</div>'}</div>${p.badge ? '<div class="badge">' + esc(p.badge) + '</div>' : ''}</div>
<div class="right"><div class="top"><div class="logo fd">W<b>YK</b></div>${p.cat ? '<div class="pill">' + esc(p.cat) + '</div>' : ''}</div>
<h1 class="fd">${esc(p.name)}</h1>
<div class="price"><b class="fd">${esc(fmt(p.price))}</b>${p.old ? '<s>' + esc(fmt(p.old)) + '</s>' : ''}</div>
<div class="stock"><i></i>${stockTxt}</div>
<div class="cta"><div class="wa"><svg viewBox="0 0 24 24" fill="#04230f"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7a11.4 11.4 0 01-4.7-4.1c-.4-.5-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.900 1.200 2.200 1.300.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.300z"/></svg>Commander sur WhatsApp</div></div></div>
</body></html>`;
}

function defaultHtml() {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
.wrap{position:absolute;inset:0;padding:56px 80px 52px;display:flex;flex-direction:column}
.logo{font-size:96px}
.tag{margin-top:26px;font-size:28px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:#ff7482}
h1{margin-top:16px;font-size:78px;font-weight:800;line-height:1.02;max-width:900px}
h1 em{font-style:normal;color:#e8192c}
.sub{margin-top:20px;font-size:28px;color:rgba(255,255,255,.66);max-width:860px;line-height:1.35}
.foot{margin-top:auto;display:flex;align-items:center;gap:18px}
.wa{background:#25d366;color:#04230f;font-weight:700;font-size:26px;padding:15px 30px;border-radius:50px}
.url{font-size:26px;font-weight:600;color:rgba(255,255,255,.6)}
.ring{position:absolute;right:-170px;top:60px;width:560px;height:560px;border-radius:50%;border:2px solid rgba(255,255,255,.12)}
.ring.r2{right:-60px;top:170px;width:340px;height:340px;border-color:rgba(232,25,44,.45);background:radial-gradient(circle,rgba(232,25,44,.22),transparent 70%)}
</style></head><body><div class="grain"></div><div class="glow"></div><div class="ring"></div><div class="ring r2"></div>
<div class="wrap"><div class="logo fd">W<b>YK</b></div><div class="tag">Boutique en ligne · Haïti</div>
<h1 class="fd">Faites vos achats <em>autrement.</em></h1>
<div class="sub">Produits, alimentation, abonnements et services. Commandez sur WhatsApp, payez en gourdes.</div>
<div class="foot"><div class="wa">Commander sur WhatsApp</div><div class="url">wykht.com</div></div></div>
</body></html>`;
}

function productPage(p) {
  const url = SITE + '/produit/' + encodeURIComponent(p.id), img = SITE + '/og/' + encodeURIComponent(p.id) + '.jpg';
  const title = p.name + ' — ' + fmt(p.price) + ' | WYK';
  const bits = [fmt(p.price) + (p.old ? ' (au lieu de ' + fmt(p.old) + ')' : '')];
  if (p.cat) bits.push(p.cat);
  const desc = cut(bits.join(' · ') + (p.desc ? ' — ' + p.desc : ' — Commandez sur WhatsApp, livraison en Haïti.'), 200);
  const real = SITE + '/?p=' + encodeURIComponent(p.id);
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: p.img || img, description: p.desc || p.name, offers: { '@type': 'Offer', price: String(p.price), priceCurrency: 'HTG', url: real, availability: p.stock != null && p.stock <= 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' } };
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${esc(real)}">
<meta property="og:site_name" content="WYK">
<meta property="og:type" content="product">
<meta property="og:locale" content="fr_HT">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(p.name + ' — ' + fmt(p.price))}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:secure_url" content="${esc(img)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(p.name)}">
<meta property="product:price:amount" content="${esc(p.price)}">
<meta property="product:price:currency" content="HTG">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.name + ' — ' + fmt(p.price))}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<script>location.replace('/?p='+${JSON.stringify(encodeURIComponent(p.id))}+location.hash)</script>
<style>body{font-family:system-ui,sans-serif;background:#0d0d0c;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px}a{color:#ff7482}</style>
</head>
<body>
<main>
<h1>${esc(p.name)}</h1>
<p>${esc(bits.join(' · '))}</p>
<p><a href="${esc('/?p=' + encodeURIComponent(p.id))}">Voir le produit sur WYK</a></p>
</main>
</body>
</html>
`;
}

(async () => {
  fs.mkdirSync(PDIR, { recursive: true }); fs.mkdirSync(ODIR, { recursive: true });
  let browser, page;
  async function shot(html, out) {
    if (!browser) {
      browser = await getChromium().launch();
      page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
    }
    await page.setContent(html, { waitUntil: 'load' });
    try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
    await page.waitForTimeout(250);
    await page.screenshot(Object.assign({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } }, out.endsWith('.jpg') ? { type: 'jpeg', quality: 84 } : {}));
  }

  if (process.argv.includes('--default')) {
    await shot(defaultHtml(), path.join(ODIR, 'default.png'));
    console.log('og/default.png créé'); await browser.close(); return;
  }

  const cat = await loadCatalog();
  const prods = (cat.products || []).filter(p => p && p.id != null && p.active !== false).map(norm).filter(p => isFinite(p.price));
  let man = {}; try { man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) {}
  const next = {}, todo = [];
  for (const p of prods) {
    const h = sha(JSON.stringify(p) + '|v3');
    next[p.id] = h;
    if (!(man[p.id] === h && fs.existsSync(path.join(ODIR, p.id + '.jpg')) && fs.existsSync(path.join(PDIR, p.id + '.html')))) todo.push(p);
  }
  const goneIds = Object.keys(man).filter(id => !next[id]);

  /* --plan : n'affiche que le nombre de changements à faire (sert au workflow pour éviter d'installer Chromium pour rien) */
  if (process.argv.includes('--plan')) { console.log(todo.length + goneIds.length); return; }

  for (const p of todo) {
    console.log('→', p.id, p.name);
    const photo = await toDataUri(p.img);
    await shot(productHtml(p, photo), path.join(ODIR, p.id + '.jpg'));
    fs.writeFileSync(path.join(PDIR, p.id + '.html'), productPage(p));
  }
  for (const id of goneIds)
    for (const f of [path.join(ODIR, id + '.jpg'), path.join(PDIR, id + '.html')]) try { fs.unlinkSync(f); } catch (e) {}
  /* anciennes images .png (trop lourdes pour WhatsApp) : supprimées, sauf l'image par défaut */
  for (const f of fs.readdirSync(ODIR)) if (f.endsWith('.png') && f !== 'default.png') try { fs.unlinkSync(path.join(ODIR, f)); } catch (e) {}
  fs.writeFileSync(MANIFEST, JSON.stringify(next, null, 1) + '\n');
  if (browser) await browser.close();
  console.log(`Produits : ${prods.length} · générés ${todo.length} · inchangés ${prods.length - todo.length} · supprimés ${goneIds.length}`);
})().catch(e => { console.error(e); process.exit(1); });
