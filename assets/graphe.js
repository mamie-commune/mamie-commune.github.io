// Le Graphe des luttes (graphe/index.html). Données : data/graphe.js (window.GRAPHE), fabriqué par _src/build.ps1
// depuis _src/graphe/graphe.json. Tout se passe dans le navigateur : rien n'est envoyé.
// Trois vues : la frise (chaque élément à sa date, rangé par catégorie), « autour de » (un élément au centre et ses
// connexions directes), et la liste (lisible au clavier et au lecteur d'écran, et la vue par défaut sur téléphone).
// Favoris et parcours personnels : gardés dans ce navigateur (clé « mamie-graphe ») et versés dans « Mon dossier ».
(function () {
  "use strict";
  const G = window.GRAPHE, app = document.getElementById("graphe");
  if (!G || !app) return;
  const $ = (s) => app.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const NS = "http://www.w3.org/2000/svg";
  const racine = new URL("..", location.href).href;          // la page est graphe/index.html
  const mobile = () => matchMedia("(max-width: 760px)").matches;
  const ORDRE = ["courant", "concept", "personne", "organisation", "evenement", "experience", "lutte", "publication"];

  /* ---------- données ---------- */
  const N = new Map(G.noeuds.map((n) => [n.id, n]));
  const voisins = new Map(G.noeuds.map((n) => [n.id, []]));
  G.liens.forEach((l, i) => { l.i = i; voisins.get(l.de).push({ l, autre: l.vers, sortant: true }); voisins.get(l.vers).push({ l, autre: l.de, sortant: false }); });
  const relLib = (v) => { const r = G.relations[v.l.type]; return v.sortant ? r.sens : r.inverse; };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const refTxt = (s) => { const r = G.references[s.ref]; if (!r) return ""; return `${esc(r.auteur)}, <cite>${esc(r.titre)}</cite>, ${esc(r.edition)}${r.annee && !String(r.edition).includes(String(r.annee)) ? ", " + r.annee : ""}${r.langue === "en" ? " (en anglais)" : ""}${s.precision ? ", " + esc(s.precision) : ""}`; };

  /* ---------- état, adresse, stockage ---------- */
  const etat = { vue: "frise", sel: null, fil: [], types: new Set(ORDRE), periode: "", courant: "", parcours: null, t: { x: 0, y: 0, k: 1 } };
  const CLE = "mamie-graphe";
  const lirePerso = () => { try { const p = JSON.parse(localStorage.getItem(CLE) || "null") || {}; return { favoris: (p.favoris || []).filter((id) => N.has(id)), parcours: (p.parcours || []).map((x) => ({ nom: String(x.nom || "Mon parcours"), ids: (x.ids || []).filter((id) => N.has(id)) })), actif: Number(p.actif) || 0 }; } catch (e) { return { favoris: [], parcours: [], actif: 0 }; } };
  let perso = lirePerso();
  let stockageOk = true;
  const garderPerso = () => { try { localStorage.setItem(CLE, JSON.stringify(perso)); stockageOk = true; } catch (e) { stockageOk = false; } };
  function ecrireAdresse() {
    const p = new URLSearchParams();
    if (etat.sel) p.set("n", etat.sel);
    if (etat.vue !== "frise") p.set("vue", etat.vue);
    if (etat.parcours && !etat.parcours.perso) p.set("parcours", etat.parcours.id);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
  }

  /* ---------- filtres ---------- */
  const periodes = G.periodes;
  function dansPeriode(n) { if (!etat.periode) return true; const p = periodes.find((x) => x.id === etat.periode); const fin = n.fin || n.annee; return n.annee <= p.a && fin >= p.de; }
  function dansCourant(n) { if (!etat.courant) return true; const c = etat.courant; return n.id === c || (n.courants || []).includes(c) || voisins.get(n.id).some((v) => v.autre === c); }
  const visible = (n) => etat.types.has(n.type) && dansPeriode(n) && dansCourant(n);

  /* ---------- formes ---------- */
  function forme(type, r) {
    const f = G.types[type].forme, s = document.createElementNS(NS, "path");
    const poly = (pts) => "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
    const reg = (k, rot) => poly(Array.from({ length: k }, (_, i) => { const a = rot + (i * 2 * Math.PI) / k; return [r * Math.cos(a), r * Math.sin(a)]; }));
    let d;
    if (f === "rond") d = `M${-r} 0a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    else if (f === "losange") d = reg(4, -Math.PI / 2);
    else if (f === "carre") d = poly([[-r * 0.85, -r * 0.85], [r * 0.85, -r * 0.85], [r * 0.85, r * 0.85], [-r * 0.85, r * 0.85]]);
    else if (f === "hexagone") d = reg(6, 0);
    else if (f === "triangle") d = reg(3, -Math.PI / 2);
    else if (f === "etoile") d = poly(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.48 : r * 1.1; return [q * Math.cos(a), q * Math.sin(a)]; }));
    else if (f === "page") d = poly([[-r * 0.75, -r], [r * 0.4, -r], [r * 0.75, -r * 0.6], [r * 0.75, r], [-r * 0.75, r]]);
    else d = reg(8, Math.PI / 8); // « poing » : un octogone, comme un panneau de manif
    s.setAttribute("d", d); s.setAttribute("class", "g-forme"); s.style.setProperty("--c", G.types[type].couleur);
    return s;
  }

  /* ---------- la frise : position de chaque élément ---------- */
  const LANE = 118, MARGE_G = 150, HAUT = 70;
  const ans = [...new Set(G.noeuds.map((n) => n.annee))].sort((a, b) => a - b);
  const amin = ans[0], amax = ans[ans.length - 1];
  // Échelle mixte : moitié chronologique, moitié par rang, pour ne pas écraser les années où tout se passe.
  const xAn = (a) => { const lin = (a - amin) / (amax - amin), rang = ans.indexOf(a) / (ans.length - 1); return MARGE_G + (0.45 * lin + 0.55 * rang) * 2300; };
  const posFrise = new Map();
  ORDRE.forEach((type, li) => {
    const liste = G.noeuds.filter((n) => n.type === type).sort((a, b) => a.annee - b.annee || a.nom.localeCompare(b.nom));
    let dernier = -1e9, rang = 0;
    liste.forEach((n) => { let x = xAn(n.annee); if (x - dernier < 70) { rang++; } else rang = 0; dernier = x; const dy = [0, -34, 34, -17, 17][rang % 5]; posFrise.set(n.id, { x, y: HAUT + li * LANE + LANE / 2 + dy }); });
  });
  const LARGEUR = MARGE_G + 2300 + 140, HAUTEUR = HAUT + ORDRE.length * LANE + 20;

  /* ---------- dessin ---------- */
  const svg = $("#gSvg"), monde = $("#gMonde");
  const el = (n, a = {}, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  const court = (s, k) => (s.length > k ? s.slice(0, k - 1) + "…" : s);
  // cote : où poser l'étiquette ("bas" par défaut, "droite", "gauche", "haut") pour éviter les chevauchements.
  function noeudSvg(n, x, y, r, etiquette, classe, cote = "bas") {
    const g = el("g", { class: "g-noeud " + (classe || ""), transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`, tabindex: "0", role: "button", "data-id": n.id, "aria-label": `${n.nom}, ${G.types[n.type].nom.toLowerCase()}, ${n.dates}` });
    el("title", {}, g).textContent = `${n.nom} (${n.dates})`;
    g.appendChild(forme(n.type, r));
    if (perso.favoris.includes(n.id)) el("text", { class: "g-fav", x: r * 0.7, y: -r * 0.7 }, g).textContent = "★";
    const pos = { bas: { x: 0, y: r + 15, a: "middle" }, haut: { x: 0, y: -r - 8, a: "middle" }, droite: { x: r + 7, y: 4, a: "start" }, gauche: { x: -r - 7, y: 4, a: "end" } }[cote];
    const t = el("text", { class: "g-etiq", x: pos.x, y: pos.y, "text-anchor": pos.a }, g); t.textContent = etiquette;
    return g;
  }
  function courbe(a, b, cl) { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.min(60, Math.abs(a.x - b.x) / 6); return el("path", { d: `M${a.x} ${a.y}Q${mx} ${my} ${b.x} ${b.y}`, class: cl }); }

  function dessinerFrise() {
    monde.textContent = "";
    const fond = el("g", { class: "g-fond" }, monde);
    ORDRE.forEach((type, li) => {
      const y0 = HAUT + li * LANE;
      el("rect", { x: 0, y: y0, width: LARGEUR, height: LANE, class: li % 2 ? "g-couloir g-couloir--alt" : "g-couloir" }, fond);
      const t = el("text", { x: 12, y: y0 + 22, class: "g-couloir__nom" }, fond); t.textContent = G.types[type].pluriel;
    });
    for (let d = Math.ceil(amin / 10) * 10; d <= amax; d += 10) {
      if (!ans.some((a) => a >= d && a < d + 10) && d % 50) continue;
      const x = xAn(ans.find((a) => a >= d) ?? amax);
      el("line", { x1: x, x2: x, y1: HAUT - 10, y2: HAUTEUR - 20, class: "g-decennie" }, fond);
      el("text", { x: x + 4, y: HAUT - 16, class: "g-decennie__an" }, fond).textContent = d;
    }
    const sel = etat.sel, proches = new Set(sel ? [sel, ...voisins.get(sel).map((v) => v.autre)] : []);
    const pIds = etat.parcours ? etat.parcours.ids : [];
    const liens = el("g", { class: "g-liens-svg" }, monde);
    G.liens.forEach((l) => {
      const a = N.get(l.de), b = N.get(l.vers); if (!visible(a) || !visible(b)) return;
      const actif = sel && (l.de === sel || l.vers === sel);
      liens.appendChild(courbe(posFrise.get(l.de), posFrise.get(l.vers), "g-arete" + (actif ? " g-arete--actif g-arete--" + l.statut : sel ? " g-arete--pale" : "")));
    });
    if (pIds.length > 1) { const pts = pIds.map((id) => posFrise.get(id)); el("path", { d: "M" + pts.map((p) => `${p.x} ${p.y}`).join("L"), class: "g-chemin" }, monde); }
    const noeuds = el("g", {}, monde);
    G.noeuds.forEach((n) => {
      if (!visible(n)) return;
      const p = posFrise.get(n.id);
      const cl = (n.id === sel ? "g-noeud--sel" : sel && !proches.has(n.id) ? "g-noeud--pale" : "") + (pIds.includes(n.id) ? " g-noeud--parcours" : "");
      const g = noeudSvg(n, p.x, p.y, n.type === "courant" ? 15 : 12, court(n.nom, 24), cl);
      if (pIds.includes(n.id)) el("text", { class: "g-num", y: 4, "text-anchor": "middle" }, g).textContent = pIds.indexOf(n.id) + 1;
      noeuds.appendChild(g);
    });
    appliquer();
  }

  function dessinerAutour() {
    monde.textContent = "";
    const c = N.get(etat.sel); if (!c) return;
    const vs = voisins.get(c.id).filter((v) => etat.types.has(N.get(v.autre).type));
    // On range les voisins par type de relation, sur des secteurs du cercle.
    const groupes = new Map(); vs.forEach((v) => { const k = relLib(v); if (!groupes.has(k)) groupes.set(k, []); groupes.get(k).push(v); });
    const tous = [...groupes.values()].flat();
    // Sur téléphone : cercle plus serré, étiquettes plus courtes (les relations se lisent dans la fiche juste en dessous).
    const petit = mobile(), R = petit ? Math.max(115, Math.min(155, 16 * tous.length)) : Math.max(210, Math.min(380, 26 * tous.length));
    const liens = el("g", {}, monde), noeuds = el("g", {}, monde);
    let i = 0;
    groupes.forEach((liste, lib) => {
      liste.forEach((v) => {
        const pas = (2 * Math.PI) / Math.max(tous.length, 1), a = -Math.PI / 2 + pas / 2 + i++ * pas, cs = Math.cos(a), sn = Math.sin(a), x = R * cs, y = R * sn;
        el("line", { x1: 0, y1: 0, x2: x, y2: y, class: "g-arete g-arete--actif g-arete--" + v.l.statut }, liens);
        // Le type de relation s'écrit près du voisin, en suivant le trait : les étiquettes ne se chevauchent plus au centre.
        const ang = (a * 180) / Math.PI, droit = Math.abs(ang) <= 90 || Math.abs(ang) >= 270;
        const lt = el("text", { x: x * 0.66, y: y * 0.66, class: "g-rel", "text-anchor": "middle", dy: -4, transform: `rotate(${(droit ? ang : ang + 180).toFixed(1)} ${(x * 0.66).toFixed(1)} ${(y * 0.66).toFixed(1)})` }, liens); lt.textContent = lib;
        const n = N.get(v.autre), cote = petit ? (sn < -0.2 ? "haut" : "bas") : cs > 0.35 ? "droite" : cs < -0.35 ? "gauche" : sn < 0 ? "haut" : "bas";
        noeuds.appendChild(noeudSvg(n, x, y, petit ? 16 : 14, court(n.nom, petit ? 16 : 30), "g-noeud--voisin", cote));
      });
    });
    noeuds.appendChild(noeudSvg(c, 0, 0, petit ? 24 : 26, court(c.nom, petit ? 22 : 40), "g-noeud--sel g-noeud--centre"));
    if (!tous.length) el("text", { y: 70, "text-anchor": "middle", class: "g-rel" }, monde).textContent = "Aucune connexion visible avec les filtres choisis.";
    if (petit) cadrer(-R - 55, -R - 40, 2 * R + 110, 2 * R + 85); else cadrer(-R - 170, -R - 60, 2 * R + 340, 2 * R + 140);
  }

  function dessinerListe() {
    const zone = $("#gListe");
    zone.innerHTML = ORDRE.filter((t) => etat.types.has(t)).map((t) => {
      const l = G.noeuds.filter((n) => n.type === t && visible(n)).sort((a, b) => a.annee - b.annee);
      if (!l.length) return "";
      return `<section><h3>${esc(G.types[t].pluriel)} <small>(${l.length})</small></h3><ul>${l.map((n) => `<li><button type="button" class="g-lienb${n.id === etat.sel ? " g-lienb--sel" : ""}" data-aller="${n.id}">${esc(n.nom)}</button> <small>${esc(n.dates)}</small>${perso.favoris.includes(n.id) ? ' <span aria-label="favori">★</span>' : ""}</li>`).join("")}</ul></section>`;
    }).join("") || "<p>Aucun élément ne correspond aux filtres.</p>";
  }

  function dessiner() {
    const liste = etat.vue === "liste" || (etat.vue === "autour" && !etat.sel);
    svg.hidden = liste; $("#gListe").hidden = !liste; $("#gLegende").hidden = liste;
    app.querySelectorAll("[data-vue]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vue === (liste ? "liste" : etat.vue))));
    if (liste) dessinerListe(); else if (etat.vue === "autour") dessinerAutour(); else dessinerFrise();
    dessinerFil(); etatFiltres(); ecrireAdresse();
  }

  /* ---------- zoom et déplacement ---------- */
  function appliquer() { monde.setAttribute("transform", `translate(${etat.t.x.toFixed(1)} ${etat.t.y.toFixed(1)}) scale(${etat.t.k.toFixed(3)})`); }
  function taille() { const r = svg.getBoundingClientRect(); return { w: r.width || 800, h: r.height || 500 }; }
  function cadrer(x, y, w, h) { const { w: W, h: H } = taille(); const k = Math.min(W / w, H / h, 1.6); etat.t = { k, x: (W - w * k) / 2 - x * k, y: (H - h * k) / 2 - y * k }; appliquer(); }
  function vueInitiale() {
    if (etat.vue === "autour") { dessinerAutour(); return; }
    const { w: W, h: H } = taille(); const k = Math.max(H / HAUTEUR, Math.min(W / LARGEUR, 1)) * 0.98;
    etat.t = { k, x: 0, y: (H - HAUTEUR * k) / 2 }; appliquer();
  }
  function centrerSur(id) {
    const p = posFrise.get(id); if (!p) return; const { w: W, h: H } = taille(); const k = Math.max(etat.t.k, 0.75);
    etat.t = { k, x: W / 2 - p.x * k, y: H / 2 - p.y * k }; appliquer();
  }
  function zoomer(f, cx, cy) {
    const { w, h } = taille(); cx ??= w / 2; cy ??= h / 2;
    const k = Math.min(4, Math.max(0.15, etat.t.k * f)); const r = k / etat.t.k;
    etat.t = { k, x: cx - (cx - etat.t.x) * r, y: cy - (cy - etat.t.y) * r }; appliquer();
  }
  const pointeurs = new Map(); let glisse = null, ecart = 0, bouge = false;
  svg.addEventListener("pointerdown", (e) => { pointeurs.set(e.pointerId, e); if (pointeurs.size === 1) { glisse = { x: e.clientX, y: e.clientY, tx: etat.t.x, ty: etat.t.y }; bouge = false; } else if (pointeurs.size === 2) { const [a, b] = [...pointeurs.values()]; ecart = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } });
  svg.addEventListener("pointermove", (e) => {
    if (!pointeurs.has(e.pointerId)) return; pointeurs.set(e.pointerId, e);
    if (pointeurs.size === 2) { const [a, b] = [...pointeurs.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), r = svg.getBoundingClientRect(); if (ecart) zoomer(d / ecart, (a.clientX + b.clientX) / 2 - r.left, (a.clientY + b.clientY) / 2 - r.top); ecart = d; bouge = true; return; }
    if (!glisse) return; const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
    if (!bouge && Math.hypot(dx, dy) < 5) return;
    if (!bouge) svg.setPointerCapture(e.pointerId);
    bouge = true; etat.t.x = glisse.tx + dx; etat.t.y = glisse.ty + dy; appliquer();
  });
  const lacher = (e) => { pointeurs.delete(e.pointerId); if (!pointeurs.size) glisse = null; if (pointeurs.size < 2) ecart = 0; };
  svg.addEventListener("pointerup", lacher); svg.addEventListener("pointercancel", lacher);
  svg.addEventListener("wheel", (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomer(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  svg.addEventListener("click", (e) => { if (bouge) { bouge = false; return; } const g = e.target.closest(".g-noeud"); if (g) choisir(g.dataset.id, { vue: etat.vue === "autour" ? "autour" : null }); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.(".g-noeud"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); choisir(g.dataset.id, { vue: etat.vue === "autour" ? "autour" : null, focus: true }); } });
  app.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => zoomer(Number(b.dataset.zoom))));
  $("#gReset").addEventListener("click", () => { if (etat.vue === "frise") { etat.sel = null; etat.fil = []; rendrePanneau(); dessiner(); } vueInitiale(); });
  $("#gPlein").addEventListener("click", () => { const s = $("#gScene"); if (document.fullscreenElement) document.exitFullscreen(); else if (s.requestFullscreen) s.requestFullscreen().catch(() => s.classList.toggle("g-scene--plein")); else s.classList.toggle("g-scene--plein"); });
  document.addEventListener("fullscreenchange", () => { $("#gPlein").setAttribute("aria-pressed", String(!!document.fullscreenElement)); setTimeout(vueInitiale, 60); });
  app.querySelectorAll("[data-vue]").forEach((b) => b.addEventListener("click", () => { etat.vue = b.dataset.vue; dessiner(); if (etat.vue === "frise") { if (etat.sel) centrerSur(etat.sel); else vueInitiale(); } }));

  /* ---------- choisir un élément ---------- */
  function choisir(id, o = {}) {
    if (!N.has(id)) return;
    if (etat.sel && etat.sel !== id) { etat.fil.push(etat.sel); if (etat.fil.length > 12) etat.fil.shift(); }
    etat.sel = id;
    if (o.vue) etat.vue = o.vue;
    if (!N.get(id) || !visible(N.get(id))) { etat.types.add(N.get(id).type); }
    rendrePanneau(); dessiner();
    if (etat.vue === "frise") centrerSur(id);
    if (o.focus) { const g = svg.querySelector(`.g-noeud[data-id="${id}"]`); g ? g.focus() : $("#gPanneau").focus(); }
    if (mobile() && o.defiler !== false) $("#gPanneau").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function dessinerFil() {
    const f = $("#gFil"); const ids = [...etat.fil, etat.sel].filter(Boolean).slice(-6);
    f.hidden = ids.length < 2;
    f.innerHTML = ids.length < 2 ? "" : "<span>Ton chemin :</span> " + ids.map((id, i) => i === ids.length - 1 ? `<b aria-current="true">${esc(court(N.get(id).nom, 26))}</b>` : `<button type="button" class="g-lienb" data-retour="${i}">${esc(court(N.get(id).nom, 26))}</button>`).join(" → ");
  }
  $("#gFil").addEventListener("click", (e) => { const b = e.target.closest("[data-retour]"); if (!b) return; const ids = [...etat.fil, etat.sel].slice(-6); const id = ids[Number(b.dataset.retour)]; etat.fil = etat.fil.slice(0, etat.fil.lastIndexOf(id)); etat.sel = null; choisir(id); });

  /* ---------- le panneau documentaire ---------- */
  function rendrePanneau() {
    const p = $("#gPanneau"), n = N.get(etat.sel);
    if (!n) { p.querySelector(".g-panneau__vide").hidden = false; p.querySelector(".g-doc")?.remove(); return; }
    const t = G.types[n.type], vs = voisins.get(n.id);
    const groupes = new Map(); vs.forEach((v) => { const k = relLib(v); if (!groupes.has(k)) groupes.set(k, []); groupes.get(k).push(v); });
    const liees = (type) => vs.filter((v) => N.get(v.autre).type === type).map((v) => `<button type="button" class="g-lienb" data-aller="${v.autre}">${esc(N.get(v.autre).nom)}</button>`).filter((x, i, a) => a.indexOf(x) === i);
    const pubs = liees("publication"), evts = liees("evenement");
    const courants = (n.courants || []).map((c) => `<button type="button" class="g-lienb" data-aller="${c}">${esc(N.get(c).nom)}</button>`);
    const fav = perso.favoris.includes(n.id), parcActif = perso.parcours[perso.actif];
    const parcs = G.parcours.filter((pc) => pc.etapes.some((e) => e.n === n.id));
    const html = `<div class="g-doc">
      <p class="g-doc__type"><span class="g-pastille" style="--c:${t.couleur}"></span>${esc(t.nom)} · ${esc(n.dates)}</p>
      <h2 tabindex="-1">${esc(n.nom)}</h2>
      <p class="g-doc__resume">${esc(n.resume)}</p>
      <p class="g-doc__act">
        <button type="button" class="chip" data-act="fav" aria-pressed="${fav}">${fav ? "★ Dans mes favoris" : "☆ Favori"}</button>
        <button type="button" class="chip" data-act="parcours">+ ${parcActif ? "Ajouter à « " + esc(court(parcActif.nom, 22)) + " »" : "Commencer mon parcours"}</button>
        <button type="button" class="chip" data-act="dossier">${dansDossier(n.id) ? "✓ Dans mon dossier" : "Ajouter à mon dossier"}</button>
        ${etat.vue !== "autour" ? '<button type="button" class="chip" data-act="autour">Explorer autour</button>' : '<button type="button" class="chip" data-act="frise">Voir dans la frise</button>'}
        <a class="chip" href="${n.id}.html">Fiche complète</a>
        <button type="button" class="chip" data-act="signaler">Signaler</button>
      </p>
      <h3>Présentation</h3><p>${esc(n.contexte)}</p>
      ${courants.length ? `<p><b>Courants associés :</b> ${courants.join(", ")}</p>` : ""}
      ${pubs.length ? `<p><b>Textes et publications liés :</b> ${pubs.join(", ")}</p>` : ""}
      ${evts.length ? `<p><b>Événements liés :</b> ${evts.join(", ")}</p>` : ""}
      <h3>Connexions <small>(${vs.length})</small></h3>
      ${[...groupes].map(([lib, l]) => `<h4>${esc(cap(lib))}</h4><ul class="g-liens">${l.map((v) => `<li><button type="button" class="g-lienb g-lien__nom" data-aller="${v.autre}">${esc(N.get(v.autre).nom)}</button> <span class="g-statut g-statut--${v.l.statut}">${esc(G.statuts[v.l.statut])}</span><p>${esc(v.l.texte)}</p><details><summary>Sources</summary><ul>${v.l.sources.map((s) => `<li>${refTxt(s)}</li>`).join("")}</ul></details></li>`).join("")}</ul>`).join("")}
      ${n.pages && n.pages.length ? `<h3>Sur le site</h3><ul class="g-pages">${n.pages.map(([u, lib]) => `<li><a href="${racine}${u}">${esc(lib)}</a></li>`).join("")}</ul>` : ""}
      ${parcs.length ? `<h3>Dans les parcours</h3><p>${parcs.map((pc) => `<button type="button" class="g-lienb" data-parcours="${pc.id}">${esc(pc.titre)}</button>`).join(", ")}</p>` : ""}
      <h3>Sources</h3><ul class="g-sources">${n.sources.map((s) => `<li>${refTxt(s)}</li>`).join("")}</ul>
      <p class="g-doc__msg" role="status"></p>
    </div>`;
    p.querySelector(".g-panneau__vide").hidden = true; p.querySelector(".g-doc")?.remove(); p.insertAdjacentHTML("beforeend", html);
  }
  const msg = (t) => { const m = app.querySelector(".g-doc__msg"); if (m) m.textContent = t; };

  /* ---------- Mon dossier, favoris, parcours personnels ---------- */
  const lireDossier = () => { try { return JSON.parse(localStorage.getItem("mamie-dossier") || "null") || { titre: "", items: [] }; } catch (e) { return { titre: "", items: [] }; } };
  const dansDossier = (id) => lireDossier().items.includes("graphe/" + id);
  function versDossier(ids, titre) {
    const dos = lireDossier(); const avant = dos.items.length;
    dos.items = [...new Set([...dos.items, ...ids.map((id) => "graphe/" + id)])];
    if (!dos.titre && titre) dos.titre = titre;
    try { localStorage.setItem("mamie-dossier", JSON.stringify(dos)); } catch (e) { return -1; }
    return dos.items.length - avant;
  }
  app.addEventListener("click", (e) => {
    const aller = e.target.closest("[data-aller]"); if (aller) { e.preventDefault(); choisir(aller.dataset.aller, { focus: false }); return; }
    const pc = e.target.closest("[data-parcours]"); if (pc) { lancerParcours(pc.dataset.parcours); return; }
    const b = e.target.closest("[data-act]"); if (!b || !etat.sel) return;
    const id = etat.sel, a = b.dataset.act;
    if (a === "fav") { perso.favoris = perso.favoris.includes(id) ? perso.favoris.filter((x) => x !== id) : [...perso.favoris, id]; garderPerso(); rendrePanneau(); dessiner(); majMes(); if (!stockageOk) msg("Ton navigateur bloque l'enregistrement : les favoris disparaîtront en fermant la page."); }
    else if (a === "parcours") { if (!perso.parcours.length) { perso.parcours.push({ nom: "Mon parcours", ids: [] }); perso.actif = 0; } const pp = perso.parcours[perso.actif]; if (!pp.ids.includes(id)) pp.ids.push(id); garderPerso(); majMes(); rendrePanneau(); msg(`Ajouté à « ${pp.nom} » (${pp.ids.length} étape${pp.ids.length > 1 ? "s" : ""}).`); }
    else if (a === "dossier") { const r = versDossier([id], ""); rendrePanneau(); msg(r < 0 ? "Impossible : stockage du navigateur bloqué." : r ? "Ajouté à ton dossier." : "Déjà dans ton dossier."); }
    else if (a === "autour") { etat.vue = "autour"; dessiner(); }
    else if (a === "frise") { etat.vue = "frise"; dessiner(); centrerSur(id); }
    else if (a === "signaler") ouvrirSignal(id);
  });

  const zoneMes = $("#gMes");
  function majMes() {
    const nb = perso.favoris.length + perso.parcours.reduce((s, p) => s + p.ids.length, 0);
    $("#gMesNb").textContent = nb ? `(${nb})` : "";
    if (zoneMes.hidden) return;
    const fav = perso.favoris.map((id) => `<li><button type="button" class="g-lienb" data-aller="${id}">${esc(N.get(id).nom)}</button> <button type="button" class="chip chip--mini" data-mes="defav" data-id="${id}" aria-label="Retirer ${esc(N.get(id).nom)} des favoris">✕</button></li>`).join("");
    const parcs = perso.parcours.map((p, pi) => `<li class="g-mes__parc${pi === perso.actif ? " g-mes__parc--actif" : ""}">
      <p><b>${esc(p.nom)}</b> <small>${p.ids.length} étape${p.ids.length > 1 ? "s" : ""}${pi === perso.actif ? " · parcours en cours" : ""}</small></p>
      <ol>${p.ids.map((id, i) => `<li><button type="button" class="g-lienb" data-aller="${id}">${esc(N.get(id).nom)}</button> <span class="g-ligne"><button type="button" class="chip chip--mini" data-mes="haut" data-p="${pi}" data-i="${i}" aria-label="Monter" ${i ? "" : "disabled"}>↑</button><button type="button" class="chip chip--mini" data-mes="bas" data-p="${pi}" data-i="${i}" aria-label="Descendre" ${i < p.ids.length - 1 ? "" : "disabled"}>↓</button><button type="button" class="chip chip--mini" data-mes="ote" data-p="${pi}" data-i="${i}" aria-label="Retirer">✕</button></span></li>`).join("")}</ol>
      <p class="g-ligne">${pi !== perso.actif ? `<button type="button" class="chip" data-mes="activer" data-p="${pi}">En faire mon parcours en cours</button>` : ""}<button type="button" class="chip" data-mes="suivre" data-p="${pi}" ${p.ids.length ? "" : "disabled"}>Suivre</button><button type="button" class="chip" data-mes="dossier" data-p="${pi}" ${p.ids.length ? "" : "disabled"}>Mettre dans mon dossier</button><button type="button" class="chip" data-mes="renommer" data-p="${pi}">Renommer</button><button type="button" class="chip" data-mes="supprimer" data-p="${pi}">Supprimer</button></p></li>`).join("");
    zoneMes.innerHTML = `<h2 id="gMesTit">Mes favoris et mes parcours</h2>
      <p class="g-mes__note">Gardés dans ce navigateur seulement, comme <a href="${racine}mon-dossier">Mon dossier</a>. Pour les emporter ou les imprimer, mets-les dans ton dossier.${stockageOk ? "" : " <b>Ton navigateur bloque l'enregistrement : ils disparaîtront en fermant la page.</b>"}</p>
      <div class="g-mes__grille"><section><h3>Favoris <small>(${perso.favoris.length})</small></h3>${fav ? `<ul>${fav}</ul><p><button type="button" class="chip" data-mes="favdossier">Mettre tous mes favoris dans mon dossier</button></p>` : "<p>Pas encore de favori : ouvre un élément et clique sur « ☆ Favori ».</p>"}</section>
      <section><h3>Mes parcours</h3>${parcs ? `<ul class="g-mes__parcs">${parcs}</ul>` : "<p>Pas encore de parcours : ouvre un élément et clique sur « + Commencer mon parcours », puis ajoute les étapes une à une.</p>"}<p><button type="button" class="chip" data-mes="nouveau">+ Nouveau parcours</button></p></section></div>
      <p class="g-doc__msg" id="gMesMsg" role="status"></p>`;
  }
  $("#gMesBtn").addEventListener("click", () => { zoneMes.hidden = !zoneMes.hidden; $("#gMesBtn").setAttribute("aria-expanded", String(!zoneMes.hidden)); majMes(); if (!zoneMes.hidden) zoneMes.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
  zoneMes.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mes]"); if (!b) return;
    const a = b.dataset.mes, pi = Number(b.dataset.p), i = Number(b.dataset.i), p = perso.parcours[pi];
    let note = "";
    if (a === "defav") perso.favoris = perso.favoris.filter((x) => x !== b.dataset.id);
    else if (a === "favdossier") { const r = versDossier(perso.favoris, "Mes favoris du graphe des luttes"); note = r < 0 ? "Impossible : stockage bloqué." : `${r} fiche(s) ajoutée(s) à ton dossier.`; }
    else if (a === "nouveau") { const nom = (prompt("Nom du parcours :", "Mon parcours " + (perso.parcours.length + 1)) || "").trim(); if (!nom) return; perso.parcours.push({ nom, ids: [] }); perso.actif = perso.parcours.length - 1; }
    else if (!p) return;
    else if (a === "haut" && i > 0) [p.ids[i - 1], p.ids[i]] = [p.ids[i], p.ids[i - 1]];
    else if (a === "bas" && i < p.ids.length - 1) [p.ids[i + 1], p.ids[i]] = [p.ids[i], p.ids[i + 1]];
    else if (a === "ote") p.ids.splice(i, 1);
    else if (a === "activer") perso.actif = pi;
    else if (a === "renommer") { const nom = (prompt("Nouveau nom :", p.nom) || "").trim(); if (nom) p.nom = nom; }
    else if (a === "supprimer") { if (!confirm(`Supprimer le parcours « ${p.nom} » ? Ses étapes ne sont pas retirées de ton dossier.`)) return; perso.parcours.splice(pi, 1); perso.actif = Math.max(0, Math.min(perso.actif, perso.parcours.length - 1)); }
    else if (a === "suivre") { etat.parcours = { id: "perso-" + pi, perso: true, titre: p.nom, ids: [...p.ids], textes: [], i: 0 }; montrerEtape(); }
    else if (a === "dossier") { const r = versDossier(p.ids, p.nom); note = r < 0 ? "Impossible : stockage bloqué." : `${r} fiche(s) ajoutée(s) à ton dossier, dans l'ordre du parcours.`; }
    garderPerso(); majMes(); if (etat.sel) rendrePanneau(); if (etat.vue === "frise") dessinerFrise();
    if (note) $("#gMesMsg").textContent = note;
  });

  /* ---------- parcours thématiques ---------- */
  function lancerParcours(id) {
    const pc = G.parcours.find((x) => x.id === id); if (!pc) return;
    etat.parcours = { id, titre: pc.titre, intro: pc.intro, ids: pc.etapes.map((e) => e.n), textes: pc.etapes.map((e) => e.texte), i: 0 };
    $("#gParcours").value = id; montrerEtape();
  }
  function montrerEtape() {
    const p = etat.parcours, z = $("#gEtape");
    if (!p) { z.hidden = true; $("#gParcours").value = ""; dessiner(); return; }
    const id = p.ids[p.i], n = N.get(id);
    z.hidden = false;
    z.innerHTML = `<div class="wrap g-etape__in"><p class="g-etape__tit"><span>Parcours</span> <b>${esc(p.titre)}</b> <small>étape ${p.i + 1} sur ${p.ids.length}</small></p>
      ${p.i === 0 && p.intro ? `<p class="g-etape__intro">${esc(p.intro)}</p>` : ""}
      <p class="g-etape__txt"><b>${esc(n.nom)}</b>${p.textes[p.i] ? " — " + esc(p.textes[p.i]) : ""}</p>
      <p class="g-ligne"><button type="button" class="chip" data-etape="-1" ${p.i ? "" : "disabled"}>← Étape précédente</button><button type="button" class="chip" data-etape="1" ${p.i < p.ids.length - 1 ? "" : "disabled"}>Étape suivante →</button><button type="button" class="chip" data-etape="0">Quitter le parcours</button></p></div>`;
    etat.fil = []; etat.sel = null; choisir(id, { defiler: false });
  }
  $("#gEtape").addEventListener("click", (e) => { const b = e.target.closest("[data-etape]"); if (!b) return; const d = Number(b.dataset.etape); if (!d) { etat.parcours = null; montrerEtape(); return; } etat.parcours.i = Math.max(0, Math.min(etat.parcours.ids.length - 1, etat.parcours.i + d)); montrerEtape(); });
  $("#gParcours").addEventListener("change", (e) => { if (e.target.value) lancerParcours(e.target.value); else { etat.parcours = null; montrerEtape(); } });

  /* ---------- recherche ---------- */
  const champ = $("#gQ"), sugg = $("#gSugg"); let actifS = -1, resultats = [];
  function chercher(q) {
    const m = norm(q).trim(); if (m.length < 2) return [];
    return G.noeuds.map((n) => { const nom = norm(n.nom); const s = nom.startsWith(m) ? 3 : nom.includes(m) ? 2 : norm(n.resume + " " + n.contexte).includes(m) ? 1 : 0; return { n, s }; })
      .filter((x) => x.s).sort((a, b) => b.s - a.s || a.n.nom.localeCompare(b.n.nom)).slice(0, 8).map((x) => x.n);
  }
  function montrerSugg() {
    resultats = chercher(champ.value); actifS = -1;
    sugg.hidden = !resultats.length; champ.setAttribute("aria-expanded", String(!sugg.hidden));
    sugg.innerHTML = resultats.map((n, i) => `<li role="option" id="gS${i}" data-aller="${n.id}"><span class="g-pastille" style="--c:${G.types[n.type].couleur}"></span>${esc(n.nom)} <small>${esc(G.types[n.type].nom)} · ${esc(n.dates)}</small></li>`).join("");
  }
  champ.addEventListener("input", montrerSugg);
  champ.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!resultats.length) return; actifS = (actifS + (e.key === "ArrowDown" ? 1 : -1) + resultats.length) % resultats.length; sugg.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", String(i === actifS))); champ.setAttribute("aria-activedescendant", "gS" + actifS); }
    else if (e.key === "Enter") { e.preventDefault(); const n = resultats[Math.max(actifS, 0)]; if (n) { fermerSugg(); choisir(n.id, { vue: "autour" }); } }
    else if (e.key === "Escape") fermerSugg();
  });
  const fermerSugg = () => { sugg.hidden = true; champ.setAttribute("aria-expanded", "false"); champ.removeAttribute("aria-activedescendant"); };
  sugg.addEventListener("click", (e) => { const li = e.target.closest("[data-aller]"); if (!li) return; e.stopPropagation(); fermerSugg(); champ.value = N.get(li.dataset.aller).nom; choisir(li.dataset.aller, { vue: "autour" }); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".g-cherche")) fermerSugg(); });

  /* ---------- découverte au hasard ---------- */
  $("#gHasard").addEventListener("click", () => {
    const t = $("#gHasardType").value;
    let pool = G.noeuds.filter((n) => (!t || n.type === t) && visible(n) && n.id !== etat.sel);
    if (!pool.length) pool = G.noeuds.filter((n) => (!t || n.type === t) && n.id !== etat.sel);
    const n = pool[Math.floor(Math.random() * pool.length)];
    if (n) choisir(n.id, { vue: etat.vue === "liste" ? "liste" : "autour" });
  });

  /* ---------- filtres ---------- */
  function etatFiltres() {
    const nb = (ORDRE.length - etat.types.size) + (etat.periode ? 1 : 0) + (etat.courant ? 1 : 0);
    $("#gFiltresEtat").textContent = nb ? `(${nb} actif${nb > 1 ? "s" : ""})` : "";
  }
  $("#gTypes").innerHTML = ORDRE.map((t) => `<label class="g-type"><input type="checkbox" value="${t}" checked><span class="g-pastille" style="--c:${G.types[t].couleur}"></span>${esc(G.types[t].pluriel)}</label>`).join("");
  $("#gTypes").addEventListener("change", (e) => { const t = e.target.value; if (e.target.checked) etat.types.add(t); else etat.types.delete(t); dessiner(); });
  $("#gPeriode").insertAdjacentHTML("beforeend", periodes.map((p) => `<option value="${p.id}">${esc(p.nom)}</option>`).join(""));
  $("#gPeriode").addEventListener("change", (e) => { etat.periode = e.target.value; dessiner(); });
  $("#gCourant").insertAdjacentHTML("beforeend", G.noeuds.filter((n) => n.type === "courant").map((n) => `<option value="${n.id}">${esc(n.nom)}</option>`).join(""));
  $("#gCourant").addEventListener("change", (e) => { etat.courant = e.target.value; dessiner(); });
  $("#gRaz").addEventListener("click", () => { etat.types = new Set(ORDRE); etat.periode = ""; etat.courant = ""; $("#gPeriode").value = ""; $("#gCourant").value = ""; $("#gTypes").querySelectorAll("input").forEach((i) => { i.checked = true; }); dessiner(); });
  $("#gHasardType").insertAdjacentHTML("beforeend", ORDRE.map((t) => `<option value="${t}">${esc(G.types[t].nom)}</option>`).join(""));
  $("#gParcours").insertAdjacentHTML("beforeend", G.parcours.map((p) => `<option value="${p.id}">${esc(p.titre)} (${p.etapes.length} étapes)</option>`).join(""));

  /* ---------- légende et explications ---------- */
  $("#gLegende").innerHTML = ORDRE.map((t) => `<span><span class="g-pastille g-pastille--${G.types[t].forme}" style="--c:${G.types[t].couleur}"></span>${esc(G.types[t].nom)}</span>`).join("") +
    Object.entries(G.statuts).map(([k, v]) => `<span><span class="g-trait g-trait--${k}"></span>${esc(v)}</span>`).join("");
  $("#gStatuts").innerHTML = Object.entries(G.statuts).map(([k, v]) => `<span class="g-statut g-statut--${k}">${esc(v)}</span>`).join(" ") + " : la couleur du trait le dit aussi dans le graphe.";
  $("#gNb").textContent = G.noeuds.length;

  /* ---------- signalement (prépare un message, rien n'est envoyé) ---------- */
  const form = $("#gSignal"); let signale = null;
  function ouvrirSignal(id) {
    signale = id; const n = N.get(id);
    form.hidden = false; form.reset(); $("#gSigResultat").hidden = true; $("#gSigErreur").hidden = true;
    $("#gSigNom").textContent = `${n.nom} (${G.types[n.type].nom.toLowerCase()})`;
    $("#gSigQuoi").innerHTML = `<option value="">L'élément lui-même (présentation, dates, sources)</option>` + voisins.get(id).map((v) => `<option value="${v.l.i}">La relation : ${esc(n.nom)} ${esc(relLib(v))} ${esc(N.get(v.autre).nom)}</option>`).join("");
    form.scrollIntoView({ behavior: "smooth", block: "start" }); $("#gSigQuoi").focus({ preventScroll: true });
  }
  $("#gSigFermer").addEventListener("click", () => { form.hidden = true; });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = $("#gSigType").value, err = $("#gSigErreur");
    err.hidden = !!type; err.textContent = type ? "" : "Choisis le problème."; if (!type || !signale) return;
    const n = N.get(signale), q = $("#gSigQuoi").value, l = q !== "" ? G.liens[Number(q)] : null;
    const objet = { signalement: "graphe", element: signale, relation: l ? { de: l.de, vers: l.vers, type: l.type } : null, probleme: type, precisions: $("#gSigCom").value.trim(), source: $("#gSigSource").value.trim(), le: new Date().toISOString().slice(0, 10) };
    const texte = `SIGNALEMENT · GRAPHE DES LUTTES DE MAMIE COMMUNE\nÉlément : ${n.nom} (${signale})\n${l ? `Relation : ${N.get(l.de).nom} — ${G.relations[l.type].nom} — ${N.get(l.vers).nom}\n` : ""}Problème : ${$("#gSigType").selectedOptions[0].textContent}${objet.precisions ? `\nPrécisions : ${objet.precisions}` : ""}${objet.source ? `\nSource proposée : ${objet.source}` : ""}\nPage : ${racine}graphe/${signale}`;
    const z = $("#gSigResultat"); z.hidden = false;
    z.innerHTML = `<p><b>C'est prêt.</b> Copie ce texte et envoie-le à la bande en message privé sur <a href="https://www.instagram.com/mamie_commune/" rel="noopener">Instagram</a> ou <a href="https://www.tiktok.com/@mamie_commune" rel="noopener">TikTok</a>. Rien n'a été envoyé ni enregistré.</p><textarea readonly rows="7">${esc(texte)}</textarea><p class="g-ligne"><button type="button" class="chip" data-copier>Copier le texte</button><button type="button" class="chip" data-fichier>Télécharger (fichier pour la bande)</button></p>`;
    z.querySelector("[data-copier]").addEventListener("click", async (ev) => { try { await navigator.clipboard.writeText(texte); } catch (x) { z.querySelector("textarea").select(); document.execCommand("copy"); } ev.currentTarget.textContent = "Copié !"; });
    z.querySelector("[data-fichier]").addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(objet, null, 2)], { type: "application/json" })); a.download = `signalement-graphe-${signale}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); });
  });

  /* ---------- démarrage ---------- */
  const q = new URLSearchParams(location.search);
  if (["frise", "autour", "liste"].includes(q.get("vue"))) etat.vue = q.get("vue");
  else if (mobile()) etat.vue = q.get("n") ? "autour" : "liste";
  majMes();
  app.dataset.pret = "oui";
  if (q.get("parcours") && G.parcours.some((p) => p.id === q.get("parcours"))) {
    lancerParcours(q.get("parcours"));
    const n = q.get("n"); if (n && etat.parcours.ids.includes(n)) { etat.parcours.i = etat.parcours.ids.indexOf(n); montrerEtape(); }
  } else if (N.has(q.get("n"))) { if (!q.get("vue") && !mobile()) etat.vue = "autour"; choisir(q.get("n"), { defiler: false }); }
  else { dessiner(); vueInitiale(); }
  if (N.has(q.get("n")) && q.get("signaler")) ouvrirSignal(q.get("n"));
  addEventListener("resize", () => { if (etat.vue === "autour") dessinerAutour(); });
})();
