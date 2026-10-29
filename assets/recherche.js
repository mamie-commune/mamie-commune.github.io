// Barre de recherche (en haut de chaque page) et page recherche.html, organisées par grandes familles
// (Apprendre, S'organiser, Se défendre). L'index et les familles (data/recherche.js, généré par _src/build.ps1)
// et les lieux (data/lieux.js) ne sont chargés qu'au premier usage de la barre, pour ne pas alourdir les pages.
(function () {
  "use strict";
  const form = document.querySelector(".search__in");
  if (!form) return;
  const root = form.dataset.root || "";
  const ver = (document.currentScript && new URL(document.currentScript.src).search) || "";   // ?v=… : même version que la page
  const input = form.querySelector(".search__input");
  const scope = form.querySelector(".search__fam");
  const box = form.querySelector(".search__res");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ");

  let loading = null;
  function load() {
    if (loading) return loading;
    const need = [];
    if (!window.RECHERCHE) need.push("data/recherche.js");
    if (!window.LIEUX) need.push("data/lieux.js");
    loading = Promise.all(need.map((f) => new Promise((ok) => {
      const s = document.createElement("script");
      s.src = root + f + ver; s.onload = ok; s.onerror = ok;
      document.head.appendChild(s);
    }))).then(build);
    return loading;
  }

  let docs = [], familles = [];
  const nomFamille = (id) => (familles.find((f) => f.id === id) || {}).nom || "";
  function build() {
    familles = window.FAMILLES || [];
    docs = (window.RECHERCHE || []).map((r) => ({ ...r, nt: norm(r.t), nd: norm(r.d), nx: norm(r.x) }));
    for (const p of window.LIEUX || []) {
      const cat = (window.CATEGORIES_LIEUX && window.CATEGORIES_LIEUX[p.c] || {}).label || "";
      docs.push({ u: "carte?q=" + encodeURIComponent(p.n), f: "organiser", r: "Carte des collectifs", k: "Carte", t: p.n, d: `${p.v} · ${cat}`, nt: norm(p.n), nd: norm(`${p.v} ${cat}`), nx: norm(p.d) });
    }
  }

  // Chaque mot cherché doit apparaître quelque part ; le titre compte plus que le résumé, qui compte plus que le reste.
  // fam : limite la recherche à une famille (vide = partout).
  function search(q, fam) {
    // On retire les fins de mots (pluriel, féminin) pour que « espagne » trouve aussi « espagnole ».
    const words = norm(q).split(/[^a-z0-9]+/).filter((w) => w.length > 1 || /\d/.test(w))
      .map((w) => (w.length > 4 ? w.replace(/(es|e|s|x)$/, "") : w));
    if (!words.length) return [];
    const out = [];
    for (const r of docs) {
      if (fam && r.f !== fam) continue;
      let score = 0, ok = true;
      for (const w of words) {
        const s = (r.nt.includes(w) ? 10 : 0) + (r.nd.includes(w) ? 4 : 0) + (r.nx.includes(w) ? 1 : 0);
        if (!s) { ok = false; break; }
        score += s + (new RegExp("(^|[^a-z0-9])" + w).test(r.nt) ? 4 : 0);
      }
      if (ok) out.push([score - (r.k === "Carte" ? 3 : 0) + (r.k === "Rubrique" && r.f ? 6 : 0), r]);
    }
    return out.sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  }
  window.mamieSearch = (q, fam) => load().then(() => search(q, fam));

  // Étiquette d'un résultat : la famille en couleur, puis la rubrique ou le type de page.
  const etiquette = (r) => `${r.f ? `<em class="fam--${esc(r.f)}">${esc(nomFamille(r.f))}</em>` : ""}${esc(r.k === "Rubrique" ? (r.f ? "Rubrique" : "Page du site") : r.k === "Carte" ? "Lieu sur la carte" : r.k)}`;
  // Dans la liste déroulante : options numérotées (pour les flèches du clavier) ; sur la page de résultats : simples liens.
  const item = (r, i) => `<a class="search__item"${i === undefined ? "" : ` role="option" id="sr${i}"`} href="${root}${esc(r.u)}">
      <small>${etiquette(r)}</small><b>${esc(r.t)}</b><span>${esc(r.d)}</span></a>`;

  // Barre vide : raccourcis vers les trois familles et leurs rubriques.
  function raccourcis() {
    const fams = scope.value ? familles.filter((f) => f.id === scope.value) : familles;
    let n = 0;
    return `<div class="raccourcis"><p class="raccourcis__tit">Tape un mot, ou va directement à une rubrique :</p>` + fams.map((f) =>
      `<section class="fam--${esc(f.id)}"><h3><em>${esc(f.nom)}</em></h3>${f.rubriques.map((r) =>
        `<a role="option" id="sr${n++}" href="${root}${esc(r.u)}">${esc(r.nom)}</a>`).join("")}</section>`).join("") + `</div>`;
  }

  let current = -1, timer;
  function show(q) {
    current = -1;
    if (!q.trim()) {
      box.innerHTML = raccourcis();
    } else {
      const res = search(q, scope.value);
      const dans = scope.value ? ` dans « ${esc(nomFamille(scope.value))} »` : "";
      const lien = `${root}recherche?q=${encodeURIComponent(q)}${scope.value ? "&f=" + scope.value : ""}`;
      box.innerHTML = res.length
        ? res.slice(0, 7).map(item).join("") + `<a class="search__all" href="${lien}">Voir les ${res.length} résultat${res.length > 1 ? "s" : ""}${dans} →</a>`
        : `<p class="search__none">Rien trouvé pour « ${esc(q)} »${dans}. Essaie un autre mot, une ville, ou cherche partout.</p>`;
    }
    box.hidden = false; input.setAttribute("aria-expanded", "true");
  }
  function close() { box.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); current = -1; }

  input.addEventListener("focus", () => load().then(() => { if (document.activeElement === input) show(input.value); }));
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => load().then(() => show(input.value)), 120);
  });
  scope.addEventListener("change", () => load().then(() => { show(input.value); input.focus(); }));
  input.addEventListener("keydown", (e) => {
    const items = [...box.querySelectorAll(".search__item, .search__all, .raccourcis a")];
    if (e.key === "Escape") { close(); return; }
    if (box.hidden || !items.length || !["ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    items[current]?.classList.remove("is-on");
    current = (current + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[current].classList.add("is-on");
    items[current].scrollIntoView({ block: "nearest" });
    if (items[current].id) input.setAttribute("aria-activedescendant", items[current].id);
  });
  form.addEventListener("submit", (e) => {
    const on = box.querySelector(".is-on");
    if (on) { e.preventDefault(); location.href = on.href; }
    else if (!input.value.trim()) e.preventDefault();
  });
  document.addEventListener("click", (e) => { if (!form.contains(e.target)) close(); });

  // Page de résultats complète (recherche.html) : regroupés par famille.
  const page = document.getElementById("searchPage");
  if (page) {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    input.value = q;
    if (params.get("f")) scope.value = params.get("f");
    load().then(() => {
      const res = search(q, scope.value);
      const head = document.getElementById("searchHead");
      const dans = scope.value ? ` dans « ${nomFamille(scope.value)} »` : "";
      if (!q.trim()) { head.textContent = "Tape un mot dans la barre de recherche, en haut."; return; }
      head.textContent = res.length ? `${res.length} résultat${res.length > 1 ? "s" : ""} pour « ${q} »${dans}` : `Rien trouvé pour « ${q} »${dans}. Essaie un autre mot, ou une ville.`;
      const groups = [...familles.map((f) => [f.id, f.nom, res.filter((r) => r.f === f.id)]), ["", "Autres pages", res.filter((r) => !r.f)]].filter(([, , l]) => l.length);
      page.innerHTML = groups.map(([id, nom, l]) => `<section class="sgroup${id ? " fam--" + id : ""}"><h2>${esc(nom)} <small>${l.length}</small></h2>
        <div class="sgroup__list">${l.map((r) => item(r)).join("")}</div></section>`).join("");
    });
  }
})();
