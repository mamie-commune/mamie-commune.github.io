// Carte du mouvement du 17 Octobre : données recopiées de 17octobregiletjaune.net (data/mobilisations.js).
// Un lieu = [lat, lon, genre, nom, commune, cp, [[type, heure, jour, précision], …]].
(function () {
  "use strict";
  const D = window.MOBILISATIONS;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!D || !window.L) { $("#map").innerHTML = '<p class="map__loading">La carte ne se charge pas pour l\'instant.</p>'; return; }

  // Types d'action regroupés comme sur la carte du mouvement, chacun sa couleur.
  const GROUPES = {
    manif: { label: "manifestations", color: "#ff5aa8", types: ["manifestation"] },
    rond: { label: "ronds-points", color: "#f5c400", types: ["rond_point"] },
    sitting: { label: "sittings", color: "#7fd1ff", types: ["sitting"] },
    casserole: { label: "casserolades", color: "#ff9a3c", types: ["casserolade"] },
    blocage: { label: "blocages et barrages", color: "#e2321b", types: ["blocage", "barrage_filtrant", "operation_escargot", "piquet_de_greve"] },
    rassemblement: { label: "rassemblements et tractages", color: "#8fd694", types: ["rassemblement", "tractage", "pancartes", "prise_de_parole", "autre"] },
    assemblee: { label: "assemblées", color: "#b48cff", types: ["assemblee"] },
  };
  const TYPES = { rassemblement: "Rassemblement", tractage: "Distribution de tracts", pancartes: "Pancartes et banderoles", prise_de_parole: "Prise de parole",
    barrage_filtrant: "Barrage filtrant", blocage: "Blocage", operation_escargot: "Opération escargot", manifestation: "Manifestation", piquet_de_greve: "Piquet de grève",
    rond_point: "Rassemblement sur un rond-point", casserolade: "Casserolade", sitting: "Sitting", autre: "Autre action", assemblee: "Assemblée" };
  const GENRES = { station: "Station-service", raffinerie: "Raffinerie", depot: "Dépôt pétrolier", gare: "Gare", port: "Port", pont: "Pont", peage: "Péage",
    lycee: "Lycée", superieur: "Université ou école", manif: "Lieu de manifestation" };
  const groupeDe = (t) => Object.keys(GROUPES).find((g) => GROUPES[g].types.includes(t)) || "rassemblement";

  const lieux = D.lieux.map(([lat, lon, genre, nom, ville, cp, actions]) => ({ lat, lon, genre, nom, ville, cp, actions, txt: norm(`${nom} ${ville} ${cp}`) }));
  const AUJ = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());
  const jourLong = (j) => new Date(j + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const jourCourt = (j) => new Date(j + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

  // Jours proposés : chaque jour qui a des actions, plus « à venir » et « tous ».
  const parJour = {};
  lieux.forEach((l) => l.actions.forEach((a) => { parJour[a[2]] = (parJour[a[2]] || 0) + 1; }));
  const jours = Object.keys(parJour).sort();
  const aVenir = jours.filter((j) => j >= AUJ);
  const opts = [["avenir", `Tous les jours à venir (${aVenir.reduce((n, j) => n + parJour[j], 0)})`],
    ...aVenir.map((j) => [j, `${j === AUJ ? "Aujourd'hui, " : ""}${jourLong(j)} (${parJour[j]})`]),
    ["tout", `Tous les jours, passés compris (${jours.reduce((n, j) => n + parJour[j], 0)})`],
    ...jours.filter((j) => j < AUJ).reverse().map((j) => [j, `${jourLong(j)}, passé (${parJour[j]})`])];
  $("#mobJour").innerHTML = opts.map(([v, t]) => `<option value="${v}">${esc(t.charAt(0).toUpperCase() + t.slice(1))}</option>`).join("");
  const voulu = (/#jour=([\w-]+)/.exec(location.hash) || [])[1];
  let jour = opts.some(([v]) => v === voulu) ? voulu : (parJour["2026-10-31"] && "2026-10-31" >= AUJ ? "2026-10-31" : aVenir[0] || "tout");
  $("#mobJour").value = jour;

  const maj = new Date(D.maj);
  $("#mobMaj").textContent = `Carte des mobilisations · mise à jour le ${maj.toLocaleDateString("fr-FR")} à ${D.maj.slice(11, 16)}`;

  const active = new Set(Object.keys(GROUPES));
  let query = "";
  const garde = (a) => jour === "tout" || (jour === "avenir" ? a[2] >= AUJ : a[2] === jour);

  /* ---------- carte ---------- */
  const map = L.map("map", { zoomControl: true, minZoom: 3 }).setView([46.6, 2.4], 6);
  map.attributionControl.setPrefix(false);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© contributeurs OpenStreetMap · données 17octobregiletjaune.net" }).addTo(map);
  const icon = (color) => L.divIcon({ className: "", iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -9],
    html: `<div class="pin pin--rond" style="background:${color}"></div>` });
  const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45, chunkedLoading: true,
    iconCreateFunction: (c) => { const n = c.getChildCount(); return L.divIcon({ className: "", iconSize: n > 20 ? [50, 50] : [40, 40], html: `<div class="cluster${n > 20 ? " cluster--lg" : ""}">${n}</div>` }); }
  }).addTo(map);

  const popup = (l, acts) => `<span class="pcat">${esc(GENRES[l.genre] || "Lieu")}</span><h4>${esc(l.nom)}</h4><p>${esc(l.ville)} ${esc(l.cp)}</p>
    <ul class="mobacts">${acts.map((a) => `<li><b>${esc(jourCourt(a[2]))}${a[1] ? " · " + esc(a[1].replace(":", " h ")) : ""}</b> ${esc(TYPES[a[0]] || a[0])}${a[3] ? `<br><small>${esc(a[3])}</small>` : ""}</li>`).join("")}</ul>`;

  /* ---------- rendu ---------- */
  let shown = [];
  function render() {
    // Actions du jour choisi, puis filtre par type et par recherche.
    const duJour = [];
    for (const l of lieux) { const acts = l.actions.filter(garde); if (acts.length) duJour.push([l, acts]); }
    const compte = {}; let total = 0;
    duJour.forEach(([, acts]) => acts.forEach((a) => { const g = groupeDe(a[0]); compte[g] = (compte[g] || 0) + 1; total++; }));
    $("#mobTally").innerHTML = `<button type="button" class="tally__all" data-k="*" aria-pressed="${active.size === Object.keys(GROUPES).length}"><b>${total}</b><small>mobilisations recensées, dont :</small></button>` +
      Object.entries(GROUPES).map(([k, g]) => `<button type="button" data-k="${k}" aria-pressed="${active.has(k)}"><b><i style="background:${g.color}"></i>${compte[k] || 0}</b><small>${esc(g.label)}</small></button>`).join("");
    const q = norm(query.trim());
    shown = duJour.map(([l, acts]) => [l, acts.filter((a) => active.has(groupeDe(a[0])))]).filter(([l, acts]) => acts.length && (!q || l.txt.includes(q)));
    cluster.clearLayers();
    cluster.addLayers(shown.map(([l, acts]) => L.marker([l.lat, l.lon], { icon: icon(GROUPES[groupeDe(acts[0][0])].color), title: l.nom }).bindPopup(() => popup(l, acts), { maxWidth: 300 })));
    $("#mobJourTitre").textContent = jour === "tout" ? "tous les jours" : jour === "avenir" ? "les jours à venir" : (jour === AUJ ? "aujourd'hui" : jourLong(jour));
    $("#mobCount").textContent = `${shown.length} lieu${shown.length > 1 ? "x" : ""} affiché${shown.length > 1 ? "s" : ""}`;
    const tri = shown.map((s, i) => [s, i]).sort((a, b) => a[0][0].cp.localeCompare(b[0][0].cp) || a[0][0].ville.localeCompare(b[0][0].ville, "fr")).slice(0, 400);
    $("#mobList").innerHTML = shown.length ? tri.map(([[l, acts], i]) => `<li><button type="button" data-i="${i}"><b>${esc(l.ville)} (${esc(l.cp.slice(0, 2))})</b>
      <small><i style="background:${GROUPES[groupeDe(acts[0][0])].color}"></i>${esc(TYPES[acts[0][0]] || "")}${acts[0][1] ? " · " + esc(acts[0][1]) : ""} · ${esc(l.nom)}</small></button></li>`).join("") +
      (shown.length > 400 ? `<li class="empty">… et ${shown.length - 400} autres : cherche une ville pour les voir.</li>` : "")
      : '<li class="empty">Aucune mobilisation ne correspond. Change de jour, de recherche ou de type.</li>';
  }

  $("#mobTally").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    const k = b.dataset.k, keys = Object.keys(GROUPES);
    if (k === "*") keys.forEach((x) => active.add(x));
    else if (active.size === keys.length) { active.clear(); active.add(k); }   // premier clic : isoler le type
    else { active.has(k) ? active.delete(k) : active.add(k); if (!active.size) keys.forEach((x) => active.add(x)); }
    render();
  });
  $("#mobJour").addEventListener("change", (e) => { jour = e.target.value; history.replaceState(null, "", "#jour=" + jour); render(); });
  let t; $("#mobSearch").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { query = e.target.value; render(); }, 200); });
  $("#mobList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    const [l, acts] = shown[Number(b.dataset.i)];
    map.setView([l.lat, l.lon], 14);
    L.popup({ maxWidth: 300 }).setLatLng([l.lat, l.lon]).setContent(popup(l, acts)).openOn(map);
    if (window.matchMedia("(max-width: 900px)").matches) $("#map").scrollIntoView({ behavior: "smooth" });
  });
  render();
})();
