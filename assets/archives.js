// Archives historiques : filtres par période, territoire, mouvement et type, et tri par date. Sans JavaScript, tout reste affiché.
// La sélection est gardée dans l'adresse (archives?mouvement=…&type=…) pour être partagée.
(function () {
  "use strict";
  const f = document.getElementById("archFiltres"), grille = document.getElementById("archGrille"); if (!f || !grille) return;
  const cartes = [...grille.children], sel = [...f.querySelectorAll("select")];
  const p = new URLSearchParams(location.search);
  sel.forEach((s) => { const v = p.get(s.dataset.f); if (v && [...s.options].some((o) => o.value === v)) s.value = v; });
  function filtrer() {
    const v = Object.fromEntries(sel.map((s) => [s.dataset.f, s.value]));
    let n = 0;
    cartes.forEach((c) => { const ok = ["periode", "territoire", "mouvement", "type"].every((k) => !v[k] || c.dataset[k] === v[k]); c.hidden = !ok; if (ok) n++; });
    const an = (c) => Number(c.dataset.annee) || (v.ordre === "recent" ? -1 : 9999);
    cartes.slice().sort((a, b) => (v.ordre === "recent" ? an(b) - an(a) : an(a) - an(b))).forEach((c) => grille.appendChild(c));
    document.getElementById("archCompte").textContent = `${n} document${n > 1 ? "s" : ""}`;
    const u = new URLSearchParams(); ["periode", "territoire", "mouvement", "type"].forEach((k) => { if (v[k]) u.set(k, v[k]); }); if (v.ordre === "recent") u.set("ordre", "recent");
    history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
  }
  sel.forEach((s) => s.addEventListener("change", filtrer));
  filtrer();
})();
