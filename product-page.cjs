/* WYK — fiche produit statique /produit/<id> (variante A : page lisible par Google + boutons WhatsApp / boutique)
 * Module partagé par tools/generate-share.cjs. Aucune donnée inventée : tout vient du catalogue Supabase.
 *
 * RÈGLE D'INDEXATION (décision validée)
 *   noindex tant que la fiche manque d'informations utiles et uniques :
 *     - pas de nom, de prix (> 0) ou de photo  -> noindex
 *     - description vide OU qui ne fait que répéter le nom / la catégorie, ET aucune taille ni couleur -> noindex
 *   Une description COURTE mais réelle suffit (nom + prix + photo + catégorie + description) -> indexable.
 *   La règle est recalculée à chaque génération (toutes les 20 min) : quand la description est remplie dans l'admin,
 *   la fiche passe en index automatiquement ; une fiche noindex n'est jamais dans le sitemap.
 * Disponibilité : comme dans la boutique (stock vide = proposé à la vente ; 0 = rupture ; ≤ 5 = « Plus que N »).
 */
const SITE = 'https://wykht.com', WA = '50940300966';
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n).toLocaleString('fr').replace(/[\u202f\u00a0]/g, ' ') + ' HTG';
const cut = (t, n) => { t = String(t).replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; };
const words = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const ref = p => 'WYK-' + String(p.id).slice(0, 6).toUpperCase();
const url = p => SITE + '/produit/' + encodeURIComponent(p.id);

/* la description apporte-t-elle une information propre à ce produit ? */
function realDescription(p) {
  const d = String(p.desc || '').trim();
  if (!d) return false;
  const known = new Set(words(p.name).concat(words(p.cat)));
  const dw = words(d);
  return dw.length > 0 && !dw.every(w => known.has(w));   // ne contient que le nom / la catégorie -> pas une vraie description
}
function seoStatus(p) {
  if (!p.name || p.noName) return { index: false, why: 'nom manquant' };
  if (!(Number(p.price) > 0)) return { index: false, why: 'prix manquant' };
  if (!p.img) return { index: false, why: 'photo manquante' };
  if (realDescription(p) || (p.sizes && p.sizes.length) || (p.colors && p.colors.length)) return { index: true, why: 'contenu suffisant' };
  return { index: false, why: 'description vide ou identique au nom' };
}
const stockInfo = p => p.stock == null ? { t: 'En stock', k: 'ok', ld: 'InStock' }
  : p.stock <= 0 ? { t: 'Rupture de stock', k: 'out', ld: 'OutOfStock' }
  : p.stock <= 5 ? { t: 'Plus que ' + p.stock + ' en stock', k: 'low', ld: 'InStock' } : { t: 'En stock', k: 'ok', ld: 'InStock' };

function descHtml(t) {
  let out = '', ul = '';
  String(t).split(/\r?\n/).map(s => s.trim()).filter(Boolean).forEach(l => {
    if (/^[-•*–]\s+/.test(l)) ul += '<li>' + esc(l.replace(/^[-•*–]\s+/, '')) + '</li>';
    else { if (ul) { out += '<ul>' + ul + '</ul>'; ul = ''; } out += '<p>' + esc(l) + '</p>'; }
  });
  return out + (ul ? '<ul>' + ul + '</ul>' : '');
}

