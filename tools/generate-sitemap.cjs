/* WYK — générateur de sitemap.xml (phase 2 : fiable et strict)
 * Pages fixes + une entrée par catégorie ayant au moins un produit actif
 * + les fiches produit /produit/<id> (indexables depuis v2.11, canonical vers elles-mêmes)
 * Adresse de catégorie = https://wykht.com/categorie?c=<slug> (même règle de slug que categorie.html).
 * Aucune date « lastmod » (non vérifiable). Pages privées / noindex / fiches produit : jamais incluses.
 *
 * GARANTIES
 *  - Toute erreur (réseau, catalogue vide, XML invalide, baisse suspecte) => code de sortie 1 : le workflow
 *    passe en ROUGE dans GitHub Actions et sitemap.xml reste celui qui existait.
 *  - Écriture atomique (fichier temporaire puis renommage) ; adresses dédoublonnées et triées de façon stable.
 *  - Refuse de publier un sitemap qui perdrait plus de la moitié des catégories OU des fiches produit du précédent
 *    (anti-sitemap incomplet). Passer FORCE_SITEMAP=1 pour une baisse volontaire (ex. beaucoup de fiches repassées en noindex).
 * Test local : CATALOG_FILE=catalog.json node tools/generate-sitemap.cjs
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SITE = 'https://wykht.com', FILE = path.join(ROOT, 'sitemap.xml');
const SUPA = 'https://byrklytqoucdskzvcoau.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cmtseXRxb3VjZHNrenZjb2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTQ0ODcsImV4cCI6MjA5NDI3MDQ4N30.nH7LKYevuBd9jGmFmv7KMNoJu3X_rDaY1BHXZR1v3wM';
const STATIC = ['/', '/categories', '/apropos', '/conditions-utilisation', '/confidentiality', '/jeux'];

const clean = t => String(t == null ? '' : t).replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/[ \t]{2,}/g, ' ').trim();
const slug = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const xml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fail = m => { console.error('::error title=Sitemap::' + m); process.exit(1); };

async function getJson(url, headers) {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status);
  return r.json();
}
async function load() {
  if (process.env.CATALOG_FILE) { const j = JSON.parse(fs.readFileSync(process.env.CATALOG_FILE, 'utf8')); return { products: j.products || [], cats: j.categories || j.cats || [] }; }
  const H = { apikey: ANON, Authorization: 'Bearer ' + ANON };
  let products = [], cats = [];
  try { const j = await getJson(SUPA + '/storage/v1/object/public/public-data/catalog.json'); products = j.products || []; cats = j.categories || j.cats || []; }
  catch (e) { console.warn('catalog.json indisponible (' + e.message + ') : lecture directe de la base.'); }
  if (!cats.length) cats = await getJson(SUPA + '/rest/v1/categories?select=*', H);
  if (!products.length) products = await getJson(SUPA + '/rest/v1/products?select=id,category_id,active&active=eq.true', H);
  return { products, cats };
}

function indexableProducts() {
  const dir = path.join(ROOT, 'produit'); let files = [];
  try { files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort(); } catch (e) { return []; }
  const out = [];
  files.forEach(f => {
    const id = f.slice(0, -5), h = fs.readFileSync(path.join(dir, f), 'utf8').split('</head>')[0];
    const robots = (h.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
    const canon = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
    if (/noindex/i.test(robots)) return;
    if (canon !== SITE + '/produit/' + encodeURIComponent(id)) return;   // canonical doit pointer vers elle-même
    out.push(canon);
  });
  return out;
}

(async () => {
  const { products, cats } = await load();
  if (!Array.isArray(products) || !products.length) fail('Aucun produit lu dans le catalogue : sitemap.xml non modifié.');
  if (!Array.isArray(cats) || !cats.length) fail('Aucune catégorie lue : sitemap.xml non modifié.');
  const used = {}, count = {}, catUrls = new Set();
  products.forEach(p => { if (p.active === false) return; count[p.category_id] = (count[p.category_id] || 0) + 1; });
  cats.forEach(c => {                                   // même calcul que categorie.html (ordre de la liste conservé)
    let s = (c.slug && String(c.slug).trim()) || slug(clean(c.name)) || String(c.id);
    if (used[s]) s = s + '-' + String(c.id).slice(0, 4);
    used[s] = 1;
    if (count[c.id] > 0) catUrls.add(SITE + '/categorie?c=' + encodeURIComponent(s));
  });
  if (!catUrls.size) fail('Aucune catégorie ne contient de produit actif : sitemap.xml non modifié.');
  const old = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';
  const oldCats = (old.match(/<loc>[^<]*\/categorie\?c=[^<]*<\/loc>/g) || []).length;
  if (oldCats >= 2 && catUrls.size < oldCats / 2) fail('Le nouveau sitemap perdrait ' + (oldCats - catUrls.size) + ' catégories sur ' + oldCats + ' : refus de publier (vérifier la base).');
  const prodUrls = [...new Set(indexableProducts())].sort();
  const oldProds = (old.match(/<loc>[^<]*\/produit\/[^<]*<\/loc>/g) || []).length;
  if (!process.env.FORCE_SITEMAP && oldProds >= 4 && prodUrls.length < oldProds / 2) fail('Le nouveau sitemap perdrait ' + (oldProds - prodUrls.length) + ' fiches produit sur ' + oldProds + ' : refus de publier (FORCE_SITEMAP=1 si c\'est voulu).');
  const urls = [...new Set([...STATIC.map(p => SITE + p), ...[...catUrls].sort(), ...prodUrls])];
  urls.forEach(u => { if (!u.startsWith(SITE + '/') || /noindex|admin|manager|employe|compte|profil|test-urls/.test(u) || (/\/produit\//.test(u) && !prodUrls.includes(u))) fail('Adresse interdite dans le sitemap : ' + u); });
  const out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => '  <url>\n    <loc>' + xml(u) + '</loc>\n  </url>').join('\n') + '\n</urlset>\n';
  if ((out.match(/<loc>/g) || []).length !== urls.length || (out.match(/<\/url>/g) || []).length !== urls.length) fail('XML incohérent : sitemap.xml non modifié.');
  if (old === out) { console.log('sitemap.xml déjà à jour (' + urls.length + ' adresses, dont ' + catUrls.size + ' catégories et ' + prodUrls.length + ' fiches produit).'); return; }
  fs.writeFileSync(FILE + '.tmp', out); fs.renameSync(FILE + '.tmp', FILE);
  console.log('sitemap.xml écrit : ' + urls.length + ' adresses, dont ' + catUrls.size + ' catégories et ' + prodUrls.length + ' fiches produit.');
})().catch(e => fail('Échec : ' + e.message));
