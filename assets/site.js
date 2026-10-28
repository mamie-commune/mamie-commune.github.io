// Commun à toutes les pages : menu mobile, lettres de rançon et étiquettes découpées.
(function () {
  "use strict";
  const nav = document.getElementById("nav"), btn = document.getElementById("menuBtn");
  if (nav && btn) {
    btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  // Pseudo-hasard stable : la même lettre au même endroit garde toujours le même style.
  const pick = (seed, n) => Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1 * n | 0;
  const rot = (seed, max) => ((Math.abs(Math.sin(seed * 78.233) * 9631.71) % 1) * 2 - 1) * max;

  // Lettres de rançon : chaque lettre dans un morceau de papier différent.
  function ransom(el) {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    let i = 0;
    el.innerHTML = text.split(/\s+/).map((word) => {
      const letters = [...word].map((ch) => {
        i++;
        const seed = i * 7 + ch.charCodeAt(0);
        return `<span class="rl r${pick(seed, 6)}" style="--rot:${rot(seed, 4).toFixed(1)}deg">${ch.replace(/&/, "&amp;").replace(/</, "&lt;")}</span>`;
      }).join("");
      return `<span class="rw" aria-hidden="true">${letters}</span>`;
    }).join(" ");
  }

  // Étiquettes façon sous-titres des TikToks : un mot par bande noire, le mot fort en rose.
  // Le mot fort est le plus long (à égalité, le dernier) ; on peut le forcer avec data-fort="mot".
  function tags(el) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    const bare = (w) => w.replace(/[^\p{L}\p{N}]/gu, "");
    let strong = words.findIndex((w) => el.dataset.fort && bare(w).toLowerCase() === el.dataset.fort.toLowerCase());
    if (strong < 0) words.forEach((w, i) => { if (bare(w).length >= 5 && bare(w).length >= bare(words[strong] || "").length) strong = i; });
    el.setAttribute("aria-label", text);
    el.innerHTML = words.map((w, n) =>
      `<span class="tg ${n === strong ? "tg1" : "tg0"}" aria-hidden="true">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`).join(" ");
  }

  window.mamieRansom = ransom;
  document.querySelectorAll("[data-ransom]").forEach(ransom);
  document.querySelectorAll("[data-tags]").forEach(tags);
  document.querySelectorAll(".gtitle h1, .side__head h1, .sec__head h2").forEach((el) => {
    if (el.hasAttribute("data-ransom") || el.hasAttribute("data-tags")) return;
    (el.textContent.trim().length <= 26 ? ransom : tags)(el);
  });
  document.querySelectorAll(".prose h2").forEach(tags);

  /* ---------- lecteur vidéo en grand (fenêtre collage) ----------
     Cartes YouTube : <div class="yt__screen" data-yt="identifiant"> avec un bouton .yt__cover dedans.
     Affiches de documentaires : <button class="doc__poster" data-embed="adresse d'intégration"> ou data-src="fichier .mp4".
     Rien n'est chargé depuis YouTube avant le clic ; les miniatures sont hébergées ici (assets/yt/<id>.jpg). */
  const ROOT = new URL("..", document.currentScript.src).href;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  document.querySelectorAll(".yt__screen[data-yt] .yt__cover").forEach((cover) => {
    const img = new Image();
    img.className = "yt__thumb"; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    img.onerror = () => img.remove();
    img.src = `${ROOT}assets/yt/${cover.parentElement.dataset.yt}.jpg`;
    cover.prepend(img);
  });

  let dialog;
  function player({ title, embed, file, link }) {
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "player";
      dialog.innerHTML = `<div class="player__in"><div class="player__head"><p class="player__title"></p>
        <button class="player__close" type="button" aria-label="Fermer la vidéo">Fermer ✕</button></div>
        <div class="player__screen"></div><p class="player__foot"></p></div>`;
      document.body.appendChild(dialog);
      dialog.querySelector(".player__close").addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", () => { dialog.querySelector(".player__screen").replaceChildren(); document.documentElement.classList.remove("has-player"); });
    }
    const t = dialog.querySelector(".player__title");
    t.textContent = title; tags(t);
    dialog.querySelector(".player__screen").innerHTML = embed
      ? `<iframe src="${esc(embed)}" title="${esc(title)}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`
      : `<video src="${esc(file)}" controls autoplay playsinline preload="metadata"></video>`;
    const v = dialog.querySelector("video");
    if (v) v.addEventListener("error", () => { dialog.querySelector(".player__screen").innerHTML = '<p class="player__msg">Le film ne se charge pas pour l\'instant. Réessaie dans un moment.</p>'; });
    dialog.querySelector(".player__foot").innerHTML = link ? `<a href="${esc(link)}" target="_blank" rel="noopener">Ouvrir sur YouTube ↗</a>` : "";
    document.documentElement.classList.add("has-player");
    dialog.showModal();
    dialog.querySelector(".player__close").focus();
  }
  window.mamiePlayer = player;

  document.addEventListener("click", (e) => {
    const cover = e.target.closest(".yt__cover"), poster = e.target.closest(".doc__poster");
    const label = (el) => (el.getAttribute("aria-label") || "Vidéo").replace(/^Regarder (le film )?/, "").replace(/^« (.*) »/, "$1").replace(/\s*\([^)]*\)$/, "");
    if (cover) {
      const id = cover.parentElement.dataset.yt;
      player({ title: label(cover), embed: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`, link: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` });
    } else if (poster && (poster.dataset.embed || poster.dataset.src)) {
      const m = (poster.dataset.embed || "").match(/youtube-nocookie\.com\/embed\/([\w-]{11})/);
      player({ title: label(poster), embed: poster.dataset.embed, file: poster.dataset.src, link: m && `https://www.youtube.com/watch?v=${m[1]}` });
    }
  });
})();