const CSS = `:root{--bg:#f6f5f2;--surface:#fff;--s2:#efeeea;--ink:#101010;--t2:#4a4a44;--mut:rgba(16,16,16,.56);--line:rgba(16,16,16,.11);--red:#e8192c;--red-s:rgba(232,25,44,.09);--glass:rgba(255,255,255,.66);--r:20px;--sh1:0 2px 10px rgba(0,0,0,.06);--ease:cubic-bezier(.2,.7,.2,1);--fd:'Bricolage Grotesque','Inter',system-ui,sans-serif;--fb:'Inter',system-ui,sans-serif}
[data-theme=dark]{--bg:#0d0d0c;--surface:#171716;--s2:#20201e;--ink:#f3f2ec;--t2:#b4b3aa;--mut:rgba(243,242,236,.58);--line:rgba(243,242,236,.13);--red-s:rgba(232,25,44,.16);--glass:rgba(24,24,22,.62);--sh1:0 2px 10px rgba(0,0,0,.4)}
*{margin:0;padding:0;box-sizing:border-box}a{color:inherit;text-decoration:none}
body{font-family:var(--fb);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.5;overflow-x:hidden;padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}
.wrap{max-width:1280px;margin:0 auto;padding:0 24px}
.top{position:sticky;top:0;z-index:5;background:var(--glass);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}
.brand{display:flex;align-items:center;gap:9px;font:800 22px var(--fd);letter-spacing:-.03em}.brand em{font-style:normal;color:var(--red)}
.brand img{width:36px;height:36px;border-radius:10px;object-fit:contain;display:block}.lg-d{display:none!important}[data-theme=dark] .lg-d{display:block!important}[data-theme=dark] .lg-l{display:none!important}
.top nav{display:flex;gap:18px;font-size:14px;font-weight:600}.top nav a:hover{color:var(--red)}
.crumb{font-size:12px;opacity:.7;display:flex;flex-wrap:wrap;gap:8px;padding:18px 0 6px}.crumb a:hover{text-decoration:underline}
.pd{display:grid;gap:24px;padding:14px 0 8px}
.pd-im{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--sh1);aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;overflow:hidden}
.pd-im img{width:100%;height:100%;object-fit:contain;display:block}.pd-im .ph{font:800 64px var(--fd);opacity:.15}
.ct{font-size:11px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--red)}
h1{font:800 clamp(26px,4.4vw,40px)/1.1 var(--fd);letter-spacing:-.025em;margin:8px 0 14px}
.pr{display:flex;align-items:baseline;flex-wrap:wrap;gap:10px 14px}.pr b{font:800 34px var(--fd);letter-spacing:-.02em}.pr s{color:var(--mut);font-size:16px}.pr em{font-style:normal;font-weight:700;font-size:13px;color:var(--red);background:var(--red-s);padding:3px 10px;border-radius:30px}
.st{display:inline-flex;align-items:center;gap:8px;margin-top:12px;font-size:14px;font-weight:600}.st i{width:9px;height:9px;border-radius:50%;background:#3ddc84}.st.low i{background:#f5c842}.st.out i{background:var(--red)}
.act{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 24px;border-radius:40px;font-weight:600;font-size:14px;transition:.25s var(--ease)}
.btn-wa{background:#25d366;color:#fff;box-shadow:0 8px 22px rgba(37,211,102,.3)}.btn-wa:hover{transform:translateY(-2px)}
.btn-line{border:1.5px solid var(--line)}.btn-line:hover{border-color:var(--ink)}
.pd h2,.rel h2{font:700 18px var(--fd);letter-spacing:-.02em;margin:26px 0 10px}
.dsc p{margin:0 0 10px;color:var(--t2);line-height:1.65;font-size:15px}.dsc ul{margin:0 0 10px 18px;color:var(--t2);font-size:15px;line-height:1.65}
dl{display:grid;grid-template-columns:auto 1fr;gap:8px 18px;font-size:14px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px 18px}dt{color:var(--mut)}dd{font-weight:600}.dot{display:inline-block;width:18px;height:18px;border-radius:50%;border:1px solid var(--line);margin-right:6px;vertical-align:middle}
.note{margin-top:18px;font-size:13px;color:var(--mut)}
.rel{padding-bottom:10px}.rel ul{list-style:none;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.rel li a{display:flex;justify-content:space-between;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 16px;font-size:14px;font-weight:600}.rel li a:hover{border-color:var(--red)}.rel li span{color:var(--mut);font-weight:500;white-space:nowrap}
.ft{margin-top:44px;border-top:1px solid var(--line);padding:26px 0 30px;font-size:13px}
.ft .row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:18px}.ft p{color:var(--mut);margin-top:6px;max-width:340px}
.ft nav,.ft .so{display:flex;flex-wrap:wrap;gap:8px 18px;font-weight:600}.ft a:hover{color:var(--red)}.ft .bt{margin-top:18px;color:var(--mut)}
@media(min-width:820px){.pd{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:start}.pd-im{position:sticky;top:84px}}
@media(max-width:620px){.wrap{padding:0 16px}.top nav{gap:12px;font-size:13px}.btn{flex:1 1 100%}}`;

