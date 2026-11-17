// Petites gravures façon linogravure, dessinées en SVG à la main (aucune image générée).
// Une couleur pleine, des entailles en blanc cassé comme dans le lino. Usage (depuis le dossier du site) : node _src/gravures.mjs
import fs from "node:fs";
const dir = "assets/img/gravures/";
const N = "#0e0d0c", P = "#f0ebdf", R = "#d3150c";
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;

// Gerbe de blé : trois tiges liées, grains en écailles, lien rouge
function ble() {
  let b = "";
  const tiges = [[-28, -6], [0, 0], [28, 6]];
  for (const [dx, rot] of tiges) {
    b += `<g transform="rotate(${rot} 100 250)"><path d="M${100 + dx * .2} 250 Q ${100 + dx * .6} 150 ${100 + dx} 70" stroke="${N}" stroke-width="5" fill="none"/>`;
    for (let i = 0; i < 7; i++) {
      const y = 80 + i * 13, x = 100 + dx * (1 - i * .03);
      b += `<ellipse cx="${x - 7}" cy="${y}" rx="6" ry="11" transform="rotate(-28 ${x - 7} ${y})" fill="${N}"/>`;
      b += `<ellipse cx="${x + 7}" cy="${y + 5}" rx="6" ry="11" transform="rotate(28 ${x + 7} ${y + 5})" fill="${N}"/>`;
      b += `<path d="M${x - 9} ${y - 3} l3 6 M${x + 9} ${y + 2} l-3 6" stroke="${P}" stroke-width="1.6"/>`;
    }
    b += `<path d="M${100 + dx} 72 l${dx * .15 - 4} -26 M${100 + dx} 72 l${dx * .15 + 6} -24" stroke="${N}" stroke-width="2"/></g>`;
  }
  b += `<path d="M70 196 Q100 186 130 196 L128 210 Q100 200 72 210 Z" fill="${R}"/><path d="M78 200 l6 6 M96 196 l5 7 M114 197 l4 7" stroke="${P}" stroke-width="1.6"/>`;
  return svg(200, 260, b);
}

// Épi de maïs (Chiapas) : grains en grille entaillée, feuilles qui s'ouvrent
function mais() {
  let b = `<path d="M60 230 Q20 170 34 96 Q50 150 78 196 Z" fill="${N}"/><path d="M100 230 Q140 170 126 96 Q110 150 82 196 Z" fill="${N}"/>`;
  b += `<path d="M80 30 C108 40 112 120 100 200 Q80 214 60 200 C48 120 52 40 80 30 Z" fill="${N}"/>`;
  for (let y = 46; y < 200; y += 12) b += `<path d="M58 ${y} Q80 ${y + 4} 104 ${y}" stroke="${P}" stroke-width="2" fill="none"/>`;
  for (const x of [68, 80, 92]) b += `<path d="M${x} 38 Q${x + (x - 80) * .3} 120 ${x} 204" stroke="${P}" stroke-width="2" fill="none"/>`;
  b += `<path d="M40 120 Q48 170 70 205 M120 120 Q112 170 90 205" stroke="${P}" stroke-width="1.6" fill="none"/>`;
  b += `<path d="M80 30 q-6 -16 -16 -22 M80 30 q2 -18 10 -26 M80 30 q8 -12 20 -14" stroke="${R}" stroke-width="3" fill="none"/>`;
  return svg(160, 240, b);
}

// Soleil qui se lève sur un champ (ZAD, communes libres) : rayons en dents, sillons entaillés
function soleil() {
  let b = "";
  for (let i = 0; i < 13; i++) {
    const a = Math.PI + (i * Math.PI) / 12, c = Math.cos(a), s = Math.sin(a);
    const x1 = 110 + c * 58, y1 = 130 + s * 58, x2 = 110 + c * 98, y2 = 130 + s * 98;
    const o = 0.09, x3 = 110 + Math.cos(a + o) * 58, y3 = 130 + Math.sin(a + o) * 58;
    b += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} Z" fill="${R}"/>`;
  }
  b += `<path d="M58 130 A52 52 0 0 1 162 130 Z" fill="${R}"/>`;
  for (const r of [18, 30, 42]) b += `<path d="M${110 - r} 130 A${r} ${r} 0 0 1 ${110 + r} 130" stroke="${P}" stroke-width="2.4" fill="none"/>`;
  b += `<path d="M0 130 H220 V180 H0 Z" fill="${N}"/>`;
  for (let i = 0; i < 6; i++) b += `<path d="M${-20 + i * 46} 180 Q${80 + i * 12} 150 ${110} 133" stroke="${P}" stroke-width="2" fill="none"/>`;
  return svg(220, 180, b);
}

// Chat noir hérissé, le vieux signe du sabotage chez les syndicalistes révolutionnaires
function chat() {
  const b = `<circle cx="100" cy="100" r="96" fill="${P}" stroke="${N}" stroke-width="5"/>
<path d="M42 150 C40 120 46 98 60 86 L58 58 L72 74 C80 70 92 70 100 74 L112 58 L112 88 C122 96 126 108 124 120 C140 110 150 92 146 70 C158 92 154 124 130 140 C132 146 134 150 134 154 Z" fill="${N}"/>
<path d="M60 86 l-8 -6 M64 82 l-6 -10 M118 100 l10 -4 M120 108 l12 0 M126 116 l10 4" stroke="${N}" stroke-width="3"/>
<path d="M74 96 l10 4 l-10 3 Z M100 96 l-10 4 l10 3 Z" fill="${R}"/>
<path d="M84 112 l3 4 l3 -4 M70 108 h-14 M70 112 l-13 4 M104 108 h14 M104 112 l13 4" stroke="${P}" stroke-width="1.6" fill="none"/>
<path d="M50 150 h80" stroke="${N}" stroke-width="5"/>`;
  return svg(200, 200, b);
}

// Flèche et cercle tracés au feutre, et une agrafe
const fleche = svg(140, 90, `<path d="M8 12 C40 4 92 14 116 62" stroke="${R}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M100 58 L118 70 L124 48" stroke="${R}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
const cercle = svg(200, 70, `<path d="M18 40 C14 14 90 6 150 10 C196 14 198 46 160 58 C110 72 30 66 16 44 C10 30 40 18 70 14" stroke="${R}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
const agrafe = svg(46, 12, `<path d="M3 9 V4 H43 V9" stroke="#8d8a85" stroke-width="3" fill="none"/><path d="M3 4 H43" stroke="#d9d6d0" stroke-width="1"/>`);

fs.mkdirSync(dir, { recursive: true });
for (const [n, s] of Object.entries({ ble: ble(), mais: mais(), soleil: soleil(), chat: chat(), fleche, cercle, agrafe })) fs.writeFileSync(dir + n + ".svg", s);
console.log("gravures écrites");
