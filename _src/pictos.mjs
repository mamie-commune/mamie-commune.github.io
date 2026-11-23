// Pictogrammes naïfs « dessinés au feutre », comme ceux de la vidéo de Mamie (bol, enveloppe, panneau, bonshommes).
// Trait noir épais, bouts ronds, légère irrégularité. Un fichier par catégorie de la carte et quelques pictos d'usage
// général, dans assets/img/pictos/. Aucune image générée : tout est tracé ici. Usage : node _src/pictos.mjs
import fs from "node:fs";
const T = 'fill="none" stroke="#111010" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
const svg = (corps) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><g ${T}>${corps}</g></svg>\n`;
const P = {
  libertaire: `<path d="M18 56 L19 9"/><path d="M19 11 C30 6 36 17 47 12 L46 32 C35 37 29 26 19 31"/><path d="M20 12 L45 31" stroke-width="3"/>`,
  syndicat: `<path d="M22 56 L22 34 C18 32 17 26 20 22 L22 12 C22 9 27 9 27 12 L27 22 L27 9 C27 6 32 6 32 9 L32 22 L32 10 C32 7 37 7 37 10 L37 23 L37 14 C37 11 42 11 42 14 L42 34 C42 40 38 44 38 56"/>`,
  association: `<path d="M8 38 C14 30 22 30 28 34 L40 34 C44 34 44 40 40 40 L30 40"/><path d="M8 38 L8 52 L36 52 L56 38 C58 34 54 31 50 34 L40 40"/>`,
  antifa: `<circle cx="32" cy="32" r="24"/><path d="M20 44 L24 18 C30 20 34 18 40 18 L37 28 C32 28 28 30 24 29"/><path d="M28 46 L32 22 C37 24 41 22 46 22 L43 32 C38 32 35 34 31 33" stroke-width="4"/>`,
  librairie: `<path d="M32 18 C24 12 14 12 8 14 L8 50 C14 48 24 48 32 54 C40 48 50 48 56 50 L56 14 C50 12 40 12 32 18 Z"/><path d="M32 18 L32 54"/>`,
  lieu: `<path d="M10 30 L32 10 L54 30"/><path d="M16 26 L16 54 L48 54 L48 26"/><path d="M27 54 L27 40 L37 40 L37 54"/><path d="M40 16 L40 8 L46 8 L46 21"/>`,
  cooperative: `<path d="M32 56 L32 14"/><path d="M32 18 C26 18 23 14 24 9 C29 9 32 13 32 18 C32 13 35 9 40 9 C41 14 38 18 32 18"/><path d="M32 30 C25 30 21 25 22 20 C28 20 32 25 32 30 C32 25 36 20 42 20 C43 25 39 30 32 30"/><path d="M32 42 C25 42 21 37 22 32 C28 32 32 37 32 42 C32 37 36 32 42 32 C43 37 39 42 32 42"/>`,
  "centre-social": `<circle cx="20" cy="20" r="6"/><circle cx="44" cy="20" r="6"/><circle cx="32" cy="30" r="6"/><path d="M8 52 C8 38 30 36 30 52"/><path d="M34 52 C34 36 56 38 56 52"/><path d="M20 54 C20 42 44 42 44 54"/>`,
  feministe: `<circle cx="32" cy="24" r="14"/><path d="M32 38 L32 58"/><path d="M23 49 L41 49"/>`,
  antiraciste: `<path d="M14 56 L14 30 C14 26 20 26 20 30 L20 40 L20 18 C20 14 26 14 26 18 L26 38"/><path d="M50 56 L50 30 C50 26 44 26 44 30 L44 40 L44 18 C44 14 38 14 38 18 L38 38"/><path d="M26 38 C28 44 36 44 38 38"/>`,
  media: `<path d="M10 26 L10 40 L20 40 L44 52 L44 14 L20 26 Z"/><path d="M20 40 L24 54"/><path d="M50 26 C54 30 54 36 50 40"/>`,
  solidarite: `<path d="M32 54 C14 42 6 32 10 20 C14 10 26 10 32 20 C38 10 50 10 54 20 C58 32 50 42 32 54 Z"/>`,
  infokiosque: `<path d="M12 50 L12 20 L36 16 L36 46 Z"/><path d="M36 18 L50 22 L50 52 L36 46"/><path d="M17 26 L31 24 M17 32 L31 30 M17 38 L28 37" stroke-width="3"/>`,
  bibliotheque: `<path d="M10 54 L54 54"/><path d="M14 54 L14 18 L22 18 L22 54"/><path d="M24 54 L24 12 L32 12 L32 54"/><path d="M36 54 L42 20 L50 22 L44 54"/>`,
  cantine: `<path d="M8 32 L56 32 C56 46 46 54 32 54 C18 54 8 46 8 32 Z"/><path d="M22 24 C20 20 24 18 22 12"/><path d="M32 24 C30 20 34 18 32 12"/><path d="M42 24 C40 20 44 18 42 12"/>`,
  radio: `<path d="M8 24 L56 24 L56 54 L8 54 Z"/><circle cx="24" cy="39" r="8"/><path d="M40 34 L50 34 M40 42 L50 42"/><path d="M18 24 L44 8"/>`,
  imprimerie: `<path d="M10 22 L44 22 L44 34 L10 34 Z"/><path d="M44 28 L52 28 L52 40 L30 40 L30 56"/><path d="M14 14 L40 14" stroke-width="3"/>`,
  atelier: `<circle cx="18" cy="44" r="10"/><circle cx="48" cy="44" r="10"/><path d="M18 44 L28 26 L42 26 L48 44 M28 26 L34 44 L42 26 M24 20 L32 20 M42 26 L40 18 L46 18"/>`,
  // usages généraux
  enveloppe: `<path d="M8 18 L56 18 L56 48 L8 48 Z"/><path d="M8 18 L32 36 L56 18"/>`,
  bulle: `<path d="M10 14 L54 14 L54 40 L28 40 L16 52 L18 40 L10 40 Z"/><path d="M20 24 L44 24 M20 31 L36 31" stroke-width="3"/>`,
  casque: `<path d="M12 40 C12 18 52 18 52 40"/><path d="M8 38 L18 38 L18 54 L8 54 Z"/><path d="M46 38 L56 38 L56 54 L46 54 Z"/>`,
  dossier: `<path d="M8 18 L24 18 L28 24 L56 24 L56 52 L8 52 Z"/><path d="M8 30 L56 30"/>`,
  loupe: `<circle cx="26" cy="26" r="14"/><path d="M36 36 L54 54"/>`,
  balance: `<path d="M32 10 L32 54 M20 54 L44 54 M14 18 L50 18"/><path d="M14 18 L6 34 L22 34 Z M50 18 L42 34 L58 34 Z"/>`,
  bol: `<path d="M10 30 L54 30 C54 44 44 50 32 50 C20 50 10 44 10 30 Z"/><path d="M22 54 L42 54"/>`,
  etoile: `<path d="M32 8 L38 26 L57 26 L42 37 L48 55 L32 44 L16 55 L22 37 L7 26 L26 26 Z"/>`
};
fs.mkdirSync("assets/img/pictos", { recursive: true });
for (const [nom, corps] of Object.entries(P)) fs.writeFileSync(`assets/img/pictos/${nom}.svg`, svg(corps));
console.log(Object.keys(P).length + " pictos");
