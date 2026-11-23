// Matières de la DA « vidéo de Mamie » (novembre 2026), faites en SVG (aucune image générée, aucune photo de stock) :
// - assets/img/papier-froisse.svg : le relief d'un papier froissé (bruit + éclairage), à multiplier sur une couleur de fond ;
// - assets/img/flammes.svg : des flammes découpées dans du papier rouge et bordeaux, comme dans la vidéo.
// Usage (depuis le dossier du site) : node _src/matieres.mjs
import fs from "node:fs";
const froisse = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
<filter id="f" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.0075" numOctaves="5" seed="4" stitchTiles="stitch" result="b"/>
<feDiffuseLighting in="b" lighting-color="#ffffff" surfaceScale="5.5" result="l"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
<feComponentTransfer in="l"><feFuncR type="linear" slope="0.7" intercept="0.38"/><feFuncG type="linear" slope="0.7" intercept="0.38"/><feFuncB type="linear" slope="0.7" intercept="0.38"/></feComponentTransfer>
</filter><rect width="900" height="900" filter="url(#f)"/></svg>
`;
let s = 9; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
const flamme = (x, base, h, w, c) => { const n = 7, p = [`${x - w / 2},${base}`]; for (let i = 1; i < n; i++) { const t = i / n; p.push(`${(x - w / 2 + w * t + (r() - .5) * w * .5).toFixed(0)},${(base - h * (0.35 + 0.65 * Math.sin(Math.PI * t)) * (0.6 + r() * 0.5)).toFixed(0)}`); } p.push(`${x + w / 2},${base}`); return `<polygon points="${p.join(" ")}" fill="${c}"/>`; };
let fl = "";
for (let i = 0; i < 26; i++) fl += flamme(r() * 1200, 820, 260 + r() * 420, 60 + r() * 120, ["#c8201c", "#e0281f", "#9e1512", "#5a0d0b"][i % 4]);
for (let i = 0; i < 14; i++) fl += flamme(r() * 1200, 820, 120 + r() * 220, 50 + r() * 80, ["#2a0a09", "#c8201c"][i % 2]);
const flammes = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" preserveAspectRatio="none">${fl}</svg>\n`;
fs.writeFileSync("assets/img/papier-froisse.svg", froisse);
fs.writeFileSync("assets/img/flammes.svg", flammes);
console.log("matières écrites");
