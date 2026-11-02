// Centre de ressources : filtres (mot-clé, autrice ou auteur, thématique, type, date, langue, niveau, nature) et tri.
// Les fiches viennent de data/ressources.js (généré depuis _src/ressources/*.json). Les filtres sont gardés dans l'adresse
// (ressources/?theme=feminisme&type=archive) : on peut copier le lien d'une recherche.
(function () {
  "use strict";
  const R = window.RESSOURCES, V = window.RES_VOCAB;
  const form = document.getElementById("resFiltres");
  if (!R || !V || !form) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const champs = ["q", "auteur", "theme", "type", "periode", "langue", "niveau", "nature", "tri"];
  const el = (n) => form.elements[n];

  // Remplit une liste déroulante avec le nombre de fiches pour chaque valeur.
  function remplir(nom, entrees) {
    const s = el(nom);
    s.insertAdjacentHTML("beforeend", entrees.filter(([, , n]) => n > 0).map(([v, lib, n]) => `<option value="${esc(v)}">${esc(lib)} (${n})</option>`).join(""));
  }
  const compte = (pred) => R.filter(pred).length;
  remplir("theme", Object.entries(V.themes).map(([k, lib]) => [k, lib, compte((r) => r.th.includes(k))]));
  remplir("type", Object.entries(V.types).map(([k, lib]) => [k, lib, compte((r) => r.ty === k)]));
  remplir("langue", Object.entries(V.langues).map(([k, lib]) => [k, lib, compte((r) => r.l.includes(k))]));
  remplir("niveau", Object.entries(V.niveaux).map(([k, lib]) => [k, lib, compte((r) => r.n === k)]));
  remplir("nature", Object.entries(V.natures).map(([k, lib]) => [k, lib, compte((r) => r.nat === k)]));
  const auteurs = [...new Set(R.flatMap((r) => r.a))].sort((a, b) => a.localeCompare(b, "fr"));
  remplir("auteur", auteurs.map((a) => [a, a, compte((r) => r.a.includes(a))]));

  const periode = (an, p) => {
    if (p === "sans-date") return an === null;
    if (an === null) return false;
    return p === "avant-1900" ? an < 1900 : p === "1900-1945" ? an >= 1900 && an <= 1945 : p === "1946-1990" ? an >= 1946 && an <= 1990 : an >= 1991;
  };

  function lire() { const o = {}; champs.forEach((c) => { o[c] = el(c).value; }); return o; }

  function afficher() {
    const f = lire(), q = norm(f.q.trim());
    let liste = R.filter((r) =>
      (!q || norm(`${r.t} ${r.a.join(" ")} ${r.p} ${r.src} ${r.th.map((t) => V.themes[t]).join(" ")}`).includes(q)) &&
      (!f.auteur || r.a.includes(f.auteur)) && (!f.theme || r.th.includes(f.theme)) && (!f.type || r.ty === f.type) &&
      (!f.periode || periode(r.an, f.periode)) && (!f.langue || r.l.includes(f.langue)) && (!f.niveau || r.n === f.niveau) && (!f.nature || r.nat === f.nature));
    if (f.tri === "recent" || f.tri === "ancien") {
      const s = f.tri === "recent" ? -1 : 1;
      liste = liste.slice().sort((a, b) => (a.an === null) - (b.an === null) || s * ((a.an ?? 0) - (b.an ?? 0)) || a.t.localeCompare(b.t, "fr"));
    }
    document.getElementById("resCompte").textContent = `${liste.length} ressource${liste.length > 1 ? "s" : ""} sur ${R.length}`;
    document.getElementById("resListe").innerHTML = liste.length ? liste.map((r) => `
      <a class="card res-card" href="${esc(r.id)}">
        <span class="card__tag">${esc(V.types[r.ty] || r.ty)}</span>
        <h3>${esc(r.t)}</h3>
        <span class="card__by">${esc([r.a.join(", "), r.dt].filter(Boolean).join(" · "))}</span>
        <p>${esc(r.p)}</p>
        <span class="res-card__meta">${esc(V.natures[r.nat] || "")} · ${esc(V.niveaux[r.n] || "")} · ${esc(r.l.map((l) => V.langues[l] || l).join(", "))}</span>
        <span class="card__go">Voir la fiche →</span>
      </a>`).join("") : '<p class="res-vide">Aucune ressource ne correspond. Enlève un filtre, ou propose la ressource qui manque à la bande.</p>';
    // Garde les filtres dans l'adresse, sans recharger la page.
    const p = new URLSearchParams();
    champs.forEach((c) => { if (f[c] && !(c === "tri" && f[c] === "titre")) p.set(c, f[c]); });
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "") + location.hash);
  }

  // Filtres de départ lus dans l'adresse (liens depuis les fiches : ?theme=…, ?type=…).
  const p0 = new URLSearchParams(location.search);
  champs.forEach((c) => { const v = p0.get(c); if (v !== null && [...(el(c).options || [])].some((o) => o.value === v) || (c === "q" && v)) el(c).value = v; });
  let minuterie;
  form.addEventListener("input", (e) => { clearTimeout(minuterie); minuterie = setTimeout(afficher, e.target === el("q") ? 200 : 0); });
  form.addEventListener("submit", (e) => { e.preventDefault(); afficher(); });
  form.addEventListener("reset", () => setTimeout(afficher, 0));
  afficher();
})();
