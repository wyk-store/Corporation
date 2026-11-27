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
const LDIR = path.join(ROOT, 'livre'), BMANIFEST = path.join(ODIR, 'livres-manifest.json');

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

const slugify = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
function productPage(p, related) {
  related = related || [];
  const url = SITE + '/produit/' + encodeURIComponent(p.id), img = SITE + '/og/' + encodeURIComponent(p.id) + '.jpg';
  const shop = SITE + '/?p=' + encodeURIComponent(p.id);
  const title = cut(p.name + ' — ' + fmt(p.price) + ' | WYK Haïti', 70);
  const bits = [fmt(p.price) + (p.old ? ' (au lieu de ' + fmt(p.old) + ')' : '')];
  if (p.cat) bits.push(p.cat);
  const desc = cut(p.name + ' chez WYK HT (WYK Haïti) : ' + bits.join(' · ') + (p.desc ? ' — ' + p.desc : '') + '. Commandez sur WhatsApp, livraison en Haïti.', 300);
  const catUrl = p.cat ? SITE + '/categorie?c=' + encodeURIComponent(slugify(p.cat)) : '';
  const wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Bonjour WYK, je veux commander : ' + p.name + ' (' + fmt(p.price) + ') ' + url);
  const inStock = !(p.stock != null && p.stock <= 0);
  const offer = { '@type': 'Offer', url, price: String(p.price), priceCurrency: 'HTG', availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', seller: { '@type': 'Organization', name: 'WYK', alternateName: ['WYK HT', 'WYKHT'], url: SITE + '/' } };
  const ld = { '@context': 'https://schema.org', '@type': 'Product', '@id': url + '#product', url, name: p.name, sku: p.id, image: [p.img, img].filter(Boolean), description: p.desc || (p.name + ' — disponible chez WYK HT, boutique en ligne à Carrefour (Haïti).'), brand: { '@type': 'Brand', name: 'WYK' }, offers: offer };
  if (p.cat) ld.category = p.cat;
  const crumbs = [['Accueil', SITE + '/']]; if (p.cat) crumbs.push([p.cat, catUrl]); crumbs.push([p.name, url]);
  const bc = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: c[1] })) };
  const J = o => JSON.stringify(o).replace(/</g, '\\u003c');
  const rel = related.length ? `<section class="rel"><h2>Autres produits WYK HT${p.cat ? ' — ' + esc(p.cat) : ''}</h2><ul>${related.map(r => `<li><a href="/produit/${esc(encodeURIComponent(r.id))}">${esc(r.name)}</a> <span>${esc(fmt(r.price))}</span></li>`).join('')}</ul></section>` : '';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${esc(url)}">
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
<link rel="icon" type="image/png" href="${SITE}/assets/brand/wyk-icon.png">
<script type="application/ld+json">${J(ld)}</script>
<script type="application/ld+json">${J(bc)}</script>
<style>:root{--bg:#f6f5f2;--card:#fff;--ink:#101010;--mut:rgba(16,16,16,.62);--red:#e8192c;--line:rgba(128,128,128,.22)}@media(prefers-color-scheme:dark){:root{--bg:#0d0d0c;--card:#181817;--ink:#f4f4f2;--mut:rgba(244,244,242,.62);--line:rgba(255,255,255,.12)}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55}
a{color:inherit}.w{max-width:880px;margin:0 auto;padding:18px 18px 48px}
nav.bc{font-size:12.5px;color:var(--mut);margin-bottom:16px}nav.bc a{text-decoration:none}nav.bc a:hover{color:var(--red)}
.card{background:var(--card);border:1px solid var(--line);border-radius:22px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr}
.ph{background:#8883;display:flex;align-items:center;justify-content:center;min-height:260px}.ph img{width:100%;height:100%;max-height:520px;object-fit:contain;display:block}
.in{padding:24px;display:flex;flex-direction:column;gap:10px}h1{font-size:clamp(22px,4vw,30px);line-height:1.2;margin:0}
.pr{font-size:26px;font-weight:800}.pr s{font-size:15px;font-weight:600;color:var(--mut);margin-left:8px}
.cat{font-size:12.5px;font-weight:700;color:var(--red);text-decoration:none}.d{white-space:pre-line;color:var(--mut);font-size:14.5px;margin:0}
.b{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}.b a{padding:12px 20px;border-radius:30px;font-weight:700;font-size:14px;text-decoration:none;border:1px solid var(--line)}.b a.wa{background:#25d366;color:#04230f;border-color:#25d366}
.rel{margin-top:28px}.rel h2{font-size:15px;margin:0 0 8px}.rel ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}.rel li{font-size:14px;display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--line);padding:6px 0}.rel li span{color:var(--mut);white-space:nowrap}
.f{margin-top:28px;font-size:12.5px;color:var(--mut)}@media(max-width:640px){.card{grid-template-columns:1fr}}</style>
</head>
<body>
<div class="w">
<nav class="bc" aria-label="Fil d'Ariane"><a href="/">WYK Haïti</a>${p.cat ? ' › <a href="' + esc('/categorie?c=' + encodeURIComponent(slugify(p.cat))) + '">' + esc(p.cat) + '</a>' : ''} › ${esc(p.name)}</nav>
<main>
<article class="card">
<div class="ph">${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.name + ' — WYK HT Haïti')}" width="600" height="600" decoding="async">` : ''}</div>
<div class="in">
${p.cat ? `<a class="cat" href="${esc('/categorie?c=' + encodeURIComponent(slugify(p.cat)))}">${esc(p.cat)}</a>` : ''}
<h1>${esc(p.name)}</h1>
<div class="pr">${esc(fmt(p.price))}${p.old ? ` <s>${esc(fmt(p.old))}</s>` : ''}</div>
${p.desc ? `<p class="d">${esc(p.desc)}</p>` : ''}
<p class="d">${inStock ? 'Disponible chez WYK HT (WYK Haïti), boutique en ligne à Carrefour. Prix en gourdes (HTG), livraison en Haïti précisée avec vous avant l\u2019expédition.' : 'Actuellement indisponible. Écrivez-nous sur WhatsApp pour connaître le retour en stock.'}</p>
<div class="b"><a class="wa" href="${esc(wa)}" target="_blank" rel="noopener">Commander sur WhatsApp</a><a href="${esc('/?p=' + encodeURIComponent(p.id))}">Voir dans la boutique</a></div>
</div>
</article>
${rel}
<p class="f">WYK (WYK HT, WYKHT) — boutique en ligne haïtienne à Carrefour. <a href="/">Accueil</a> · <a href="/categories">Catégories</a> · <a href="/apropos">À propos</a> · <a href="https://www.instagram.com/wykht.co/" target="_blank" rel="noopener">Instagram @wykht.co</a></p>
</main>
</div>
</body>
</html>
`;
}


/* ───────── Ebook : une page de partage + une image par livre (livre/<id>.html, og/livre-<id>.jpg) ─────────
   Les livres sont enregistrés dans site_pages (slug « ebook-data »). Le lien à partager est
   https://wykht.com/livre/<id> : les réseaux y lisent la couverture, les visiteurs sont renvoyés vers /ebook#l-<id>. */
const TYPES = { book: 'Livre', bd: 'Bande dessinée', manga: 'Manga' };
async function loadBooks() {
  try {
    let j;
    if (process.env.EBOOK_FILE) j = JSON.parse(fs.readFileSync(process.env.EBOOK_FILE, 'utf8'));
    else {
      const r = await fetch(SUPA + '/rest/v1/site_pages?slug=eq.ebook-data&select=content', { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const rows = await r.json();
      j = rows && rows[0] && rows[0].content ? JSON.parse(rows[0].content) : { books: [] };
    }
    const list = (j.books || []).filter(b => b && !b.demo && b.active !== false && /^[A-Za-z0-9_-]{3,40}$/.test(String(b.id || '')) && clean(b.title)).map(normBook);
    return { ok: true, list };
  } catch (e) { console.warn('Livres indisponibles (les pages existantes sont conservées) :', e.message); return { ok: false, list: [] }; }
}
function normBook(b) {
  const price = Number(b.price) || 0, old = Number(b.old) || 0;
  return {
    id: String(b.id), type: TYPES[b.type] ? b.type : 'book', title: clean(b.title), author: clean(b.author || ''), series: clean(b.series || ''), tome: clean(b.tome || ''),
    price, old: old > price ? old : 0, cover: String(b.cover || ''), color: /^#[0-9a-f]{3,8}$/i.test(b.color || '') ? b.color : '#1f3a5f',
    summary: clean(b.summary || ''), read: !!(b.rd && b.pdf), pages: Number(b.pages) || 0, year: clean(b.year || '')
  };
}
function bookImgHtml(b, photo) {
  const nameSize = b.title.length > 48 ? 46 : b.title.length > 28 ? 58 : 72;
  const price = b.price ? esc(fmt(b.price)) : 'Gratuit';
  const ser = b.series ? b.series + (b.tome ? ' · Tome ' + b.tome : '') : '', sub = [ser, b.author && b.author !== b.series ? b.author : ''].filter(Boolean).join(' — ');
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
.bg{position:absolute;inset:-60px;background:${photo ? 'center/cover url(' + photo + ')' : b.color};filter:blur(34px) saturate(1.25) brightness(.55);transform:scale(1.15)}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.15),rgba(0,0,0,.62) 55%,rgba(0,0,0,.78))}
.cv{position:absolute;left:70px;top:50px;width:430px;height:530px;display:flex;align-items:center;justify-content:center}
.cv img,.cv .ph{max-width:100%;max-height:100%;border-radius:5px 12px 12px 5px;box-shadow:-6px 0 0 rgba(255,255,255,.18),0 30px 60px rgba(0,0,0,.6),0 8px 18px rgba(0,0,0,.4)}
.cv .ph{width:360px;height:520px;background:${b.color};display:flex;align-items:center;justify-content:center;padding:34px;text-align:center;font-size:44px;font-weight:800;line-height:1.1;color:#fff}
.right{position:absolute;left:560px;right:56px;top:0;bottom:0;padding:46px 0 42px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between}
.pill{font-size:22px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#ffe3a3;background:rgba(245,200,66,.16);border:1px solid rgba(245,200,66,.45);padding:8px 18px;border-radius:30px}
h1{font-size:${nameSize}px;font-weight:800;line-height:1.05;margin-top:34px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.au{margin-top:16px;font-size:31px;font-weight:600;color:rgba(255,255,255,.78);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pr{margin-top:auto;display:flex;align-items:baseline;gap:18px}
.pr b{font-size:78px;font-weight:800;line-height:1}.pr s{font-size:30px;color:rgba(255,255,255,.5)}
.cta{margin-top:24px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.bt{background:#fff;color:#111;font-weight:700;font-size:28px;padding:16px 30px;border-radius:50px;white-space:nowrap}
.url{font-size:23px;font-weight:600;color:rgba(255,255,255,.6);padding-left:6px}
</style></head><body><div class="bg"></div><div class="shade"></div>
<div class="cv">${photo ? '<img src="' + photo + '" alt="">' : '<div class="ph fd">' + esc(b.title) + '</div>'}</div>
<div class="right"><div class="top"><div class="logo fd">W<b>YK</b></div><div class="pill">${esc(TYPES[b.type])}</div></div>
<h1 class="fd">${esc(b.title)}</h1>${sub ? '<div class="au">' + esc(sub) + '</div>' : ''}
<div class="pr"><b class="fd">${price}</b>${b.old ? '<s>' + esc(fmt(b.old)) + '</s>' : ''}</div>
<div class="cta"><div class="bt">${b.price ? 'À découvrir sur WYK Ebook' : (b.read ? 'À lire gratuitement' : 'Gratuit sur WYK Ebook')}</div><div class="url">wykht.com/ebook</div></div></div>
</body></html>`;
}
function bookPage(b) {
  const url = SITE + '/livre/' + encodeURIComponent(b.id), img = SITE + '/og/livre-' + encodeURIComponent(b.id) + '.jpg', go = SITE + '/ebook#l-' + encodeURIComponent(b.id);
  const label = TYPES[b.type], by = b.author ? ' de ' + b.author : '';
  const title = cut(b.title + by + ' — ' + label + ' | WYK Ebook', 70);
  const priceTxt = b.price ? fmt(b.price) : 'Gratuit';
  const desc = cut(label + ' « ' + b.title + ' »' + by + ' — ' + priceTxt + ' sur WYK Ebook.' + (b.summary ? ' ' + b.summary : ''), 300);
  const ld = { '@context': 'https://schema.org', '@type': 'Book', '@id': url + '#book', url, name: b.title, image: [b.cover, img].filter(Boolean), description: b.summary || desc, inLanguage: 'fr' };
  if (b.author) ld.author = { '@type': 'Person', name: b.author };
  if (b.pages) ld.numberOfPages = b.pages;
  ld.offers = { '@type': 'Offer', url, price: String(b.price), priceCurrency: 'HTG', availability: 'https://schema.org/InStock' };
  const J = o => JSON.stringify(o).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${esc(url)}">
<meta property="og:site_name" content="WYK">
<meta property="og:type" content="book">
<meta property="og:locale" content="fr_HT">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(b.title + by + ' — ' + priceTxt)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:secure_url" content="${esc(img)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc('Couverture : ' + b.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(b.title + by + ' — ' + priceTxt)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="icon" type="image/png" href="${SITE}/assets/brand/wyk-icon.png">
<script type="application/ld+json">${J(ld)}</script>
<script>location.replace(${JSON.stringify('/ebook#l-' + b.id)})</script>
<style>:root{--bg:#f6f5f2;--card:#fff;--ink:#101010;--mut:rgba(16,16,16,.62);--line:rgba(128,128,128,.22)}@media(prefers-color-scheme:dark){:root{--bg:#0d0d0c;--card:#181817;--ink:#f4f4f2;--mut:rgba(244,244,242,.62);--line:rgba(255,255,255,.12)}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55}
.w{max-width:760px;margin:0 auto;padding:24px 18px 48px}.card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:22px;display:grid;grid-template-columns:200px 1fr;gap:22px;align-items:start}
.card img{width:100%;border-radius:6px 12px 12px 6px;box-shadow:0 14px 30px rgba(0,0,0,.28)}h1{font-size:clamp(22px,4vw,30px);line-height:1.2;margin:0 0 6px}.au{color:var(--mut);margin:0 0 10px}.pr{font-size:24px;font-weight:800;margin:0 0 12px}
.s{white-space:pre-line;color:var(--mut);font-size:14.5px;margin:0 0 16px}.bt{display:inline-block;padding:12px 22px;border-radius:30px;background:#e8192c;color:#fff;font-weight:700;text-decoration:none}
@media(max-width:560px){.card{grid-template-columns:1fr}.card img{max-width:220px}}</style>
</head>
<body>
<div class="w"><main><article class="card">
${b.cover ? `<img src="${esc(b.cover)}" alt="${esc('Couverture : ' + b.title)}" width="200" height="300" decoding="async">` : ''}
<div><h1>${esc(b.title)}</h1>${b.author ? `<p class="au">${esc(b.author)} · ${esc(label)}</p>` : `<p class="au">${esc(label)}</p>`}<p class="pr">${esc(priceTxt)}</p>${b.summary ? `<p class="s">${esc(cut(b.summary, 500))}</p>` : ''}<a class="bt" href="${esc('/ebook#l-' + b.id)}">Ouvrir dans WYK Ebook</a></div>
</article></main></div>
</body>
</html>
`;
}

(async () => {
  fs.mkdirSync(PDIR, { recursive: true }); fs.mkdirSync(ODIR, { recursive: true }); fs.mkdirSync(LDIR, { recursive: true });
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
  const relatedOf = p => prods.filter(q => q.id !== p.id && p.cat && q.cat === p.cat).slice(0, 6);
  const goneIds = Object.keys(man).filter(id => !next[id]);
  /* anciennes fiches (redirection + noindex) : remplacées par la fiche indexable, sans refaire les images */
  const isOld = id => { try { return !fs.readFileSync(path.join(PDIR, id + '.html'), 'utf8').includes('index, follow, max-image-preview'); } catch (e) { return false; } };
  const todoIds = new Set(todo.map(p => p.id));
  const stale = prods.filter(p => !todoIds.has(p.id) && isOld(p.id));

  /* livres de l'Ebook */
  const bk = await loadBooks();
  let bman = {}; try { bman = JSON.parse(fs.readFileSync(BMANIFEST, 'utf8')); } catch (e) {}
  const bnext = {}, btodo = [];
  for (const b of bk.list) {
    const h = sha(JSON.stringify(b) + '|b1'); bnext[b.id] = h;
    if (!(bman[b.id] === h && fs.existsSync(path.join(ODIR, 'livre-' + b.id + '.jpg')) && fs.existsSync(path.join(LDIR, b.id + '.html')))) btodo.push(b);
  }
  const bgone = bk.ok ? Object.keys(bman).filter(id => !bnext[id]) : [];

  /* --plan-img : nombre d'IMAGES à (re)générer (Chromium n'est installé que si > 0) ; --plan : nombre total de changements */
  if (process.argv.includes('--plan-img')) { console.log(todo.length + btodo.length); return; }
  if (process.argv.includes('--plan')) { console.log(todo.length + stale.length + goneIds.length + btodo.length + bgone.length); return; }

  for (const p of todo) {
    console.log('→', p.id, p.name);
    const photo = await toDataUri(p.img);
    await shot(productHtml(p, photo), path.join(ODIR, p.id + '.jpg'));
    fs.writeFileSync(path.join(PDIR, p.id + '.html'), productPage(p, relatedOf(p)));
  }
  for (const p of stale) { console.log('↺ fiche remise', p.id); fs.writeFileSync(path.join(PDIR, p.id + '.html'), productPage(p, relatedOf(p))); }
  for (const id of goneIds)
    for (const f of [path.join(ODIR, id + '.jpg'), path.join(PDIR, id + '.html')]) try { fs.unlinkSync(f); } catch (e) {}
  /* anciennes images .png (trop lourdes pour WhatsApp) : supprimées, sauf l'image par défaut */
  for (const f of fs.readdirSync(ODIR)) if (f.endsWith('.png') && f !== 'default.png') try { fs.unlinkSync(path.join(ODIR, f)); } catch (e) {}
  fs.writeFileSync(MANIFEST, JSON.stringify(next, null, 1) + '\n');
  for (const b of btodo) {
    console.log('📖', b.id, b.title);
    const photo = await toDataUri(b.cover);
    await shot(bookImgHtml(b, photo), path.join(ODIR, 'livre-' + b.id + '.jpg'));
    fs.writeFileSync(path.join(LDIR, b.id + '.html'), bookPage(b));
  }
  for (const id of bgone)
    for (const f of [path.join(ODIR, 'livre-' + id + '.jpg'), path.join(LDIR, id + '.html')]) try { fs.unlinkSync(f); } catch (e) {}
  if (bk.ok) fs.writeFileSync(BMANIFEST, JSON.stringify(bnext, null, 1) + '\n');
  if (browser) await browser.close();
  console.log(`Produits : ${prods.length} · générés ${todo.length} · inchangés ${prods.length - todo.length} · supprimés ${goneIds.length}`);
})().catch(e => { console.error(e); process.exit(1); });
