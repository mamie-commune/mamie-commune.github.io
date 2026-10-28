// Carte anar : regroupement des points, compteurs par catégorie, recherche, ajout de lieux.
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const CATS = window.CATEGORIES_LIEUX;
  const STORE = "Mamie Commune.lieux";
  const loadUser = () => { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; } };
  const saveUser = (l) => { try { localStorage.setItem(STORE, JSON.stringify(l)); return true; } catch { return false; } };

  let userPlaces = loadUser();
  const all = () => [...window.LIEUX, ...userPlaces.map((p) => ({ ...p, mine: true }))];
  const active = new Set(Object.keys(CATS));
  let query = "";

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
  }

  if (typeof L === "undefined") {
    $("#map").innerHTML = '<p class="map__loading">La carte n\'a pas pu se charger. Vérifie ta connexion puis recharge la page.</p>';
    return;
  }

  /* ---------- carte ---------- */
  const map = L.map("map", { zoomControl: true, minZoom: 3 }).setView([46.6, 2.4], 6);
  map.attributionControl.setPrefix(false);
  $("#map .map__loading")?.remove();
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: "© contributeurs OpenStreetMap"
  }).addTo(map);

  const icon = (color, extra = "") => L.divIcon({
    className: "", iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -9],
    html: `<div class="pin ${extra}" style="background:${color};color:${color}"></div>`
  });
  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false, maxClusterRadius: 45,
    iconCreateFunction: (c) => {
      const n = c.getChildCount();
      return L.divIcon({ className: "", iconSize: n > 20 ? [50, 50] : [40, 40], html: `<div class="cluster${n > 20 ? " cluster--lg" : ""}">${n}</div>` });
    }
  }).addTo(map);

  const popup = (p) => {
    const c = CATS[p.c] || CATS.lieu;
    return `<span class="pcat" style="color:${c.color}">${esc(c.label)}${p.mine ? " · ajouté par toi" : ""}</span>
      <h4>${esc(p.n)}</h4><p>${esc(p.v)}</p>${p.d ? `<p>${esc(p.d)}</p>` : ""}`;
  };

  /* ---------- compteurs (façon tableau de bord) ---------- */
  function renderTally() {
    const list = all();
    const count = (k) => list.filter((p) => p.c === k).length;
    let html = `<button type="button" class="tally__all" data-k="*" aria-pressed="${active.size === Object.keys(CATS).length}">
      <b>${list.length}</b><small>lieux recensés, dont :</small></button>`;
    for (const [k, c] of Object.entries(CATS)) {
      html += `<button type="button" data-k="${k}" aria-pressed="${active.has(k)}">
        <b><i style="background:${c.color}"></i>${count(k)}</b><small>${esc(c.label)}</small></button>`;
    }
    $("#tally").innerHTML = html;
  }
  $("#tally").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    const k = b.dataset.k, keys = Object.keys(CATS);
    if (k === "*") keys.forEach((x) => active.add(x));
    else if (active.size === keys.length) { active.clear(); active.add(k); }   // premier clic : isoler la catégorie
    else { active.has(k) ? active.delete(k) : active.add(k); if (!active.size) keys.forEach((x) => active.add(x)); }
    render();
  });

  /* ---------- rendu ---------- */
  let shown = [];
  function render() {
    renderTally();
    const q = norm(query.trim());
    shown = all().filter((p) => active.has(p.c) && (!q || norm(`${p.n} ${p.v} ${p.d}`).includes(q)));
    cluster.clearLayers();
    shown.forEach((p) => {
      p._m = L.marker([p.lat, p.lng], { icon: icon((CATS[p.c] || CATS.lieu).color), title: p.n }).bindPopup(popup(p));
      cluster.addLayer(p._m);
    });
    $("#mapCount").textContent = `${shown.length} lieu${shown.length > 1 ? "x" : ""} affiché${shown.length > 1 ? "s" : ""}`;
    const sorted = shown.map((p, i) => [p, i]).sort((a, b) => a[0].v.localeCompare(b[0].v, "fr"));
    $("#placeList").innerHTML = shown.length ? sorted.map(([p, i]) => `
      <li><button type="button" data-i="${i}"><b>${esc(p.n)}</b>
        <small><i style="background:${(CATS[p.c] || CATS.lieu).color}"></i>${esc(p.v)}</small></button></li>`).join("")
      : '<li class="empty">Aucun lieu ne correspond. Change la recherche ou les catégories, ou ajoute le premier.</li>';
  }
  $("#placeList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    const p = shown[Number(b.dataset.i)]; if (!p) return;
    cluster.zoomToShowLayer(p._m, () => p._m.openPopup());
    if (window.innerWidth <= 980) $("#map").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  let searchTimer;
  $("#mapSearch").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      query = e.target.value; render();
      if (query.trim() && shown.length) map.fitBounds(L.latLngBounds(shown.map((p) => [p.lat, p.lng])).pad(0.3), { maxZoom: 11 });
    }, 200);
  });
  render();

  // carte.html?q=… (lien depuis la barre de recherche) : filtrer et, si un seul lieu correspond, ouvrir sa fiche.
  const q0 = new URLSearchParams(location.search).get("q");
  if (q0) {
    $("#mapSearch").value = q0; query = q0; render();
    const exact = shown.filter((p) => norm(p.n) === norm(q0));
    if (exact.length === 1) cluster.zoomToShowLayer(exact[0]._m, () => exact[0]._m.openPopup());
    else if (shown.length) map.fitBounds(L.latLngBounds(shown.map((p) => [p.lat, p.lng])).pad(0.3), { maxZoom: 11 });
  }

  /* ---------- ajout ---------- */
  const form = $("#addForm"), hint = $("#addHint");
  $("#fCat").innerHTML = Object.entries(CATS).map(([k, c]) => `<option value="${k}">${esc(c.label)}</option>`).join("");
  let draft = null, draftMarker = null, adding = false;

  function setDraft(ll, label) {
    draft = ll;
    if (draftMarker) draftMarker.setLatLng(ll);
    else {
      draftMarker = L.marker(ll, { draggable: true, icon: icon("#ffffff", "pin--new") }).addTo(map);
      draftMarker.on("dragend", () => { draft = draftMarker.getLatLng(); });
    }
    hint.textContent = label || `Point placé. Tu peux le faire glisser pour l'ajuster.`;
    hint.classList.add("ok");
  }
  function closeForm() {
    adding = false; form.hidden = true; form.reset(); draft = null;
    if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
    hint.textContent = "Clique sur la carte pour placer le point, ou cherche une adresse.";
    hint.classList.remove("ok");
    map.getContainer().style.cursor = "";
  }
  $("#addBtn").addEventListener("click", () => {
    adding = true; form.hidden = false; map.getContainer().style.cursor = "crosshair";
    if (window.innerWidth <= 980) $("#map").scrollIntoView({ behavior: "smooth", block: "start" });
    $("#fAddr").focus({ preventScroll: true });
  });
  $("#fCancel").addEventListener("click", closeForm);
  map.on("click", (e) => { if (adding) setDraft(e.latlng); });

  $("#fGeo").addEventListener("click", async () => {
    const q = $("#fAddr").value.trim();
    if (!q) { hint.textContent = "Écris d'abord une adresse ou une ville."; hint.classList.remove("ok"); return; }
    hint.textContent = "Recherche…"; hint.classList.remove("ok");
    try {
      const r = await fetch("https://api-adresse.data.gouv.fr/search/?limit=1&q=" + encodeURIComponent(q));
      const f = (await r.json()).features?.[0];
      if (!f) { hint.textContent = "Adresse introuvable. Essaie la ville seule, ou clique sur la carte."; return; }
      const [lng, lat] = f.geometry.coordinates, ll = L.latLng(lat, lng);
      setDraft(ll, `Trouvé : ${f.properties.label}. Fais glisser le point pour l'ajuster.`);
      map.setView(ll, 13);
      if (!$("#fAddr").dataset.city) $("#fAddr").dataset.city = f.properties.city || f.properties.label;
    } catch {
      hint.textContent = "La recherche d'adresse ne répond pas. Clique directement sur la carte.";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!draft) { hint.textContent = "Place d'abord le point sur la carte."; hint.classList.remove("ok"); return; }
    const name = $("#fName").value.trim(); if (!name) { $("#fName").focus(); return; }
    userPlaces.push({
      n: name, c: $("#fCat").value, lat: +draft.lat.toFixed(4), lng: +draft.lng.toFixed(4),
      v: $("#fAddr").dataset.city || $("#fAddr").value.trim() || "Position sur la carte",
      d: $("#fDesc").value.trim(), ajout: new Date().toISOString().slice(0, 10)
    });
    delete $("#fAddr").dataset.city;
    const ok = saveUser(userPlaces);
    closeForm(); render(); updateExport();
    toast(ok ? `« ${name} » ajouté. Exporte tes lieux pour les envoyer au collectif.` : `« ${name} » affiché, mais ton navigateur bloque l'enregistrement.`);
  });

  /* ---------- export ---------- */
  const exportBtn = $("#exportBtn");
  const updateExport = () => { exportBtn.textContent = `Exporter mes lieux (${userPlaces.length})`; };
  updateExport();
  exportBtn.addEventListener("click", () => {
    if (!userPlaces.length) { toast("Tu n'as encore ajouté aucun lieu."); return; }
    const blob = new Blob([JSON.stringify(userPlaces, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "Mamie Commune-lieux.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
