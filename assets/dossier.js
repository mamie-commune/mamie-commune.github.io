// « Mon dossier » (mon-dossier.html) : composer son propre dossier à emporter à partir des pages du site.
// On choisit les pages (ici, ou avec le bouton « Ajouter à mon dossier » sur chaque fiche), on les range, on nomme le dossier,
// puis on le récupère : un fichier HTML autonome (lisible sans connexion), une version à imprimer en PDF, ou une archive ZIP
// avec le dossier complet, chaque document séparé, les PDF des livres et la liste des écoutes.
// Tout se fait dans le navigateur : rien n'est envoyé. La liste est gardée dans ce navigateur (clé « mamie-dossier »).
(function () {
  "use strict";
  const zone = document.getElementById("dossier"); if (!zone) return;
  const $ = (s) => zone.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "dossier";
  const SITE = "https://mamiecommune.org/";
  // Ce qu'on peut mettre dans un dossier : des documents, pas les pages de rubrique ni les outils interactifs.
  const TYPES = ["Fiche du graphe", "Fiche pratique", "Guide pratique", "Guide juridique", "Guide numérique", "Fiche de lecture", "Livre", "Histoire de lutte", "Dossier antifasciste", "Dossier encyclopédique", "Portrait", "Parcours", "Ressource documentaire", "Livre audio", "Archive"];
  const TOUT = (window.RECHERCHE || []).filter((r) => TYPES.includes(r.y));
  const parU = new Map(TOUT.map((r) => [r.u, r]));
  const CLE = "mamie-dossier";
  let dos = { titre: "", pour: "", par: "", items: [] }, typeChoisi = "";
  try { dos = Object.assign(dos, JSON.parse(localStorage.getItem(CLE) || "null") || {}); } catch (e) { /* rien */ }
  dos.items = (dos.items || []).filter((u) => parU.has(u));
  const garder = () => { try { localStorage.setItem(CLE, JSON.stringify(dos)); } catch (e) { /* navigation privée : la liste vit le temps de la page */ } };

  /* ---------- la liste ---------- */
  function dessinerListe() {
    const ul = $("#dosListe");
    ul.innerHTML = dos.items.length ? dos.items.map((u, i) => { const r = parU.get(u); return `<li><span class="dos__n">${i + 1}</span><span class="dos__doc"><small>${esc(r.y)}</small><b>${esc(r.t)}</b></span>
      <span class="dos__act"><button type="button" class="chip" data-haut="${i}" aria-label="Monter ${esc(r.t)}" ${i ? "" : "disabled"}>↑</button><button type="button" class="chip" data-bas="${i}" aria-label="Descendre ${esc(r.t)}" ${i < dos.items.length - 1 ? "" : "disabled"}>↓</button><button type="button" class="chip" data-retirer="${i}" aria-label="Retirer ${esc(r.t)}">Retirer</button></span></li>`; }).join("")
      : '<li class="dos__vide">Ton dossier est vide. Ajoute des documents avec la recherche ci-dessous, ou avec le bouton « Ajouter à mon dossier » en haut des fiches.</li>';
    $("#dosNb").textContent = dos.items.length;
    zone.querySelectorAll("[data-sortie]").forEach((b) => { b.disabled = !dos.items.length; });
    dessinerResultats();
  }
  $("#dosListe").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const i = Number(b.dataset.haut ?? b.dataset.bas ?? b.dataset.retirer), it = dos.items;
    if (b.dataset.haut !== undefined) [it[i - 1], it[i]] = [it[i], it[i - 1]];
    else if (b.dataset.bas !== undefined) [it[i + 1], it[i]] = [it[i], it[i + 1]];
    else it.splice(i, 1);
    garder(); dessinerListe();
  });
  ["titre", "pour", "par"].forEach((k) => { const c = $("#dos-" + k); c.value = dos[k] || ""; c.addEventListener("input", () => { dos[k] = c.value; garder(); }); });
  $("#dosVider").addEventListener("click", () => { if (!dos.items.length || !confirm("Vider le dossier ? Les pages restent sur le site.")) return; dos.items = []; garder(); dessinerListe(); });

  /* ---------- chercher des documents à ajouter ---------- */
  const types = TYPES.filter((t) => TOUT.some((r) => r.y === t));
  $("#dosTypes").innerHTML = `<button type="button" class="chip" data-type="" aria-pressed="true">Tout</button>` + types.map((t) => `<button type="button" class="chip" data-type="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("");
  $("#dosTypes").addEventListener("click", (e) => { const b = e.target.closest("[data-type]"); if (!b) return; typeChoisi = b.dataset.type; zone.querySelectorAll("#dosTypes [data-type]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); dessinerResultats(); });
  $("#dosCherche").addEventListener("input", dessinerResultats);
  function dessinerResultats() {
    const q = norm($("#dosCherche").value.trim());
    const res = TOUT.filter((r) => (!typeChoisi || r.y === typeChoisi) && (!q || norm(`${r.t} ${r.d} ${r.k} ${r.x || ""}`).includes(q))).slice(0, 40);
    $("#dosResultats").innerHTML = res.length ? res.map((r) => { const deja = dos.items.includes(r.u); return `<li><span class="dos__doc"><small>${esc(r.y)} · ${esc(r.k)}</small><b>${esc(r.t)}</b><span>${esc(r.d)}</span></span><button type="button" class="chip" data-ajouter="${esc(r.u)}" ${deja ? "disabled" : ""}>${deja ? "✓ Dans le dossier" : "Ajouter"}</button></li>`; }).join("")
      : '<li class="dos__vide">Rien ne correspond. Essaie un autre mot.</li>';
  }
  $("#dosResultats").addEventListener("click", (e) => { const b = e.target.closest("[data-ajouter]"); if (!b) return; dos.items.push(b.dataset.ajouter); garder(); dessinerListe(); });

  /* ---------- récupérer et nettoyer les pages ---------- */
  const absolu = (h, base) => { try { const x = new URL(h, base); return x.origin === location.origin ? SITE + x.pathname.replace(new URL("./", location.href).pathname, "").replace(/\.html$/, "").replace(/(^|\/)index$/, "$1") + x.hash : x.href; } catch (e) { return h; } };
  async function document1(u) {
    const r = parU.get(u), adr = new URL(u, location.href).href;
    const rep = await fetch(adr); if (!rep.ok) throw new Error(rep.status);
    const page = new DOMParser().parseFromString(await rep.text(), "text/html");
    const art = page.querySelector("article.prose") || page.querySelector("main");
    const h1 = page.querySelector(".gtitle h1")?.textContent.trim() || r.t;
    const lead = page.querySelector(".gtitle .lead")?.textContent.trim() || "";
    const meta = [...page.querySelectorAll(".gtitle .gmeta span")].map((s) => s.textContent.trim()).filter(Boolean);
    const credit = art?.querySelector(".credit")?.textContent.trim() || "";
    let pdf = "";
    const c = art ? art.cloneNode(true) : page.createElement("div");
    // Lecteur audio : on garde la liste des pistes, avec les liens d'écoute et de téléchargement.
    c.querySelectorAll(".ecoute").forEach((ec) => {
      const li = [...ec.querySelectorAll(".ecoute__pistes li")].map((l) => { const b = l.querySelector("button"); return { t: l.querySelector(".ecoute__titre")?.textContent || "", info: l.querySelector(".ecoute__info")?.textContent || "", mp3: b?.dataset.mp3 || "", ogg: b?.dataset.ogg || "" }; });
      const ol = page.createElement("ol"); ol.innerHTML = li.map((p) => `<li>${esc(p.t)} <small>(${esc(p.info)})</small> · <a href="${esc(p.mp3)}">MP3</a>${p.ogg ? ` · <a href="${esc(p.ogg)}">OGG</a>` : ""}</li>`).join("");
      ec.replaceWith(ol); r._audio = li;
    });
    c.querySelectorAll("script, style, iframe, video, audio, button, form, noscript, .hl-barre, .doc__poster, .ytwall, .tampon").forEach((n) => n.remove());
    // Photos : on garde la légende et le crédit, pas l'image (le fichier reste léger et lisible sans connexion).
    c.querySelectorAll("figure").forEach((f) => { const cap = f.querySelector("figcaption"); f.querySelectorAll("img, picture, svg, .schema__scroll").forEach((n) => n.remove()); if (cap) cap.insertAdjacentHTML("afterbegin", "<b>[Image] </b>"); else f.remove(); });
    c.querySelectorAll("img").forEach((n) => n.remove());
    // Ancres internes renommées (plusieurs documents dans un seul fichier), liens du site écrits en entier.
    c.querySelectorAll("[id]").forEach((n) => { n.id = slug(u) + "--" + n.id; });
    c.querySelectorAll("a[href]").forEach((a) => {
      const h = a.getAttribute("href");
      if (h.startsWith("#")) { a.setAttribute("href", "#" + slug(u) + "--" + h.slice(1)); return; }
      if (/\.pdf$/i.test(h) && !pdf) pdf = new URL(h, adr).href;
      a.setAttribute("href", absolu(h, adr));
    });
    if (!pdf) { const lp = page.querySelector('a[href$=".pdf"]'); if (lp && r.y === "Livre") pdf = new URL(lp.getAttribute("href"), adr).href; }
    return { u, r, h1, lead, meta, credit, pdf, audio: r._audio || null, html: c.innerHTML, adresse: SITE + u };
  }

  /* ---------- assembler ---------- */
  const STYLE = `body{margin:0;background:#f0ebdf;color:#0e0d0c;font:17px/1.6 Georgia,serif}main{max-width:780px;margin:0 auto;padding:30px 20px 60px}
    h1,h2,h3,h4{font-family:"Arial Narrow",Arial,sans-serif;line-height:1.1}.couv{border:6px solid #0e0d0c;padding:28px 24px;margin-bottom:28px;background:#fbf8f1}
    .couv .k{display:inline-block;padding:3px 9px;border:3px solid #d3150c;color:#d3150c;font:700 13px/1.2 Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;transform:rotate(-2deg)}
    .couv h1{font-size:44px;text-transform:uppercase;margin:12px 0}.doc{border-top:8px solid #0e0d0c;margin-top:48px;padding-top:10px}.doc>header h2{font-size:32px;text-transform:uppercase;margin:6px 0}
    .type{display:inline-block;background:#0e0d0c;color:#f0ebdf;padding:2px 8px;font:700 12px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em}.meta,.src{font:14px/1.4 Arial,sans-serif;color:#4a443d}
    .lead{font-style:italic}a{color:#9c0f08}table{border-collapse:collapse;width:100%;font-size:15px}td,th{border:1px solid #b5ad9f;padding:5px 7px;text-align:left;vertical-align:top}
    blockquote{margin:1em 0;padding:10px 16px;background:#0e0d0c;color:#f0ebdf}.note,.callout{background:#f0cf5a;padding:8px 14px}figure{margin:1em 0}figcaption{font-size:14px;color:#4a443d}
    .sommaire ol{padding-left:1.4em}footer{margin-top:50px;border-top:2px dashed #0e0d0c;padding-top:12px;font-size:14px}
    @media print{body{background:#fff}.doc{break-before:page}a{color:#000}}`;
  const jour = () => new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const titreDossier = () => dos.titre.trim() || "Mon dossier Mamie Commune";
  const auteursDe = (d) => [d.r.y === "Fiche de lecture" || d.r.y === "Livre" || d.r.y === "Livre audio" ? d.meta.find((m) => /·\s*\d{3,4}|\d{4}/.test(m) && !/min de lecture|Ajouté/.test(m)) : "", d.credit].filter(Boolean).join(" — ");
  function blocDoc(d, i) {
    return `<section class="doc" id="doc-${i + 1}"><header><span class="type">${esc(d.r.y)}</span><h2>${i + 1}. ${esc(d.h1)}</h2>${d.lead ? `<p class="lead">${esc(d.lead)}</p>` : ""}
      <p class="meta">${esc(d.meta.join(" · "))}</p><p class="src">Original : <a href="${esc(d.adresse)}">${esc(d.adresse)}</a></p></header>${d.html}</section>`;
  }
  function licences(docs) {
    return `<section class="doc" id="sources"><header><h2>Sources, auteurices, licences</h2></header><table><thead><tr><th>Document</th><th>Autrices, auteurs, contributions</th><th>Licence et original</th></tr></thead><tbody>${docs.map((d, i) =>
      `<tr><td>${i + 1}. ${esc(d.h1)}</td><td>${esc(auteursDe(d) || "La bande à Mamie")}</td><td>${esc(d.credit || "Rédigé par la bande à Mamie, libre de reproduction en citant la source.")} <a href="${esc(d.adresse)}">${esc(d.adresse)}</a></td></tr>`).join("")}</tbody></table>
      <p>Chaque document garde, à sa fin, ses propres sources et ses liens pour aller plus loin. Les photos ne sont pas reprises : leurs légendes et crédits restent, et elles sont visibles sur la page d'origine.</p></section>`;
  }
  function pageHtml(titre, corps, imprimer) {
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titre)}</title><style>${STYLE}</style></head><body><main>${corps}
      <footer><p>Dossier constitué le ${esc(jour())} sur Mamie Commune (${SITE}), la boîte à outils militante de Mamie et de sa bande. Il se lit sans connexion, s'imprime et se fait tourner. Les pages du site peuvent avoir été mises à jour depuis : l'adresse de chaque original est indiquée.</p></footer>
      </main>${imprimer ? "<script>addEventListener('load',()=>setTimeout(()=>print(),300))<\/script>" : ""}</body></html>`;
  }
  function dossierHtml(docs, imprimer) {
    const couv = `<section class="couv"><span class="k">Dossier Mamie Commune</span><h1>${esc(titreDossier())}</h1>${dos.pour.trim() ? `<p>${esc(dos.pour.trim())}</p>` : ""}
      <p class="meta">${docs.length} document${docs.length > 1 ? "s" : ""} · constitué le ${esc(jour())}${dos.par.trim() ? ` par ${esc(dos.par.trim())}` : ""}</p></section>
      <nav class="sommaire"><h2>Sommaire</h2><ol>${docs.map((d, i) => `<li><a href="#doc-${i + 1}">${esc(d.h1)}</a> <small>(${esc(d.r.y)})</small></li>`).join("")}<li><a href="#sources">Sources, auteurices, licences</a></li></ol></nav>`;
    return pageHtml(titreDossier(), couv + docs.map(blocDoc).join("") + licences(docs), imprimer);
  }
  async function rassembler() {
    const etat = $("#dosEtat"), docs = [], rates = [];
    for (let i = 0; i < dos.items.length; i++) {
      etat.textContent = `Je rassemble les documents : ${i + 1} sur ${dos.items.length}…`;
      try { docs.push(await document1(dos.items[i])); } catch (e) { rates.push(parU.get(dos.items[i]).t); }
    }
    etat.textContent = rates.length ? `${docs.length} documents rassemblés. Impossible de récupérer : ${rates.join(", ")} (vérifie ta connexion).` : `${docs.length} documents rassemblés.`;
    return docs;
  }
  function telecharger(nom, blob) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

  /* ---------- archive ZIP (format « stocké », sans compression, lisible partout) ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (d) => { let c = 0xffffffff; for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  function zip(fichiers) {
    const enc = new TextEncoder(), parts = [], centre = []; let pos = 0;
    const d = new Date(), heure = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const f of fichiers) {
      const nom = enc.encode(f.nom), data = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, heure, 2], [12, date, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, nom.length, 2], [28, 0, 2]].forEach(([o, v, n]) => (n === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true)));
      const c = new DataView(new ArrayBuffer(46));
      [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, heure, 2], [14, date, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, nom.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, pos, 4]].forEach(([o, v, n]) => (n === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true)));
      parts.push(h, nom, data); centre.push(c, nom); pos += 30 + nom.length + data.length;
    }
    const tailleCentre = centre.reduce((s, x) => s + x.byteLength, 0), fin = new DataView(new ArrayBuffer(22));
    [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, fichiers.length, 2], [10, fichiers.length, 2], [12, tailleCentre, 4], [16, pos, 4], [20, 0, 2]].forEach(([o, v, n]) => (n === 4 ? fin.setUint32(o, v, true) : fin.setUint16(o, v, true)));
    return new Blob([...parts, ...centre, fin], { type: "application/zip" });
  }
  window.mamieZip = zip; // pour les essais

  /* ---------- les trois sorties ---------- */
  zone.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-sortie]"); if (!b || !dos.items.length) return;
    zone.querySelectorAll("[data-sortie]").forEach((x) => { x.disabled = true; });
    try {
      const docs = await rassembler(); if (!docs.length) return;
      const nom = slug(titreDossier());
      if (b.dataset.sortie === "html") telecharger(nom + ".html", new Blob([dossierHtml(docs, false)], { type: "text/html;charset=utf-8" }));
      else if (b.dataset.sortie === "pdf") {
        const f = document.createElement("iframe"); f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
        document.body.appendChild(f); f.srcdoc = dossierHtml(docs, true); setTimeout(() => f.remove(), 180000);
        $("#dosEtat").textContent += " La fenêtre d'impression s'ouvre : choisis « Enregistrer en PDF ».";
      } else {
        const fichiers = [{ nom: `${nom}/dossier-complet.html`, data: dossierHtml(docs, false) }];
        docs.forEach((d, i) => fichiers.push({ nom: `${nom}/documents/${String(i + 1).padStart(2, "0")}-${slug(d.h1)}.html`, data: pageHtml(d.h1, blocDoc(d, i) + licences([d]), false) }));
        for (const d of docs.filter((x) => x.pdf)) {
          $("#dosEtat").textContent = `J'ajoute le PDF de « ${d.h1} »…`;
          try { const r = await fetch(d.pdf); if (r.ok) fichiers.push({ nom: `${nom}/pdf/${d.pdf.split("/").pop()}`, data: new Uint8Array(await r.arrayBuffer()) }); } catch (err) { /* il reste le lien */ }
        }
        const ecoutes = docs.filter((d) => d.audio);
        if (ecoutes.length) {
          fichiers.push({ nom: `${nom}/audio/ecoutes.m3u`, data: "#EXTM3U\r\n" + ecoutes.flatMap((d) => d.audio.map((p) => `#EXTINF:-1,${d.h1} - ${p.t}\r\n${p.mp3}`)).join("\r\n") + "\r\n" });
          fichiers.push({ nom: `${nom}/audio/liste-des-ecoutes.txt`, data: ecoutes.map((d) => `${d.h1}\r\n` + d.audio.map((p) => `  ${p.t} (${p.info})\r\n    MP3 : ${p.mp3}${p.ogg ? `\r\n    OGG : ${p.ogg}` : ""}`).join("\r\n")).join("\r\n\r\n") + "\r\n" });
        }
        fichiers.push({ nom: `${nom}/LISEZMOI.txt`, data: `${titreDossier()}\r\nDossier constitué le ${jour()} sur Mamie Commune (${SITE}).\r\n\r\n- dossier-complet.html : tous les documents à la suite, avec la page d'accueil, le sommaire, les sources et les licences. S'ouvre dans n'importe quel navigateur, sans connexion.\r\n- documents/ : chaque document séparé.\r\n${docs.some((d) => d.pdf) ? "- pdf/ : les livres complets en PDF.\r\n" : ""}${ecoutes.length ? "- audio/ : la liste des écoutes (liens vers les fichiers son, à télécharger pour écouter sans connexion) et une liste de lecture .m3u.\r\n" : ""}\r\nLes textes de la bande sont libres de reproduction en citant la source. Les licences de chaque document sont à la fin de dossier-complet.html.\r\n` });
        $("#dosEtat").textContent = "Je fabrique l'archive ZIP…";
        telecharger(nom + ".zip", zip(fichiers));
        $("#dosEtat").textContent = `Archive prête : ${fichiers.length} fichiers.`;
      }
    } finally { zone.querySelectorAll("[data-sortie]").forEach((x) => { x.disabled = !dos.items.length; }); }
  });

  /* ---------- favoris et parcours du graphe des luttes (clé « mamie-graphe », gardée par assets/graphe.js) ---------- */
  (function () {
    let g = null; try { g = JSON.parse(localStorage.getItem("mamie-graphe") || "null"); } catch (e) { return; }
    const fav = ((g && g.favoris) || []).filter((id) => parU.has("graphe/" + id)), parcs = ((g && g.parcours) || []).filter((p) => (p.ids || []).length);
    if (!fav.length && !parcs.length) return;
    const s = document.createElement("section"); s.className = "dos__graphe";
    s.innerHTML = `<h2>Depuis le graphe des luttes</h2><p>Tes favoris et tes parcours du graphe sont gardés dans ce navigateur. Verse-les dans ton dossier pour les emporter ou les imprimer, ou <a href="graphe/">retourne au graphe</a> pour les modifier.</p><p class="g-ligne">${fav.length ? `<button type="button" class="chip" data-g="fav">Ajouter mes ${fav.length} favori(s)</button>` : ""}${parcs.map((p, i) => `<button type="button" class="chip" data-g="${i}">Ajouter le parcours « ${esc(p.nom)} » (${p.ids.length} étape${p.ids.length > 1 ? "s" : ""})</button>`).join("")}</p>`;
    zone.prepend(s);
    s.addEventListener("click", (e) => {
      const b = e.target.closest("[data-g]"); if (!b) return;
      const ids = (b.dataset.g === "fav" ? fav : parcs[Number(b.dataset.g)].ids).map((id) => "graphe/" + id).filter((u) => parU.has(u));
      const avant = dos.items.length; dos.items = [...new Set([...dos.items, ...ids])]; garder(); dessinerListe();
      b.textContent = `✓ ${dos.items.length - avant} fiche(s) ajoutée(s)`; b.disabled = true;
    });
  })();
  dessinerListe();
})();
