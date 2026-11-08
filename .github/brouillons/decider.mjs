// Rassemble l'analyse de Claude, le garde-fou et les tests, décide du statut et rédige le rapport final
// (qui sert aussi de description à la Pull Request). Aucun appel à Claude ici.
// Usage : node decider.mjs <dossier de résultats> <id> <fichier du brouillon> <blob>
// Écrit statut.txt, titre.txt et rapport-final.md dans le dossier de résultats ; affiche le statut.
// Statuts : propose (tout est bon, PR à créer) · bloque (décision humaine nécessaire) ·
// tests-echoues · non-conforme (garde-fou) · echec-technique (à relancer, pas de rapport final).
import fs from "node:fs";
import path from "node:path";

const [dir, id, fichier, blob] = process.argv.slice(2);
const lire = (f, json) => { try { const t = fs.readFileSync(path.join(dir, f), "utf8"); return json ? JSON.parse(t) : t; } catch { return null; } };
const decision = lire("decision.json", true);
const garde = lire("garde.json", true);
const tests = lire("tests.json", true);
const rapportClaude = lire("rapport-claude.md");
const auth = lire("auth.txt");

let statut, raison;
if (auth && auth.trim() === "absente") { statut = "echec-technique"; raison = "Aucun secret ANTHROPIC_API_KEY ni CLAUDE_CODE_OAUTH_TOKEN n'est configuré : Claude n'a pas pu être lancé."; }
else if (!decision || !decision.decision) { statut = "echec-technique"; raison = "Claude n'a pas rendu de décision (interruption, limite atteinte ou erreur d'authentification). Relancer le workflow depuis l'onglet Actions."; }
else if (decision.decision === "bloquer") { statut = "bloque"; raison = "Claude a jugé que le dossier demande une décision humaine avant toute intégration."; }
else if (!garde) { statut = "echec-technique"; raison = "Le garde-fou n'a pas produit de résultat."; }
else if (!garde.ok) { statut = "non-conforme"; raison = "Les changements préparés sortent du périmètre autorisé : rien n'est proposé."; }
else if (!tests) { statut = "echec-technique"; raison = "Les tests Windows n'ont pas produit de résultat."; }
else if (!tests.ok) { statut = "tests-echoues"; raison = "Au moins un test bloquant a échoué : rien n'est proposé."; }
else { statut = "propose"; raison = "Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main."; }

const mouvement = (decision && decision.mouvement) || id;
const liste = (t) => (t && t.length ? t.map((x) => `- ${x}`).join("\n") : "- Aucun.");
const lignesTests = tests ? tests.tests.map((t) => `| ${t.ok ? "✅ réussi" : t.bloquant ? "❌ échec" : "⚠️ avertissement"} | ${t.nom} | ${String(t.detail || "").replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|").slice(0, 600)} |`).join("\n") : "";

const md = `# Rapport de traitement : ${mouvement}

| | |
|---|---|
| Brouillon | \`${fichier}\` |
| Empreinte du contenu | \`${blob}\` |
| Identifiant de traitement | \`${id}\` |
| Statut | **${statut}** |
| Exécution | ${process.env.GITHUB_SERVER_URL || ""}/${process.env.GITHUB_REPOSITORY || ""}/actions/runs/${process.env.GITHUB_RUN_ID || ""} |

${raison}

${decision && decision.resume ? `## Résumé de Claude\n\n${decision.resume}\n` : ""}
${decision && decision.raisons_blocage && decision.raisons_blocage.length ? `## Raisons du blocage\n\n${liste(decision.raisons_blocage)}\n` : ""}
## Garde-fou (périmètre des changements)

${garde ? `${garde.ok ? "✅ Conforme" : "❌ Non conforme"}\n\nFichiers créés :\n${liste(garde.nouveaux)}\n\nFichiers modifiés :\n${liste(garde.modifies)}\n${garde.problemes.length ? `\nProblèmes :\n${liste(garde.problemes)}\n` : ""}` : "Non exécuté."}

## Tests automatiques (Windows, générateur du site)

${tests ? `| Résultat | Test | Détail |\n|---|---|---|\n${lignesTests}` : "Non exécutés."}

## Rapport détaillé de Claude

${rapportClaude ? rapportClaude.trim() : "Aucun rapport détaillé."}

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
`;
fs.writeFileSync(path.join(dir, "rapport-final.md"), md);
fs.writeFileSync(path.join(dir, "statut.txt"), statut);
fs.writeFileSync(path.join(dir, "titre.txt"), `Encyclopédie : ${mouvement} (brouillon ChatGPT, à relire)`.slice(0, 200));
console.log(statut);
