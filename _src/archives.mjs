// Archives historiques : fabrique _src/archives/archives.json, une fiche par document d'archive du site.
// Sources : assets/img/revolutions/credits.txt (autrice ou auteur, licence, adresse Wikimedia Commons), les légendes écrites
// par la bande dans les pages (description, contexte, page où le document est montré), et la date relevée sur Commons.
// Rien n'est inventé : un champ qu'on ne connaît pas reste vide et la fiche le dit ; une date qui ne vient que de notre légende,
// ou qui est approximative, est signalée comme incertaine.
// Usage (depuis le dossier du site) : node _src/archives.mjs   (à relancer après avoir ajouté des images dans credits.txt)
import fs from "node:fs";
import path from "node:path";

const net = (s) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();
const credits = fs.readFileSync("assets/img/revolutions/credits.txt", "utf8").split(/\r?\n/).filter((l) => l.includes("|") && !l.startsWith("#"))
  .map((l) => { const [id, taille, auteur, licence, url] = l.split("|").map((x) => x.trim()); return { id, taille, auteur, licence, url }; });

// 1. Où chaque image est montrée sur le site, avec notre légende.
const fichiers = [];
(function lister(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) lister(p); else if (/\.(txt|html)$/.test(f.name)) fichiers.push(p); } })("_src");
const usages = {};
for (const f of fichiers) {
  const txt = fs.readFileSync(f, "utf8"), dossier = path.relative("_src", path.dirname(f)).replace(/\\/g, "/");
  for (const m of txt.matchAll(/<figure class="photo[^"]*"><img src="[^"]*revolutions\/([a-z0-9-]+)\.jpg" alt="([^"]*)"[^>]*><figcaption>([\s\S]*?)<\/figcaption>/g)) {
    const avant = txt.slice(0, m.index), h = [...avant.matchAll(/^=== ([^|]+?) \| [^|]*\| ([^|]+?) \|/gm)].pop();
    let page = "", titre = "";
    if (h && /\.txt$/.test(f)) { page = `${dossier}/${h[1].trim()}`; titre = h[2].trim(); }
    else if (/\.html$/.test(f)) { page = (dossier === "pages" ? "" : dossier + "/") + path.basename(f, ".html"); titre = net((txt.match(/^<!--\s*([^|]+)/) || [])[1]).replace(/ · Mamie Commune$/, ""); }
    const legende = net(m[3].replace(/<small>[\s\S]*?<\/small>/g, ""));
    (usages[m[1]] ||= []).push({ page, titre, legende, alt: m[2].replace(/&#39;/g, "'").replace(/&quot;/g, '"') });
  }
}

// 2. La date et le titre du fichier sur Wikimedia Commons (par paquets de 40).
const titreCommons = (u) => decodeURIComponent((u.split("/wiki/")[1] || "").replace(/_/g, " "));
const meta = {};
const aDemander = credits.filter((c) => c.url.includes("commons.wikimedia.org"));
for (let i = 0; i < aDemander.length; i += 40) {
  const lot = aDemander.slice(i, i + 40), titres = lot.map((c) => titreCommons(c.url));
  const u = "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=DateTimeOriginal|ObjectName&format=json&titles=" + encodeURIComponent(titres.join("|"));
  const j = await (await fetch(u, { headers: { "User-Agent": "MamieCommune-archives/1.0 (site militant, recherche documentaire)" } })).json();
  const norm = Object.fromEntries((j.query?.normalized || []).map((n) => [n.to, n.from]));
  for (const p of Object.values(j.query?.pages || {})) { const t = norm[p.title] || p.title; meta[t] = p.imageinfo?.[0]?.extmetadata || {}; }
  await new Promise((r) => setTimeout(r, 800));
}

// 3. Classement : mouvement, territoire, type, date.
const MOUV = { commune: "Commune de Paris", makhno: "Makhnovtchina", espagne: "Révolution espagnole et CNT-FAI", zapatistes: "Expériences zapatistes", zad: "ZAD et luttes écologistes",
  slt: "ZAD et luttes écologistes", mai68: "Mai 68", panthers: "Black Panthers", gj: "Gilets jaunes", argentine: "Argentine 2001", oaxaca: "Oaxaca 2006", kanaky: "Luttes anticoloniales",
  rojava: "Rojava", shinmin: "Shinmin coréen", queer: "Luttes LGBT", ad: "Histoire syndicale et action directe", figure: "Figures de l'anarchisme", biblio: "Histoire des idées anarchistes" };
const TERR = [["Kanaky", /kanak|nouvelle-calédonie|nouméa/i], ["Mexique", /mexique|chiapas|oaxaca|zapatist/i], ["Argentine", /argentin|buenos aires/i], ["Espagne", /espagn|barcelon|madrid|catalogne|aragon|cnt/i],
  ["Ukraine", /ukrain|houlia|makhno/i], ["Russie", /russie|russe|cronstadt|kronstadt|pétersbourg|moscou|soviét/i], ["Syrie (Rojava)", /rojava|syrie|kobané|kurde/i], ["Corée et Mandchourie", /corée|coréen|mandchou/i],
  ["Japon", /japon|tokyo/i], ["États-Unis", /états-unis|harpers ferry|virginie|john brown|haymarket|chicago|new york|seattle|paterson|californie|oakland|américain/i], ["Royaume-Uni", /londres|angleterre|britann/i], ["Italie", /itali|rome|milan/i],
  ["Suisse", /suisse|genève|bâle|saint-imier|jura|lausanne/i], ["Allemagne", /allemagne|allemand|berlin|munich|bavière/i], ["Belgique", /belgique|bruxelles/i], ["Algérie", /algérie|alger/i], ["Turquie", /turquie|turc/i],
  ["France", /france|français|paris|lyon|marseille|nantes|notre-dame-des-landes|bretagne|courrières|besançon|blipb|larzac|sainte-soline|montmartre|versailles|bordeaux|rouen|lille|flins|billancourt|sorbonne|nanterre|saint-nazaire|bastille|rond-point/i],
  ["Pays-Bas", /pays-bas|amsterdam/i], ["Autriche", /autriche|vienneb/i], ["Pologne", /pologne|varsovie/i], ["Portugal", /portugal|lisbonne/i], ["Chine", /chine|chinois|pékin|shanghai/i], ["Inde", /bindeb|indien/i], ["Brésil", /brésil/i], ["Cuba", /cuba/i]];
const TERR_MOUV = { commune: "France", mai68: "France", gj: "France", zad: "France", slt: "France", makhno: "Ukraine", espagne: "Espagne", zapatistes: "Mexique", oaxaca: "Mexique", argentine: "Argentine", kanaky: "Kanaky", rojava: "Syrie (Rojava)", shinmin: "Corée et Mandchourie", panthers: "États-Unis" };
// Type : d'abord la légende de la bande (alt et légende), puis le reste ; une photo d'une personne est un portrait.
const TYPE = (leg, tout) => /affiche|poster/i.test(leg) ? "Affiche" : /\btract\b/i.test(leg) ? "Tract"
  : /photographi|\bphoto\b|portrait/i.test(leg) ? (/photographié|photographiée|portrait|\bpose\b/i.test(leg) ? "Portrait" : "Photographie")
  : /gravure|dessin|caricature|lithographie|illustration|peinture|tableau|fresque|estampe/i.test(leg) ? "Gravure, dessin et peinture"
  : /journal|une du|numéro|périodique|hebdomadaire|quotidien/i.test(leg) ? "Journal et périodique"
  : /brochure|manuscrit|couverture|page de titre|lettre|programme|déclaration|carte d'adhérent|copie/i.test(leg) ? "Document imprimé ou manuscrit"
  : /affiche|\btract\b|gravure|dessin|journal/i.test(tout) ? TYPE(tout, "") : "Photographie";
const annee = (s) => { const m = String(s).match(/\b(1[5-9]\d\d|20[0-2]\d)\b/); return m ? Number(m[1]) : null; };

const docs = credits.map((c) => {
  const us = usages[c.id] || [], u0 = us[0] || {}, m = meta[titreCommons(c.url)] || {};
  const dateCommons = net(m.DateTimeOriginal?.value), prefixe = c.id.split("-")[0];
  let date = "", incertitude = "";
  const aC = annee(dateCommons), aL = annee(u0.legende);
  if (aC) { date = dateCommons.length <= 30 ? dateCommons : String(aC); if (/circa|vers|ca\.|\?|environ|avant|après|between|entre/i.test(dateCommons)) incertitude = "Date approximative selon la notice de Wikimedia Commons."; if (aL && Math.abs(aL - aC) > 1 && !/\d{4}\s*[-–]\s*\d{4}/.test(dateCommons)) incertitude = `À vérifier : Wikimedia Commons date le document de ${dateCommons}, notre légende évoque ${aL}. La photo ou l'objet peut être postérieur à l'événement, ou l'une des dates est fausse.`; }
  else if (aL) { date = String(aL); incertitude = "Date tirée de notre légende : la notice de Wikimedia Commons ne donne pas de date."; }
  else incertitude = "Date inconnue : ni la notice de Wikimedia Commons ni notre légende ne la donnent.";
  const tout = `${us.map((x) => x.legende + " " + x.alt).join(" ")} ${net(m.ObjectName?.value)} ${c.id.replace(/-/g, " ")}`;
  const territoire = TERR_MOUV[prefixe] || (TERR.find(([, re]) => re.test(tout)) || ["Non précisé"])[0];
  return {
    id: c.id, image: `assets/img/revolutions/${c.id}.jpg`, titre: u0.legende ? u0.legende.split(/(?<=[.!?])\s/)[0].replace(/\.$/, "") : net(m.ObjectName?.value) || c.id,
    date, annee: aC || aL || null, incertitude, auteur: c.auteur, mouvement: MOUV[prefixe] || "Autres luttes", territoire, type: TYPE(us.map((x) => x.legende + " " + x.alt).join(" "), tout),
    description: u0.alt || "", contexte: u0.legende || "", pages: us.filter((x) => x.page).map((x) => ({ page: x.page, titre: x.titre })),
    provenance: "Wikimedia Commons" + (/musée|bibliothèque|archives|library|museum|carnavalet|gallica|bnf|congress|getty|nationaal|iish|institut/i.test(c.auteur) ? ` (fonds cité : ${c.auteur})` : ""),
    source: c.url, licence: c.licence, taille: c.taille
  };
});
fs.mkdirSync("_src/archives", { recursive: true });
// Corrections écrites à la main (transcription d'une affiche, territoire, date vérifiée…) : elles remplacent les champs calculés.
const fc = "_src/archives/corrections.json";
if (fs.existsSync(fc)) for (const [id, champs] of Object.entries(JSON.parse(fs.readFileSync(fc, "utf8")))) { const d = docs.find((x) => x.id === id); if (d) Object.assign(d, champs); else console.warn("correction pour un document inconnu : " + id); }
fs.writeFileSync("_src/archives/archives.json", JSON.stringify({ _lisezmoi: "Généré par node _src/archives.mjs depuis assets/img/revolutions/credits.txt, les légendes des pages et Wikimedia Commons. Pour corriger une fiche, corriger la légende dans la page, ou ajouter une entrée dans _src/archives/corrections.json (même id, champs à remplacer, par exemple transcription), puis relancer le script.", documents: docs }, null, 1) + "\n");
const comp = (k) => Object.entries(docs.reduce((a, d) => ((a[d[k]] = (a[d[k]] || 0) + 1), a), {})).map(([x, n]) => `${x} ${n}`).join(" · ");
console.log(`${docs.length} documents · sans page : ${docs.filter((d) => !d.pages.length).length} · dates incertaines : ${docs.filter((d) => d.incertitude).length}`);
console.log("types :", comp("type")); console.log("territoires :", comp("territoire")); console.log("mouvements :", comp("mouvement"));
