// Mur de TikTok compact : des vignettes dessinées en local (rien n'est chargé depuis TikTok avant le clic),
// qui ouvrent le lecteur TikTok dans la grande fenêtre de lecture (window.mamiePlayer, assets/site.js).
// data-limit="4" : n'afficher que les plus récentes ; sinon 8 d'abord, puis un bouton « Voir les plus anciennes ».
(function () {
  "use strict";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const list = window.VIDEOS || [];
  const PAR_PAGE = 8;
  const STAR = '<svg class="vcard__star" viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,0 61.2,34.5 97.6,34.5 68.2,55.9 79.4,90.5 50,69.1 20.6,90.5 31.8,55.9 2.4,34.5 38.8,34.5"/></svg>';
  const court = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const long = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const carte = (v, root) => `
      <article class="vcard">
        <button class="vcard__cover" type="button" data-id="${esc(v.id)}" aria-label="Regarder « ${esc(v.titre)} », ${v.type === "photo" ? "carrousel" : "vidéo"} du ${long(v.date)}">
          ${STAR}
          <img class="vcard__mamie" src="${root}assets/mamie-logo-192.webp" alt="" loading="lazy" width="192" height="192">
          <span class="vcard__title" data-ransom>${esc(v.titre)}</span>
          <span class="vcard__play" aria-hidden="true">▶</span>
          <span class="vcard__type">${v.type === "photo" ? "Carrousel" : "Vidéo"}</span>
        </button>
        <p class="vcard__meta"><time datetime="${esc(v.date)}">${court(v.date)}</time><span>${esc(v.vues)} vues</span></p>
        <p class="vcard__text">${esc(v.texte)}</p>
        ${v.lien ? `<a class="vcard__more" href="${root}${esc(v.lien[0])}">${esc(v.lien[1])} →</a>` : ""}
      </article>`;

  document.querySelectorAll("[data-videos]").forEach((wall) => {
    const root = wall.dataset.root || "";
    const limit = Number(wall.dataset.limit) || 0;
    if (!list.length) { wall.innerHTML = '<p class="vempty">Pas encore de vidéo ici.</p>'; return; }
    let montre = 0;
    const suite = () => {
      const n = limit || PAR_PAGE;
      const lot = list.slice(montre, montre + n);
      wall.insertAdjacentHTML("beforeend", lot.map((v) => carte(v, root)).join(""));
      [...wall.querySelectorAll(".vcard__title")].slice(montre).forEach((el) => window.mamieRansom && window.mamieRansom(el));
      montre += lot.length;
      const plus = wall.nextElementSibling && wall.nextElementSibling.classList.contains("vmore") ? wall.nextElementSibling : null;
      if (!limit && montre < list.length) {
        if (!plus) {
          wall.insertAdjacentHTML("afterend", '<div class="vmore cta"><button class="btn" type="button"></button></div>');
          wall.nextElementSibling.querySelector("button").addEventListener("click", suite);
        }
        wall.nextElementSibling.querySelector("button").textContent = `Voir les plus anciennes (${list.length - montre})`;
      } else if (plus) plus.remove();
    };
    suite();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".vcard__cover"); if (!btn) return;
    const v = list.find((x) => x.id === btn.dataset.id); if (!v) return;
    // Lecteur officiel « player/v1 » : plus fiable que l'ancien embed/v2, qui renvoie souvent un écran noir.
    window.mamiePlayer({
      title: v.titre, vertical: true,
      embed: `https://www.tiktok.com/player/v1/${encodeURIComponent(v.id)}?autoplay=1&music_info=1&description=1&rel=0`,
      link: `https://www.tiktok.com/@mamie_commune/${v.type}/${encodeURIComponent(v.id)}`,
      linkLabel: "Ça ne s'affiche pas ? Ouvrir sur TikTok ↗",
    });
  });
})();
