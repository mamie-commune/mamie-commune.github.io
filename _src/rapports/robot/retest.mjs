// Reteste les adresses en erreur en les relisant en entier dans les attributs href/src des pages citées.
import fs from "node:fs"; import path from "node:path";
const [site, entree] = process.argv.slice(2);
const res = JSON.parse(fs.readFileSync(entree, "utf8")).filter((r) => r.statut === 0 || r.statut >= 400);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const vus = new Set();
for (const r of res) {
  for (const p of r.pages) {
    if (!p.endsWith(".html")) continue;
    const html = fs.readFileSync(path.join(site, p), "utf8");
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const u = m[1].replace(/&amp;/g, "&");
      if (!u.startsWith(r.url) || vus.has(u)) continue;
      vus.add(u);
      let s;
      try { const c = new AbortController(); setTimeout(() => c.abort(), 25000); const x = await fetch(u, { redirect: "follow", signal: c.signal, headers: { "User-Agent": UA, "Accept-Language": "fr" } }); s = x.status + (x.url !== u ? " → " + x.url.slice(0, 90) : ""); }
      catch (e) { s = "ERREUR " + (e.cause && e.cause.code || e.name); }
      console.log(s.padEnd(6), "|", u.slice(0, 120), "|", p);
    }
  }
}
