// Chronologie de l'université populaire : filtres par thème, recherche, accès par période, événements dépliables.
// Données : data/chronologie.js (généré depuis _src/universite/chronologie.json). Le thème choisi reste dans l'adresse (?theme=).
(function () {
  "use strict";
  const EV = window.CHRONOLOGIE, TH = window.CHRONO_THEMES, liste = document.getElementById("chrono");
  if (!EV || !TH || !liste) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const params = new URLSearchParams(location.search);
  let theme = TH[params.get("theme")] ? params.get("theme") : "", q = "";
  const periode = (an) => (an < 1900 ? "XIXe siècle" : an < 1946 ? "1900-1945" : an < 1990 ? "1946-1989" : "Depuis 1990");

  function filtres() {
    const n = (k) => EV.filter((e) => !k || e.theme === k).length;
    document.getElementById("chronoThemes").innerHTML = [["", "Tout"], ...Object.entries(TH)].map(([k, l]) => `<button class="chip" type="button" data-theme="${k}" aria-pressed="${k === theme}">${esc(l)} · ${n(k)}</button>`).join("");
  }
  function afficher() {
    filtres();
    const mots = norm(q).split(/\s+/).filter(Boolean);
    const vus = EV.filter((e) => (!theme || e.theme === theme) && mots.every((m) => norm(`${e.quand} ${e.titre} ${e.texte} ${TH[e.theme]}`).includes(m)));
    document.getElementById("chronoCompte").textContent = `${vus.length} événement${vus.length > 1 ? "s" : ""} sur ${EV.length}`;
    let avant = "";
    liste.innerHTML = vus.length ? vus.map((e) => {
      const p = periode(+e.date.slice(0, 4)), titreP = p !== avant ? `<li class="chrono__periode" id="p-${norm(p).replace(/[^a-z0-9]+/g, "-")}"><h2>${esc(p)}</h2></li>` : ""; avant = p;
      return `${titreP}<li class="chrono__ev chrono__ev--${esc(e.theme)}"><details><summary><span class="chrono__date">${esc(e.quand)}</span><span class="chrono__titre">${esc(e.titre)}</span><span class="chrono__theme">${esc(TH[e.theme])}</span></summary>
        <div class="chrono__corps"><p>${esc(e.texte)}</p><p class="chrono__liens">${e.lien ? `<a href="${esc(e.lien)}">Lire le dossier ou la fiche →</a>` : ""}<span>Source : <a href="${esc(e.source[1])}"${/^https?:/.test(e.source[1]) ? ' rel="noopener"' : ""}>${esc(e.source[0])}</a></span></p></div></details></li>`;
    }).join("") : '<li class="chrono__vide">Aucun événement ne correspond. Enlève le filtre ou change de mot.</li>';
    // Accès rapide aux périodes affichées.
    const ps = [...new Set(vus.map((e) => periode(+e.date.slice(0, 4))))];
    document.getElementById("chronoSiecles").innerHTML = ps.map((p) => `<a href="#p-${norm(p).replace(/[^a-z0-9]+/g, "-")}">${esc(p)}</a>`).join("");
    const u = new URLSearchParams(); if (theme) u.set("theme", theme); history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "") + location.hash);
  }
  document.getElementById("chronoThemes").addEventListener("click", (e) => { const b = e.target.closest("[data-theme]"); if (!b) return; theme = b.dataset.theme; afficher(); });
  let t; document.getElementById("chronoQ").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value; afficher(); }, 200); });
  afficher();
})();
