// Garde-fou exécuté après Claude, sans Claude : vérifie que les changements restent dans le périmètre
// autorisé, puis fabrique le correctif (patch) qui sera testé et proposé.
// Périmètre : créer des fichiers _src/encyclopedie/<n>-<mouvement>.txt et modifier _src/encyclopedie/familles.json,
// sans retirer aucune famille, aucun mouvement ni aucune ressource existante. Rien d'autre.
// Usage : node garde-fou.mjs <racine du site (checkout de main)> <dossier de résultats>
// Écrit garde.json (et correctif.patch si tout est conforme).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const racine = path.resolve(process.argv[2] || ".");
const sortie = path.resolve(process.argv[3] || "resultat");
fs.mkdirSync(sortie, { recursive: true });
const git = (...a) => execFileSync("git", a, { cwd: racine, maxBuffer: 64 * 1024 * 1024 }).toString();

const problemes = [], nouveaux = [], modifies = [];
const NOUVEAU_OK = /^_src\/encyclopedie\/\d+[a-z]?-[a-z0-9-]+\.txt$/;
const FAMILLES = "_src/encyclopedie/familles.json";

for (const ligne of git("status", "--porcelain", "--untracked-files=all").split("\n").filter(Boolean)) {
  const code = ligne.slice(0, 2);
  const p = ligne.slice(3).replace(/^"|"$/g, "");
  if (code === "??") { (NOUVEAU_OK.test(p) ? nouveaux : problemes).push(NOUVEAU_OK.test(p) ? p : `Fichier créé hors du périmètre autorisé : ${p}`); continue; }
  if (code.includes("D")) { problemes.push(`Suppression interdite : ${p}`); continue; }
  if (code.includes("R") || code.includes("C")) { problemes.push(`Renommage ou copie interdit : ${p}`); continue; }
  if (p === FAMILLES) { modifies.push(p); continue; }
  problemes.push(`Modification hors du périmètre autorisé : ${p}`);
}

// familles.json : JSON valide, et rien de ce qui existait n'a disparu.
let familles = null;
try { familles = JSON.parse(fs.readFileSync(path.join(racine, FAMILLES), "utf8")).familles; } catch (e) { problemes.push(`familles.json n'est plus un JSON valide : ${e.message}`); }
if (familles && modifies.includes(FAMILLES)) {
  const avant = JSON.parse(git("show", `HEAD:${FAMILLES}`)).familles;
  for (const fa of avant) {
    const fn = familles.find((x) => x.id === fa.id);
    if (!fn) { problemes.push(`Famille supprimée : ${fa.id}`); continue; }
    for (const mv of fa.mouvements) if (!fn.mouvements.some((m) => m.nom === mv.nom)) problemes.push(`Mouvement retiré de la famille ${fa.id} : ${mv.nom}`);
    if ((fn.deja || []).length < (fa.deja || []).length) problemes.push(`Ressources « Déjà sur le site » retirées de la famille ${fa.id}`);
    if (fn.presentation !== fa.presentation) problemes.push(`Présentation de la famille ${fa.id} modifiée (non autorisé automatiquement)`);
  }
}

// Nouveaux dossiers : en-têtes au bon format, identifiants libres, mouvement rangé dans une famille.
const existants = new Set();
for (const f of git("ls-files", "_src/encyclopedie").split("\n").filter((x) => x.endsWith(".txt"))) {
  for (const m of git("show", `HEAD:${f}`).matchAll(/^=== ([^|\s]+) \|/gm)) existants.add(m[1]);
}
const mouvements = new Set((familles || []).flatMap((f) => f.mouvements.map((m) => m.nom)));
const pages = [];
for (const f of nouveaux) {
  const texte = fs.readFileSync(path.join(racine, f), "utf8");
  const tetes = [...texte.matchAll(/^=== (.+)$/gm)].map((m) => m[1].split(/\s\|\s/));
  if (!tetes.length) problemes.push(`${f} : aucune page (ligne « === identifiant | Mouvement | Titre | … »)`);
  for (const t of tetes) {
    const [id, cat] = [t[0]?.trim(), t[1]?.trim()];
    if (t.length < 4) problemes.push(`${f} : en-tête incomplet pour « ${id} »`);
    if (!/^[a-z0-9-]+$/.test(id || "")) problemes.push(`${f} : identifiant de page invalide « ${id} »`);
    if (existants.has(id)) problemes.push(`${f} : l'identifiant « ${id} » existe déjà dans l'encyclopédie`);
    if (cat && !mouvements.has(cat)) problemes.push(`${f} : le mouvement « ${cat} » n'est rangé dans aucune famille de familles.json`);
    pages.push(id);
  }
}
if (!nouveaux.length && !problemes.length) problemes.push("Aucun nouveau dossier n'a été créé.");

const ok = problemes.length === 0;
if (ok) {
  for (const f of nouveaux) git("add", "-N", f);
  fs.writeFileSync(path.join(sortie, "correctif.patch"), git("diff", "--binary"));
}
fs.writeFileSync(path.join(sortie, "garde.json"), JSON.stringify({ ok, problemes, nouveaux, modifies, pages }, null, 2));
console.log(ok ? `Garde-fou : conforme (${nouveaux.length} nouveau(x) fichier(s), ${pages.length} page(s)).` : `Garde-fou : NON conforme\n- ${problemes.join("\n- ")}`);
