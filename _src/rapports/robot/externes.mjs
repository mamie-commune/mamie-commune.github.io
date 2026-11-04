// Recense les adresses externes du site (pages générées et scripts de données) puis teste chacune.
// Usage : node externes.mjs <dossier du site> <sortie.json>
import fs from "node:fs"; import path from "node:path";
const [site, sortie] = process.argv.slice(2);
const urls = new Map();
const ignore = /\$\{|\{s\}|localhost|example\.|youtube-nocookie\.com\/embed|tiktok\.com\/player|w3\.org|v\.calameo|schema\.org/;
(function tour(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if ([".git", "node_modules", "films", "_src", ".claude", "vendor", ".github"].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { tour(p); continue; }
    if (!/\.(html|js)$/.test(p)) continue;
    const s = fs.readFileSync(p, "utf8");
    for (const m of s.matchAll(/https?:\/\/[^\s"'<>`)\\]+/g)) {
      const u = m[0].replace(/&amp;/g, "&").replace(/[.,;:]+$/, "");
      if (ignore.test(u) || /^https:\/\/mamiecommune\.org/.test(u)) continue;
      if (!urls.has(u)) urls.set(u, []);
      const l = urls.get(u); const rel = path.relative(site, p).replace(/\\/g, "/"); if (l.length < 3 && !l.includes(rel)) l.push(rel);
    }
  }
})(site);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 MamieCommuneVerifLiens";
async function tester(u) {
  for (const methode of ["HEAD", "GET"]) {
    try {
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 20000);
      const r = await fetch(u, { method: methode, redirect: "follow", signal: c.signal, headers: { "User-Agent": UA, "Accept-Language": "fr,en" } });
      clearTimeout(t);
      if (methode === "HEAD" && (r.status === 405 || r.status === 403 || r.status === 404 || r.status >= 500)) continue;
      return { statut: r.status, final: r.url !== u ? r.url : "" };
    } catch (e) { if (methode === "GET") return { statut: 0, erreur: String(e.cause && e.cause.code || e.name) }; }
  }
}
const liste = [...urls.keys()]; const res = []; let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => { while (i < liste.length) { const u = liste[i++]; res.push({ url: u, pages: urls.get(u), ...(await tester(u)) }); } }));
fs.writeFileSync(sortie, JSON.stringify(res, null, 1));
const mauvais = res.filter((r) => r.statut === 0 || r.statut >= 400);
console.log(`${res.length} adresses testées, ${mauvais.length} en erreur`);
