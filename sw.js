// Généré par _src/build.ps1 depuis _src/sw.js — ne pas modifier à la main.
// Service worker de Mamie Commune : le site lisible sans connexion. Modèle : _src/sw.js ; _src/build.ps1 remplace la
// version et la liste des fichiers de départ et écrit sw.js à la racine (ne pas modifier sw.js à la main).
//
// Ce qu'il fait, et rien d'autre :
// - à l'installation, il garde la « coquille » : accueil, page Hors ligne, page « pas de connexion », styles, polices, logo, scripts communs ;
// - chaque page ou fichier du site que tu ouvres est gardé dans ton navigateur (cache « mamie-pages », 300 éléments au plus) ;
// - les pages que tu demandes à garder vont dans « mamie-garde » (jamais effacées toutes seules) ;
// - sans connexion, il sert la copie gardée, ou la page « pas de connexion ».
// Il ne touche jamais aux autres sites (carte OpenStreetMap, vidéos, TikTok…), ni aux films et PDF, ni aux formulaires.
// Il n'envoie rien, ne synchronise rien en arrière-plan et n'utilise ni notifications ni synchronisation périodique.
const VERSION = "16907eb1";
const COQUILLE = "mamie-coquille-" + VERSION, PAGES = "mamie-pages", GARDE = "mamie-garde";
const DEPART = [
  "./",
  "hors-ligne",
  "sans-connexion",
  "recherche",
  "confidentialite",
  "manifest.webmanifest",
  "assets/style.css?v=16907eb1",
  "assets/fonts.css?v=16907eb1",
  "assets/site.js?v=16907eb1",
  "assets/recherche.js?v=16907eb1",
  "assets/hors-ligne.js?v=16907eb1",
  "data/recherche.js?v=16907eb1",
  "data/lieux.js?v=16907eb1",
  "assets/mamie-logo-192.webp",
  "assets/icone-32.png",
  "assets/icone-192.png",
  "assets/fonts/AlfaSlabOne-400-normal-latin-ext.woff2",
  "assets/fonts/AlfaSlabOne-400-normal-latin.woff2",
  "assets/fonts/Archivo-400-italic-latin-ext.woff2",
  "assets/fonts/Archivo-400-italic-latin.woff2",
  "assets/fonts/Archivo-400-normal-latin-ext.woff2",
  "assets/fonts/Archivo-400-normal-latin.woff2",
  "assets/fonts/Archivo-600-normal-latin-ext.woff2",
  "assets/fonts/Archivo-600-normal-latin.woff2",
  "assets/fonts/ArchivoBlack-400-normal-latin-ext.woff2",
  "assets/fonts/ArchivoBlack-400-normal-latin.woff2",
  "assets/fonts/SpecialElite-400-normal-latin-ext.woff2",
  "assets/fonts/SpecialElite-400-normal-latin.woff2"
];
const MAX_PAGES = 300;
const base = new URL("./", self.location).href;
const abs = (u) => new URL(u, base).href;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(COQUILLE).then((c) => c.addAll(DEPART.map((u) => new Request(abs(u), { cache: "reload" })))));
  // Pas de skipWaiting ici : la nouvelle version attend que la personne clique « Mettre à jour » (bandeau dans la page).
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("mamie-coquille-") && k !== COQUILLE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e) => { if (e.data && e.data.type === "METTRE_A_JOUR") self.skipWaiting(); });

// Une seule copie par fichier : quand style.css?v=nouvelle arrive, l'ancienne style.css?v=ancienne part.
async function ranger(req, res) {
  const c = await caches.open(PAGES), u = new URL(req.url);
  if (u.search) for (const k of await c.keys()) { const ku = new URL(k.url); if (ku.pathname === u.pathname && ku.href !== u.href) await c.delete(k); }
  await c.put(req, res);
  const cles = await c.keys();
  for (let i = 0; i < cles.length - MAX_PAGES; i++) await c.delete(cles[i]);   // les plus anciennes d'abord
}

// Pages : le réseau d'abord (pour avoir la dernière version), la copie gardée si le réseau manque ou traîne.
async function page(e) {
  const req = e.request, u = new URL(req.url), cle = new Request(u.origin + u.pathname);
  const copie = () => caches.match(cle, { ignoreSearch: true });
  const reseau = fetch(req).then((res) => {
    if (res.ok && res.type === "basic") e.waitUntil(ranger(cle, res.clone()));
    return res;
  });
  reseau.catch(() => {});   // l'échec est traité plus bas ; évite une erreur « non traitée » si la copie a déjà répondu
  try {
    // Connexion très lente : au bout de 6 secondes, on montre la copie si elle existe (la vraie arrive quand même en cache).
    const lente = new Promise((ok) => setTimeout(async () => { const c = await copie(); if (c) ok(c); }, 6000));
    return await Promise.race([reseau, lente]);
  } catch (err) {
    return (await copie()) || (await caches.match(abs("sans-connexion"))) || new Response("Pas de connexion.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

// Styles, scripts, polices, images, données : la copie gardée d'abord (leur adresse change à chaque nouvelle version).
async function fichier(e) {
  const req = e.request, gardee = await caches.match(req);
  if (gardee) return gardee;
  try {
    const res = await fetch(req);
    if (res.ok && res.type === "basic") e.waitUntil(ranger(req, res.clone()));
    return res;
  } catch (err) {
    return (await caches.match(req, { ignoreSearch: true })) || Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== self.location.origin) return;   // autres sites : le navigateur s'en occupe, sans nous
  if (req.headers.has("range") || /\.(mp4|webm|mp3|ogg|pdf|zip)$/i.test(u.pathname) || u.pathname.includes("/films/")) return;
  if (u.pathname.endsWith("/sw.js")) return;
  e.respondWith(req.mode === "navigate" ? page(e) : fichier(e));
});
