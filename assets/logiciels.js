// Annuaire des logiciels libres : filtres par usage, plateforme et difficulté. Les fiches sont déjà dans la page
// (lisibles sans JavaScript et hors ligne) : ce script ne fait que masquer celles qui ne correspondent pas.
// Les filtres restent dans l'adresse (logiciels/?pf=android&cat=communiquer) pour partager une sélection.
(function () {
  "use strict";
  const zone = document.getElementById("logiFiltres"), fiches = [...document.querySelectorAll(".logi")];
  if (!zone || !fiches.length) return;
  const choix = { cat: "", pf: "", dif: "" };
  const p0 = new URLSearchParams(location.search);
  Object.keys(choix).forEach((k) => { const v = p0.get(k); if (v && zone.querySelector(`[data-${k}="${CSS.escape(v)}"]`)) choix[k] = v; });

  // Petit sommaire : un lien par logiciel affiché.
  const sommaire = document.getElementById("logiSommaire");
  function afficher() {
    let n = 0;
    fiches.forEach((f) => {
      const ok = (!choix.cat || f.dataset.cat === choix.cat) && (!choix.pf || f.dataset.pf.split(" ").includes(choix.pf)) && (!choix.dif || f.dataset.dif === choix.dif);
      f.hidden = !ok; if (ok) n++;
    });
    zone.querySelectorAll(".chip").forEach((b) => { const k = Object.keys(choix).find((c) => b.dataset[c] !== undefined); b.setAttribute("aria-pressed", String(choix[k] === b.dataset[k])); });
    document.getElementById("logiCompte").textContent = n === fiches.length ? `${n} logiciels` : `${n} logiciel${n > 1 ? "s" : ""} sur ${fiches.length}`;
    document.getElementById("logiVide").hidden = n > 0;
    sommaire.innerHTML = fiches.filter((f) => !f.hidden).map((f) => `<a href="#${f.id}">${f.querySelector("h3").textContent}</a>`).join("");
    const u = new URLSearchParams(); Object.entries(choix).forEach(([k, v]) => { if (v) u.set(k, v); });
    history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "") + location.hash);
  }
  // Un clic sur un filtre déjà choisi l'enlève.
  zone.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    const k = Object.keys(choix).find((c) => b.dataset[c] !== undefined);
    choix[k] = choix[k] === b.dataset[k] ? "" : b.dataset[k];
    afficher();
  });
  afficher();
})();
