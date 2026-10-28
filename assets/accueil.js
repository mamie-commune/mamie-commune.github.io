// Listes filtrables (guides, fiches de la bibliothèque) + compteurs de l'accueil.
// Chaque liste : <div data-list="GUIDES|BIBLIO" data-base="…"> et ses filtres <div data-filters="…">.
(function () {
  "use strict";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const counts = { nGuides: window.GUIDES, nBiblio: window.BIBLIO, nLivres: window.LIVRES, nLieux: window.LIEUX };
  for (const [id, arr] of Object.entries(counts)) {
    const el = document.getElementById(id);
    if (el && arr) el.textContent = arr.length;
  }

  document.querySelectorAll("[data-list]").forEach((grid) => {
    const key = grid.dataset.list, items = window[key] || [];
    const filters = document.querySelector(`[data-filters="${key}"]`);
    const base = grid.dataset.base ?? "";
    const limit = Number(grid.dataset.limit) || Infinity;
    const cta = { BIBLIO: "Lire la fiche →", LIVRES: "Lire le livre →", EXPERIENCES: "Lire le dossier →", ANTIFA: "Lire la fiche →", MANIF: "Lire la fiche →" }[key] || "Lire le guide →";
    const cats = ["Tout", ...new Set(items.map((g) => g.cat))];
    let active = cats.find((c) => slugify(c) === location.hash.slice(1)) || "Tout";

    function render() {
      if (filters) filters.innerHTML = cats.map((c) => {
        const n = c === "Tout" ? items.length : items.filter((g) => g.cat === c).length;
        return `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${c === active}">${esc(c)} · ${n}</button>`;
      }).join("");
      const list = (active === "Tout" ? items : items.filter((g) => g.cat === active)).slice(0, limit);
      grid.innerHTML = list.map((g) => `
        <a class="card" href="${base}${esc(g.slug)}">
          <span class="card__tag">${esc(g.by || g.cat)}</span>
          <h3>${esc(g.t)}</h3>
          <p>${esc(g.d)}</p>
          <span class="card__go">${cta}</span>
        </a>`).join("");
    }
    filters?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      active = b.dataset.cat; render();
    });
    render();
  });
})();
