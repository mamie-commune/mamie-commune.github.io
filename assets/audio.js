// Lecteur de la bibliothèque audio (pages audio/<œuvre>). Sans dépendance.
// Lecture et pause, ±15 s, barre de progression, volume, vitesse, piste précédente et suivante, enchaînement des pistes,
// position gardée dans le navigateur (clé « mamie-ecoute:<œuvre> », rien n'est envoyé), transcription synchronisée
// quand la piste a un fichier WebVTT. Le son n'est chargé qu'au moment où l'on appuie sur lecture.
(function () {
  "use strict";
  const bloc = document.querySelector("[data-ecoute]"); if (!bloc) return;
  const $ = (s) => bloc.querySelector(s);
  const id = bloc.dataset.ecoute, CLE = "mamie-ecoute:" + id;
  const choix = [...bloc.querySelectorAll(".ecoute__choix")];
  const audio = new Audio(); audio.preload = "none";
  const peutOgg = audio.canPlayType('audio/ogg; codecs="vorbis"') !== "";
  let n = 0, cues = [], derniereSauvegarde = 0, glisse = false;

  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); };
  const lire = () => { try { return JSON.parse(localStorage.getItem(CLE) || "null"); } catch (e) { return null; } };
  const garder = () => { try { localStorage.setItem(CLE, JSON.stringify({ n, t: Math.floor(audio.currentTime || 0) })); } catch (e) { /* navigation privée */ } };
  const duree = () => (isFinite(audio.duration) && audio.duration) || Number(choix[n].dataset.duree) || 0;

  function afficherTemps() {
    $(".ecoute__temps").textContent = fmt(audio.currentTime) + " / " + fmt(duree());
    if (!glisse) $(".ecoute__pos").value = duree() ? Math.round((audio.currentTime / duree()) * 1000) : 0;
    if (cues.length) {
      const t = audio.currentTime; let actif = null;
      cues.forEach((c) => { const on = t >= c.debut && t < c.fin; c.el.classList.toggle("is-actif", on); if (on) actif = c.el; });
      if (actif && !actif.dataset.vu) { bloc.querySelectorAll(".ecoute__cues [data-vu]").forEach((e) => delete e.dataset.vu); actif.dataset.vu = "1"; actif.scrollIntoView({ block: "nearest" }); }
    }
  }

  // WebVTT : seulement les horaires et le texte (pas de mise en forme).
  async function chargerTranscription(url) {
    cues = []; const zone = $(".ecoute__transcription"), liste = $(".ecoute__cues"); liste.textContent = "";
    if (!url) { zone.hidden = true; return; }
    try {
      const vtt = await (await fetch(url)).text();
      const sec = (h) => { const p = h.trim().split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
      for (const bloc of vtt.replace(/\r/g, "").split(/\n\n+/)) {
        const l = bloc.split("\n"), i = l.findIndex((x) => x.includes("-->")); if (i < 0) continue;
        const [a, b] = l[i].split("-->"); const p = document.createElement("p");
        p.textContent = l.slice(i + 1).join(" ").replace(/<[^>]+>/g, "");
        const c = { debut: sec(a), fin: sec(b.split(" ")[1] || b), el: p };
        p.tabIndex = 0; p.addEventListener("click", () => { audio.currentTime = c.debut; if (audio.paused) jouer(); });
        liste.appendChild(p); cues.push(c);
      }
      zone.hidden = !cues.length;
    } catch (e) { zone.hidden = true; }
  }

  function choisir(i, debut, lancer) {
    n = Math.max(0, Math.min(choix.length - 1, i));
    const b = choix[n];
    audio.src = peutOgg && b.dataset.ogg ? b.dataset.ogg : b.dataset.mp3;
    choix.forEach((x, k) => { x.setAttribute("aria-current", k === n ? "true" : "false"); });
    $(".ecoute__piste").textContent = b.querySelector(".ecoute__titre").textContent;
    $(".ecoute__voix").textContent = "Voix : " + (b.parentElement.querySelector(".ecoute__info").textContent.split(" · ").slice(1).join(" · "));
    chargerTranscription(b.dataset.vtt);
    if (debut) audio.addEventListener("loadedmetadata", () => { audio.currentTime = debut; }, { once: true });
    afficherTemps();
    if (lancer) jouer();
  }
  function jouer() { if (!audio.src) choisir(n, 0, false); audio.playbackRate = Number($(".ecoute__vitesse").value); audio.play().catch(() => {}); }

  $(".ecoute__jouer").addEventListener("click", () => (audio.paused ? jouer() : audio.pause()));
  audio.addEventListener("play", () => { $(".ecoute__jouer").textContent = "❚❚"; $(".ecoute__jouer").setAttribute("aria-label", "Pause"); bloc.classList.add("is-lecture"); });
  audio.addEventListener("pause", () => { $(".ecoute__jouer").textContent = "▶"; $(".ecoute__jouer").setAttribute("aria-label", "Lecture"); bloc.classList.remove("is-lecture"); garder(); });
  audio.addEventListener("timeupdate", () => { afficherTemps(); if (Date.now() - derniereSauvegarde > 5000) { derniereSauvegarde = Date.now(); garder(); } });
  audio.addEventListener("loadedmetadata", afficherTemps);
  audio.addEventListener("ended", () => { if (n < choix.length - 1) choisir(n + 1, 0, true); else { try { localStorage.removeItem(CLE); } catch (e) { /* rien */ } } });
  audio.addEventListener("error", () => { $(".ecoute__piste").textContent = "Le son ne se charge pas : vérifie ta connexion, ou télécharge la piste plus bas."; });

  bloc.querySelectorAll("[data-saut]").forEach((b) => b.addEventListener("click", () => { audio.currentTime = Math.max(0, Math.min(duree(), audio.currentTime + Number(b.dataset.saut))); afficherTemps(); }));
  bloc.querySelectorAll("[data-piste]").forEach((b) => b.addEventListener("click", () => choisir(n + Number(b.dataset.piste), 0, !audio.paused)));
  choix.forEach((b, i) => b.addEventListener("click", () => choisir(i, 0, true)));
  const pos = $(".ecoute__pos");
  pos.addEventListener("input", () => { glisse = true; $(".ecoute__temps").textContent = fmt((pos.value / 1000) * duree()) + " / " + fmt(duree()); });
  pos.addEventListener("change", () => { glisse = false; if (!audio.src) choisir(n, 0, false); audio.currentTime = (pos.value / 1000) * duree(); afficherTemps(); });
  $(".ecoute__vol").addEventListener("input", (e) => { audio.volume = Number(e.target.value); });
  $(".ecoute__vitesse").addEventListener("change", (e) => { audio.playbackRate = Number(e.target.value); });
  // Raccourcis clavier, sauf quand on écrit dans un champ.
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea, [contenteditable]") || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === " " || e.key === "k") { e.preventDefault(); audio.paused ? jouer() : audio.pause(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { if (!audio.src) return; e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime + (e.key === "ArrowLeft" ? -15 : 15)); }
  });

  // Reprendre là où on s'était arrêté.
  const r = lire();
  if (r && (r.n > 0 || r.t > 10) && choix[r.n]) {
    const p = $(".ecoute__reprise"), b = p.querySelector("button");
    b.textContent = `Reprendre : piste ${r.n}, à ${fmt(r.t)}`; p.hidden = false;
    b.addEventListener("click", () => { p.hidden = true; choisir(r.n, r.t, true); });
    choisir(r.n, 0, false);
  }
})();
