// Remplit _src/audio/catalogue.json depuis LibriVox et archive.org : pistes (titre, durée, OGG, MP3, voix), lecteurs,
// durée totale, adresse de l'item archive.org, source du texte et licence relevée sur l'item.
// Usage (depuis le dossier du site) : node _src/audio.mjs          → complète les œuvres qui n'ont pas encore de pistes
//                                      node _src/audio.mjs --refaire → refait toutes les œuvres LibriVox
// Rien n'est copié : les fichiers restent chez archive.org et ne sont chargés qu'au moment où l'on appuie sur lecture.
import fs from "node:fs";
const F = "_src/audio/catalogue.json";
const cat = JSON.parse(fs.readFileSync(F, "utf8"));
const refaire = process.argv.includes("--refaire");
const net = (s) => String(s || "").replace(/<br\s*\/?>/gi, " · ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").replace(/^ · | · $/g, "").trim();
const lv = async (q) => { const r = await fetch("https://librivox.org/api/feed/audiobooks/?" + q + "&extended=1&format=json"); if (!r.ok) throw new Error("LibriVox " + r.status + " " + q); return (await r.json()).books || []; };

for (const o of cat.oeuvres) {
  if (o.librivoxId === undefined || (o.pistes && !refaire)) continue;
  let livre;
  if (o.librivoxId) livre = (await lv("id=" + o.librivoxId))[0];
  else {
    // Recherche par titre : on garde la version dont l'item archive.org est celui indiqué, sinon la première de l'autrice ou de l'auteur.
    const nom = o.auteur.split(" ").pop().replace(/[ïî]/g, "i").replace("Kropotkine", "Kropotkin").replace("Bakounine", "Bakunin");
    const cand = (await lv("title=" + encodeURIComponent("^" + o.librivoxTitre))).filter((b) => JSON.stringify(b.authors).toLowerCase().includes(nom.toLowerCase().slice(0, 6)));
    livre = cand.find((b) => o.librivoxArchive && String(b.url_iarchive).endsWith(o.librivoxArchive)) || cand[0];
  }
  if (!livre) throw new Error("introuvable sur LibriVox : " + o.id);
  const item = String(livre.url_iarchive).split("/").pop();
  const meta = await (await fetch("https://archive.org/metadata/" + item)).json();
  const noms = new Set((meta.files || []).map((f) => f.name));
  o.librivoxId = Number(livre.id);
  o.source = { titre: "LibriVox", url: livre.url_librivox };
  o.archive = "https://archive.org/details/" + item;
  o.licence = /publicdomain/.test(meta.metadata?.licenseurl || "") ? "Domaine public (LibriVox ; marque du domaine public sur archive.org)" : "Domaine public (LibriVox : les voix bénévoles versent leurs lectures au domaine public)";
  o.texteSource = livre.url_text_source || "";
  o.duree = livre.totaltime;
  o.pistes = livre.sections.map((s) => {
    const mp3 = s.listen_url.replace(/^http:/, "https:").replace("www.archive.org", "archive.org");
    const ogg = mp3.replace(/_64kb\.mp3$/, ".ogg");
    return { titre: net(s.title), duree: Number(s.playtime), voix: s.readers.map((r) => r.display_name).join(", "), mp3, ogg: noms.has(ogg.split("/").pop()) ? ogg : "" };
  });
  o.lecteurs = [...new Set(o.pistes.flatMap((p) => p.voix.split(", ")))];
  console.log(`${o.id} : ${o.pistes.length} pistes, ${o.duree}, ${o.lecteurs.length} voix, OGG ${o.pistes.filter((p) => p.ogg).length}/${o.pistes.length}`);
}
fs.writeFileSync(F, JSON.stringify(cat, null, 2) + "\n");
