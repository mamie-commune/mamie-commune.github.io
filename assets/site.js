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

  // Étiquettes : des groupes de mots collés sur des bandes noires, roses ou crème.
  function tags(el) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    const chunks = [];
    for (let k = 0; k < words.length;) {
      const size = words[k].length < 4 && words[k + 1] ? 2 : 1 + (k % 3 === 0 && words[k + 1] && words[k + 1].length < 6 ? 1 : 0);
      chunks.push(words.slice(k, k + size).join(" "));
      k += size;
    }
    el.setAttribute("aria-label", text);
    el.innerHTML = chunks.map((c, n) => {
      const seed = n * 13 + c.length;
      return `<span class="tg tg${n % 3 === 2 ? 2 : n % 2}" style="--rot:${rot(seed, 1.6).toFixed(1)}deg" aria-hidden="true">${c.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`;
    }).join(" ");
  }

  window.mamieRansom = ransom;
  document.querySelectorAll("[data-ransom]").forEach(ransom);
  document.querySelectorAll("[data-tags]").forEach(tags);
  document.querySelectorAll(".gtitle h1, .side__head h1, .sec__head h2").forEach((el) => {
    if (el.hasAttribute("data-ransom") || el.hasAttribute("data-tags")) return;
    (el.textContent.trim().length <= 26 ? ransom : tags)(el);
  });
  document.querySelectorAll(".prose h2").forEach(tags);

  // Vidéos YouTube : <div class="yt__screen" data-yt="identifiant"> avec un bouton .yt__cover dedans.
  // Rien n'est chargé depuis YouTube avant le clic, puis le lecteur youtube-nocookie remplace la couverture.
  document.addEventListener("click", (e) => {
    const cover = e.target.closest(".yt__cover"); if (!cover) return;
    const screen = cover.parentElement;
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(screen.dataset.yt)}?autoplay=1&rel=0`;
    frame.title = cover.getAttribute("aria-label") || "Vidéo";
    frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    frame.allowFullscreen = true;
    screen.replaceChildren(frame);
    screen.classList.add("is-playing");
  });
})();
