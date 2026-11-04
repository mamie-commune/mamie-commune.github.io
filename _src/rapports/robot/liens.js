// Vérifie les liens internes (adresses propres) de toutes les pages générées. Usage : node liens.js <dossier du site>
const fs = require("fs"), path = require("path");
const site = path.resolve(process.argv[2]);
const pages = [];
(function tour(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (["_src", ".git", ".github", ".claude", "node_modules"].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) tour(p); else if (p.endsWith(".html")) pages.push(p); } })(site);
const existe = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
const casses = {};
for (const p of pages) {
  const html = fs.readFileSync(p, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
    let u = m[1].replace(/&amp;/g, "&");
    if (!u || /^(https?:|mailto:|tel:|data:|#|javascript:)/.test(u)) continue;
    u = u.split(/[?#]/)[0]; if (!u) continue;
    let f = u.startsWith("/") ? path.join(site, u) : path.join(path.dirname(p), u);
    try { f = decodeURIComponent(f); } catch {}
    const ok = existe(f) || existe(f + ".html") || existe(path.join(f, "index.html"));
    if (!ok) { const k = path.relative(site, p) + " -> " + m[1]; casses[k] = 1; }
  }
}
const l = Object.keys(casses);
console.log(`${pages.length} pages, ${l.length} liens cassés`);
l.slice(0, 40).forEach((x) => console.log(" ", x));