function buildPage(p, ctx) {
  ctx = ctx || {};
  const st = seoStatus(p), stk = stockInfo(p), self = url(p), ogimg = SITE + '/og/' + encodeURIComponent(p.id) + '.jpg';
  const real = realDescription(p);
  const title = p.name + ' — ' + fmt(p.price) + ' | WYK Haïti' + (ctx.dupTitle && ctx.dupTitle.has(p.name + '|' + p.price) ? ' (' + ref(p) + ')' : '');
  const firstLine = real ? String(p.desc).split(/\r?\n/).map(s => s.replace(/^[-•*–]\s+/, '').trim()).filter(Boolean)[0] : '';
  const desc = cut(p.name + ' à ' + fmt(p.price) + ' chez WYK Haïti' + (p.cat ? ' — ' + p.cat : '') + '.' + (firstLine ? ' ' + cut(firstLine, 110) : '') + ' Commandez sur WhatsApp.', 160);
  const catUrl = p.cat && p.catSlug ? SITE + '/categorie?c=' + encodeURIComponent(p.catSlug) : '';
  const waMsg = 'Bonjour WYK, je souhaite commander : ' + p.name + ' (' + fmt(p.price) + '). Réf. ' + ref(p) + '. ' + self;
  const wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waMsg);
  const rel = (ctx.related || []).slice(0, 6);

  const crumbs = [{ n: 'Accueil', u: SITE + '/' }, { n: 'Catégories', u: SITE + '/categories' }];
  if (catUrl) crumbs.push({ n: p.cat, u: catUrl });
  crumbs.push({ n: p.name, u: self });
  const graph = [{
    '@type': 'Product', '@id': self + '#product', name: p.name, url: self,
    image: (p.imgs && p.imgs.length ? p.imgs : (p.img ? [p.img] : [])).slice(0, 6),
    sku: ref(p),
    ...(real ? { description: cut(String(p.desc).replace(/\s+/g, ' '), 500) } : {}),
    ...(p.cat ? { category: p.cat } : {}),
    ...(p.colors && p.colors.filter(c => !/^#/.test(c)).length ? { color: p.colors.filter(c => !/^#/.test(c)).join(', ') } : {}),
    ...(p.sizes && p.sizes.length ? { size: p.sizes.join(', ') } : {}),
    offers: { '@type': 'Offer', url: self, price: String(p.price), priceCurrency: 'HTG', availability: 'https://schema.org/' + stk.ld, seller: { '@id': SITE + '/#organization' } }
  }, {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.n, item: c.u }))
  }];
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');

  const specs = [['Catégorie', p.cat ? (catUrl ? '<a href="' + esc('/categorie?c=' + encodeURIComponent(p.catSlug)) + '">' + esc(p.cat) + '</a>' : esc(p.cat)) : ''],
    ['Référence', esc(ref(p))], ['Disponibilité', esc(stk.t)],
    ['Tailles', esc((p.sizes || []).join(', '))],
    ['Couleurs', (p.colors || []).map(c => /^#[0-9a-f]{3,8}$/i.test(c) ? '<span class="dot" style="background:' + esc(c) + '" title="' + esc(c) + '"></span>' : esc(c)).join(/^#/.test((p.colors || [])[0] || '') ? '' : ', ')]]
    .filter(r => r[1]).map(r => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('');

  return `<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<script>try{var t=localStorage.getItem("wyk-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}if(/\\.html$/.test(location.pathname)){history.replaceState(null,"",location.pathname.replace(/\\.html$/,"")+location.search+location.hash)}</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${st.index ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">
<link rel="canonical" href="${esc(self)}">
<meta property="og:site_name" content="WYK">
<meta property="og:type" content="product">
<meta property="og:locale" content="fr_HT">
<meta property="og:url" content="${esc(self)}">
<meta property="og:title" content="${esc(p.name + ' — ' + fmt(p.price))}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(ogimg)}">
<meta property="og:image:secure_url" content="${esc(ogimg)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(p.name)}">
<meta property="product:price:amount" content="${esc(p.price)}">
<meta property="product:price:currency" content="HTG">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.name + ' — ' + fmt(p.price))}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogimg)}">
<link rel="icon" type="image/png" sizes="any" href="${SITE}/assets/brand/wyk-icon.png">
<link rel="icon" type="image/png" sizes="any" href="${SITE}/assets/brand/wyk-icon-dark.png" media="(prefers-color-scheme: dark)">
<link rel="apple-touch-icon" href="${SITE}/assets/brand/wyk-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap">
<script type="application/ld+json">${ld}</script>
<style>${CSS}</style>
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="/" aria-label="WYK — accueil"><img class="lg-l" src="/assets/brand/wyk-logo.png" alt="WYK" width="36" height="36"><img class="lg-d" src="/assets/brand/wyk-logo-dark.png" alt="" width="36" height="36"></a><nav aria-label="Navigation"><a href="/">Boutique</a><a href="/categories">Catégories</a><a href="/apropos">À propos</a></nav></div></header>
<main class="wrap">
<nav class="crumb" aria-label="Fil d'Ariane">${crumbs.map((c, i) => i < crumbs.length - 1 ? '<a href="' + esc(c.u.replace(SITE, '') || '/') + '">' + esc(c.n) + '</a><span aria-hidden="true">›</span>' : '<span aria-current="page">' + esc(c.n) + '</span>').join('')}</nav>
<article class="pd">
<div class="pd-im">${p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" fetchpriority="high" decoding="async">' : '<div class="ph" aria-hidden="true">WYK</div>'}</div>
<div class="pd-in">
${p.cat ? '<span class="ct">' + esc(p.cat) + '</span>' : ''}
<h1>${esc(p.name)}</h1>
<div class="pr"><b>${esc(fmt(p.price))}</b>${p.old ? '<s>' + esc(fmt(p.old)) + '</s><em>-' + p.off + '%</em>' : ''}</div>
<span class="st ${stk.k}"><i></i>${esc(stk.t)}</span>
<div class="act"><a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener">Commander sur WhatsApp</a><a class="btn btn-line" href="${esc('/?p=' + encodeURIComponent(p.id))}">Ouvrir dans la boutique</a></div>
${real ? '<section class="dsc"><h2>Description</h2>' + descHtml(p.desc) + '</section>' : ''}
<section><h2>Caractéristiques</h2><dl>${specs}</dl></section>
<p class="note">Prix en gourdes (HTG). Commande confirmée avec vous sur WhatsApp ; livraison en Haïti, le panier et les favoris se trouvent dans la boutique.</p>
</div>
</article>
${rel.length ? '<section class="rel"><h2>Dans la même catégorie</h2><ul>' + rel.map(r => '<li><a href="/produit/' + esc(encodeURIComponent(r.id)) + '">' + esc(r.name) + '<span>' + esc(fmt(r.price)) + '</span></a></li>').join('') + '</ul></section>' : ''}
</main>
<footer class="ft"><div class="wrap"><div class="row"><div><a class="brand" href="/" aria-label="WYK"><span>W<em>YK</em></span></a><p>Boutique en ligne en Haïti : produits, alimentation, abonnements et services.</p></div><nav aria-label="Pied de page"><a href="/categories">Catégories</a><a href="/apropos">À propos</a><a href="/jeux">Jeux</a><a href="/conditions-utilisation">Conditions</a><a href="/confidentiality">Confidentialité</a></nav><div class="so"><a href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="https://www.instagram.com/wykht.co/" target="_blank" rel="noopener">Instagram</a><a href="mailto:contact@wykht.com">E-mail</a></div></div><div class="bt">© WYK — wykht.com · Fait en Haïti</div></div></footer>
</body>
</html>
`;
}
module.exports = { buildPage, seoStatus, realDescription, ref, url, fmt };
