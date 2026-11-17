// Carte des collectifs : OpenStreetMap + Leaflet, données data/lieux.js (générées depuis data/lieux.geojson).
// Recherche par ville, département et catégorie, fiches avec site, contact public, source et date de vérification,
// export des données publiques, formulaires de proposition et de signalement (qui préparent un message : rien n'est envoyé).
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const CATS = window.CATEGORIES_LIEUX, TOUS = window.LIEUX || [];
  const DEPS = { "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes", "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "2A": "Corse-du-Sud", "2B": "Haute-Corse", "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère", "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura", "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord", "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône", "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse", "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise", "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "La Réunion", "976": "Mayotte" };
  // Régions (découpage de 2016) : chaque département y est rangé, pour filtrer et exporter par région.
  const REG = { "Auvergne-Rhône-Alpes": "01 03 07 15 26 38 42 43 63 69 73 74", "Bourgogne-Franche-Comté": "21 25 39 58 70 71 89 90", "Bretagne": "22 29 35 56",
    "Centre-Val de Loire": "18 28 36 37 41 45", "Corse": "2A 2B", "Grand Est": "08 10 51 52 54 55 57 67 68 88", "Hauts-de-France": "02 59 60 62 80",
    "Île-de-France": "75 77 78 91 92 93 94 95", "Normandie": "14 27 50 61 76", "Nouvelle-Aquitaine": "16 17 19 23 24 33 40 47 64 79 86 87",
    "Occitanie": "09 11 12 30 31 32 34 46 48 65 66 81 82", "Pays de la Loire": "44 49 53 72 85", "Provence-Alpes-Côte d'Azur": "04 05 06 13 83 84",
    "Outre-mer": "971 972 973 974 976" };
  const REGION_DE = {}; for (const [r, ds] of Object.entries(REG)) ds.split(" ").forEach((d) => { REGION_DE[d] = r; });
  const regionDe = (p) => (p.pays && p.pays !== "France" ? "" : REGION_DE[p.dep] || "");
  // Ressources du site à proposer avec chaque catégorie (« pour aller plus loin » dans les fiches).
  const RES_CAT = {
    libertaire: [["Dix questions sur l'anarchisme", "livres/dix-questions-anarchisme"]], syndicat: [["Le syndicalisme", "s-organiser#syndicalisme"], ["Lancer une grève", "agir/lancer-une-greve"]],
    association: [["Trouver des alliés", "trouver-des-allies#associations"]], antifa: [["Le tiroir Antifascisme", "antifascisme/"]], librairie: [["La bibliothèque de Mamie", "bibliotheque/"]],
    lieu: [["Bibliothèques populaires", "s-entraider#bibliotheques-populaires"]], cooperative: [["Coopératives", "s-entraider#cooperatives"]], "centre-social": [["S'entraider", "s-entraider"]],
    feministe: [["Féminisme", "se-defendre#feminisme"], ["L'autodéfense féministe", "manif/autodefense-feministe"]], antiraciste: [["Ressources antiracistes", "ressources/?theme=antiracisme"]],
    media: [["Médias indépendants", "creer#medias"]], solidarite: [["Monter une caisse de solidarité", "agir/caisse-de-solidarite"]],
    infokiosque: [["Affiches, tracts, fanzines", "creer"], ["Le centre de ressources", "ressources/"]], bibliotheque: [["Bibliothèques populaires", "s-entraider#bibliotheques-populaires"], ["La bibliothèque de Mamie", "bibliotheque/"]],
    cantine: [["Cantines populaires", "s-entraider#cantines"]], radio: [["Médias indépendants", "creer#medias"]], imprimerie: [["Affiches et tracts à imprimer", "agir/affiches-et-tracts"]],
    atelier: [["S'entraider", "s-entraider"], ["Les outils de Mamie", "outils/"]]
  };
  const MOIS = 12; // au-delà, une fiche est signalée comme ancienne
  const DM = '<a href="https://www.instagram.com/mamie_commune/" rel="noopener">Instagram</a> ou <a href="https://www.tiktok.com/@mamie_commune" rel="noopener">TikTok</a>';

  const dateFr = (iso) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "");
  function fraicheur(p) {
    if (p.etat === "a-reverifier" || !p.verifie) return { cls: "vieux", txt: "À revérifier", long: p.note || "Ces informations n'ont pas pu être confirmées récemment." };
    const mois = Math.floor((Date.now() - new Date(p.verifie + "T12:00:00")) / (30.44 * 864e5));
    if (mois >= MOIS) return { cls: "vieux", txt: `Informations anciennes (${mois} mois)`, long: `Vérifiée le ${dateFr(p.verifie)}, il y a plus d'un an.` };
    return { cls: "ok", txt: `Vérifiée le ${dateFr(p.verifie)}`, long: "" };
  }
  const lieuDe = (p) => { const v = String(p.v || "").replace(` (${p.dep})`, ""), n = DEPS[p.dep]; return [v, n && norm(v) !== norm(n) ? `${n} (${p.dep})` : p.dep && v !== p.v ? `(${p.dep})` : "", p.pays && p.pays !== "France" ? p.pays : ""].filter(Boolean).join(" · ").replace(" · (", " ("); };
  const lien = (u, t) => `<a href="${esc(u)}" rel="noopener">${esc(t)}</a>`;

  let toastTimer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 4000); }
  $("#mapMaj").textContent = dateFr(window.LIEUX_MAJ) || "—";

  if (typeof L === "undefined") { $("#map").innerHTML = '<p class="map__loading">La carte n\'a pas pu se charger. Vérifie ta connexion puis recharge la page. La liste à gauche reste utilisable.</p>'; }
  const carteOk = typeof L !== "undefined";

  /* ---------- carte ---------- */
  let map, cluster;
  const icon = (color) => L.divIcon({ className: "", iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -9], html: `<div class="pin" style="background:${color};color:${color}"></div>` });
  if (carteOk) {
    map = L.map("map", { zoomControl: true, minZoom: 3 }).setView([46.6, 2.4], 6);
    map.attributionControl.setPrefix(false);
    $("#map .map__loading")?.remove();
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© contributeurs OpenStreetMap" }).addTo(map);
    cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45, iconCreateFunction: (c) => { const n = c.getChildCount(); return L.divIcon({ className: "", iconSize: n > 20 ? [50, 50] : [40, 40], html: `<div class="cluster${n > 20 ? " cluster--lg" : ""}">${n}</div>` }); } }).addTo(map);
  }

  /* ---------- fiche descriptive ---------- */
  function fiche(p) {
    const c = CATS[p.c] || { label: p.c, color: "#999" }, fr = fraicheur(p);
    const res = [...(p.res || []), ...(RES_CAT[p.c] || [])];
    return `<div class="fiche-lieu"><span class="pcat" style="border-left-color:${c.color}">${esc(c.label)}</span>
      <h2 class="fiche-lieu__nom">${esc(p.n)}</h2>${p.org ? `<p class="fiche-lieu__org">${esc(p.org)}</p>` : ""}<p class="fiche-lieu__lieu">${esc(lieuDe(p) || (p.portee === "national" ? "Réseau national" : ""))}</p>
      ${p.sp ? `<p class="fiche-lieu__sp">${p.sp.split(/\s*,\s*/).map((x) => `<span>${esc(x)}</span>`).join("")}</p>` : ""}
      <p>${esc(p.d)}</p>
      <dl class="fiche-lieu__dl">${p.act ? `<dt>Activités publiques</dt><dd>${esc(p.act)}</dd>` : ""}
        ${p.hor ? `<dt>Horaires publiés</dt><dd>${esc(p.hor)}</dd>` : ""}
        ${p.acc ? `<dt>Accueil</dt><dd>${esc(p.acc)}</dd>` : ""}
        ${p.site ? `<dt>Site officiel</dt><dd>${lien(p.site, p.site.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</dd>` : ""}
        ${p.annuaire ? `<dt>Près de chez toi</dt><dd>${lien(p.annuaire, "Annuaire local officiel")}</dd>` : ""}
        <dt>Contact public</dt><dd>${p.contact ? esc(p.contact) : p.site ? "Sur le site officiel" : p.sourceUrl ? lien(p.sourceUrl, "Voir l'annuaire public") : "Non renseigné"}</dd>
        <dt>Source</dt><dd>${p.sourceUrl ? lien(p.sourceUrl, p.source) : esc(p.source)}</dd></dl>
      <p class="fraicheur fraicheur--${fr.cls}">${esc(fr.txt)}</p>${fr.long ? `<p class="fiche-lieu__note">${esc(fr.long)}</p>` : ""}
      ${res.length ? `<p class="fiche-lieu__res"><b>Pour aller plus loin :</b> ${res.map(([t, u]) => `<a href="${esc(u)}">${esc(t)}</a>`).join(" · ")}</p>` : ""}
      <button type="button" class="chip fiche-lieu__signal" data-signaler="${esc(p.id)}">Signaler une information fausse ou ancienne</button></div>`;
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-signaler]"); if (b) ouvrirSignalement(TOUS.find((p) => p.id === b.dataset.signaler)); });

  /* ---------- filtres ---------- */
  const active = new Set(Object.keys(CATS));
  let query = "", depChoisi = "", regChoisi = "", seulementAJour = false, shown = [], nationaux = [];
  const params = new URLSearchParams(location.search);
  const types0 = (params.get("type") || "").split(",").map((k) => ({ fa: "libertaire", ucl: "libertaire", numerique: "association" }[k] || k)).filter((k) => CATS[k]);
  if (types0.length) { active.clear(); types0.forEach((k) => active.add(k)); }
  // Départements présents dans les données, puis les autres pays.
  const depsPresents = [...new Set(TOUS.map((p) => p.dep).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
  const pays = [...new Set(TOUS.map((p) => p.pays).filter((x) => x && x !== "France"))];
  const optsDep = depsPresents.map((d) => `<option value="${d}">${d} · ${esc(DEPS[d] || d)}</option>`).join("") + pays.map((x) => `<option value="pays:${esc(x)}">${esc(x)}</option>`).join("");
  $("#depSelect").insertAdjacentHTML("beforeend", optsDep);
  $("#pDep").insertAdjacentHTML("beforeend", Object.entries(DEPS).map(([d, n]) => `<option value="${d}">${d} · ${esc(n)}</option>`).join(""));
  if (params.get("dep") && [...$("#depSelect").options].some((o) => o.value === params.get("dep"))) { depChoisi = params.get("dep"); $("#depSelect").value = depChoisi; }
  // Régions présentes dans les données (l'adresse garde un nom court : carte?reg=bretagne).
  const cleReg = (r) => norm(r).replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
  const regsPresentes = Object.keys(REG).filter((r) => TOUS.some((p) => regionDe(p) === r));
  $("#regSelect").insertAdjacentHTML("beforeend", regsPresentes.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join(""));
  if (params.get("reg")) { const r = regsPresentes.find((x) => cleReg(x) === params.get("reg")); if (r) { regChoisi = r; $("#regSelect").value = r; } }

  const correspond = (p) => {
    if (!active.has(p.c)) return false;
    if (seulementAJour && fraicheur(p).cls !== "ok") return false;
    if (regChoisi && regionDe(p) !== regChoisi) return false;
    if (depChoisi) { if (depChoisi.startsWith("pays:")) { if (p.pays !== depChoisi.slice(5)) return false; } else if (p.dep !== depChoisi) return false; }
    const q = norm(query.trim());
    return !q || norm(`${p.n} ${p.v} ${p.d} ${p.org} ${p.sp} ${p.act} ${DEPS[p.dep] || ""} ${p.dep} ${regionDe(p)} ${p.pays}`).includes(q);
  };

  function renderTally() {
    const locaux = TOUS.filter((p) => p.lat !== null);
    const count = (k) => TOUS.filter((p) => p.c === k).length;
    let html = `<button type="button" class="tally__all" data-k="*" aria-pressed="${active.size === Object.keys(CATS).length}"><b>${locaux.length}</b><small>lieux sur la carte et ${TOUS.length - locaux.length} réseaux nationaux. Toutes les catégories :</small></button>`;
    // Pas de rubrique fictive : une catégorie sans aucune fiche n'est pas proposée.
    for (const [k, c] of Object.entries(CATS)) if (count(k)) html += `<button type="button" data-k="${k}" aria-pressed="${active.has(k)}"><b><i style="background:${c.color}"></i>${count(k)}</b><small>${esc(c.label)}</small></button>`;
    $("#tally").innerHTML = html;
  }
  $("#tally").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    const k = b.dataset.k, keys = Object.keys(CATS);
    if (k === "*") keys.forEach((x) => active.add(x));
    else if (active.size === keys.length) { active.clear(); active.add(k); }
    else { active.has(k) ? active.delete(k) : active.add(k); if (!active.size) keys.forEach((x) => active.add(x)); }
    render(true);
  });

  function render(cadrer) {
    renderTally();
    const sel = TOUS.filter(correspond);
    shown = sel.filter((p) => p.lat !== null); nationaux = sel.filter((p) => p.lat === null);
    if (carteOk) {
      cluster.clearLayers();
      shown.forEach((p) => { p._m = L.marker([p.lat, p.lng], { icon: icon((CATS[p.c] || {}).color || "#999"), title: p.n }).bindPopup(() => fiche(p), { maxWidth: 320 }); cluster.addLayer(p._m); });
      if (cadrer && shown.length && (query.trim() || depChoisi || regChoisi || active.size < Object.keys(CATS).length)) map.fitBounds(L.latLngBounds(shown.map((p) => [p.lat, p.lng])).pad(0.3), { maxZoom: 11 });
    }
    $("#mapCount").textContent = `${shown.length} lieu${shown.length > 1 ? "x" : ""} affiché${shown.length > 1 ? "s" : ""}`;
    const tri = shown.map((p, i) => [p, i]).sort((a, b) => a[0].v.localeCompare(b[0].v, "fr") || a[0].n.localeCompare(b[0].n, "fr"));
    $("#placeList").innerHTML = shown.length ? tri.map(([p, i]) => { const fr = fraicheur(p); return `<li><button type="button" data-i="${i}"><b>${esc(p.n)}</b><small><i style="background:${(CATS[p.c] || {}).color}"></i>${esc(lieuDe(p))}${fr.cls === "vieux" ? ` <em class="fraicheur fraicheur--vieux">${esc(fr.txt)}</em>` : ""}</small></button></li>`; }).join("")
      : '<li class="empty">Aucun lieu ne correspond. Change la recherche, le département ou les catégories. Il manque une structure ? Propose-la.</li>';
    $("#nationalList").innerHTML = nationaux.length ? nationaux.map((p) => `<li><details><summary><b>${esc(p.n)}</b><small><i style="background:${(CATS[p.c] || {}).color}"></i>${esc((CATS[p.c] || {}).label)}</small></summary>${fiche(p)}</details></li>`).join("") : '<li class="empty">Aucun réseau national dans cette sélection.</li>';
    // Garde la sélection dans l'adresse (lien partageable).
    const u = new URLSearchParams(); if (query.trim()) u.set("q", query.trim()); if (regChoisi) u.set("reg", cleReg(regChoisi)); if (depChoisi) u.set("dep", depChoisi); if (active.size < Object.keys(CATS).length) u.set("type", [...active].join(","));
    history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
  }
  $("#placeList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b || !carteOk) return;
    const p = shown[Number(b.dataset.i)]; if (!p) return;
    cluster.zoomToShowLayer(p._m, () => p._m.openPopup());
    if (window.innerWidth <= 980) $("#map").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  let searchTimer;
  $("#mapSearch").addEventListener("input", (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { query = e.target.value; render(true); }, 200); });
  $("#depSelect").addEventListener("change", (e) => { depChoisi = e.target.value; render(true); });
  // Choisir une région remet le département à « tous » s'il n'en fait pas partie.
  $("#regSelect").addEventListener("change", (e) => { regChoisi = e.target.value; if (depChoisi && regChoisi && REGION_DE[depChoisi] !== regChoisi) { depChoisi = ""; $("#depSelect").value = ""; } render(true); });
  $("#freshOnly").addEventListener("change", (e) => { seulementAJour = e.target.checked; render(false); });
  const q0 = params.get("q");
  if (q0) { $("#mapSearch").value = q0; query = q0; }
  render(Boolean(q0 || depChoisi || regChoisi || types0.length));
  if (q0 && carteOk) { const exact = shown.filter((p) => norm(p.n) === norm(q0)); if (exact.length === 1) cluster.zoomToShowLayer(exact[0]._m, () => exact[0]._m.openPopup()); }

  /* ---------- export des données publiques ---------- */
  function telecharger(nom, contenu, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([contenu], { type })); a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
  const CHAMPS = [["id", "id"], ["nom", "n"], ["categorie", "c"], ["organisation", "org"], ["ville", "v"], ["departement", "dep"], ["pays", "pays"], ["portee", "portee"], ["description", "d"], ["specialites", "sp"], ["activites", "act"], ["horaires", "hor"], ["accueil", "acc"], ["site", "site"], ["contact", "contact"], ["annuaire", "annuaire"], ["source", "source"], ["sourceUrl", "sourceUrl"], ["verifie", "verifie"], ["etat", "etat"], ["note", "note"]];
  const selection = () => [...shown, ...nationaux];
  $("#exportGeo").addEventListener("click", () => {
    const fc = { type: "FeatureCollection", metadata: { source: "Mamie Commune, carte des collectifs", licence: "ODbL", export: new Date().toISOString().slice(0, 10) },
      features: selection().map((p) => ({ type: "Feature", geometry: p.lat === null ? null : { type: "Point", coordinates: [p.lng, p.lat] }, properties: Object.fromEntries(CHAMPS.map(([k, j]) => [k, p[j] ?? ""])) })) };
    telecharger("mamie-commune-lieux-selection.geojson", JSON.stringify(fc, null, 1), "application/geo+json"); toast(`${fc.features.length} structures exportées en GeoJSON.`);
  });
  $("#exportCsv").addEventListener("click", () => {
    const cell = (s) => { s = String(s ?? ""); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lignes = [[...CHAMPS.map(([k]) => k), "region", "latitude", "longitude"], ...selection().map((p) => [...CHAMPS.map(([, j]) => p[j] ?? ""), regionDe(p), p.lat ?? "", p.lng ?? ""])];
    telecharger("mamie-commune-lieux-selection.csv", "﻿" + lignes.map((l) => l.map(cell).join(";")).join("\r\n"), "text/csv;charset=utf-8"); toast(`${lignes.length - 1} structures exportées en CSV.`);
  });

  // Carnet d'adresses de la sélection : un fichier HTML autonome (lisible sans connexion) ou une version à imprimer en PDF.
  // Il garde les noms, catégories, informations publiques, sources et dates de vérification. Jamais de coordonnées GPS.
  function titreSelection() {
    const bouts = [];
    if (active.size < Object.keys(CATS).length) bouts.push([...active].filter((k) => TOUS.some((p) => p.c === k)).map((k) => CATS[k].label).join(", "));
    if (regChoisi) bouts.push(regChoisi);
    if (depChoisi) bouts.push(depChoisi.startsWith("pays:") ? depChoisi.slice(5) : `${DEPS[depChoisi] || ""} (${depChoisi})`);
    if (query.trim()) bouts.push(`« ${query.trim()} »`);
    if (seulementAJour) bouts.push("fiches à jour seulement");
    return bouts.join(" · ") || "Toute la carte";
  }
  function carnet(pourImprimer) {
    const sel = selection().slice().sort((a, b) => (regionDe(a) || "~" + (a.pays || "")).localeCompare(regionDe(b) || "~" + (b.pays || ""), "fr")
      || String(a.dep).localeCompare(String(b.dep), "fr", { numeric: true }) || a.v.localeCompare(b.v, "fr") || a.n.localeCompare(b.n, "fr"));
    const jour = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    let groupe = "", corps = "";
    for (const p of sel) {
      const g = p.lat === null ? "Réseaux nationaux" : regionDe(p) || p.pays || "Autres";
      if (g !== groupe) { corps += `<h2>${esc(g)}</h2>`; groupe = g; }
      const fr = fraicheur(p), c = CATS[p.c] || { label: p.c };
      corps += `<article><p class="cat">${esc(c.label)}</p><h3>${esc(p.n)}</h3><p class="lieu">${esc(lieuDe(p) || (p.portee === "national" ? "Réseau national" : ""))}${p.org ? " · " + esc(p.org) : ""}</p>
        ${p.sp ? `<p class="sp">${esc(p.sp)}</p>` : ""}<p>${esc(p.d)}</p><dl>${p.act ? `<dt>Activités</dt><dd>${esc(p.act)}</dd>` : ""}${p.hor ? `<dt>Horaires publiés</dt><dd>${esc(p.hor)}</dd>` : ""}${p.acc ? `<dt>Accueil</dt><dd>${esc(p.acc)}</dd>` : ""}
        ${p.site ? `<dt>Site</dt><dd><a href="${esc(p.site)}">${esc(p.site)}</a></dd>` : ""}${p.annuaire ? `<dt>Annuaire local</dt><dd><a href="${esc(p.annuaire)}">${esc(p.annuaire)}</a></dd>` : ""}${p.contact ? `<dt>Contact public</dt><dd>${esc(p.contact)}</dd>` : ""}
        <dt>Source</dt><dd>${p.sourceUrl ? `<a href="${esc(p.sourceUrl)}">${esc(p.source)}</a>` : esc(p.source)}</dd></dl><p class="fr ${fr.cls}">${esc(fr.txt)}</p></article>`;
    }
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Carnet d'adresses · Mamie Commune</title><style>
      body{margin:0;background:#f0ebdf;color:#0e0d0c;font:15px/1.5 Georgia,serif}main{max-width:820px;margin:0 auto;padding:28px 20px 50px}
      header{border-bottom:6px solid #0e0d0c;margin-bottom:18px;padding-bottom:12px}header p.k{display:inline-block;margin:0 0 8px;padding:3px 8px;border:3px solid #d3150c;color:#d3150c;font:700 13px/1.2 Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;transform:rotate(-2deg)}
      h1{margin:0;font:900 38px/1 "Arial Narrow",Arial,sans-serif;text-transform:uppercase}h2{margin:30px 0 8px;display:inline-block;padding:4px 12px 2px;background:#0e0d0c;color:#f0ebdf;font:900 22px/1.1 "Arial Narrow",Arial,sans-serif;text-transform:uppercase}
      article{break-inside:avoid;background:#fbf8f1;border-left:6px solid #d3150c;padding:10px 14px;margin:10px 0}h3{margin:0;font:700 19px/1.15 Arial,sans-serif}.cat{margin:0;color:#9c0f08;font:700 11px/1.3 Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em}
      .lieu{margin:2px 0 6px;color:#4a443d;font-size:14px}.sp{margin:0 0 4px;font:italic 14px/1.4 Georgia,serif}dl{display:grid;grid-template-columns:max-content 1fr;gap:2px 12px;margin:6px 0;font-size:14px}dt{font-weight:700}dd{margin:0;overflow-wrap:anywhere}
      .fr{margin:4px 0 0;font:700 12px/1.3 Arial,sans-serif}.fr.vieux{color:#9c0f08}.fr.ok{color:#2e6b2e}a{color:#9c0f08}footer{margin-top:30px;border-top:2px dashed #0e0d0c;padding-top:10px;font-size:13px}
      @media print{body{background:#fff}article{background:#fff}main{padding:0}a{color:#000}}</style></head><body><main>
      <header><p class="k">Carnet d'adresses de Mamie Commune</p><h1>${esc(titreSelection())}</h1><p>${sel.length} structure${sel.length > 1 ? "s" : ""} · exporté le ${esc(jour)} · données de la carte mises à jour le ${esc(dateFr(window.LIEUX_MAJ))}</p></header>
      ${corps || "<p>Aucune structure dans cette sélection.</p>"}
      <footer><p><b>À lire avant de s'en servir.</b> Seulement des structures publiques, situées au niveau de la ville, avec ce qu'elles publient elles-mêmes : jamais de domicile ni de coordonnée personnelle. Une fiche « à revérifier » ou « ancienne » peut avoir changé : vérifie sur le site de la structure avant de t'y rendre. Une erreur ? Signale-la sur https://mamiecommune.org/carte.</p>
      <p>Source : Mamie Commune, carte des collectifs (https://mamiecommune.org/carte). Données libres de réutilisation sous licence ODbL, en citant la source.</p></footer>
      </main>${pourImprimer ? "<script>addEventListener('load',()=>setTimeout(()=>print(),200))<\/script>" : ""}</body></html>`;
  }
  const nomCarnet = () => "carnet-mamie-commune-" + (norm(titreSelection()).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "carte");
  $("#exportHtml").addEventListener("click", () => { telecharger(nomCarnet() + ".html", carnet(false), "text/html;charset=utf-8"); toast(`Carnet de ${selection().length} structures téléchargé : il s'ouvre sans connexion.`); });
  $("#exportPdf").addEventListener("click", () => {
    // Un cadre invisible porte le carnet, et la fenêtre d'impression du navigateur propose « Enregistrer en PDF ».
    const f = document.createElement("iframe"); f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(f); f.srcdoc = carnet(true); setTimeout(() => f.remove(), 120000);
    toast("La fenêtre d'impression s'ouvre : choisis « Enregistrer en PDF » pour garder le fichier.");
  });
  // Ancienne version de la carte : des lieux ajoutés restaient dans le navigateur. On permet de les récupérer ou de les effacer.
  const ANCIEN = "Mamie Commune.lieux";
  let anciens = []; try { anciens = JSON.parse(localStorage.getItem(ANCIEN) || "[]"); } catch (e) { anciens = []; }
  if (anciens.length) {
    $("#legacyBox").hidden = false;
    $("#legacyExport").addEventListener("click", () => telecharger("mes-anciens-lieux.json", JSON.stringify(anciens, null, 2), "application/json"));
    $("#legacyClear").addEventListener("click", () => { if (!confirm("Effacer ces lieux de ce navigateur ?")) return; try { localStorage.removeItem(ANCIEN); } catch (e) { /* rien */ } $("#legacyBox").hidden = true; toast("Effacés de ce navigateur."); });
  }

  /* ---------- formulaires : proposition et signalement ---------- */
  const propForm = $("#propForm"), reportForm = $("#reportForm");
  $("#pCat").innerHTML = '<option value="">—</option>' + Object.entries(CATS).map(([k, c]) => `<option value="${k}">${esc(c.label)}</option>`).join("");
  let draft = null, draftMarker = null;
  function fermer(f) { f.hidden = true; if (f === propForm && draftMarker) { map.removeLayer(draftMarker); draftMarker = null; draft = null; } if (carteOk) map.getContainer().style.cursor = ""; }
  document.querySelectorAll("[data-fermer]").forEach((b) => b.addEventListener("click", () => fermer(b.closest("form"))));
  $("#proposeBtn").addEventListener("click", () => {
    reportForm.hidden = true; propForm.hidden = false; $("#pResultat").hidden = true; if (carteOk) map.getContainer().style.cursor = "crosshair";
    if (window.innerWidth <= 980) propForm.scrollIntoView({ behavior: "smooth", block: "start" }); $("#pNom").focus({ preventScroll: true });
  });
  // Le point est arrondi à deux décimales (environ un kilomètre) : jamais d'adresse précise.
  const arrondi = (x) => Math.round(x * 100) / 100;
  function placer(ll, msg) {
    draft = L.latLng(arrondi(ll.lat), arrondi(ll.lng));
    if (draftMarker) draftMarker.setLatLng(draft); else draftMarker = L.marker(draft, { icon: L.divIcon({ className: "", iconSize: [20, 20], html: '<div class="pin pin--new" style="background:#fff"></div>' }) }).addTo(map);
    $("#pHint").textContent = msg || "Point placé (arrondi au kilomètre)."; $("#pHint").classList.add("ok");
  }
  if (carteOk) map.on("click", (e) => { if (!propForm.hidden) placer(e.latlng); });
  $("#pGeo").addEventListener("click", async () => {
    const q = $("#pVille").value.trim(); if (!q) { $("#pHint").textContent = "Écris d'abord la ville."; return; }
    $("#pHint").textContent = "Recherche…";
    try {
      const r = await fetch("https://api-adresse.data.gouv.fr/search/?type=municipality&limit=1&q=" + encodeURIComponent(q));
      const f = (await r.json()).features?.[0];
      if (!f) { $("#pHint").textContent = "Ville introuvable. Clique sur la carte, ou laisse sans point : la bande placera la structure."; return; }
      const [lng, lat] = f.geometry.coordinates; placer(L.latLng(lat, lng), `Trouvé : ${f.properties.label}.`); map.setView([lat, lng], 11);
      const code = String(f.properties.citycode || "").slice(0, f.properties.citycode?.startsWith("97") ? 3 : 2); if (DEPS[code]) $("#pDep").value = code;
    } catch (e) { $("#pHint").textContent = "La recherche ne répond pas. Clique sur la carte, ou laisse sans point."; }
  });
  function resultat(zone, texte, objet, nomFichier) {
    zone.hidden = false;
    zone.innerHTML = `<p><b>C'est prêt.</b> Copie ce texte, ou télécharge le fichier, et envoie-le à la bande par message privé sur ${DM}. La bande vérifie avant de publier ; rien n'a été envoyé ni enregistré.</p><textarea readonly rows="8">${esc(texte)}</textarea><div class="addform__actions"><button type="button" class="btn btn--main" data-copier>Copier le texte</button><button type="button" class="btn" data-fichier>Télécharger (.json)</button></div>`;
    zone.querySelector("[data-copier]").addEventListener("click", async (e) => { try { await navigator.clipboard.writeText(texte); e.currentTarget.textContent = "Copié !"; } catch (err) { zone.querySelector("textarea").select(); document.execCommand("copy"); e.currentTarget.textContent = "Copié !"; } });
    zone.querySelector("[data-fichier]").addEventListener("click", () => telecharger(nomFichier, JSON.stringify(objet, null, 2), "application/json"));
    zone.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  const URL_OK = (u) => !u || /^https?:\/\/[^\s.]+\.[^\s]+$/.test(u);
  // Garde-fou : on refuse un numéro de portable ou une adresse de rue dans une proposition (protection des personnes).
  const PERSO = (s) => /(?<!\d)(0|\+33\s?)[67](\s?\d\d){4}/.test(s) || /\b\d{1,4}(bis|ter)?,?\s+(rue|avenue|boulevard|bd|place|chemin|impasse|allée)\b/i.test(s);
  propForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (id) => $(id).value.trim(), err = $("#pErreur");
    const manque = [["#pNom", "le nom"], ["#pCat", "la catégorie"], ["#pVille", "la ville"], ["#pDesc", "ce que fait la structure"], ["#pSource", "où les informations sont publiées"]].filter(([id]) => !v(id)).map(([, t]) => t);
    let msg = manque.length ? `Il manque : ${manque.join(", ")}.` : "";
    if (!msg && !URL_OK(v("#pSite"))) msg = "Le site officiel doit commencer par http:// ou https://.";
    if (!msg && PERSO(`${v("#pContact")} ${v("#pDesc")} ${v("#pVille")}`)) msg = "Pas de numéro de portable ni d'adresse de rue : seulement une ville et les contacts publics de la structure (site, adresse de contact du collectif).";
    if (!msg && !($("#pOk1").checked && $("#pOk2").checked)) msg = "Coche les deux engagements : structure publique, coordonnées publiées par la structure.";
    err.hidden = !msg; err.textContent = msg; if (msg) { $("#pResultat").hidden = true; return; }   // pas d'ancienne proposition à côté de l'erreur
    const objet = { type: "Feature", geometry: draft ? { type: "Point", coordinates: [draft.lng, draft.lat] } : null, properties: { nom: v("#pNom"), categorie: v("#pCat"), ville: v("#pVille"), departement: v("#pDep"), site: v("#pSite"), contact: v("#pContact"), description: v("#pDesc"), source: v("#pSource"), etat: "proposition", proposeLe: new Date().toISOString().slice(0, 10) } };
    const texte = `PROPOSITION POUR LA CARTE DE MAMIE COMMUNE\nNom : ${v("#pNom")}\nCatégorie : ${CATS[v("#pCat")].label}\nVille : ${v("#pVille")}${v("#pDep") ? ` (${v("#pDep")})` : ""}\nSite officiel : ${v("#pSite") || "—"}\nContact public : ${v("#pContact") || "—"}\nCe qu'elle fait : ${v("#pDesc")}\nSource : ${v("#pSource")}${draft ? `\nPosition (arrondie) : ${draft.lat}, ${draft.lng}` : ""}`;
    resultat($("#pResultat"), texte, objet, "proposition-" + norm(v("#pNom")).replace(/[^a-z0-9]+/g, "-").slice(0, 40) + ".json");
  });
  let signale = null;
  function ouvrirSignalement(p) {
    if (!p) return; signale = p; propForm.hidden = true; reportForm.hidden = false; reportForm.reset(); $("#rResultat").hidden = true; $("#rErreur").hidden = true; $("#rUrgent").hidden = true;
    $("#rNom").textContent = p.n; if (carteOk) map.closePopup();
    if (window.innerWidth <= 980) reportForm.scrollIntoView({ behavior: "smooth", block: "start" }); $("#rType").focus({ preventScroll: true });
  }
  $("#rType").addEventListener("change", (e) => { $("#rUrgent").hidden = e.target.value !== "danger"; });
  reportForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = $("#rType").value, err = $("#rErreur");
    err.hidden = !!type; err.textContent = type ? "" : "Choisis ce qui ne va pas."; if (!type || !signale) return;
    const lib = $("#rType").selectedOptions[0].textContent;
    const objet = { signalement: true, id: signale.id, nom: signale.n, probleme: type, precisions: $("#rCom").value.trim(), source: $("#rSource").value.trim(), signaleLe: new Date().toISOString().slice(0, 10) };
    const texte = `${type === "danger" ? "URGENT · " : ""}SIGNALEMENT CARTE DE MAMIE COMMUNE\nStructure : ${signale.n} (${signale.id})\nProblème : ${lib}${objet.precisions ? `\nPrécisions : ${objet.precisions}` : ""}${objet.source ? `\nVu sur : ${objet.source}` : ""}`;
    resultat($("#rResultat"), texte, objet, `signalement-${signale.id}.json`);
  });
})();
