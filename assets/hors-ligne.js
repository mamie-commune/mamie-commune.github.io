// Mamie hors ligne : installe le service worker (sw.js), propose les mises à jour, l'installation du site comme une application,
// le bouton « Garder hors ligne » sur les fiches, et la page de gestion (hors-ligne.html).
// Tout se passe dans le navigateur : rien n'est envoyé, aucun compte. Les copies sont dans le stockage du navigateur (Cache Storage)
// et s'effacent depuis la page Hors ligne ou les réglages du navigateur.
(function () {
  "use strict";
  if (!("serviceWorker" in navigator) || !window.caches) return;
  const racine = new URL("../", document.currentScript.src).href;   // ce script est dans assets/
  const GARDE = "mamie-garde";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let maj = false;

  // ---------- installation du service worker et mises à jour ----------
  function bandeau(attente) {
    if (document.getElementById("majBandeau")) return;
    const b = document.createElement("div");
    b.id = "majBandeau"; b.className = "maj"; b.setAttribute("role", "status");
    b.innerHTML = '<p><b>Nouvelle version de Mamie.</b> Des pages ont changé depuis ta dernière visite.</p><button class="btn btn--main" type="button">Mettre à jour</button><button class="maj__plus-tard" type="button">Plus tard</button>';
    b.querySelector(".btn").addEventListener("click", () => { maj = true; attente.postMessage({ type: "METTRE_A_JOUR" }); });
    b.querySelector(".maj__plus-tard").addEventListener("click", () => b.remove());
    document.body.appendChild(b);
  }
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (maj) location.reload(); });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(racine + "sw.js").then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) bandeau(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        w && w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) bandeau(w); });
      });
    }).catch(() => {});
  });

  // ---------- sans connexion : un petit bandeau le dit ----------
  function etatReseau() {
    let b = document.getElementById("horsLigneBandeau");
    if (navigator.onLine) { if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement("p");
    b.id = "horsLigneBandeau"; b.className = "hl-bandeau"; b.setAttribute("role", "status");
    b.innerHTML = `Pas de connexion : tu lis les pages gardées par ton navigateur. <a href="${racine}hors-ligne">Ce qui est disponible</a>`;
    document.body.prepend(b);
  }
  window.addEventListener("online", etatReseau); window.addEventListener("offline", etatReseau); etatReseau();

  // ---------- installer le site comme une application ----------
  let invite = null;
  const installee = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  function boutonsInstaller() {
    document.querySelectorAll("[data-installer]").forEach((b) => {
      b.hidden = !invite;
      if (!b.dataset.pret) { b.dataset.pret = "1"; b.addEventListener("click", async () => { if (!invite) return; invite.prompt(); await invite.userChoice; invite = null; boutonsInstaller(); }); }
    });
    document.querySelectorAll("[data-installee]").forEach((p) => { p.hidden = !installee(); });
  }
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); invite = e; boutonsInstaller(); });
  window.addEventListener("appinstalled", () => { invite = null; boutonsInstaller(); });

  // ---------- garder une page hors ligne ----------
  // La page elle-même et ses fichiers (styles, scripts, images du site) vont dans le cache « mamie-garde ».
  const adresse = (u) => { const x = new URL(u, location.href); return x.origin + x.pathname; };
  async function garder(u) {
    const c = await caches.open(GARDE), page = adresse(u);
    const res = await fetch(page, { cache: "reload" });
    if (!res.ok) throw new Error(res.status);
    const html = await res.clone().text();
    await c.put(page, res);
    // Fichiers du même site cités par la page (sauf films et PDF).
    const doc = new DOMParser().parseFromString(html, "text/html"), fichiers = new Set();
    doc.querySelectorAll('link[rel="stylesheet"][href], script[src], img[src]').forEach((n) => {
      const f = new URL(n.getAttribute("href") || n.getAttribute("src"), page);
      if (f.origin === location.origin && !/\.(mp4|pdf|zip)$/i.test(f.pathname)) fichiers.add(f.href);
    });
    await Promise.all([...fichiers].map((f) => caches.match(f).then((deja) => deja || fetch(f).then((r) => r.ok && c.put(f, r))).catch(() => {})));
  }
  const gardee = async (u) => !!(await (await caches.open(GARDE)).match(adresse(u)));
  async function oublier(u) { await (await caches.open(GARDE)).delete(adresse(u)); }

  // Bouton sur les fiches, guides, dossiers et packs : sous les informations de la page.
  async function barre() {
    const meta = document.querySelector(".gtitle .gmeta");
    if (!meta || document.querySelector(".hl-barre")) return;
    const d = document.createElement("div");
    d.className = "hl-barre";
    meta.after(d);
    const dessiner = async () => {
      const ok = await gardee(location.href);
      d.innerHTML = (ok ? '<span class="hl-barre__ok">✓ Gardée hors ligne</span><button type="button" data-act="oublier">Retirer</button>' : '<button type="button" data-act="garder">Garder hors ligne</button>') +
        '<button type="button" data-act="imprimer">Imprimer ou PDF</button>';
    };
    d.addEventListener("click", async (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.act === "imprimer") { window.print(); return; }
      b.disabled = true;
      try { if (b.dataset.act === "garder") await garder(location.href); else await oublier(location.href); } catch (err) { b.textContent = "Impossible sans connexion"; return; }
      dessiner();
    });
    dessiner();
  }

  // ---------- page Hors ligne : ce qui est gardé, l'espace utilisé, tout effacer ----------
  async function gestion() {
    const zone = document.getElementById("hlGestion");
    if (!zone) return;
    const liste = document.getElementById("hlListe"), info = document.getElementById("hlInfo");
    async function inventaire() {
      const lignes = [];
      for (const nom of ["mamie-garde", "mamie-pages"]) {
        const c = await caches.open(nom);
        for (const k of await c.keys()) {
          const u = new URL(k.url);
          if (/\.[a-z0-9]+$/i.test(u.pathname) && !u.pathname.endsWith(".html")) continue;   // seulement les pages
          if (lignes.some((l) => l.u === u.pathname)) continue;
          const r = await c.match(k); if (!r) continue;   // copie effacée entre-temps (cache plein)
          const t = (await r.text()).match(/<title>([^<]*)<\/title>/);
          lignes.push({ u: u.pathname, t: t ? t[1].replace(/ · Mamie Commune$/, "").replace(/&#39;/g, "'").replace(/&amp;/g, "&") : u.pathname, garde: nom === "mamie-garde" });
        }
      }
      liste.innerHTML = lignes.length ? lignes.map((l) => `<li><a href="${esc(l.u)}">${esc(l.t)}</a>${l.garde ? ' <span class="hl-garde">gardée</span>' : ""}</li>`).join("") : "<li>Rien pour l'instant. Ouvre des pages, ou garde un pack ci-dessous.</li>";
      let txt = `${lignes.length} page${lignes.length > 1 ? "s" : ""} lisible${lignes.length > 1 ? "s" : ""} sans connexion sur cet appareil.`;
      if (navigator.storage && navigator.storage.estimate) { const s = await navigator.storage.estimate(); txt += ` Espace utilisé par le site : ${(s.usage / 1048576).toFixed(1).replace(".", ",")} Mo.`; }
      info.textContent = txt;
      document.querySelectorAll("[data-garder]").forEach(async (b) => {
        const ok = await gardee(racine + b.dataset.garder);
        b.textContent = ok ? "✓ Gardé hors ligne" : (b.dataset.libelle || "Garder hors ligne");
        b.setAttribute("aria-pressed", String(ok));
      });
    }
    document.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-garder], [data-garder-tout], #hlEffacer"); if (!b) return;
      b.disabled = true;
      try {
        if (b.id === "hlEffacer") {
          if (!confirm("Effacer toutes les pages gardées par Mamie sur cet appareil ?")) { b.disabled = false; return; }
          for (const k of await caches.keys()) if (k.startsWith("mamie-")) await caches.delete(k);
          for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
          info.textContent = "Tout est effacé, et le mode hors ligne est arrêté sur cet appareil. Il se remettra en route à ta prochaine visite.";
          liste.innerHTML = ""; b.disabled = false; return;
        }
        const urls = b.dataset.garderTout ? b.dataset.garderTout.split(" ") : [b.dataset.garder];
        let n = 0; b.textContent = "Téléchargement…";
        for (const u of urls) { try { await garder(racine + u); n++; } catch (err) { /* page suivante */ } }
        if (n < urls.length) b.textContent = `${n} sur ${urls.length} : vérifie ta connexion`;
      } finally { b.disabled = false; }
      await inventaire();
      if (b.dataset.garderTout && !b.textContent.includes("vérifie")) b.textContent = "✓ L'essentiel est gardé";
    });
    inventaire();
  }

  const demarrer = () => { boutonsInstaller(); barre(); gestion(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
