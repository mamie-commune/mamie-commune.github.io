// Range les rapports dans la branche contenus-chatgpt (jamais publiés : _brouillons-chatgpt est exclu du site).
// Un statut final (propose, bloque, tests-echoues, non-conforme) écrit rapports/<id>.md : le brouillon ne sera
// plus retraité tant que son contenu ne change pas. Un échec technique écrit rapports/echecs/<id>-<exécution>.md :
// le brouillon sera retraité au prochain dépôt ou à la relance du workflow.
// Usage : node rapporter.mjs <racine contenus-chatgpt> <dossier des artefacts> '<liste JSON des brouillons>'
import fs from "node:fs";
import path from "node:path";

const [racine, artefacts, listeJson] = process.argv.slice(2);
const liste = JSON.parse(listeJson || "[]");
const rapports = path.join(racine, "_brouillons-chatgpt", "rapports");
const echecs = path.join(rapports, "echecs");
fs.mkdirSync(echecs, { recursive: true });
const FINAUX = new Set(["propose", "bloque", "tests-echoues", "non-conforme"]);
const run = process.env.GITHUB_RUN_ID || "local";

for (const b of liste) {
  const d = path.join(artefacts, `final-${b.id}`);
  const lire = (f) => { try { return fs.readFileSync(path.join(d, f), "utf8").trim(); } catch { return ""; } };
  let statut = lire("statut.txt");
  let texte = lire("rapport-final.md");
  const pr = lire("pr.txt");
  if (!statut) {
    statut = "echec-technique";
    texte = `# Rapport de traitement : ${b.id}\n\nStatut : **echec-technique**\n\nLe traitement s'est interrompu avant la fin (voir l'exécution ${process.env.GITHUB_SERVER_URL || ""}/${process.env.GITHUB_REPOSITORY || ""}/actions/runs/${run}). Le brouillon \`${b.fichier}\` sera retraité au prochain dépôt ou à la relance du workflow.\n`;
  }
  if (pr) texte = texte.replace(/^(# .*\n)/, `$1\n**Pull Request : ${pr}**\n`);
  const cible = FINAUX.has(statut) ? path.join(rapports, `${b.id}.md`) : path.join(echecs, `${b.id}-${run}.md`);
  fs.writeFileSync(cible, texte + "\n");
  console.log(`${b.id} : ${statut} -> ${path.relative(racine, cible)}`);
}
