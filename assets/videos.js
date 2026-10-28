// Mur de vidéos TikTok : des couvertures dessinées en local, et le lecteur TikTok seulement après un clic,
// pour ne rien envoyer à TikTok tant que la personne n'a pas choisi de regarder.
(function () {
  "use strict";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const list = window.VIDEOS || [];
  const STAR = '<svg class="vcard__star" viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,0 61.2,34.5 97.6,34.5 68.2,55.9 79.4,90.5 50,69.1 20.6,90.5 31.8,55.9 2.4,34.5 38.8,34.5"/></svg>';
  const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  document.querySelectorAll("[data-videos]").forEach((wall) => {
    const root = wall.dataset.root || "";
    const limit = Number(wall.dataset.limit) || Infinity;
    const items = list.slice(0, limit);
    if (!items.length) { wall.innerHTML = '<p class="vempty">Pas encore de vidéo ici.</p>'; return; }
    wall.innerHTML = items.map((v, i) => `
      <article class="vcard">
        <div class="vcard__screen" data-id="${esc(v.id)}">
          <button class="vcard__cover" type="button" aria-label="Regarder « ${esc(v.titre)} »">
            ${STAR}
            <img class="vcard__mamie" src="${root}assets/mamie.webp" alt="" loading="lazy">
            <span class="vcard__title" data-ransom>${esc(v.titre)}</span>
            <span class="vcard__play" aria-hidden="true">▶</span>
            <span class="vcard__type">${v.type === "photo" ? "Carrousel" : "Vidéo"}</span>
            <span class="vcard__views">▶ ${esc(v.vues)} vues</span>
          </button>
        </div>
        <div class="vcard__body">
          <p class="vcard__date">${fmt(v.date)}</p>
          <p>${esc(v.texte)}</p>
          <p class="vcard__tags">${v.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}</p>
          ${v.lien ? `<a class="vcard__more" href="${root}${esc(v.lien[0])}">${esc(v.lien[1])} →</a>` : ""}
        </div>
      </article>`).join("");
    wall.querySelectorAll(".vcard__title").forEach((el) => window.mamieRansom && window.mamieRansom(el));
  });

  document.addEventListener("click", (e) => {
    // Documentaires : l'affiche devient le lecteur.
    // data-embed (adresse d'intégration PeerTube) est prioritaire ; sinon data-src (fichier .mp4 sur le site).
    const poster = e.target.closest(".doc__poster");
    if (poster) {
      const box = poster.parentElement;
      const embed = poster.dataset.embed, file = poster.dataset.src;
      if (embed) {
        box.innerHTML = `<iframe class="doc__video" src="${embed}" title="${poster.getAttribute("aria-label") || "Documentaire"}" allow="fullscreen" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups"></iframe>`;
      } else if (file) {
        box.innerHTML = `<video class="doc__video" src="${file}" controls autoplay playsinline preload="metadata"></video>`;
        box.querySelector("video").addEventListener("error", () => {
          box.innerHTML = '<p class="note doc__missing">Le film n\'est pas encore en ligne sur cette version du site. Il arrive bientôt.</p>';
        });
      } else return;
      box.classList.add("is-playing");
      return;
    }
    const btn = e.target.closest(".vcard__cover"); if (!btn) return;
    const screen = btn.parentElement;
    // Lecteur officiel « player/v1 » : plus fiable que l'ancien embed/v2, qui renvoie souvent un écran noir.
    screen.innerHTML = `<iframe src="https://www.tiktok.com/player/v1/${encodeURIComponent(screen.dataset.id)}?autoplay=1&music_info=1&description=1&rel=0" title="Publication TikTok de Mamie Commune" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    screen.classList.add("is-playing");
    const v = list.find((x) => x.id === screen.dataset.id);
    const body = screen.nextElementSibling;
    if (v && body && !body.querySelector(".vcard__out")) {
      body.insertAdjacentHTML("beforeend", `<a class="vcard__more vcard__out" href="https://www.tiktok.com/@mamie_commune/${v.type}/${encodeURIComponent(v.id)}" target="_blank" rel="noopener">Ça ne s'affiche pas ? Ouvrir sur TikTok ↗</a>`);
    }
  });
})();
