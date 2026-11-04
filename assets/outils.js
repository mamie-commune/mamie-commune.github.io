// Les outils de Mamie : formulaires, modèles, calculs simples et exports, entièrement dans le navigateur.
// Aucune intelligence artificielle, aucun envoi : ce qui est tapé reste sur l'appareil. Rien n'est enregistré
// automatiquement : on enregistre un brouillon seulement en le téléchargeant (fichier .json), et on le rouvre de la même façon.
// Un outil = <div data-outil="nom"></div> dans la page. Les modèles de documents sont décrits dans window.OUTILS_MODELES
// (assets/outils-modeles.js) ; le minuteur, l'affiche et le quiz ont leur propre code plus bas.
(function () {
  "use strict";

  /* ---------- petits outils communs ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nb = (v) => { const n = parseFloat(String(v ?? "").replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };
  const euros = (n) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  const nombre = (n) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const dateFr = (iso) => { if (!iso) return ""; const d = new Date(iso + "T12:00:00"); return isNaN(d) ? iso : d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); };
  const heurePlus = (hhmm, minutes) => { const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || ""); if (!m) return ""; const t = (+m[1] * 60 + +m[2] + Math.round(minutes)) % 1440; return `${String(Math.floor(t / 60)).padStart(2, "0")} h ${String(t % 60).padStart(2, "0")}`; };
  const heureFr = (hhmm) => (hhmm ? hhmm.replace(":", " h ") : "");
  const slug = (s) => String(s || "document").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "document";
  const paras = (t) => String(t || "").split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const racine = new URL("../", location.href).href; // dossier racine du site (les outils sont dans outils/)

  function telecharger(nom, contenu, type) {
    const url = URL.createObjectURL(contenu instanceof Blob ? contenu : new Blob([contenu], { type: type || "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  async function copier(texte, bouton) {
    let ok = false;
    try { await navigator.clipboard.writeText(texte); ok = true; } catch (e) {
      const t = document.createElement("textarea"); t.value = texte; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } t.remove();
    }
    signaler(bouton, ok ? "Copié !" : "Copie impossible : sélectionne le texte à la main");
  }
  function signaler(bouton, msg) {
    if (!bouton) return; const avant = bouton.dataset.txt || bouton.textContent; bouton.dataset.txt = avant; bouton.textContent = msg;
    clearTimeout(bouton._t); bouton._t = setTimeout(() => { bouton.textContent = avant; }, 2200);
  }
  // CSV au point-virgule avec BOM : s'ouvre directement dans LibreOffice Calc et Excel en français.
  // Une cellule qui commence par =, @ ou + (hors numéro) serait lue comme une formule par le tableur : on la neutralise.
  const csv = (lignes) => "﻿" + lignes.map((l) => l.map((c) => { let s = String(c ?? ""); if (/^[=@]|^\+(?![\d ])/.test(s)) s = "'" + s; return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(";")).join("\r\n");
  function lireFichier(accept) {
    return new Promise((ok) => {
      const i = document.createElement("input"); i.type = "file"; i.accept = accept;
      i.onchange = () => { const f = i.files[0]; if (!f) return ok(null); const r = new FileReader(); r.onload = () => ok({ nom: f.name, contenu: r.result }); r.readAsText(f); };
      i.click();
    });
  }
  const bouton = (txt, cls, action) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn outil-btn" + (cls ? " " + cls : ""); b.textContent = txt; b.addEventListener("click", action); return b; };
  window.addEventListener("beforeunload", (e) => { if (document.querySelector("[data-outil].is-modifie")) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- feuille d'aperçu (iframe) : ce qu'on voit est exactement ce qui s'imprime ---------- */
  const CSS_FEUILLE = `
  @page { size: A4; margin: 16mm; }
  html { background: #d8d2c4; } body { margin: 0; padding: 18px; font: 11pt/1.5 Archivo, Arial, sans-serif; color: #111; }
  .feuille { background: #fff; max-width: 190mm; margin: 0 auto; padding: 14mm 14mm 16mm; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
  h1 { font: 22pt/1.1 "Archivo Black", Arial, sans-serif; margin: 0 0 6px; } h2 { font: 13pt/1.2 "Archivo Black", Arial, sans-serif; margin: 18px 0 6px; padding-bottom: 3px; border-bottom: 2px solid #111; text-transform: uppercase; }
  h3 { font: 700 11pt/1.3 Archivo, Arial, sans-serif; margin: 12px 0 4px; } p { margin: 0 0 6px; } ul { margin: 0 0 8px; padding-left: 20px; } li { margin: 2px 0; }
  .type { font: 9pt/1 "Special Elite", "Courier New", monospace; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 8px; } .meta { margin: 0 0 12px; font-style: italic; }
  .ligne b { display: inline-block; min-width: 9em; } .resume { border: 2px solid #111; padding: 8px 10px; margin: 10px 0 14px; } .resume p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin: 4px 0 10px; font-size: 10pt; } th, td { border: 1px solid #555; padding: 4px 6px; text-align: left; vertical-align: top; } th { background: #eee; }
  td.n { text-align: right; white-space: nowrap; } .case { font-size: 12pt; } .vide { color: #777; font-style: italic; }
  .signature { margin-top: 26px; display: flex; gap: 30px; } .signature div { flex: 1; border-top: 1px solid #111; padding-top: 4px; font-size: 9pt; }
  @media print { html, body { background: #fff; padding: 0; } .feuille { box-shadow: none; max-width: none; padding: 0; } h2, h3 { break-after: avoid; } tr, li { break-inside: avoid; } }`;

  function feuille(iframe, html, cssEnPlus, titre) {
    const doc = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(titre || "Document")}</title>
      <link rel="stylesheet" href="${racine}assets/fonts.css"><style>${CSS_FEUILLE}${cssEnPlus || ""}</style></head><body>${html}
      <script>(function () { /* à l'écran, la feuille réelle est réduite pour tenir dans l'aperçu ; à l'impression, taille réelle */
        function ajuste() { var p = document.querySelector(".planche, .feuille"); if (!p) return; document.body.style.zoom = 1; var l = document.documentElement.clientWidth - 36, w = p.offsetWidth; document.body.style.zoom = w > l ? l / w : 1; }
        addEventListener("load", ajuste); addEventListener("resize", ajuste); addEventListener("beforeprint", function () { document.body.style.zoom = 1; }); addEventListener("afterprint", ajuste); ajuste();
      })();<\/script></body></html>`;
    iframe.srcdoc = doc;
  }
  function ajusterHauteur(iframe) {
    const h = () => { try { iframe.style.height = Math.max(320, iframe.contentDocument.documentElement.scrollHeight + 4) + "px"; } catch (e) { /* rien */ } };
    iframe.addEventListener("load", () => { h(); setTimeout(h, 120); });
  }
  function imprimerFeuille(iframe) {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (e) { alert("L'impression n'est pas disponible dans ce navigateur."); }
  }

  /* ---------- moteur de documents : formulaire → aperçu → exports ---------- */
  function valeurVide(champ) {
    if (champ.type === "table") return (champ.lignes || []).map((l) => ({ ...l }));
    if (champ.type === "liste" || champ.type === "cases") return (champ.defaut || []).slice();
    return champ.defaut ?? "";
  }
  const estVide = (champ, v) => {
    if (v == null || v === "") return true;
    if (Array.isArray(v)) return champ.type === "table" ? !v.some((l) => champ.colonnes.some((c) => c.type !== "case" && String(l[c.id] ?? "").trim())) : !v.some((x) => String(x).trim());
    return false;
  };
  const libelleOption = (champ, v) => { const o = (champ.options || []).find((x) => x.v === v); return o ? o.l : v; };

  function moteurDocument(racineEl, def) {
    const etat = {};
    def.sections.forEach((s) => s.champs.forEach((c) => { etat[c.id] = valeurVide(c); }));
    const champsTous = def.sections.flatMap((s) => s.champs);
    const champPar = (id) => champsTous.find((c) => c.id === id);

    racineEl.classList.add("outil");
    racineEl.innerHTML = `<div class="outil__form"></div><div class="outil__apercu"><div class="outil__barre"></div><p class="outil__note">Aperçu : c'est exactement ce qui sera imprimé. Rien n'est envoyé ni enregistré tant que tu ne télécharges pas un fichier.</p><div class="outil__calc" aria-live="polite"></div><iframe class="outil__feuille" title="Aperçu du document"></iframe></div>`;
    const form = racineEl.querySelector(".outil__form"), barre = racineEl.querySelector(".outil__barre"), iframe = racineEl.querySelector("iframe"), calcEl = racineEl.querySelector(".outil__calc");
    ajusterHauteur(iframe);

    // --- formulaire ---
    function dessinerChamp(c, box) {
      const v = etat[c.id], id = `${def.id}-${c.id}`;
      const aide = c.aide ? `<p class="outil__aide">${esc(c.aide)}</p>` : "";
      if (["text", "date", "time", "number"].includes(c.type)) {
        box.innerHTML = `<label for="${id}">${esc(c.label)}</label>${aide}<input id="${id}" type="${c.type === "number" ? "text" : c.type}"${c.type === "number" ? ' inputmode="decimal" data-nombre pattern="-?[0-9 ]*([.,][0-9]*)?" title="Un nombre, par exemple 12 ou 12,50"' : ""} value="${esc(v)}" placeholder="${esc(c.placeholder || "")}">`;
        box.querySelector("input").addEventListener("input", (e) => { etat[c.id] = e.target.value; change(); });
      } else if (c.type === "textarea") {
        box.innerHTML = `<label for="${id}">${esc(c.label)}</label>${aide}<textarea id="${id}" rows="${c.lignesTexte || 4}" placeholder="${esc(c.placeholder || "")}">${esc(v)}</textarea>`;
        box.querySelector("textarea").addEventListener("input", (e) => { etat[c.id] = e.target.value; change(); });
      } else if (c.type === "select") {
        box.innerHTML = `<label for="${id}">${esc(c.label)}</label>${aide}<select id="${id}">${c.options.map((o) => `<option value="${esc(o.v)}"${o.v === v ? " selected" : ""}>${esc(o.l)}</option>`).join("")}</select><p class="outil__def"></p>`;
        const s = box.querySelector("select"), d = box.querySelector(".outil__def");
        const montrer = () => { const o = c.options.find((x) => x.v === s.value); d.textContent = o && o.d ? o.d : ""; d.hidden = !(o && o.d); };
        s.addEventListener("change", () => { etat[c.id] = s.value; montrer(); change(); }); montrer();
      } else if (c.type === "cases") {
        box.innerHTML = `<fieldset><legend>${esc(c.label)}</legend>${aide}${c.options.map((o, i) => `<label class="outil__case"><input type="checkbox" value="${esc(o.v)}"${v.includes(o.v) ? " checked" : ""}><span><b>${esc(o.l)}</b>${o.d ? `<small>${esc(o.d)}</small>` : ""}</span></label>`).join("")}</fieldset>`;
        box.querySelectorAll("input").forEach((x) => x.addEventListener("change", () => { etat[c.id] = [...box.querySelectorAll("input:checked")].map((y) => y.value); change(); }));
      } else if (c.type === "liste") {
        box.innerHTML = `<fieldset><legend>${esc(c.label)}</legend>${aide}<ol class="outil__liste"></ol></fieldset>`;
        const ol = box.querySelector("ol");
        v.forEach((txt, i) => {
          const li = document.createElement("li");
          li.innerHTML = `<input type="text" aria-label="${esc(c.label)}, ligne ${i + 1}" value="${esc(txt)}" placeholder="${esc(c.placeholder || "")}"><button type="button" class="outil__suppr" aria-label="Retirer la ligne ${i + 1}">×</button>`;
          li.querySelector("input").addEventListener("input", (e) => { etat[c.id][i] = e.target.value; change(); });
          li.querySelector("button").addEventListener("click", () => { etat[c.id].splice(i, 1); dessinerChamp(c, box); change(); });
          ol.appendChild(li);
        });
        box.querySelector("fieldset").appendChild(bouton(`+ ${c.ajout || "Ajouter une ligne"}`, "outil-btn--petit", () => { etat[c.id].push(""); dessinerChamp(c, box); box.querySelector("li:last-child input").focus(); change(); }));
      } else if (c.type === "table") {
        box.innerHTML = `<fieldset><legend>${esc(c.label)}</legend>${aide}<div class="outil__lignes"></div></fieldset>`;
        const zone = box.querySelector(".outil__lignes");
        v.forEach((ligne, i) => {
          const carte = document.createElement("div"); carte.className = "outil__ligne";
          carte.innerHTML = `<p class="outil__num">${esc(c.nomLigne || "Ligne")} ${i + 1}</p>` + c.colonnes.map((col) => {
            const cid = `${id}-${i}-${col.id}`, val = ligne[col.id] ?? "";
            if (col.type === "case") return `<label class="outil__case outil__case--seule"><input id="${cid}" type="checkbox" data-col="${col.id}"${val ? " checked" : ""}><span>${esc(col.label)}</span></label>`;
            if (col.type === "select") return `<div class="outil__cell"><label for="${cid}">${esc(col.label)}</label><select id="${cid}" data-col="${col.id}">${col.options.map((o) => `<option value="${esc(o.v)}"${o.v === val ? " selected" : ""}>${esc(o.l)}</option>`).join("")}</select></div>`;
            if (col.type === "textarea") return `<div class="outil__cell outil__cell--large"><label for="${cid}">${esc(col.label)}</label><textarea id="${cid}" rows="2" data-col="${col.id}">${esc(val)}</textarea></div>`;
            return `<div class="outil__cell${col.large ? " outil__cell--large" : ""}"><label for="${cid}">${esc(col.label)}</label><input id="${cid}" type="${col.type === "number" ? "text" : col.type || "text"}"${col.type === "number" ? ' inputmode="decimal" data-nombre pattern="-?[0-9 ]*([.,][0-9]*)?" title="Un nombre, par exemple 12 ou 12,50"' : ""} data-col="${col.id}" value="${esc(val)}"></div>`;
          }).join("") + `<div class="outil__ligne-actions"><button type="button" data-act="haut" aria-label="Monter la ligne ${i + 1}"${i === 0 ? " disabled" : ""}>↑</button><button type="button" data-act="suppr" aria-label="Retirer la ligne ${i + 1}">Retirer</button></div>`;
          carte.querySelectorAll("[data-col]").forEach((x) => x.addEventListener(x.type === "checkbox" || x.tagName === "SELECT" ? "change" : "input", () => { ligne[x.dataset.col] = x.type === "checkbox" ? x.checked : x.value; change(); }));
          carte.querySelector('[data-act="suppr"]').addEventListener("click", () => { etat[c.id].splice(i, 1); dessinerChamp(c, box); change(); });
          carte.querySelector('[data-act="haut"]').addEventListener("click", () => { const t = etat[c.id]; [t[i - 1], t[i]] = [t[i], t[i - 1]]; dessinerChamp(c, box); change(); });
          zone.appendChild(carte);
        });
        box.querySelector("fieldset").appendChild(bouton(`+ ${c.ajout || "Ajouter une ligne"}`, "outil-btn--petit", () => {
          const n = {}; c.colonnes.forEach((col) => { n[col.id] = col.type === "case" ? false : (col.defaut ?? (col.type === "select" ? col.options[0].v : "")); });
          etat[c.id].push(n); dessinerChamp(c, box); const champs = box.querySelectorAll(".outil__ligne:last-child input:not([type=checkbox]), .outil__ligne:last-child textarea"); if (champs[0]) champs[0].focus(); change();
        }));
      }
    }
    function dessinerFormulaire() {
      form.innerHTML = "";
      def.sections.forEach((s) => {
        const sec = document.createElement("section"); sec.className = "outil__section";
        sec.innerHTML = `<h2 class="outil__titre">${esc(s.titre)}</h2>${s.aide ? `<p class="outil__aide">${esc(s.aide)}</p>` : ""}`;
        s.champs.forEach((c) => { const box = document.createElement("div"); box.className = "outil__champ outil__champ--" + c.type; sec.appendChild(box); dessinerChamp(c, box); });
        form.appendChild(sec);
      });
    }

    // --- aperçu et texte ---
    const calcHtml = () => (def.calcul ? def.calcul(etat, { euros, nombre, nb, heurePlus }) : "");
    function htmlChamp(c, v, seul) {
      if (estVide(c, v)) return "";
      const titre = seul ? "" : `<h3>${esc(c.label)}</h3>`;
      switch (c.type) {
        case "text": case "number": return `<p class="ligne"><b>${esc(c.label)} :</b> ${esc(v)}</p>`;
        case "date": return `<p class="ligne"><b>${esc(c.label)} :</b> ${esc(dateFr(v))}</p>`;
        case "time": return `<p class="ligne"><b>${esc(c.label)} :</b> ${esc(heureFr(v))}</p>`;
        case "select": return `<p class="ligne"><b>${esc(c.label)} :</b> ${esc(libelleOption(c, v))}</p>`;
        case "textarea": return titre + paras(v);
        case "liste": return titre + `<ul>${v.filter((x) => String(x).trim()).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
        case "cases": return titre + `<ul>${v.map((x) => { const o = c.options.find((y) => y.v === x); return `<li><b>${esc(o ? o.l : x)}</b>${c.avecDef && o && o.d ? ` : ${esc(o.d)}` : ""}</li>`; }).join("")}</ul>`;
        case "table": {
          const calc = (def.colonnesCalculees && def.colonnesCalculees[c.id]) || [];
          const lignes = v.filter((l) => c.colonnes.some((col) => col.type !== "case" && String(l[col.id] ?? "").trim()));
          return titre + `<table><thead><tr>${c.colonnes.map((col) => `<th>${esc(col.label)}</th>`).join("")}${calc.map((k) => `<th>${esc(k.label)}</th>`).join("")}</tr></thead><tbody>${lignes.map((l, i) => `<tr>${c.colonnes.map((col) => {
            const x = l[col.id]; if (col.type === "case") return `<td class="case">${x ? "☑" : "☐"}</td>`;
            const t = col.type === "select" ? libelleOption(col, x) : col.type === "date" ? (x ? new Date(x + "T12:00:00").toLocaleDateString("fr-FR") : "") : col.type === "number" && col.euros && String(x).trim() ? euros(nb(x)) : x;
            return `<td${col.type === "number" ? ' class="n"' : ""}>${esc(t).replace(/\n/g, "<br>")}</td>`; }).join("")}${calc.map((k) => `<td class="n">${esc(k.f(l, etat, lignes.slice(0, i + 1)))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
        }
      }
      return "";
    }
    function htmlDocument() {
      if (def.apercu) return def.apercu(etat, { esc, paras, dateFr, heureFr, euros, nombre, nb });
      const titre = def.titreDoc(etat) || def.titre;
      const meta = (def.meta ? def.meta(etat, { dateFr, heureFr }) : []).filter(Boolean);
      let h = `<div class="feuille"><p class="type">${esc(def.typeDoc || def.titre)}</p><h1>${esc(titre)}</h1>${meta.length ? `<p class="meta">${esc(meta.join(" · "))}</p>` : ""}`;
      const calc = calcHtml(); if (calc && def.calculDansDoc !== false) h += `<div class="resume">${calc}</div>`;
      def.sections.forEach((s) => {
        if (s.horsDoc) return;
        const champs = s.champs.filter((c) => !c.horsDoc);
        const parts = champs.map((c) => htmlChamp(c, etat[c.id], champs.length === 1)).filter(Boolean);
        if (parts.length) h += `<h2>${esc(s.titre)}</h2>${parts.join("")}`;
      });
      if (def.signatures) h += `<div class="signature">${def.signatures.map((x) => `<div>${esc(x)}</div>`).join("")}</div>`;
      return h + `</div>`;
    }
    function texteChamp(c, v, seul) {
      if (estVide(c, v)) return "";
      const t = seul ? "" : `### ${c.label}\n\n`;
      switch (c.type) {
        case "text": case "number": return `**${c.label} :** ${v}\n\n`;
        case "date": return `**${c.label} :** ${dateFr(v)}\n\n`;
        case "time": return `**${c.label} :** ${heureFr(v)}\n\n`;
        case "select": return `**${c.label} :** ${libelleOption(c, v)}\n\n`;
        case "textarea": return t + v.trim() + "\n\n";
        case "liste": return t + v.filter((x) => String(x).trim()).map((x) => `- ${x}`).join("\n") + "\n\n";
        case "cases": return t + v.map((x) => `- ${libelleOption(c, x)}`).join("\n") + "\n\n";
        case "table": {
          const calc = (def.colonnesCalculees && def.colonnesCalculees[c.id]) || [];
          const lignes = v.filter((l) => c.colonnes.some((col) => col.type !== "case" && String(l[col.id] ?? "").trim()));
          const tete = [...c.colonnes.map((col) => col.label), ...calc.map((k) => k.label)];
          const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
          return t + `| ${tete.join(" | ")} |\n|${tete.map(() => " --- ").join("|")}|\n` + lignes.map((l, i) => `| ${[...c.colonnes.map((col) => { const x = l[col.id]; return col.type === "case" ? (x ? "[x]" : "[ ]") : col.type === "select" ? libelleOption(col, x) : col.type === "number" && col.euros && String(x).trim() ? euros(nb(x)) : x; }), ...calc.map((k) => k.f(l, etat, lignes.slice(0, i + 1)))].map(cell).join(" | ")} |`).join("\n") + "\n\n";
        }
      }
      return "";
    }
    function markdown() {
      if (def.texte) return def.texte(etat, { dateFr, heureFr, euros, nombre, nb });
      const meta = (def.meta ? def.meta(etat, { dateFr, heureFr }) : []).filter(Boolean);
      let m = `# ${def.titreDoc(etat) || def.titre}\n\n${meta.length ? `_${meta.join(" · ")}_\n\n` : ""}`;
      const calc = calcHtml(); if (calc) m += calc.replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim() + "\n\n";
      def.sections.forEach((s) => {
        if (s.horsDoc) return;
        const champs = s.champs.filter((c) => !c.horsDoc);
        const parts = champs.map((c) => texteChamp(c, etat[c.id], champs.length === 1)).filter(Boolean);
        if (parts.length) m += `## ${s.titre}\n\n${parts.join("")}`;
      });
      return m.trim() + "\n";
    }

    let minuterie, modifie = false;
    function rendre() { feuille(iframe, htmlDocument(), def.css, def.titreDoc(etat) || def.titre); const c = calcHtml(); calcEl.innerHTML = c; calcEl.hidden = !c; }
    function change() { if (!modifie) { modifie = true; racineEl.classList.add("is-modifie"); } clearTimeout(minuterie); minuterie = setTimeout(rendre, 250); }

    // --- barre d'actions ---
    const nomFichier = () => slug(def.titreDoc(etat) || def.titre);
    barre.append(
      bouton(def.boutonImprimer || "Imprimer ou enregistrer en PDF", "btn--main", () => imprimerFeuille(iframe)),
      bouton("Copier le texte", "", (e) => copier(markdown(), e.currentTarget)),
      bouton("Télécharger (.md)", "", () => telecharger(nomFichier() + ".md", markdown(), "text/markdown;charset=utf-8"))
    );
    (def.csv || []).forEach((tid) => {
      const c = champPar(tid);
      barre.append(bouton(`Tableau « ${c.label} » (.csv)`, "", () => {
        const calc = (def.colonnesCalculees && def.colonnesCalculees[tid]) || [];
        const lignes = etat[tid].filter((l) => c.colonnes.some((col) => col.type !== "case" && String(l[col.id] ?? "").trim()));
        telecharger(`${nomFichier()}-${slug(c.label)}.csv`, csv([[...c.colonnes.map((col) => col.label), ...calc.map((k) => k.label)],
          ...lignes.map((l, i) => [...c.colonnes.map((col) => { const x = l[col.id]; return col.type === "case" ? (x ? "oui" : "non") : col.type === "select" ? libelleOption(col, x) : x; }), ...calc.map((k) => k.f(l, etat, lignes.slice(0, i + 1)))])]), "text/csv;charset=utf-8");
      }));
    });
    barre.append(
      bouton("Enregistrer le brouillon (fichier)", "", () => { telecharger(`brouillon-${def.id}-${nomFichier()}.json`, JSON.stringify({ outil: def.id, version: 1, valeurs: etat }, null, 2), "application/json"); modifie = false; racineEl.classList.remove("is-modifie"); }),
      bouton("Ouvrir un brouillon", "", async (e) => {
        const b = e.currentTarget;   // à lire avant l'attente : après, l'événement n'a plus de bouton
        const f = await lireFichier(".json,application/json"); if (!f) return;
        try {
          const d = JSON.parse(f.contenu); if (d.outil !== def.id) throw new Error("autre outil");
          // On ne reprend que les champs connus, et seulement si la valeur a le bon type (texte, liste, tableau…).
          champsTous.forEach((c) => {
            if (!d.valeurs || !Object.prototype.hasOwnProperty.call(d.valeurs, c.id)) return;
            const v = d.valeurs[c.id], vide = valeurVide(c);
            if (Array.isArray(vide) ? Array.isArray(v) && v.every((x) => x !== null && typeof x === (vide.length ? typeof vide[0] : typeof x) && (typeof x !== "object" || !Array.isArray(x))) : typeof v === typeof vide) etat[c.id] = v;
          });
          dessinerFormulaire(); rendre(); signaler(b, "Brouillon ouvert");
        } catch (err) { alert("Ce fichier n'est pas un brouillon de cet outil."); }
      }),
      bouton("Tout effacer", "outil-btn--danger", () => {
        if (!confirm("Effacer tout ce qui a été saisi dans cet outil ?")) return;
        champsTous.forEach((c) => { etat[c.id] = valeurVide(c); }); dessinerFormulaire(); rendre(); modifie = false; racineEl.classList.remove("is-modifie");
      })
    );
    dessinerFormulaire(); rendre();
  }

  /* ---------- minuteur de parole ---------- */
  function minuteur(el) {
    el.classList.add("minuteur");
    el.innerHTML = `
      <div class="minuteur__ecran" aria-live="off"><span class="minuteur__temps">02:00</span><span class="minuteur__etat">Prêt</span></div>
      <div class="minuteur__barre" aria-hidden="true"><span></span></div>
      <div class="minuteur__cmd">
        <button type="button" class="btn btn--main" data-act="go">Démarrer</button>
        <button type="button" class="btn" data-act="plus">+ 30 s</button>
        <button type="button" class="btn" data-act="zero">Remettre à zéro</button>
        <button type="button" class="btn" data-act="suivant">Personne suivante</button>
      </div>
      <form class="minuteur__reglages" onsubmit="return false">
        <fieldset><legend>Mode</legend>
          <label class="outil__case"><input type="radio" name="mode" value="decompte" checked><span><b>Compte à rebours</b><small>Le temps de parole diminue ; le dépassement s'affiche ensuite en rouge.</small></span></label>
          <label class="outil__case"><input type="radio" name="mode" value="chrono"><span><b>Chronomètre</b><small>Le temps monte, sans limite.</small></span></label>
        </fieldset>
        <fieldset><legend>Temps de parole</legend>
          <div class="minuteur__duree"><label>Minutes <input type="number" name="min" min="0" max="180" value="2" inputmode="numeric"></label><label>Secondes <input type="number" name="sec" min="0" max="59" value="0" inputmode="numeric"></label></div>
          <div class="minuteur__presets">${[1, 2, 3, 5, 10].map((m) => `<button type="button" class="btn outil-btn--petit" data-preset="${m}">${m} min</button>`).join("")}</div>
        </fieldset>
        <fieldset><legend>Signal sonore (facultatif)</legend>
          <label class="outil__case"><input type="checkbox" name="son"><span><b>Bip à la fin du temps</b></span></label>
          <label class="outil__case"><input type="checkbox" name="alerte"><span><b>Bip d'avertissement</b><small>30 secondes avant la fin.</small></span></label>
        </fieldset>
      </form>
      <div class="minuteur__tours"><p><b>Prises de parole</b> <span data-tours>0</span> · temps total <span data-total>00:00</span></p></div>`;
    const f = el.querySelector("form"), affichage = el.querySelector(".minuteur__temps"), etatEl = el.querySelector(".minuteur__etat"), jauge = el.querySelector(".minuteur__barre span"), go = el.querySelector('[data-act="go"]');
    let total = 120, ecoule = 0, depart = null, tic = null, averti = false, sonne = false, tours = 0, cumul = 0;
    const fmt = (s) => { const n = Math.abs(Math.round(s)); return `${s < 0 ? "+" : ""}${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`; };
    const mode = () => f.elements.mode.value;
    let audio = null;
    function bip(freq, duree) {
      try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = freq; o.connect(g); g.connect(audio.destination); g.gain.setValueAtTime(0.25, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duree);
        o.start(); o.stop(audio.currentTime + duree); } catch (e) { /* pas de son possible */ }
    }
    const maintenant = () => ecoule + (depart ? (performance.now() - depart) / 1000 : 0);
    function afficher() {
      const t = maintenant(), reste = total - t;
      if (mode() === "chrono") { affichage.textContent = fmt(t); jauge.style.width = "0"; el.classList.remove("is-fin", "is-alerte"); }
      else {
        affichage.textContent = fmt(reste); jauge.style.width = Math.min(100, (t / Math.max(total, 1)) * 100) + "%";
        el.classList.toggle("is-alerte", reste <= 30 && reste > 0); el.classList.toggle("is-fin", reste <= 0);
        if (depart && f.elements.alerte.checked && !averti && reste <= 30 && total > 30) { averti = true; bip(660, 0.25); }
        if (depart && reste <= 0 && !sonne) { sonne = true; if (f.elements.son.checked) { bip(880, 0.6); setTimeout(() => bip(880, 0.6), 700); } }
      }
      etatEl.textContent = depart ? "En cours" : ecoule ? "En pause" : "Prêt";
    }
    function lireDuree() { total = Math.max(0, nb(f.elements.min.value) * 60 + nb(f.elements.sec.value)); }
    function arreter() { if (depart) { ecoule = maintenant(); depart = null; } clearInterval(tic); go.textContent = "Reprendre"; afficher(); }
    function demarrer() { if (audio && audio.state === "suspended") audio.resume(); depart = performance.now(); tic = setInterval(afficher, 200); go.textContent = "Pause"; afficher(); }
    function zero(compter) { if (compter && maintenant() > 0) { tours++; cumul += maintenant(); el.querySelector("[data-tours]").textContent = tours; el.querySelector("[data-total]").textContent = fmt(cumul); }
      clearInterval(tic); depart = null; ecoule = 0; averti = false; sonne = false; go.textContent = "Démarrer"; lireDuree(); afficher(); }
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.act === "go") depart ? arreter() : demarrer();
      if (b.dataset.act === "plus") { if (mode() === "chrono") ecoule += 30; else { total += 30; averti = false; sonne = false; } afficher(); }
      if (b.dataset.act === "zero") zero(false);
      if (b.dataset.act === "suivant") { zero(true); }
      if (b.dataset.preset) { f.elements.min.value = b.dataset.preset; f.elements.sec.value = 0; zero(false); }
    });
    f.addEventListener("input", (e) => { if (e.target.name === "min" || e.target.name === "sec" || e.target.name === "mode") { if (!depart && !ecoule) { lireDuree(); } else if (e.target.name !== "mode") { lireDuree(); } afficher(); } });
    document.addEventListener("keydown", (e) => { if (e.code === "Space" && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName) && document.body.contains(el)) { e.preventDefault(); depart ? arreter() : demarrer(); } });
    lireDuree(); afficher();
    el._test = { maintenant, fmt };
  }

  /* ---------- affiche : aperçu dessiné en direct, export PNG et PDF ---------- */
  function affiche(el) {
    const POLICES = [["Archivo Black", "Archivo Black (titres carrés)"], ["Alfa Slab One", "Alfa Slab One (affiche)"], ["Special Elite", "Special Elite (machine à écrire)"], ["Archivo", "Archivo (sobre)"]];
    const COULEURS = [
      { v: "creme", l: "Crème, noir et rouge", fond: "#ebe3d1", texte: "#171414", accent: "#e1301c" },
      { v: "noir", l: "Noir, blanc et rose", fond: "#171414", texte: "#f6f0e3", accent: "#ff5aa8" },
      { v: "rouge", l: "Rouge et noir", fond: "#e1301c", texte: "#171414", accent: "#f6f0e3" },
      { v: "jaune", l: "Jaune et noir", fond: "#f5b63b", texte: "#171414", accent: "#171414" },
      { v: "blanc", l: "Blanc et noir (économe en encre)", fond: "#ffffff", texte: "#000000", accent: "#000000" }
    ];
    el.classList.add("outil", "affiche-outil");
    el.innerHTML = `
      <form class="outil__form" onsubmit="return false">
        <section class="outil__section"><h2 class="outil__titre">Le texte</h2>
          <div class="outil__champ"><label for="af-titre">Titre (en gros)</label><input id="af-titre" name="titre" value="" placeholder="Grève générale !"></div>
          <div class="outil__champ"><label for="af-sous">Sous-titre</label><input id="af-sous" name="sous" placeholder="Tous et toutes dans la rue"></div>
          <div class="outil__champ"><label for="af-texte">Texte</label><textarea id="af-texte" name="texte" rows="4" placeholder="Quelques lignes pour expliquer."></textarea></div>
          <div class="outil__champ"><label for="af-quand">Date, heure</label><input id="af-quand" name="quand" placeholder="Jeudi 12 mars, 14 h"></div>
          <div class="outil__champ"><label for="af-ou">Lieu</label><input id="af-ou" name="ou" placeholder="Place de la mairie"></div>
          <div class="outil__champ"><label for="af-sign">Signature</label><input id="af-sign" name="sign" placeholder="Le collectif…"></div>
        </section>
        <section class="outil__section"><h2 class="outil__titre">La mise en page</h2>
          <div class="outil__champ"><label for="af-format">Format</label><select id="af-format" name="format"><option value="A4">A4 (21 × 29,7 cm)</option><option value="A3">A3 (29,7 × 42 cm)</option></select></div>
          <div class="outil__champ"><label for="af-police">Police des titres</label><select id="af-police" name="police">${POLICES.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select></div>
          <fieldset class="outil__champ"><legend>Couleurs</legend>${COULEURS.map((c, i) => `<label class="outil__case"><input type="radio" name="couleurs" value="${c.v}"${i === 0 ? " checked" : ""}><span><i class="af-pastille" style="background:${c.fond};border-color:${c.texte}"><i style="background:${c.accent}"></i></i><b>${esc(c.l)}</b></span></label>`).join("")}</fieldset>
          <div class="outil__champ"><label for="af-image">Image personnelle (facultatif)</label><p class="outil__aide">L'image reste sur ton appareil : elle n'est envoyée nulle part.</p><input id="af-image" name="image" type="file" accept="image/*"><button type="button" class="btn outil-btn outil-btn--petit" data-act="sans-image" hidden>Retirer l'image</button></div>
          <div class="outil__champ"><label for="af-place">Place de l'image</label><select id="af-place" name="place"><option value="haut">En haut</option><option value="milieu">Au milieu</option><option value="fond">En fond, sous le texte</option></select></div>
        </section>
      </form>
      <div class="outil__apercu"><div class="outil__barre"></div><p class="outil__note">Aperçu en temps réel, à l'échelle. Rien n'est envoyé.</p><canvas class="affiche__canvas" aria-label="Aperçu de l'affiche"></canvas></div>`;
    const f = el.querySelector("form"), cv = el.querySelector("canvas"), barre = el.querySelector(".outil__barre");
    let image = null;
    const F = { A4: [210, 297], A3: [297, 420] };
    function lignes(ctx, texte, largeur) {
      const out = [];
      String(texte || "").split("\n").forEach((par) => {
        let l = ""; par.split(/\s+/).filter(Boolean).forEach((mot) => { const t = l ? l + " " + mot : mot; if (ctx.measureText(t).width > largeur && l) { out.push(l); l = mot; } else l = t; });
        out.push(l);
      });
      return out;
    }
    function ajuster(ctx, texte, police, largeur, max, min, lignesMax) {
      let taille = max;
      for (; taille > min; taille -= 2) { ctx.font = `${taille}px "${police}"`; const ls = lignes(ctx, texte, largeur); if (ls.length <= lignesMax && ls.every((x) => ctx.measureText(x).width <= largeur)) break; }
      ctx.font = `${taille}px "${police}"`; return taille;
    }
    function dessiner(c, largeurPx) {
      const v = Object.fromEntries(new FormData(f).entries()), [lw, lh] = F[v.format], h = Math.round(largeurPx * lh / lw), W = largeurPx;
      const col = COULEURS.find((x) => x.v === v.couleurs) || COULEURS[0];
      c.width = W; c.height = h; const ctx = c.getContext("2d"), m = W * 0.07, L = W - 2 * m;
      ctx.fillStyle = col.fond; ctx.fillRect(0, 0, W, h);
      let y = m;
      const img = (x0, y0, wMax, hMax, couvrir) => {
        if (!image) return 0; const r = image.width / image.height; let w = wMax, hh = w / r;
        if (couvrir) { if (hh < hMax) { hh = hMax; w = hh * r; } ctx.drawImage(image, x0 + (wMax - w) / 2, y0 + (hMax - hh) / 2, w, hh); return hMax; }
        if (hh > hMax) { hh = hMax; w = hh * r; } ctx.drawImage(image, x0 + (wMax - w) / 2, y0, w, hh); return hh;
      };
      if (image && v.place === "fond") { ctx.save(); ctx.globalAlpha = 0.35; img(0, 0, W, h, true); ctx.restore(); }
      if (image && v.place === "haut") y += img(m, y, L, h * 0.32) + W * 0.03;
      ctx.fillStyle = col.texte; ctx.textBaseline = "top";
      if (v.titre) { const t = ajuster(ctx, v.titre.toUpperCase(), v.police, L, W * 0.16, W * 0.04, 4); lignes(ctx, v.titre.toUpperCase(), L).forEach((ln) => { ctx.fillText(ln, m, y); y += t * 1.05; }); y += W * 0.015; }
      if (v.sous) { ctx.fillStyle = col.accent; const t = ajuster(ctx, v.sous, v.police, L, W * 0.06, W * 0.025, 3); lignes(ctx, v.sous, L).forEach((ln) => { ctx.fillText(ln, m, y); y += t * 1.15; }); ctx.fillStyle = col.texte; y += W * 0.02; }
      if (image && v.place === "milieu") y += img(m, y, L, h * 0.28) + W * 0.03;
      if (v.texte) { ctx.font = `${Math.round(W * 0.032)}px "Archivo"`; lignes(ctx, v.texte, L).forEach((ln) => { ctx.fillText(ln, m, y); y += W * 0.043; }); y += W * 0.02; }
      // bas de l'affiche : quand, où, signature, posés au pied de la feuille
      const bas = [v.quand, v.ou].filter(Boolean); let yb = h - m;
      if (v.sign) { ctx.font = `${Math.round(W * 0.028)}px "Special Elite"`; yb -= W * 0.035; ctx.fillText(v.sign, m, yb); yb -= W * 0.02; }
      if (bas.length) {
        const t = Math.round(W * 0.05); ctx.font = `${t}px "${v.police}"`;
        for (let i = bas.length - 1; i >= 0; i--) { const ls = lignes(ctx, bas[i], L - W * 0.04); for (let j = ls.length - 1; j >= 0; j--) { yb -= t * 1.25; ctx.fillStyle = col.accent; ctx.fillRect(m, yb - t * 0.12, ctx.measureText(ls[j]).width + W * 0.04, t * 1.2); ctx.fillStyle = col.accent === col.texte ? col.fond : col.texte; ctx.fillText(ls[j], m + W * 0.02, yb); } }
        ctx.fillStyle = col.texte;
      }
      return y;
    }
    let attente;
    const rendre = () => { clearTimeout(attente); attente = setTimeout(() => { dessiner(cv, 840); el.classList.add("is-modifie"); }, 120); };
    f.addEventListener("input", rendre); f.addEventListener("change", rendre);
    f.elements.image.addEventListener("change", () => {
      const file = f.elements.image.files[0]; if (!file) return;
      const r = new FileReader(); r.onload = () => { const i = new Image(); i.onload = () => { image = i; el.querySelector('[data-act="sans-image"]').hidden = false; rendre(); }; i.src = r.result; }; r.readAsDataURL(file);
    });
    el.querySelector('[data-act="sans-image"]').addEventListener("click", (e) => { image = null; f.elements.image.value = ""; e.currentTarget.hidden = true; rendre(); });
    const nom = () => "affiche-" + slug(f.elements.titre.value || "mamie");
    const haute = () => { const c = document.createElement("canvas"); const [lw] = F[f.elements.format.value]; dessiner(c, Math.round(lw / 25.4 * 150)); return c; }; // 150 points par pouce
    barre.append(
      bouton("Télécharger en PNG", "btn--main", () => { haute().toBlob((b) => telecharger(nom() + ".png", b), "image/png"); }),
      bouton("Imprimer ou enregistrer en PDF", "", () => {
        const c = haute(), fr = document.createElement("iframe"), fmt = f.elements.format.value;
        fr.className = "outil__cache"; fr.title = "Impression de l'affiche"; document.body.appendChild(fr);
        fr.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(nom())}</title><style>@page{size:${fmt};margin:0}html,body{margin:0}img{display:block;width:100vw;height:100vh;object-fit:contain}</style></head><body><img src="${c.toDataURL("image/png")}" alt=""></body></html>`;
        fr.onload = () => { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(() => fr.remove(), 60000); };
      }),
      bouton("Tout effacer", "outil-btn--danger", () => { if (!confirm("Effacer l'affiche ?")) return; f.reset(); image = null; el.querySelector('[data-act="sans-image"]').hidden = true; rendre(); el.classList.remove("is-modifie"); })
    );
    const pret = document.fonts ? Promise.all(POLICES.map(([p]) => document.fonts.load(`40px "${p}"`))).catch(() => {}) : Promise.resolve();
    pret.then(() => { dessiner(cv, 840); el.classList.remove("is-modifie"); });
    el._test = { dessiner };
  }

  /* ---------- quiz : questions écrites à l'avance, puis jeu ---------- */
  function quiz(el) {
    const etat = { titre: "", questions: [{ q: "", r: ["", "", "", ""], bonne: 0, expl: "" }] };
    el.classList.add("quiz");
    el.innerHTML = `<div class="quiz__onglets" role="tablist"><button type="button" role="tab" aria-selected="true" data-onglet="ecrire">1. Écrire les questions</button><button type="button" role="tab" aria-selected="false" data-onglet="jouer">2. Jouer</button></div>
      <div class="quiz__ecrire"></div><div class="quiz__jouer" hidden></div>`;
    const zoneE = el.querySelector(".quiz__ecrire"), zoneJ = el.querySelector(".quiz__jouer");
    const valides = () => etat.questions.filter((q) => q.q.trim() && q.r.filter((x) => x.trim()).length >= 2 && (q.r[q.bonne] || "").trim());
    const modifie = () => el.classList.add("is-modifie");
    function ecrire() {
      zoneE.innerHTML = `<div class="outil__champ"><label for="qz-titre">Titre du quiz</label><input id="qz-titre" value="${esc(etat.titre)}" placeholder="La Commune de Paris en 10 questions"></div><div class="quiz__liste"></div><div class="outil__barre quiz__barre"></div><p class="quiz__etat" aria-live="polite"></p>`;
      zoneE.querySelector("#qz-titre").addEventListener("input", (e) => { etat.titre = e.target.value; modifie(); });
      const liste = zoneE.querySelector(".quiz__liste");
      etat.questions.forEach((q, i) => {
        const b = document.createElement("fieldset"); b.className = "quiz__q";
        b.innerHTML = `<legend>Question ${i + 1}</legend><div class="outil__champ"><label for="qz-${i}">Question</label><textarea id="qz-${i}" rows="2">${esc(q.q)}</textarea></div>
          ${q.r.map((r, j) => `<div class="quiz__rep"><input type="radio" name="qz-bonne-${i}" id="qz-${i}-b${j}" value="${j}"${q.bonne === j ? " checked" : ""} aria-label="Réponse ${j + 1} est la bonne"><label for="qz-${i}-r${j}" class="sr">Réponse ${j + 1}</label><input type="text" id="qz-${i}-r${j}" value="${esc(r)}" placeholder="Réponse ${j + 1}${j > 1 ? " (facultative)" : ""}"></div>`).join("")}
          <p class="outil__aide">Coche le rond devant la bonne réponse.</p>
          <div class="outil__champ"><label for="qz-${i}-e">Explication montrée après la réponse (facultatif)</label><textarea id="qz-${i}-e" rows="2">${esc(q.expl)}</textarea></div>
          <div class="outil__ligne-actions"><button type="button" data-act="suppr">Retirer la question</button></div>`;
        b.querySelector(`#qz-${i}`).addEventListener("input", (e) => { q.q = e.target.value; modifie(); etatQ(); });
        q.r.forEach((r, j) => { b.querySelector(`#qz-${i}-r${j}`).addEventListener("input", (e) => { q.r[j] = e.target.value; modifie(); etatQ(); }); b.querySelector(`#qz-${i}-b${j}`).addEventListener("change", () => { q.bonne = j; modifie(); etatQ(); }); });
        b.querySelector(`#qz-${i}-e`).addEventListener("input", (e) => { q.expl = e.target.value; modifie(); });
        b.querySelector('[data-act="suppr"]').addEventListener("click", () => { etat.questions.splice(i, 1); if (!etat.questions.length) etat.questions.push({ q: "", r: ["", "", "", ""], bonne: 0, expl: "" }); ecrire(); });
        liste.appendChild(b);
      });
      const barre = zoneE.querySelector(".quiz__barre");
      barre.append(
        bouton("+ Ajouter une question", "outil-btn--petit", () => { etat.questions.push({ q: "", r: ["", "", "", ""], bonne: 0, expl: "" }); ecrire(); zoneE.querySelector(".quiz__q:last-child textarea").focus(); }),
        bouton("Imprimer ou enregistrer en PDF", "", () => {
          const fr = document.createElement("iframe"); fr.className = "outil__cache"; fr.title = "Impression du quiz"; document.body.appendChild(fr);
          const v = valides();
          feuille(fr, `<div class="feuille"><p class="type">Quiz</p><h1>${esc(etat.titre || "Quiz")}</h1>${v.map((q, i) => `<h3>${i + 1}. ${esc(q.q)}</h3><ul>${q.r.map((r, j) => r.trim() ? `<li>${"ABCD"[j]}. ${esc(r)}</li>` : "").join("")}</ul>`).join("")}<h2>Réponses</h2>${v.map((q, i) => `<p><b>${i + 1}. ${"ABCD"[q.bonne]}</b> ${esc(q.r[q.bonne])}${q.expl.trim() ? ` : ${esc(q.expl)}` : ""}</p>`).join("")}</div>`, "", etat.titre);
          fr.onload = () => { fr.contentWindow.focus(); fr.contentWindow.print(); setTimeout(() => fr.remove(), 60000); };
        }),
        bouton("Télécharger (.md)", "", () => telecharger(slug(etat.titre || "quiz") + ".md", md(), "text/markdown;charset=utf-8")),
        bouton("Copier le texte", "", (e) => copier(md(), e.currentTarget)),
        bouton("Enregistrer le brouillon (fichier)", "", () => { telecharger(`brouillon-quiz-${slug(etat.titre || "quiz")}.json`, JSON.stringify({ outil: "quiz", version: 1, valeurs: etat }, null, 2), "application/json"); el.classList.remove("is-modifie"); }),
        bouton("Ouvrir un brouillon", "", async () => {
          const f = await lireFichier(".json,application/json"); if (!f) return;
          try { const d = JSON.parse(f.contenu); if (d.outil !== "quiz" || !Array.isArray(d.valeurs.questions)) throw 0; etat.titre = d.valeurs.titre || ""; etat.questions = d.valeurs.questions.map((q) => ({ q: q.q || "", r: [0, 1, 2, 3].map((j) => (q.r || [])[j] || ""), bonne: +q.bonne || 0, expl: q.expl || "" })); ecrire(); }
          catch (e) { alert("Ce fichier n'est pas un brouillon de quiz."); }
        }),
        bouton("Tout effacer", "outil-btn--danger", () => { if (!confirm("Effacer toutes les questions ?")) return; etat.titre = ""; etat.questions = [{ q: "", r: ["", "", "", ""], bonne: 0, expl: "" }]; ecrire(); el.classList.remove("is-modifie"); })
      );
      etatQ();
    }
    function etatQ() { const n = valides().length, t = etat.questions.length; const p = zoneE.querySelector(".quiz__etat"); if (p) p.textContent = `${n} question${n > 1 ? "s" : ""} prête${n > 1 ? "s" : ""} sur ${t}. Une question est prête quand elle a un texte, au moins deux réponses et une bonne réponse remplie.`; }
    const md = () => `# ${etat.titre || "Quiz"}\n\n` + valides().map((q, i) => `## ${i + 1}. ${q.q}\n\n${q.r.map((r, j) => r.trim() ? `- ${"ABCD"[j]}. ${r}` : "").filter(Boolean).join("\n")}\n\n**Réponse :** ${"ABCD"[q.bonne]}. ${q.r[q.bonne]}${q.expl.trim() ? `\n\n${q.expl}` : ""}\n`).join("\n");
    function jouer() {
      const qs = valides();
      if (!qs.length) { zoneJ.innerHTML = `<p class="quiz__vide">Aucune question prête. Écris d'abord au moins une question avec deux réponses et une bonne réponse.</p>`; return; }
      let i = 0, score = 0, repondu = false;
      function question() {
        const q = qs[i]; repondu = false;
        zoneJ.innerHTML = `<p class="quiz__prog">Question ${i + 1} sur ${qs.length} · ${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""}</p><h2 class="quiz__question">${esc(q.q)}</h2>
          <div class="quiz__choix">${q.r.map((r, j) => r.trim() ? `<button type="button" class="quiz__choix-btn" data-j="${j}"><b>${"ABCD"[j]}</b> ${esc(r)}</button>` : "").join("")}</div><div class="quiz__retour" aria-live="polite"></div>`;
        zoneJ.querySelectorAll("[data-j]").forEach((b) => b.addEventListener("click", () => {
          if (repondu) return; repondu = true; const j = +b.dataset.j, ok = j === q.bonne; if (ok) score++;
          zoneJ.querySelectorAll("[data-j]").forEach((x) => { x.disabled = true; if (+x.dataset.j === q.bonne) x.classList.add("is-bonne"); });
          if (!ok) b.classList.add("is-fausse");
          const r = zoneJ.querySelector(".quiz__retour");
          r.innerHTML = `<p><b>${ok ? "Bonne réponse." : `Non : la bonne réponse était ${"ABCD"[q.bonne]}.`}</b></p>${q.expl.trim() ? `<p>${esc(q.expl)}</p>` : ""}`;
          r.appendChild(bouton(i + 1 < qs.length ? "Question suivante →" : "Voir le résultat", "btn--main", () => { i++; i < qs.length ? question() : fin(); }));
          r.querySelector("button").focus();
        }));
      }
      function fin() { zoneJ.innerHTML = `<h2 class="quiz__question">Résultat</h2><p class="quiz__score">${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} sur ${qs.length}</p>`; zoneJ.appendChild(bouton("Rejouer", "btn--main", () => { i = 0; score = 0; question(); })); }
      question();
    }
    el.querySelectorAll("[data-onglet]").forEach((b) => b.addEventListener("click", () => {
      const j = b.dataset.onglet === "jouer";
      el.querySelectorAll("[data-onglet]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      zoneE.hidden = j; zoneJ.hidden = !j; if (j) jouer();
    }));
    ecrire();
  }

  window.MamieOutils = { csv, heurePlus, nb };
  /* ---------- démarrage ---------- */
  const SPECIAUX = { minuteur, affiche, quiz };
  document.querySelectorAll("[data-outil]").forEach((el) => {
    const k = el.dataset.outil;
    if (SPECIAUX[k]) return SPECIAUX[k](el);
    const def = (window.OUTILS_MODELES || {})[k];
    if (def) moteurDocument(el, { id: k, ...def });
    else el.innerHTML = `<p>Cet outil n'a pas pu se charger. Recharge la page.</p>`;
  });
})();
