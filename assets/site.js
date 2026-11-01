// Commun à toutes les pages : menu mobile, lettres de rançon et étiquettes découpées.
(function () {
  "use strict";
  const nav = document.getElementById("nav"), btn = document.getElementById("menuBtn");
  // Familles du menu : sur ordinateur, chaque bouton déplie ses rubriques ; sur téléphone, le menu montre tout.
  const fams = [...document.querySelectorAll(".nav__btn")];
  const mobile = () => window.matchMedia("(max-width: 860px)").matches;
  const fermer = () => fams.forEach((b) => b.setAttribute("aria-expanded", "false"));
  fams.forEach((b) => b.addEventListener("click", () => {
    if (mobile()) return;
    const ouvert = b.getAttribute("aria-expanded") === "true";
    fermer(); b.setAttribute("aria-expanded", String(!ouvert));
  }));
  document.addEventListener("click", (e) => { if (!mobile() && !e.target.closest(".nav__fam")) fermer(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || mobile()) return;
    const ouvert = fams.find((b) => b.getAttribute("aria-expanded") === "true");
    if (ouvert) { fermer(); ouvert.focus(); }
  });
  if (nav && btn) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      fams.forEach((b) => b.setAttribute("aria-expanded", String(open)));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); fermer(); }
    });
  }

  // Lecture facile : gros texte, police simple, rien de penché ; le choix est gardé dans le navigateur.
  const facile = document.getElementById("facileBtn");
  if (facile) {
    const html = document.documentElement;
    facile.setAttribute("aria-pressed", String(html.classList.contains("facile")));
    facile.addEventListener("click", () => {
      const on = html.classList.toggle("facile");
      facile.setAttribute("aria-pressed", String(on));
      try { localStorage.setItem("mamie-facile", on ? "1" : "0"); } catch (e) { /* navigation privée : tant pis */ }
    });
  }

  // Thème clair ou sombre : clair par défaut ; le bouton bascule, et le choix est gardé dans le navigateur.
  const theme = document.getElementById("themeBtn");
  if (theme) {
    const html = document.documentElement;
    const sombre = () => html.dataset.theme === "dark";
    const afficher = () => {
      const s = sombre();
      theme.querySelector("[aria-hidden]").textContent = s ? "☀" : "☾";
      theme.querySelector(".facile-btn__txt").textContent = s ? " Clair" : " Sombre";
      theme.title = s ? "Passer en mode clair" : "Passer en mode sombre";
      theme.setAttribute("aria-label", theme.title);
    };
    afficher();
    theme.addEventListener("click", () => {
      html.dataset.theme = sombre() ? "light" : "dark";
      try { localStorage.setItem("mamie-theme", html.dataset.theme); } catch (e) { /* navigation privée : tant pis */ }
      afficher();
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
     Affiches de documentaires : <button class="doc__poster" data-embed="adresse d'intégration"> ou data-src="fichier .mp4" ; épisodes d'une série : <button class="doc__ep" data-src="…">.
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

  /* Lecteur maison : les mêmes commandes, dans le style du site, pour les films hébergés sur le serveur (<video>)
     et pour YouTube (lecteur youtube-nocookie sans ses commandes, piloté par messages : aucun script YouTube en plus).
     TikTok garde son propre lecteur (vertical). Clavier : espace ou K lecture, ← → 5 s, J L 10 s, ↑ ↓ volume, M son, F plein écran.
     La position est gardée dans le navigateur : en rouvrant un long film, on propose de reprendre où on s'était arrêté. */
  const ICONES = {
    lire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h4.5v15H6zM13.5 4.5H18v15h-4.5z"/></svg>',
    son: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4.5v15L7 15H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    muet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4.5v15L7 15H3z"/><path d="M15.5 9l6 6M21.5 9l-6 6" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
    plein: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
    sortir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M21 9h-6V3M15 21v-6h6M3 15h6v6" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
  };
  const VITESSES = [1, 1.25, 1.5, 2, 0.75];
  const duree = (s) => {
    if (!isFinite(s) || s < 0) return "--:--";
    s = Math.floor(s);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`;
  };
  const lireReprise = (k) => { try { return Number(localStorage.getItem("mamie-reprise:" + k)) || 0; } catch { return 0; } };
  const ecrireReprise = (k, t) => { try { t ? localStorage.setItem("mamie-reprise:" + k, String(Math.floor(t))) : localStorage.removeItem("mamie-reprise:" + k); } catch {} };

  // Source « fichier » : la balise <video> du navigateur.
  function sourceFichier(ecran, file, secours, ev) {
    const v = document.createElement("video");
    // Une fois la fenêtre fermée, on n'écoute plus la vidéo (sinon le retour à 0 effacerait la position gardée).
    let actif = true;
    const on = (n, f) => v.addEventListener(n, (x) => { if (actif) f(x); });
    v.src = file; v.autoplay = true; v.playsInline = true; v.preload = "metadata";
    ecran.prepend(v);
    on("error", () => {
      // Adresse principale injoignable : on essaie la copie de secours (une seule fois), sinon message.
      if (secours && v.src !== secours) { v.src = secours; v.play().catch(() => {}); return; }
      ev.erreur("Le film ne se charge pas pour l'instant. Réessaie dans un moment.");
    });
    on("loadedmetadata", () => ev.pret(v.duration));
    on("timeupdate", () => ev.temps(v.currentTime, v.duration));
    on("progress", () => { if (v.buffered.length) ev.charge(v.buffered.end(v.buffered.length - 1) / (v.duration || 1)); });
    on("play", () => ev.etat("lecture"));
    on("pause", () => ev.etat("pause"));
    on("ended", () => ev.etat("fin"));
    on("waiting", () => ev.attente(true));
    on("playing", () => ev.attente(false));
    on("volumechange", () => ev.son(v.muted ? 0 : v.volume));
    return {
      lire: () => v.play().catch(() => {}), pause: () => v.pause(), aller: (t) => { v.currentTime = t; },
      volume: (x) => { v.volume = x; v.muted = x === 0; }, vitesse: (r) => { v.playbackRate = r; },
      pleinIos: () => v.webkitEnterFullscreen && v.webkitEnterFullscreen(), fermer: () => { actif = false; v.pause(); v.removeAttribute("src"); v.load(); },
    };
  }

  // Source YouTube : lecteur sans commandes, piloté par postMessage (protocole du lecteur intégré YouTube).
  function sourceYoutube(ecran, id, titre, ev) {
    const ORIG = "https://www.youtube-nocookie.com";
    const f = document.createElement("iframe");
    f.src = `${ORIG}/embed/${encodeURIComponent(id)}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    f.title = titre; f.allow = "autoplay; encrypted-media; picture-in-picture";
    ecran.prepend(f);
    const envoyer = (func, args = []) => f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), ORIG);
    let dur = 0, cur = 0, ecoute;
    const ecouter = () => f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), ORIG);
    f.addEventListener("load", () => { ecouter(); ecoute = setInterval(ecouter, 500); });
    const recu = (e) => {
      if (e.origin !== ORIG || e.source !== f.contentWindow) return;
      let d; try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!d || !d.event) return;
      if (d.event === "onReady" || d.event === "initialDelivery") clearInterval(ecoute);
      const i = d.info || {};
      if (typeof i.duration === "number" && i.duration > 0 && i.duration !== dur) { dur = i.duration; ev.pret(dur); }
      if (typeof i.currentTime === "number") { cur = i.currentTime; ev.temps(cur, dur); }
      if (typeof i.videoLoadedFraction === "number") ev.charge(i.videoLoadedFraction);
      if (typeof i.volume === "number") ev.son(i.muted ? 0 : i.volume / 100);
      const s = d.event === "onStateChange" ? d.info : i.playerState;
      if (s === 1) { ev.etat("lecture"); ev.attente(false); } else if (s === 2) ev.etat("pause");
      else if (s === 0) ev.etat("fin"); else if (s === 3) ev.attente(true);
      if (d.event === "onError") ev.erreur("YouTube refuse de lire cette vidéo ici. Ouvre-la directement sur YouTube.");
    };
    window.addEventListener("message", recu);
    return {
      lire: () => envoyer("playVideo"), pause: () => envoyer("pauseVideo"), aller: (t) => envoyer("seekTo", [t, true]),
      volume: (x) => { if (x === 0) envoyer("mute"); else { envoyer("unMute"); envoyer("setVolume", [Math.round(x * 100)]); } },
      vitesse: (r) => envoyer("setPlaybackRate", [r]), pleinIos: () => {},
      fermer: () => { clearInterval(ecoute); window.removeEventListener("message", recu); },
    };
  }

  let dialog, source = null, cle = "";
  function player({ title, embed, file, secours, link, linkLabel, vertical }) {
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "player";
      dialog.innerHTML = `<div class="player__in"><div class="player__head"><p class="player__title"></p>
        <button class="player__close" type="button" aria-label="Fermer la vidéo">Fermer ✕</button></div>
        <div class="player__screen"></div>
        <div class="lec" role="group" aria-label="Commandes de lecture" hidden>
          <button class="lec__btn lec__play" type="button" aria-label="Lecture">${ICONES.lire}</button>
          <button class="lec__btn lec__saut" type="button" data-saut="-10" aria-label="Reculer de 10 secondes">−10</button>
          <button class="lec__btn lec__saut" type="button" data-saut="10" aria-label="Avancer de 10 secondes">+10</button>
          <span class="lec__temps" aria-hidden="true"><span class="lec__cur">0:00</span> / <span class="lec__dur">--:--</span></span>
          <input class="lec__barre" type="range" min="0" max="1000" step="1" value="0" aria-label="Position dans la vidéo">
          <button class="lec__btn lec__son" type="button" aria-label="Couper le son">${ICONES.son}</button>
          <input class="lec__vol" type="range" min="0" max="100" step="5" value="100" aria-label="Volume">
          <button class="lec__btn lec__vit" type="button" aria-label="Vitesse de lecture : normale">1×</button>
          <button class="lec__btn lec__plein" type="button" aria-label="Plein écran">${ICONES.plein}</button>
        </div>
        <p class="player__foot"></p></div>`;
      document.body.appendChild(dialog);
      dialog.querySelector(".player__close").addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", () => {
        if (source) source.fermer(); source = null;
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        dialog.querySelector(".player__screen").replaceChildren(); document.documentElement.classList.remove("has-player");
      });
      commandes();
    }
    const t = dialog.querySelector(".player__title");
    t.textContent = title; tags(t);
    if (source) source.fermer();
    source = null;
    const ecran = dialog.querySelector(".player__screen"), lec = dialog.querySelector(".lec");
    ecran.replaceChildren();
    const yt = (embed || "").match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/);
    dialog.classList.toggle("player--vertical", !!vertical);
    if (file || (yt && !vertical)) {
      // Notre lecteur : écran + voile (gros bouton lecture, chargement) + barre de commandes.
      ecran.innerHTML = `<button class="lec__voile" type="button" tabindex="-1" aria-hidden="true"><span class="lec__gros">${ICONES.lire}</span><span class="lec__charge">Chargement…</span></button>`;
      cle = file || "yt:" + yt[1];
      dialog.classList.add("player--maison");
      lec.hidden = false;
      raz();
      const ev = evenements();
      source = file ? sourceFichier(ecran, file, secours, ev) : sourceYoutube(ecran, yt[1], title, ev);
    } else {
      // TikTok et autres lecteurs intégrés : leur propre lecteur.
      dialog.classList.remove("player--maison");
      lec.hidden = true;
      ecran.innerHTML = `<iframe src="${esc(embed)}" title="${esc(title)}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
    dialog.querySelector(".player__foot").innerHTML = link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(linkLabel || "Ouvrir sur YouTube ↗")}</a>` : "";
    document.documentElement.classList.add("has-player");
    if (!dialog.open) dialog.showModal();
    (lec.hidden ? dialog.querySelector(".player__close") : lec.querySelector(".lec__play")).focus();
  }
  window.mamiePlayer = player;

  // État affiché par la barre, remis à zéro à chaque vidéo.
  let st = {};
  let reveiller = () => {};   // réaffiche les commandes en plein écran (défini dans commandes())
  const $ = (s) => dialog.querySelector(s);
  function raz() {
    st = { dur: 0, cur: 0, lecture: false, vit: 0, glisse: false, repris: false, dernier: 0, vol: 1 };
    $(".lec__cur").textContent = "0:00"; $(".lec__dur").textContent = "--:--";
    const b = $(".lec__barre"); b.value = 0; b.style.setProperty("--p", "0%"); b.style.setProperty("--c", "0%");
    $(".lec__vit").textContent = "1×"; dialog.classList.remove("is-lecture", "is-attente");
    dialog.classList.add("is-attente");
    $(".player__foot").querySelector(".lec__reprise")?.remove();
  }
  function evenements() {
    return {
      pret(d) {
        st.dur = d; $(".lec__dur").textContent = duree(d);
        // Reprendre un long film là où on l'avait laissé.
        const r = lireReprise(cle);
        if (!st.repris && d > 600 && r > 30 && r < d - 30) {
          st.repris = true;
          const p = document.createElement("button");
          p.type = "button"; p.className = "lec__reprise"; p.textContent = `Reprendre à ${duree(r)}`;
          p.addEventListener("click", () => { source.aller(r); source.lire(); p.remove(); });
          $(".player__foot").prepend(p);
        }
      },
      temps(c, d) {
        if (d && d !== st.dur) { st.dur = d; $(".lec__dur").textContent = duree(d); }
        st.cur = c; if (st.glisse) return;
        $(".lec__cur").textContent = duree(c);
        const b = $(".lec__barre"), p = st.dur ? (c / st.dur) * 100 : 0;
        b.value = Math.round(p * 10); b.style.setProperty("--p", p + "%");
        b.setAttribute("aria-valuetext", `${duree(c)} sur ${duree(st.dur)}`);
        if (st.dur > 600 && Math.abs(c - st.dernier) > 5) { st.dernier = c; ecrireReprise(cle, c > 30 && c < st.dur - 30 ? c : 0); }
      },
      charge(x) { $(".lec__barre").style.setProperty("--c", Math.min(100, x * 100) + "%"); },
      etat(e) {
        st.lecture = e === "lecture";
        dialog.classList.toggle("is-lecture", st.lecture);
        const b = $(".lec__play");
        b.innerHTML = st.lecture ? ICONES.pause : ICONES.lire;
        b.setAttribute("aria-label", st.lecture ? "Pause" : "Lecture");
        if (e === "fin") ecrireReprise(cle, 0);
        reveiller();
      },
      attente(x) { dialog.classList.toggle("is-attente", x); },
      son(x) {
        st.vol = x;
        $(".lec__vol").value = Math.round(x * 100);
        $(".lec__vol").style.setProperty("--p", Math.round(x * 100) + "%");
        const b = $(".lec__son");
        b.innerHTML = x === 0 ? ICONES.muet : ICONES.son;
        b.setAttribute("aria-label", x === 0 ? "Remettre le son" : "Couper le son");
      },
      erreur(msg) {
        $(".player__screen").innerHTML = `<p class="player__msg">${esc(msg)}</p>`;
        $(".lec").hidden = true;
      },
    };
  }
  function commandes() {
    const basculer = () => { if (!source) return; st.lecture ? source.pause() : source.lire(); };
    const sauter = (s) => { if (!source || !st.dur) return; source.aller(Math.max(0, Math.min(st.dur - 1, st.cur + s))); };
    const volume = (x) => { if (!source) return; x = Math.max(0, Math.min(1, x)); if (x > 0) st.avant = x; source.volume(x); evenements().son(x); };
    // Plein écran : le vrai si le navigateur l'accepte ; sinon (iPhone, navigateurs intégrés aux applications…)
    // le lecteur s'agrandit à toute la fenêtre, en gardant nos commandes.
    const iconePlein = (on) => {
      $(".lec__plein").innerHTML = on ? ICONES.sortir : ICONES.plein;
      $(".lec__plein").setAttribute("aria-label", on ? "Quitter le plein écran" : "Plein écran");
    };
    const grand = (on) => { dialog.classList.toggle("player--grand", on); iconePlein(on); reveiller(); };
    // iPhone et iPad : pour les films du serveur, on passe la main au lecteur plein écran d'Apple.
    const apple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const plein = () => {
      const zone = $(".player__in");
      if (document.fullscreenElement) return document.exitFullscreen().catch(() => {});
      if (dialog.classList.contains("player--grand")) return grand(false);
      if (apple && source && source.pleinIos && dialog.querySelector(".player__screen video")) return source.pleinIos();
      if (!zone.requestFullscreen) return grand(true);
      zone.requestFullscreen().catch(() => grand(true));
      // Certains navigateurs intégrés ne répondent jamais : sans plein écran au bout d'un instant, on agrandit quand même.
      setTimeout(() => { if (!document.fullscreenElement) grand(true); }, 700);
    };
    dialog.addEventListener("cancel", (e) => { if (dialog.classList.contains("player--grand")) { e.preventDefault(); grand(false); } });
    dialog.addEventListener("close", () => grand(false));
    // En plein écran, pendant la lecture : commandes et curseur disparaissent après 2,5 s sans bouger,
    // et reviennent au moindre mouvement, toucher ou appui sur une touche.
    let minuteur;
    const enPlein = () => document.fullscreenElement === $(".player__in") || dialog.classList.contains("player--grand");
    reveiller = () => {
      clearTimeout(minuteur);
      dialog.classList.remove("is-repos");
      if (enPlein() && st.lecture) minuteur = setTimeout(() => {
        if (enPlein() && st.lecture && !st.glisse) dialog.classList.add("is-repos");
      }, 2500);
    };
    ["pointermove", "pointerdown", "keydown", "touchstart"].forEach((n) => dialog.addEventListener(n, () => reveiller(), { passive: true }));
    $(".lec__play").addEventListener("click", basculer);
    dialog.addEventListener("click", (e) => {
      if (!e.target.closest(".lec__voile")) return;
      // Commandes cachées : le premier toucher les fait revenir, sans mettre en pause.
      if (e.pointerType === "touch" && dialog.dataset.cache === "1") return;
      basculer();
    });
    dialog.addEventListener("pointerdown", () => { dialog.dataset.cache = dialog.classList.contains("is-repos") ? "1" : "0"; }, { capture: true });
    dialog.querySelectorAll(".lec__saut").forEach((b) => b.addEventListener("click", () => sauter(Number(b.dataset.saut))));
    const barre = $(".lec__barre");
    barre.addEventListener("input", () => {
      st.glisse = true;
      const t = (barre.value / 1000) * st.dur;
      barre.style.setProperty("--p", barre.value / 10 + "%");
      $(".lec__cur").textContent = duree(t);
    });
    barre.addEventListener("change", () => { st.glisse = false; if (source && st.dur) source.aller((barre.value / 1000) * st.dur); });
    $(".lec__son").addEventListener("click", () => volume(st.vol === 0 ? (st.avant || 1) : 0));
    $(".lec__vol").addEventListener("input", (e) => volume(e.target.value / 100));
    $(".lec__vit").addEventListener("click", (e) => {
      st.vit = (st.vit + 1) % VITESSES.length;
      const r = VITESSES[st.vit];
      if (source) source.vitesse(r);
      e.currentTarget.textContent = String(r).replace(".", ",") + "×";
      e.currentTarget.setAttribute("aria-label", `Vitesse de lecture : ${r === 1 ? "normale" : "× " + String(r).replace(".", ",")}`);
    });
    $(".lec__plein").addEventListener("click", plein);
    document.addEventListener("fullscreenchange", () => {
      const on = document.fullscreenElement === $(".player__in");
      if (on) dialog.classList.remove("player--grand");
      iconePlein(on);
      reveiller();
    });
    dialog.addEventListener("keydown", (e) => {
      if (!source || $(".lec").hidden || e.altKey || e.ctrlKey || e.metaKey) return;
      const champ = e.target.matches("input[type=range]");
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") { if (e.target.matches("button") && k === " ") return; e.preventDefault(); basculer(); }
      else if (champ) return;
      else if (k === "arrowleft") { e.preventDefault(); sauter(-5); }
      else if (k === "arrowright") { e.preventDefault(); sauter(5); }
      else if (k === "j") sauter(-10);
      else if (k === "l") sauter(10);
      else if (k === "arrowup") { e.preventDefault(); volume(st.vol + 0.1); }
      else if (k === "arrowdown") { e.preventDefault(); volume(st.vol - 0.1); }
      else if (k === "m") volume(st.vol === 0 ? (st.avant || 1) : 0);
      else if (k === "f") plein();
    });
  }

  document.addEventListener("click", (e) => {
    const cover = e.target.closest(".yt__cover"), poster = e.target.closest(".doc__poster, button.doc__ep");
    const label = (el) => (el.getAttribute("aria-label") || "Vidéo").replace(/^Regarder (le film )?/, "").replace(/^« (.*) »/, "$1").replace(/\s*\([^)]*\)$/, "");
    if (cover) {
      const id = cover.parentElement.dataset.yt;
      player({ title: label(cover), embed: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`, link: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` });
    } else if (poster && (poster.dataset.embed || poster.dataset.src)) {
      const m = (poster.dataset.embed || "").match(/youtube-nocookie\.com\/embed\/([\w-]{11})/);
      player({ title: label(poster), embed: poster.dataset.embed, file: poster.dataset.src, secours: poster.dataset.secours, link: m && `https://www.youtube.com/watch?v=${m[1]}` });
    }
  });
})();
