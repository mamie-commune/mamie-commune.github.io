// Robot d'audit : ouvre chaque page du site dans Edge sans fenêtre (protocole DevTools) et relève
// erreurs JS, erreurs réseau, appels à d'autres sites au chargement, et contrôles d'accessibilité de base.
// Usage : node audit.mjs <dossier du site> <adresse du serveur> <sortie.json> [largeur]
import fs from "node:fs"; import path from "node:path"; import { spawn } from "node:child_process";
const [site, base, sortie, largeur = "1280"] = process.argv.slice(2);
const pages = [];
(function tour(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (["_src", ".git", ".github", ".claude", "node_modules", "films"].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) tour(p); else if (p.endsWith(".html")) pages.push(path.relative(site, p).replace(/\\/g, "/")); } })(site);
const url = (r) => base + "/" + (r === "index.html" ? "" : r.endsWith("/index.html") ? r.slice(0, -10) : r.replace(/\.html$/, ""));
const profil = path.join(process.env.TEMP, "mamie-audit-" + Date.now());
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9333;
const proc = spawn(edge, ["--headless=new", "--disable-gpu", "--no-first-run", `--user-data-dir=${profil}`, `--remote-debugging-port=${port}`, `--window-size=${largeur},900`, "about:blank"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const cibles = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(cibles.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const attente = new Map(); const ecoute = [];
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && attente.has(d.id)) { attente.get(d.id)(d); attente.delete(d.id); } else ecoute.forEach((f) => f(d)); });
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; attente.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await cmd("Page.enable"); await cmd("Runtime.enable"); await cmd("Network.enable"); await cmd("Log.enable");
await cmd("Network.setCacheDisabled", { cacheDisabled: true });
// Edge sans fenêtre impose une largeur minimale (environ 500 px) : on simule la vraie largeur d'écran demandée.
await cmd("Emulation.setDeviceMetricsOverride", { width: +largeur, height: 900, deviceScaleFactor: 1, mobile: +largeur < 800 });
const CONTROLES = `(() => {
  const r = {}; const vis = (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
  r.lang = document.documentElement.lang;
  r.titre = document.title;
  r.h1 = document.querySelectorAll("h1").length;
  const niv = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]); r.sauts = [];
  for (let i = 1; i < niv.length; i++) if (niv[i] > niv[i - 1] + 1) r.sauts.push(niv[i - 1] + "→" + niv[i]);
  r.imgSansAlt = [...document.querySelectorAll("img:not([alt])")].map((i) => i.getAttribute("src")).slice(0, 5);
  r.champsSansNom = [...document.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea")].filter((c) => !(c.labels && c.labels.length) && !c.getAttribute("aria-label") && !c.getAttribute("aria-labelledby") && !c.title).map((c) => c.name || c.id || c.outerHTML.slice(0, 60)).slice(0, 5);
  r.boutonsSansNom = [...document.querySelectorAll("button,a[href]")].filter((b) => vis(b) && !b.textContent.trim() && !b.getAttribute("aria-label") && !b.getAttribute("title") && !b.querySelector("img[alt]:not([alt=''])")).map((b) => b.outerHTML.slice(0, 80)).slice(0, 5);
  const ids = {}; document.querySelectorAll("[id]").forEach((e) => { ids[e.id] = (ids[e.id] || 0) + 1; }); r.idsDoubles = Object.keys(ids).filter((k) => ids[k] > 1).slice(0, 5);
  r.ancresMortes = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href").slice(1)).filter((h) => h && !document.getElementById(decodeURIComponent(h))).slice(0, 5);
  r.debord = document.documentElement.scrollWidth > window.innerWidth + 1 ? document.documentElement.scrollWidth : 0;
  const nav = performance.getEntriesByType("navigation")[0]; r.chargementMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : null;
  r.poidsKo = Math.round(performance.getEntriesByType("resource").reduce((s, e) => s + (e.encodedBodySize || 0), (nav && nav.encodedBodySize) || 0) / 1024);
  return r;
})()`;
const resultats = [];
for (const p of pages) {
  const u = url(p); const r = { page: p, url: u, erreursJS: [], console: [], reseau: [], externes: [] };
  const f = (d) => {
    if (d.method === "Runtime.exceptionThrown") r.erreursJS.push((d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text).split("\n")[0]);
    if (d.method === "Runtime.consoleAPICalled" && (d.params.type === "error" || d.params.type === "warning")) r.console.push(d.params.args.map((a) => a.value || a.description).join(" ").slice(0, 160));
    if (d.method === "Log.entryAdded" && d.params.entry.level === "error") r.console.push((d.params.entry.text + " " + (d.params.entry.url || "")).slice(0, 200));
    if (d.method === "Network.requestWillBeSent") { const h = new URL(d.params.request.url); if (!/^(localhost|127\.0\.0\.1)$/.test(h.hostname) && h.protocol.startsWith("http")) r.externes.push(h.hostname); }
    if (d.method === "Network.responseReceived" && d.params.response.status >= 400) r.reseau.push(d.params.response.status + " " + d.params.response.url);
    if (d.method === "Network.loadingFailed" && !d.params.canceled) r.reseau.push("échec " + d.params.errorText + " " + (d.params.type || ""));
  };
  ecoute.push(f);
  const charge = new Promise((ok) => { const g = (d) => { if (d.method === "Page.loadEventFired") { ecoute.splice(ecoute.indexOf(g), 1); ok(); } }; ecoute.push(g); setTimeout(ok, 15000); });
  await cmd("Page.navigate", { url: u }); await charge; await new Promise((ok) => setTimeout(ok, 700));
  const ev = await cmd("Runtime.evaluate", { expression: CONTROLES, returnByValue: true });
  Object.assign(r, (ev.result && ev.result.result && ev.result.result.value) || { evalErreur: true });
  ecoute.splice(ecoute.indexOf(f), 1);
  r.externes = [...new Set(r.externes)];
  resultats.push(r);
}
fs.writeFileSync(sortie, JSON.stringify(resultats, null, 1));
ws.close(); proc.kill();
console.log(`${resultats.length} pages testées`);
