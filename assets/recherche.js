// Barre de recherche (en haut de chaque page) et page recherche.html.
// L'index (data/recherche.js, généré par _src/build.ps1) et les lieux (data/lieux.js) ne sont chargés
// qu'au premier usage de la barre, pour ne pas alourdir les pages.
(function () {
  "use strict";
  const form = document.querySelector(".search__in");
  if (!form) return;
  const root = form.dataset.root || "";
  const ver = (document.currentScript && new URL(document.currentScript.src).search) || "";   // ?v=… : même version que la page
  const input = form.querySelector(".search__input");
  const box = form.querySelector(".search__res");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ");

  // Ordre d'affichage des rubriques sur la page de résultats.
  const KINDS = ["Rubrique", "Révolutions", "Antifascisme", "Guide de manif", "Livre complet", "Fiche de lecture", "Outils numériques", "Carte"];

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

  let docs = [];
  function build() {
    docs = (window.RECHERCHE || []).map((r) => ({ ...r, nt: norm(r.t), nd: norm(r.d), nx: norm(r.x) }));
    for (const p of window.LIEUX || []) {
      const cat = (window.CATEGORIES_LIEUX && window.CATEGORIES_LIEUX[p.c] || {}).label || "";
      docs.push({ u: "carte?q=" + encodeURIComponent(p.n), k: "Carte", t: p.n, d: `${p.v} · ${cat}`, nt: norm(p.n), nd: norm(`${p.v} ${cat}`), nx: norm(p.d) });
    }
  }

  // Chaque mot cherché doit apparaître quelque part ; le titre compte plus que le résumé, qui compte plus que le reste.
  function search(q) {
    // On retire les fins de mots (pluriel, féminin) pour que « espagne » trouve aussi « espagnole ».
    const words = norm(q).split(/[^a-z0-9]+/).filter((w) => w.length > 1 || /\d/.test(w))
      .map((w) => (w.length > 4 ? w.replace(/(es|e|s|x)$/, "") : w));
    if (!words.length) return [];
    const out = [];
    for (const r of docs) {
      let score = 0, ok = true;
      for (const w of words) {
        const s = (r.nt.includes(w) ? 10 : 0) + (r.nd.includes(w) ? 4 : 0) + (r.nx.includes(w) ? 1 : 0);
        if (!s) { ok = false; break; }
        score += s + (new RegExp("(^|[^a-z0-9])" + w).test(r.nt) ? 4 : 0);
      }
      if (ok) out.push([score - (r.k === "Carte" ? 3 : 0), r]);
    }
    return out.sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  }
  window.mamieSearch = (q) => load().then(() => search(q));

  const item = (r, i) => `<a class="search__item" role="option" id="sr${i}" href="${root}${esc(r.u)}">
      <small>${esc(r.k)}</small><b>${esc(r.t)}</b><span>${esc(r.d)}</span></a>`;

  let current = -1, timer;
  function show(q) {
    const res = search(q);
    current = -1;
    if (!q.trim()) { close(); return; }
    box.innerHTML = res.length
      ? res.slice(0, 7).map(item).join("") + `<a class="search__all" href="${root}recherche?q=${encodeURIComponent(q)}">Voir les ${res.length} résultat${res.length > 1 ? "s" : ""} →</a>`
      : `<p class="search__none">Rien trouvé pour « ${esc(q)} ». Essaie un autre mot, ou une ville.</p>`;
    box.hidden = false; input.setAttribute("aria-expanded", "true");
  }
  function close() { box.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); current = -1; }

  input.addEventListener("focus", load, { once: true });
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => load().then(() => show(input.value)), 120);
  });
  input.addEventListener("keydown", (e) => {
    const items = [...box.querySelectorAll(".search__item, .search__all")];
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

  // Page de résultats complète (recherche.html).
  const page = document.getElementById("searchPage");
  if (page) {
    const q = new URLSearchParams(location.search).get("q") || "";
    input.value = q;
    load().then(() => {
      const res = search(q);
      const head = document.getElementById("searchHead");
      if (!q.trim()) { head.textContent = "Tape un mot dans la barre de recherche, en haut."; return; }
      head.textContent = res.length ? `${res.length} résultat${res.length > 1 ? "s" : ""} pour « ${q} »` : `Rien trouvé pour « ${q} ». Essaie un autre mot, ou une ville.`;
      const groups = KINDS.map((k) => [k, res.filter((r) => r.k === k)]).filter(([, l]) => l.length);
      page.innerHTML = groups.map(([k, l]) => `<section class="sgroup"><h2>${esc(k === "Rubrique" ? "Pages du site" : k === "Carte" ? "Lieux sur la carte" : k)} <small>${l.length}</small></h2>
        <div class="sgroup__list">${l.map(item).join("")}</div></section>`).join("");
    });
  }
})();
