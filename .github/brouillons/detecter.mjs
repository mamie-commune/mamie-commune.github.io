// Liste les brouillons de _brouillons-chatgpt/dossiers/ qui n'ont pas encore de rapport final.
// Un brouillon est identifié par son nom et l'empreinte Git de son contenu : un fichier modifié
// est donc retraité, un fichier inchangé ne l'est jamais deux fois.
// Usage : node detecter.mjs <racine de la branche contenus-chatgpt>
// Écrit dans $GITHUB_OUTPUT : liste (JSON), nombre, reste.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const racine = path.resolve(process.argv[2] || ".");
const dossiers = path.join(racine, "_brouillons-chatgpt", "dossiers");
const rapports = path.join(racine, "_brouillons-chatgpt", "rapports");
const MAXIMUM = 10; // au-delà, la suite est traitée au dépôt suivant

const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const enAttente = [];
for (const nom of fs.existsSync(dossiers) ? fs.readdirSync(dossiers).sort() : []) {
  if (!/\.md$/i.test(nom) || nom.startsWith(".")) continue;
  const base = slug(nom.replace(/\.md$/i, ""));
  if (!base) continue;
  const fichier = path.join(dossiers, nom);
  if (!fs.statSync(fichier).isFile()) continue;
  const blob = execFileSync("git", ["hash-object", fichier], { cwd: racine }).toString().trim();
  const id = `${base}-${blob.slice(0, 7)}`;
  if (fs.existsSync(path.join(rapports, `${id}.md`))) continue; // déjà traité (rapport final présent)
  enAttente.push({ fichier: `_brouillons-chatgpt/dossiers/${nom}`, base, blob, id });
}
const lot = enAttente.slice(0, MAXIMUM);
const sortie = { liste: JSON.stringify(lot), nombre: String(lot.length), reste: String(enAttente.length - lot.length) };
console.log(`${lot.length} brouillon(s) à traiter${enAttente.length > lot.length ? `, ${enAttente.length - lot.length} reporté(s) au prochain dépôt` : ""}.`);
for (const b of lot) console.log(`- ${b.fichier} (${b.id})`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(sortie).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
