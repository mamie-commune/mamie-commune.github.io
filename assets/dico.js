// Dictionnaire militant (glossaire.html) : recherche dans les mots et les définitions, filtre par thème.
// Tout se passe dans le navigateur, rien n'est envoyé. Sans JavaScript, la page reste une liste complète par lettres.
(function () {
  "use strict";
  const outils = document.querySelector("[data-dico-outils]");
  if (!outils) return;
  const mots = [...document.querySelectorAll(".dico__mot")];
  const lettres = [...document.querySelectorAll(".dico h2")];
  const champ = outils.querySelector("[data-dico-cherche]");
  const compte = outils.querySelector("[data-dico-compte]");
  const vide = document.querySelector("[data-dico-vide]");
  const plat = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const textes = mots.map((m) => plat(m.textContent));
  let theme = "";

  const appliquer = () => {
    const q = plat(champ.value.trim());
    let n = 0;
    mots.forEach((m, i) => {
      const ok = (!theme || m.dataset.theme === theme) && (!q || textes[i].includes(q));
      m.hidden = !ok; if (ok) n++;
    });
    // une lettre sans mot visible disparaît avec sa liste
    lettres.forEach((h) => { const dl = h.nextElementSibling; const rien = !dl.querySelector(".dico__mot:not([hidden])"); h.hidden = rien; dl.hidden = rien; });
    compte.textContent = q || theme ? `${n} mot${n > 1 ? "s" : ""} sur ${mots.length}` : `${mots.length} mots`;
    vide.hidden = n > 0;
  };

  outils.hidden = false;
  champ.addEventListener("input", appliquer);
  outils.addEventListener("click", (e) => {
    const c = e.target.closest("[data-dico-theme]");
    if (!c) return;
    theme = c.dataset.dicoTheme;
    outils.querySelectorAll("[data-dico-theme]").forEach((x) => x.setAttribute("aria-pressed", x === c ? "true" : "false"));
    appliquer();
  });
  // arrivée sur un mot précis (glossaire#mandat) : on le montre même si un filtre traînait
  window.addEventListener("hashchange", () => { const m = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (m && m.closest("[hidden]")) { champ.value = ""; theme = ""; outils.querySelector('[data-dico-theme=""]').click(); m.scrollIntoView(); } });
  appliquer();
})();
