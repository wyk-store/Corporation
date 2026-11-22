/* WYK — affiches « périodes de fête » (accueil) + espace fêtes (page catégories) + entrée Resto Lakay */
(function(){
'use strict';
var W=window.WYK||{},esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var CSS='\
.fp-sec{max-width:1240px;margin:0 auto;padding:clamp(26px,5vw,54px) 18px 0}\
.fp-hd{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:18px}\
.fp-tag{font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--red,#e8192c);display:flex;align-items:center;gap:8px}.fp-tag::before{content:"";width:22px;height:2px;background:currentColor}\
.fp-hd h2{margin:8px 0 0;font:800 clamp(24px,4vw,38px)/1.05 var(--fd,system-ui);letter-spacing:-.03em}\
.fp-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(260px,31%);gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 18px 22px;margin:0 -18px;scrollbar-width:none;overscroll-behavior-x:contain}.fp-rail::-webkit-scrollbar{display:none}\
@media(max-width:900px){.fp-rail{grid-auto-columns:minmax(78%,82%)}}@media(min-width:901px){.fp-rail.few{grid-auto-flow:row;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));overflow:visible}}\
.fp{position:relative;display:flex;flex-direction:column;justify-content:flex-end;aspect-ratio:4/4.6;border-radius:30px;overflow:hidden;color:#fff;text-decoration:none;scroll-snap-align:start;isolation:isolate;box-shadow:0 20px 48px rgba(0,0,0,.22);transition:transform .4s cubic-bezier(.2,.8,.2,1),box-shadow .4s;background:linear-gradient(150deg,var(--c1),var(--c2))}\
.fp:hover{transform:translateY(-8px) rotate(-.6deg);box-shadow:0 32px 64px rgba(0,0,0,.3)}\
.fp>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;transition:transform .8s}.fp:hover>img{transform:scale(1.07)}\
.fp::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(10,4,4,.86) 0,rgba(10,4,4,.18) 58%,rgba(10,4,4,.08));z-index:-1}\
.fp .em{position:absolute;top:18px;left:18px;width:58px;height:58px;border-radius:20px;background:rgba(255,255,255,.2);backdrop-filter:blur(10px);display:grid;place-items:center;font-size:30px;border:1.5px solid rgba(255,255,255,.35)}\
.fp .cd{position:absolute;top:22px;right:18px;padding:6px 12px;border-radius:30px;background:#fff;color:#101010;font:800 11.5px var(--fb,system-ui)}\
.fp .bd{padding:22px}.fp b{display:block;font:800 clamp(24px,3vw,30px)/1.05 var(--fd,system-ui);letter-spacing:-.03em}.fp small{display:block;margin-top:7px;font-size:13.5px;opacity:.88;line-height:1.45}\
.fp .go{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:10px 18px;border-radius:30px;background:#fff;color:#101010;font-weight:800;font-size:13px}\
.rlb{display:grid;grid-template-columns:1.2fr 1fr;align-items:center;gap:20px;position:relative;overflow:hidden;border-radius:34px;padding:clamp(26px,4vw,48px);color:#fff;text-decoration:none;background:linear-gradient(135deg,#450a0a,#9a3412 55%,#ea580c);box-shadow:0 30px 70px rgba(127,29,29,.35);isolation:isolate;transition:transform .4s}\
.rlb:hover{transform:translateY(-5px)}.rlb::before{content:"";position:absolute;right:-90px;top:-90px;width:340px;height:340px;border-radius:50%;background:rgba(255,255,255,.12);z-index:-1}\
.rlb .t{font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.8}.rlb h3{margin:10px 0 10px;font:800 clamp(30px,5vw,52px)/1 var(--fd,system-ui);letter-spacing:-.035em}.rlb p{margin:0;opacity:.9;max-width:460px;line-height:1.6}\
.rlb .go{display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:13px 24px;border-radius:40px;background:#fff;color:#9a3412;font-weight:800}\
.rlb svg.g{width:100%;max-width:280px;justify-self:end;filter:drop-shadow(0 20px 30px rgba(0,0,0,.35));animation:rlf 5s ease-in-out infinite}@keyframes rlf{50%{transform:translateY(-10px) rotate(2deg)}}\
@media(max-width:700px){.rlb{grid-template-columns:1fr}.rlb svg.g{max-width:150px;justify-self:start;order:-1}}\
.fxs{margin-top:22px;border-radius:32px;overflow:hidden;border:1px solid var(--line,rgba(0,0,0,.08));background:var(--surface,#fff);box-shadow:0 20px 50px rgba(0,0,0,.08)}\
.fxs-h{position:relative;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:22px 24px;color:#fff;background:linear-gradient(120deg,var(--c1),var(--c2))}\
.fxs-h .em{width:56px;height:56px;border-radius:18px;background:rgba(255,255,255,.2);display:grid;place-items:center;font-size:28px}.fxs-h b{display:block;font:800 clamp(22px,3vw,30px)/1.05 var(--fd,system-ui);letter-spacing:-.03em}.fxs-h small{opacity:.9;font-size:13.5px}\
.fxs-h a{margin-left:auto;padding:11px 20px;border-radius:30px;background:#fff;color:#101010;font-weight:800;font-size:13px;text-decoration:none}\
.fxs-b{padding:18px 6px 8px}\
@media(prefers-reduced-motion:reduce){.fp,.rlb,.rlb svg.g{transition:none;animation:none}}\
';
var CHEF='M12 3C9.2 3 7 5.2 7 8c-1.7.4-3 1.9-3 3.7 0 2 1.6 3.6 3.6 3.6H8V20h8v-4.7h.4c2 0 3.6-1.6 3.6-3.6 0-1.8-1.3-3.3-3-3.7 0-2.8-2.2-5-5-5zM9 17h6v1H9v-1z';
function inject(){if(document.getElementById('fp-css'))return;var s=document.createElement('style');s.id='fp-css';s.textContent=CSS;document.head.appendChild(s)}
function shade(h,k){h=String(h||'#e8192c').replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16),r=n>>16,g=n>>8&255,b=n&255;return'#'+[r,g,b].map(function(x){return('0'+Math.max(0,Math.min(255,Math.round(x*k))).toString(16)).slice(-2)}).join('')}
async function list(){
  try{await W.ensureDb();var r=await W.db.from('fete_pages').select('*').eq('is_active',true).order('position');
    var now=new Date();return(r.data||[]).filter(function(f){return!f.ends_on||new Date(f.ends_on+'T23:59:59')>=now})}catch(e){return[]}}
function cd(f){var now=new Date();if(f.starts_on&&new Date(f.starts_on+'T00:00:00')>now){var d=Math.ceil((new Date(f.starts_on+'T00:00:00')-now)/864e5);return'Dans '+d+' j'}
  if(f.ends_on){var e=Math.ceil((new Date(f.ends_on+'T23:59:59')-now)/864e5);if(e>=0&&e<=45)return'Plus que '+(e+1)+' j'}return''}
function poster(f){var c1=shade(f.accent,.5),c2=f.accent||'#e8192c',n=(f.product_ids||[]).length,t=cd(f);
  return'<a class="fp" href="/'+esc(f.slug)+'" style="--c1:'+c1+';--c2:'+c2+'">'+(f.hero_image?'<img src="'+esc(f.hero_image)+'" alt="'+esc(f.title)+'" loading="lazy">':'')+'<span class="em">'+esc(f.emoji||'🎁')+'</span>'+(t?'<span class="cd">'+t+'</span>':'')+'<div class="bd"><b>'+esc(f.title)+'</b>'+(f.subtitle?'<small>'+esc(f.subtitle)+'</small>':'')+'<span class="go">'+(n?n+' produit'+(n>1?'s':'')+' · ':'')+'Découvrir →</span></div></a>'}
/* accueil : affiches de fête + entrée Resto Lakay */
async function home(host,o){
  host=typeof host==='string'?document.querySelector(host):host;if(!host)return;inject();
  var L=await list(),h='';
  if(L.length)h+='<section class="fp-sec"><div class="fp-hd"><div><span class="fp-tag">Périodes de fête</span><h2>Célébrons ensemble</h2></div></div><div class="fp-rail'+(L.length<=3?' few':'')+'">'+L.map(poster).join('')+'</div></section>';
  if(o&&o.resto)h+='<section class="fp-sec" style="padding-top:'+(L.length?'4':'26')+'px"><a class="rlb" href="/restolakay"><div><span class="t">Resto Lakay</span><h3>Plats, boissons &amp; desserts livrés chez vous</h3><p>Cuisine du pays, jus frais et douceurs de fête. Découvrez la carte et commandez en quelques clics.</p><span class="go">Découvrir la carte →</span></div><svg class="g" viewBox="0 0 24 24" aria-hidden="true"><path d="'+CHEF+'" fill="#fff"/></svg></a></section>';
  host.innerHTML=h;host.style.display=h?'':'none'}
/* page catégories : espace fêtes avec les produits de chaque fête */
async function space(host){
  host=typeof host==='string'?document.querySelector(host):host;if(!host)return;inject();
  var L=await list();if(!L.length){host.style.display='none';return}
  host.innerHTML='<div class="fp-hd"><div><span class="fp-tag">Périodes de fête</span><h2>Espace fêtes</h2></div></div>'+L.map(function(f){
    var P=(f.product_ids||[]).map(function(i){return W.byId(i)}).filter(Boolean),t=cd(f);
    return'<article class="fxs"><div class="fxs-h" style="--c1:'+shade(f.accent,.5)+';--c2:'+esc(f.accent||'#e8192c')+'"><span class="em">'+esc(f.emoji||'🎁')+'</span><div><b>'+esc(f.title)+'</b><small>'+(f.subtitle?esc(f.subtitle):'')+(t?(f.subtitle?' · ':'')+t:'')+'</small></div><a href="/'+esc(f.slug)+'">Voir toute la page →</a></div>'+(P.length?'<div class="fxs-b">'+W.rail(P)+'</div>':'')+'</article>'}).join('');
  host.style.display='';if(W.reveal)W.reveal()}
window.WYKFetes={home:home,space:space,list:list};
})();
