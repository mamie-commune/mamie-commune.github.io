// Modèles des outils de Mamie (utilisés par assets/outils.js). Pas d'IA : des champs, des choix, des calculs simples.
// Chaque modèle : titre, sections de champs (text, textarea, date, time, number, select, cases, liste, table),
// et au besoin des calculs (calcul, colonnesCalculees), des tableaux exportables en CSV (csv) ou une mise en page propre (apercu, texte).
(function () {
  "use strict";
  const nb = (v) => { const n = parseFloat(String(v ?? "").replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };
  const somme = (lignes, cle) => lignes.reduce((s, l) => s + nb(l[cle]), 0);
  const duree = (t) => { const m = Math.round(t); return (Math.floor(m / 60) ? Math.floor(m / 60) + " h " : "") + (m % 60) + " min"; };
  const plein = (lignes, cles) => (lignes || []).filter((l) => cles.some((k) => String(l[k] ?? "").trim()));

  // Les façons de décider : présentées côte à côte, sans en imposer une.
  const METHODES = [
    { v: "vote", l: "Vote", d: "Chaque personne a une voix ; la proposition qui réunit la majorité fixée à l'avance (simple, deux tiers…) l'emporte. Rapide et clair, mais la minorité peut se sentir écartée." },
    { v: "consensus", l: "Consensus", d: "On cherche une décision que tout le monde peut soutenir, en reformulant la proposition jusqu'à l'accord. Renforce l'adhésion, mais peut être long, et il faut prévoir quoi faire en cas de blocage." },
    { v: "consentement", l: "Consentement", d: "La proposition passe si personne n'a d'objection grave (« je peux vivre avec »). Plus rapide que le consensus ; demande de distinguer une préférence d'une objection argumentée." },
    { v: "mandat", l: "Décision par mandat", d: "Le groupe confie une décision à une ou plusieurs personnes, dans un cadre précis, avec obligation de rendre compte et droit de révocation. Utile pour agir vite ou à distance." }
  ];
  const METHODE_SELECT = [{ v: "", l: "Pas encore choisie", d: "" }, ...METHODES, { v: "mixte", l: "Selon les sujets (à préciser)", d: "Certains collectifs décident au consentement au quotidien et votent pour les grandes décisions, par exemple." }];
  const ETATS = [{ v: "neuf", l: "Neuf" }, { v: "bon", l: "Bon état" }, { v: "use", l: "Usé" }, { v: "reparer", l: "À réparer" }, { v: "hs", l: "Hors service" }];
  const reunion = (prefixe) => [
    { id: "nom", type: "text", label: "Nom de la réunion", placeholder: prefixe },
    { id: "date", type: "date", label: "Date" },
    { id: "heure", type: "time", label: "Heure de début" },
    { id: "lieu", type: "text", label: "Lieu", placeholder: "Salle, adresse, ou en ligne" }
  ];
  const dureeDe = (l) => nb(l.duree);
  const horaire = (champHeure, duree = dureeDe) => ({ label: "Horaire", f: (l, v, avant) => (v[champHeure] ? window.MamieOutils.heurePlus(v[champHeure], avant.slice(0, -1).reduce((s, x) => s + duree(x, v), 0)) : "") });
  const dureeProjection = (l, v) => nb(l.duree) || (/^film$/i.test(String(l.etape || "").trim()) ? nb(v.duree) : 0);
  const checklist = (id, label, items) => ({ id, type: "table", label, nomLigne: "Point", ajout: "Ajouter un point", colonnes: [{ id: "fait", type: "case", label: "Fait" }, { id: "tache", label: "À faire", large: true }, { id: "qui", label: "Qui s'en charge" }], lignes: items.map((t) => ({ fait: false, tache: t, qui: "" })) });
  const avancement = (v, ids) => { const l = ids.flatMap((id) => plein(v[id], ["tache"])); const f = l.filter((x) => x.fait).length; return l.length ? `<p><b>${f} point${f > 1 ? "s" : ""} fait${f > 1 ? "s" : ""} sur ${l.length}</b> (${Math.round((f / l.length) * 100)} %)</p>` : ""; };

  window.OUTILS_METHODES = METHODES;
  window.OUTILS_MODELES = {
    /* ---------------- organisation collective ---------------- */
    ag: {
      titre: "Préparer une assemblée générale", typeDoc: "Ordre du jour",
      titreDoc: (v) => v.nom, meta: (v, h) => [h.dateFr(v.date), v.heure ? "à " + h.heureFr(v.heure) : "", v.lieu],
      sections: [
        { titre: "La réunion", champs: [...reunion("Assemblée générale du collectif…"),
          { id: "animation", type: "text", label: "Animation (facultatif)", aide: "Qui distribue la parole et tient le temps. Beaucoup de collectifs font tourner ce rôle." },
          { id: "notes", type: "text", label: "Prise de notes (facultatif)" },
          { id: "methode", type: "select", label: "Façon de décider", options: METHODE_SELECT, aide: "Rien n'est imposé : choisis ce que ton collectif pratique, ou décidez-en ensemble en début de réunion." }] },
        { titre: "Ordre du jour", aide: "Les horaires se calculent tout seuls à partir de l'heure de début et des durées.", champs: [
          { id: "points", type: "table", label: "Points", nomLigne: "Point", ajout: "Ajouter un point", colonnes: [
            { id: "point", label: "Sujet", large: true }, { id: "duree", type: "number", label: "Durée (minutes)" },
            { id: "type", type: "select", label: "Nature", options: [{ v: "info", l: "Information" }, { v: "discussion", l: "Discussion" }, { v: "decision", l: "Décision" }, { v: "pause", l: "Pause" }] },
            { id: "qui", label: "Qui présente" }],
            lignes: [{ point: "Accueil et tour de table", duree: "10", type: "info", qui: "" }, { point: "Validation de l'ordre du jour et des rôles", duree: "5", type: "decision", qui: "" }, { point: "", duree: "", type: "discussion", qui: "" }, { point: "Répartition des tâches et date de la prochaine réunion", duree: "10", type: "decision", qui: "" }] }] },
        { titre: "Documents nécessaires", champs: [{ id: "documents", type: "liste", label: "Documents à préparer ou à apporter", ajout: "Ajouter un document", defaut: ["Compte rendu de la réunion précédente"] }] },
        { titre: "Accueil et accessibilité", champs: [{ id: "acces", type: "textarea", label: "Accueil et accessibilité", placeholder: "Accès en fauteuil, garde d'enfants, traduction, horaires adaptés…" }] }
      ],
      colonnesCalculees: { points: [horaire("heure")] },
      calcul: (v, h) => { const t = somme(plein(v.points, ["point"]), "duree"); if (!t) return ""; return `<p><b>Durée prévue : ${duree(t)}</b>${v.heure ? ` · fin prévue vers ${h.heurePlus(v.heure, t)}` : ""}</p>`; },
      csv: ["points"]
    },

    cr: {
      titre: "Compte rendu de réunion", typeDoc: "Compte rendu",
      titreDoc: (v) => v.nom, meta: (v, h) => [h.dateFr(v.date), v.lieu],
      sections: [
        { titre: "La réunion", champs: [
          { id: "nom", type: "text", label: "Nom de la réunion", placeholder: "AG du collectif…" }, { id: "date", type: "date", label: "Date" }, { id: "lieu", type: "text", label: "Lieu" },
          { id: "animation", type: "text", label: "Animation" }, { id: "notes", type: "text", label: "Prise de notes" }] },
        { titre: "Participants", aide: "Pour un compte rendu diffusé largement, tu peux ne mettre que des prénoms, ou seulement un nombre.", champs: [
          { id: "presents", type: "liste", label: "Personnes présentes", ajout: "Ajouter une personne" }, { id: "nombre", type: "number", label: "Nombre de personnes (si on ne met pas de noms)" }] },
        { titre: "Sujets abordés", champs: [{ id: "sujets", type: "table", label: "Sujets", nomLigne: "Sujet", ajout: "Ajouter un sujet", colonnes: [{ id: "sujet", label: "Sujet", large: true }, { id: "resume", type: "textarea", label: "Ce qui a été dit" }], lignes: [{ sujet: "", resume: "" }] }] },
        { titre: "Propositions", champs: [{ id: "propositions", type: "table", label: "Propositions", nomLigne: "Proposition", ajout: "Ajouter une proposition", colonnes: [{ id: "texte", type: "textarea", label: "Proposition" }, { id: "par", label: "Portée par" }], lignes: [] }] },
        { titre: "Décisions", champs: [{ id: "decisions", type: "table", label: "Décisions", nomLigne: "Décision", ajout: "Ajouter une décision", colonnes: [{ id: "texte", type: "textarea", label: "Décision prise" }, { id: "methode", type: "select", label: "Comment", options: [{ v: "", l: "—" }, ...METHODES] }, { id: "resultat", label: "Résultat (ex. : 12 pour, 2 contre)" }], lignes: [] }] },
        { titre: "Désaccords et points non résolus", champs: [{ id: "desaccords", type: "liste", label: "À reprendre plus tard", ajout: "Ajouter un point" }] },
        { titre: "Tâches réparties", champs: [{ id: "taches", type: "table", label: "Tâches", nomLigne: "Tâche", ajout: "Ajouter une tâche", colonnes: [{ id: "tache", label: "Tâche", large: true }, { id: "qui", label: "Qui" }, { id: "quand", type: "date", label: "Pour quand" }], lignes: [] }] },
        { titre: "Prochaine réunion", champs: [{ id: "pDate", type: "date", label: "Date" }, { id: "pHeure", type: "time", label: "Heure" }, { id: "pLieu", type: "text", label: "Lieu" }, { id: "pOdj", type: "liste", label: "Points déjà prévus", ajout: "Ajouter un point" }] }
      ],
      csv: ["taches", "decisions"]
    },

    mandat: {
      titre: "Mandat collectif", typeDoc: "Mandat",
      titreDoc: (v) => (v.personne ? `Mandat confié à ${v.personne}` : "Mandat"), meta: (v) => [v.collectif],
      signatures: ["Pour le collectif", "La personne mandatée"],
      sections: [
        { titre: "Qui et quoi", champs: [
          { id: "collectif", type: "text", label: "Collectif ou assemblée qui donne le mandat" }, { id: "personne", type: "text", label: "Personne mandatée (ou délégation)" },
          { id: "objet", type: "textarea", label: "Objet du mandat", placeholder: "Représenter le collectif à la réunion inter-collectifs du…, négocier…" }] },
        { titre: "Durée", champs: [{ id: "debut", type: "date", label: "Début" }, { id: "fin", type: "date", label: "Fin" }, { id: "duree", type: "text", label: "Ou en clair", placeholder: "Jusqu'à la prochaine assemblée générale" }] },
        { titre: "Objectifs", champs: [{ id: "objectifs", type: "liste", label: "Ce que la personne doit chercher à obtenir", ajout: "Ajouter un objectif" }] },
        { titre: "Limites", champs: [{ id: "limites", type: "liste", label: "Ce que la personne ne peut pas décider seule", ajout: "Ajouter une limite", defaut: ["Tout engagement qui n'est pas dans ce mandat revient devant l'assemblée."] }] },
        { titre: "Révocation", champs: [
          { id: "revocation", type: "cases", label: "Conditions de révocation", options: [
            { v: "toutmoment", l: "Révocable à tout moment par l'assemblée qui l'a donné" }, { v: "nonrespect", l: "Révoqué si le mandat n'est pas respecté" },
            { v: "datefin", l: "Prend fin automatiquement à la date prévue" }, { v: "renouv", l: "Renouvelable seulement par une nouvelle décision" }], defaut: ["toutmoment", "datefin"] },
          { id: "revocationPlus", type: "textarea", label: "Précisions (facultatif)" }] },
        { titre: "Rendre compte", champs: [
          { id: "frequence", type: "select", label: "Quand rendre compte", options: [{ v: "", l: "À préciser" }, { v: "action", l: "Après chaque action ou rencontre" }, { v: "semaine", l: "Chaque semaine" }, { v: "ag", l: "À chaque assemblée" }, { v: "fin", l: "À la fin du mandat" }] },
          { id: "modalites", type: "textarea", label: "Comment", placeholder: "Compte rendu écrit sur la liste de discussion, puis oral en AG." }] },
        { titre: "Adoption", champs: [{ id: "adopte", type: "date", label: "Mandat adopté le" }, { id: "comment", type: "select", label: "Décidé par", options: [{ v: "", l: "—" }, ...METHODES.filter((m) => m.v !== "mandat")] }] }
      ]
    },

    charte: {
      titre: "Charte collective", typeDoc: "Charte",
      titreDoc: (v) => (v.nom ? `Charte de ${v.nom}` : "Charte du collectif"), meta: (v, h) => [v.adoptee ? "Adoptée le " + h.dateFr(v.adoptee) : ""],
      sections: [
        { titre: "Le collectif", champs: [{ id: "nom", type: "text", label: "Nom du collectif" }, { id: "adoptee", type: "date", label: "Date d'adoption" }, { id: "pourquoi", type: "textarea", label: "Pourquoi on existe (en quelques lignes)" }] },
        { titre: "Valeurs communes", champs: [{ id: "valeurs", type: "liste", label: "Nos valeurs", ajout: "Ajouter une valeur", placeholder: "Pas de chef, entraide, refus du racisme et du sexisme…" }] },
        { titre: "Fonctionnement", champs: [
          { id: "fonction", type: "cases", label: "Ce qu'on pratique", options: [{ v: "ag", l: "Une assemblée régulière ouverte à tous les membres" }, { v: "rotation", l: "La rotation des rôles (animation, prise de notes, contact)" }, { v: "cr", l: "Des comptes rendus partagés après chaque réunion" }, { v: "caisse", l: "Une caisse commune aux comptes ouverts" }, { v: "ouvert", l: "Des réunions ouvertes aux personnes qui veulent découvrir" }] },
          { id: "fonctionPlus", type: "textarea", label: "En détail" }] },
        { titre: "Prise de décision", aide: "Ces méthodes ne s'excluent pas : beaucoup de collectifs en combinent plusieurs. Coche celles que le vôtre utilise.", champs: [
          { id: "decision", type: "cases", label: "Comment on décide", options: METHODES, avecDef: true },
          { id: "decisionPlus", type: "textarea", label: "Précisions", placeholder: "Quorum, majorité requise, que faire en cas de blocage, décisions urgentes…" }] },
        { titre: "Répartition des tâches", champs: [
          { id: "taches", type: "cases", label: "Ce qu'on s'engage à faire", options: [{ v: "binome", l: "Travailler en binôme pour transmettre les savoir-faire" }, { v: "visible", l: "Rendre visibles toutes les tâches, même ingrates (ménage, comptes, accueil)" }, { v: "limite", l: "Limiter le nombre de responsabilités par personne" }] },
          { id: "tachesPlus", type: "textarea", label: "En détail" }] },
        { titre: "Gestion des conflits", champs: [
          { id: "conflits", type: "cases", label: "Ce qu'on prévoit", options: [{ v: "parler", l: "Un temps pour parler des tensions avant qu'elles grossissent" }, { v: "mediation", l: "Le recours à une médiation, au besoin extérieure au groupe" }, { v: "vss", l: "Un protocole en cas de violences sexistes ou sexuelles" }, { v: "exclusion", l: "Des règles claires pour une éventuelle exclusion" }] },
          { id: "conflitsPlus", type: "textarea", label: "En détail" }] },
        { titre: "Modification de la charte", champs: [
          { id: "modif", type: "select", label: "Comment on la modifie", options: [{ v: "", l: "À préciser" }, ...METHODES.filter((m) => m.v !== "mandat").map((m) => ({ v: m.v, l: m.l + " en assemblée" }))] },
          { id: "modifPlus", type: "textarea", label: "Précisions", placeholder: "Proposition envoyée deux semaines avant l'assemblée…" }] }
      ]
    },

    /* ---------------- mobilisation et communication ---------------- */
    tract: {
      titre: "Modèle de tract", boutonImprimer: "Imprimer ou enregistrer en PDF",
      titreDoc: (v) => v.titre || "tract",
      sections: [
        { titre: "Le texte", champs: [
          { id: "titre", type: "text", label: "Titre", placeholder: "Pas touche à nos retraites !" }, { id: "accroche", type: "text", label: "Accroche (facultatif)" },
          { id: "texte", type: "textarea", label: "Texte", lignesTexte: 7, aide: "Court : une idée, des phrases simples. Laisse une ligne vide entre deux paragraphes." }] },
        { titre: "Le rendez-vous", champs: [{ id: "date", type: "date", label: "Date" }, { id: "heure", type: "time", label: "Heure" }, { id: "lieu", type: "text", label: "Lieu" }, { id: "infos", type: "textarea", label: "Informations pratiques", lignesTexte: 3, placeholder: "Cantine à prix libre, garde d'enfants, accès en fauteuil…" }] },
        { titre: "Signature", champs: [{ id: "signature", type: "text", label: "Signature" }, { id: "contact", type: "text", label: "Contact public (facultatif)", aide: "Une adresse de collectif, jamais une adresse personnelle." }, { id: "mention", type: "text", label: "Mention en bas (facultatif)", placeholder: "Ne pas jeter sur la voie publique" }] },
        { titre: "Mise en page", champs: [
          { id: "modele", type: "select", label: "Modèle graphique", defaut: "collage", options: [{ v: "collage", l: "Collage (noir, rose, jaune)" }, { v: "sobre", l: "Sobre (noir et blanc, économe en encre)" }, { v: "machine", l: "Machine à écrire" }] },
          { id: "format", type: "select", label: "Format", defaut: "a4", options: [{ v: "a4", l: "A4, un tract par feuille" }, { v: "a5", l: "A5, deux tracts par feuille A4 (à couper)" }] }] }
      ],
      apercu: (v, h) => {
        const quand = [h.dateFr(v.date), v.heure ? h.heureFr(v.heure) : ""].filter(Boolean).join(", ");
        const un = `<div class="tract tract--${h.esc(v.modele || "collage")}"><h1>${h.esc(v.titre || "Titre du tract")}</h1>${v.accroche ? `<p class="accroche">${h.esc(v.accroche)}</p>` : ""}<div class="corps">${h.paras(v.texte)}</div>
          ${quand || v.lieu ? `<p class="rdv">${h.esc([quand, v.lieu].filter(Boolean).join(" · "))}</p>` : ""}${v.infos ? `<div class="infos">${h.paras(v.infos)}</div>` : ""}
          <p class="signe">${h.esc(v.signature)}${v.contact ? `<br>${h.esc(v.contact)}` : ""}</p>${v.mention ? `<p class="mention">${h.esc(v.mention)}</p>` : ""}</div>`;
        return v.format === "a5" ? `<div class="planche">${un}<div class="coupe"></div>${un}</div>` : `<div class="planche planche--a4">${un}</div>`;
      },
      texte: (v, h) => `# ${v.titre || ""}\n\n${v.accroche ? `**${v.accroche}**\n\n` : ""}${(v.texte || "").trim()}\n\n${[h.dateFr(v.date), v.heure ? h.heureFr(v.heure) : "", v.lieu].filter(Boolean).join(" · ")}\n\n${(v.infos || "").trim()}\n\n${v.signature || ""}${v.contact ? "\n" + v.contact : ""}\n`.replace(/\n{3,}/g, "\n\n"),
      css: `@page { size: A4; margin: 0; } body { padding: 18px; } .planche { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto; box-sizing: border-box; box-shadow: 0 2px 10px rgba(0,0,0,.25); display: flex; flex-direction: column; }
        .planche--a4 .tract { flex: 1; } .planche .tract { flex: 1; box-sizing: border-box; padding: 14mm; display: flex; flex-direction: column; gap: 8px; overflow: hidden; } .planche:not(.planche--a4) .tract { height: 148mm; flex: none; padding: 10mm 14mm; font-size: 10pt; }
        .coupe { border-top: 1px dashed #888; } .tract h1 { font-size: 30pt; line-height: 1; text-transform: uppercase; margin: 0; } .planche:not(.planche--a4) h1 { font-size: 22pt; }
        .accroche { font: 14pt/1.2 "Archivo Black", Arial, sans-serif; margin: 0; } .corps { flex: 1; } .rdv { font: 15pt/1.2 "Archivo Black", Arial, sans-serif; margin: 0; padding: 6px 10px; } .infos { font-size: 10pt; }
        .signe { margin: 0; font-weight: 700; } .mention { margin: 0; font-size: 8pt; text-align: center; color: #555; }
        .tract--collage { background: #f6f0e3; } .tract--collage h1 { background: #171414; color: #fff; padding: 4px 8px; align-self: flex-start; } .tract--collage .accroche { color: #c0186b; } .tract--collage .rdv { background: #f5b63b; align-self: flex-start; }
        .tract--sobre h1 { border-bottom: 4px solid #000; padding-bottom: 4px; } .tract--sobre .rdv { border: 2px solid #000; align-self: flex-start; }
        .tract--machine, .tract--machine .accroche, .tract--machine .rdv, .tract--machine h1 { font-family: "Special Elite", "Courier New", monospace; } .tract--machine .rdv { border-top: 2px dashed #000; border-bottom: 2px dashed #000; }
        @media print { body { padding: 0; } .planche { box-shadow: none; margin: 0; } }`
    },

    communique: {
      titre: "Communiqué", titreDoc: (v) => v.titre || "communique",
      sections: [
        { titre: "En-tête", champs: [{ id: "orga", type: "text", label: "Organisation" }, { id: "date", type: "date", label: "Date" }, { id: "lieu", type: "text", label: "Fait à (ville)" }, { id: "diffusion", type: "select", label: "Diffusion", options: [{ v: "immediat", l: "Pour diffusion immédiate" }, { v: "", l: "Ne rien indiquer" }] }] },
        { titre: "Le texte", champs: [
          { id: "titre", type: "text", label: "Titre" },
          { id: "intro", type: "textarea", label: "Introduction (le plus important d'abord : qui, quoi, quand, où, pourquoi)", lignesTexte: 3 },
          { id: "corps", type: "textarea", label: "Corps du texte", lignesTexte: 8 }] },
        { titre: "Contact", champs: [{ id: "contact", type: "text", label: "Contact public", aide: "Adresse ou téléphone du collectif, pas celui d'une personne si ce n'est pas voulu." }, { id: "site", type: "text", label: "Site ou réseau (facultatif)" }] }
      ],
      apercu: (v, h) => `<div class="feuille com"><p class="type">Communiqué${v.diffusion ? " · pour diffusion immédiate" : ""}</p><p class="orga">${h.esc(v.orga || "Organisation")}</p>
        <p class="meta">${h.esc([v.lieu, h.dateFr(v.date)].filter(Boolean).join(", le "))}</p><h1>${h.esc(v.titre || "Titre du communiqué")}</h1>
        ${v.intro ? `<div class="chapo">${h.paras(v.intro)}</div>` : ""}${h.paras(v.corps)}<p class="fin">###</p>
        ${v.contact || v.site ? `<div class="contact"><b>Contact :</b> ${h.esc(v.contact)}${v.site ? `<br>${h.esc(v.site)}` : ""}</div>` : ""}</div>`,
      texte: (v, h) => `COMMUNIQUÉ${v.diffusion ? " · pour diffusion immédiate" : ""}\n${v.orga || ""}\n${[v.lieu, h.dateFr(v.date)].filter(Boolean).join(", le ")}\n\n# ${v.titre || ""}\n\n${(v.intro || "").trim()}\n\n${(v.corps || "").trim()}\n\n###\n\nContact : ${v.contact || ""}${v.site ? "\n" + v.site : ""}\n`,
      css: `.com .orga { font: 16pt/1.2 "Archivo Black", Arial, sans-serif; margin: 0; } .com h1 { margin-top: 14px; } .com .chapo { font-weight: 700; } .com .fin { text-align: center; margin: 16px 0; } .com .contact { border-top: 2px solid #111; padding-top: 8px; }`
    },

    evenement: {
      titre: "Checklist d'événement", typeDoc: "Checklist d'événement",
      titreDoc: (v) => v.nom, meta: (v, h) => [h.dateFr(v.date), v.lieu],
      sections: [
        { titre: "L'événement", champs: [{ id: "nom", type: "text", label: "Nom de l'événement", placeholder: "Concert de soutien, rassemblement, projection…" }, { id: "date", type: "date", label: "Date" }, { id: "lieu", type: "text", label: "Lieu" }] },
        { titre: "Préparation", aide: "Une liste de départ : modifie, retire, ajoute ce qui convient à ton événement.", champs: [checklist("prepa", "Préparation", ["Fixer la date et vérifier qu'elle ne tombe pas sur un autre événement ami", "Réserver ou confirmer le lieu", "Vérifier s'il faut déclarer l'événement (manifestation sur la voie publique, débit de boissons…)", "Prévoir le budget et la façon de le financer (prix libre, caisse…)", "Prévoir un plan si ça tourne mal (pluie, annulation, police)"])] },
        { titre: "Matériel", champs: [checklist("materiel", "Matériel", ["Tables, chaises, barnum", "Sono, micro, rallonges, multiprises", "Banderoles et affiches", "Trousse de premiers secours", "Sacs poubelle, de quoi nettoyer"])] },
        { titre: "Communication", champs: [checklist("comm", "Communication", ["Affiche et tract prêts", "Collage et diffusion dans le quartier", "Annonce sur les listes et réseaux du collectif", "Prévenir les collectifs amis"])] },
        { titre: "Accessibilité", champs: [checklist("acces", "Accessibilité", ["Lieu accessible en fauteuil, ou information claire si ce n'est pas le cas", "Coin calme pour se poser", "Prix libre ou gratuit pour que personne ne reste dehors", "Garde d'enfants ou espace enfants", "Traduction ou interprétariat si besoin"])] },
        { titre: "Répartition des tâches", champs: [checklist("taches", "Rôles le jour J", ["Accueil", "Caisse", "Buvette ou cantine", "Sécurité et contacts en cas de problème", "Rangement et nettoyage"])] },
        { titre: "Bilan", champs: [checklist("bilan", "Après l'événement", ["Faire les comptes", "Remercier les personnes et les lieux", "Rendre le matériel emprunté"]), { id: "marche", type: "textarea", label: "Ce qui a bien marché" }, { id: "ameliorer", type: "textarea", label: "Ce qu'on fera autrement" }] }
      ],
      calcul: (v) => avancement(v, ["prepa", "materiel", "comm", "acces", "taches", "bilan"])
    },

    /* ---------------- solidarité ---------------- */
    caisse: {
      titre: "Caisse de solidarité", typeDoc: "État de la caisse",
      titreDoc: (v) => v.nom, meta: (v, h) => [v.date ? "Au " + h.dateFr(v.date) : ""],
      sections: [
        { titre: "La caisse", champs: [{ id: "nom", type: "text", label: "Nom de la caisse", placeholder: "Caisse de grève des…" }, { id: "date", type: "date", label: "Date du point" }, { id: "objectif", type: "number", label: "Objectif (en euros)" }] },
        { titre: "Contributions", champs: [{ id: "entrees", type: "table", label: "Contributions", nomLigne: "Contribution", ajout: "Ajouter une contribution", colonnes: [{ id: "date", type: "date", label: "Date" }, { id: "origine", label: "Origine (soirée, collecte, don…)", large: true }, { id: "montant", type: "number", label: "Montant (€)", euros: true }], lignes: [] }] },
        { titre: "Dépenses", champs: [{ id: "sorties", type: "table", label: "Dépenses", nomLigne: "Dépense", ajout: "Ajouter une dépense", colonnes: [{ id: "date", type: "date", label: "Date" }, { id: "objet", label: "Objet (sans nom de personne aidée si c'est sensible)", large: true }, { id: "montant", type: "number", label: "Montant (€)", euros: true }], lignes: [] }] },
        { titre: "Scénarios", aide: "Pour comparer : « si on récolte tant par mois et qu'on verse tant par mois, où en sera-t-on ? ». Ce sont des simulations, pas des prévisions.", champs: [
          { id: "scenarios", type: "table", label: "Scénarios", nomLigne: "Scénario", ajout: "Ajouter un scénario", colonnes: [{ id: "nom", label: "Nom du scénario", large: true }, { id: "entree", type: "number", label: "Entrées par mois (€)" }, { id: "sortie", type: "number", label: "Sorties par mois (€)" }, { id: "mois", type: "number", label: "Nombre de mois" }],
            lignes: [{ nom: "Prudent", entree: "", sortie: "", mois: "3" }, { nom: "Si la grève dure", entree: "", sortie: "", mois: "6" }] }] }
      ],
      colonnesCalculees: {
        scenarios: [
          { label: "Solde à la fin", f: (l, v) => { if (!String(l.entree).trim() && !String(l.sortie).trim()) return ""; const s = somme(v.entrees, "montant") - somme(v.sorties, "montant"); return (s + (nb(l.entree) - nb(l.sortie)) * nb(l.mois)).toLocaleString("fr-FR", { style: "currency", currency: "EUR" }); } },
          { label: "Objectif atteint", f: (l, v) => { const obj = nb(v.objectif), s = somme(v.entrees, "montant") - somme(v.sorties, "montant"), net = nb(l.entree) - nb(l.sortie); if (!obj || (!String(l.entree).trim() && !String(l.sortie).trim())) return ""; if (s >= obj) return "déjà atteint"; if (net <= 0) return "pas à ce rythme"; const m = Math.ceil((obj - s) / net); return `en ${m} mois${nb(l.mois) && m > nb(l.mois) ? " (après la période)" : ""}`; } }]
      },
      calcul: (v, h) => {
        const e = somme(v.entrees, "montant"), s = somme(v.sorties, "montant"), solde = e - s, obj = h.nb(v.objectif);
        if (!e && !s && !obj) return "";
        return `<p>Contributions : <b>${h.euros(e)}</b> · Dépenses : <b>${h.euros(s)}</b></p><p>Solde : <b>${h.euros(solde)}</b>${solde < 0 ? " (la caisse est dans le rouge)" : ""}</p>${obj ? `<p>Objectif : ${h.euros(obj)} · ${solde >= obj ? "atteint" : `reste à trouver <b>${h.euros(obj - solde)}</b> (${Math.max(0, Math.round((solde / obj) * 100))} % atteint)`}</p>` : ""}`;
      },
      csv: ["entrees", "sorties", "scenarios"]
    },

    cantine: {
      titre: "Budget de cantine", typeDoc: "Budget de cantine",
      titreDoc: (v) => v.nom, meta: (v, h) => [h.dateFr(v.date), v.personnes ? v.personnes + " personnes" : ""],
      sections: [
        { titre: "Le repas", champs: [{ id: "nom", type: "text", label: "Nom du repas", placeholder: "Cantine du piquet de grève" }, { id: "date", type: "date", label: "Date" }, { id: "personnes", type: "number", label: "Nombre de personnes" }, { id: "prix", type: "number", label: "Prix demandé par repas (facultatif, en €)", aide: "Pour un prix libre, laisse vide ou mets le prix conseillé." }] },
        { titre: "Denrées", aide: "« Par personne » : la quantité est multipliée par le nombre de personnes. « Au total » : la quantité est celle que tu achètes.", champs: [
          { id: "denrees", type: "table", label: "Denrées", nomLigne: "Denrée", ajout: "Ajouter une denrée", colonnes: [{ id: "denree", label: "Denrée", large: true }, { id: "mode", type: "select", label: "Compter", options: [{ v: "pp", l: "par personne" }, { v: "total", l: "au total" }] }, { id: "qte", type: "number", label: "Quantité" }, { id: "unite", label: "Unité (kg, l, pièce…)" }, { id: "pu", type: "number", label: "Prix par unité (€)" }],
            lignes: [{ denree: "", mode: "pp", qte: "", unite: "kg", pu: "" }] }] },
        { titre: "Autres dépenses", champs: [{ id: "autres", type: "table", label: "Autres dépenses", nomLigne: "Dépense", ajout: "Ajouter une dépense", colonnes: [{ id: "objet", label: "Objet (gaz, location, vaisselle…)", large: true }, { id: "montant", type: "number", label: "Montant (€)", euros: true }], lignes: [] }] }
      ],
      colonnesCalculees: {
        denrees: [
          { label: "Quantité totale", f: (l, v) => { const q = l.mode === "pp" ? nb(l.qte) * nb(v.personnes) : nb(l.qte); return q ? `${q.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${l.unite || ""}`.trim() : ""; } },
          { label: "Coût", f: (l, v) => { const q = l.mode === "pp" ? nb(l.qte) * nb(v.personnes) : nb(l.qte), c = q * nb(l.pu); return c ? c.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : ""; } }]
      },
      calcul: (v, h) => {
        const n = h.nb(v.personnes), den = (v.denrees || []).reduce((s, l) => s + (l.mode === "pp" ? nb(l.qte) * n : nb(l.qte)) * nb(l.pu), 0), aut = somme(v.autres, "montant"), tot = den + aut;
        if (!tot) return n ? `<p>${n} personnes. Ajoute des denrées pour voir le coût.</p>` : "";
        return `<p>Denrées : <b>${h.euros(den)}</b> · Autres dépenses : <b>${h.euros(aut)}</b> · Total : <b>${h.euros(tot)}</b></p>${n ? `<p>Coût par personne : <b>${h.euros(tot / n)}</b></p>` : "<p>Indique le nombre de personnes pour avoir le coût par personne.</p>"}${n && h.nb(v.prix) ? `<p>Recette si chaque personne paie ${h.euros(h.nb(v.prix))} : ${h.euros(h.nb(v.prix) * n)} · différence : <b>${h.euros(h.nb(v.prix) * n - tot)}</b></p>` : ""}`;
      },
      csv: ["denrees", "autres"]
    },

    inventaire: {
      titre: "Inventaire de matériel", typeDoc: "Inventaire",
      titreDoc: (v) => (v.collectif ? `Inventaire · ${v.collectif}` : "Inventaire du matériel"), meta: (v, h) => [v.date ? "Au " + h.dateFr(v.date) : ""],
      sections: [
        { titre: "L'inventaire", champs: [{ id: "collectif", type: "text", label: "Collectif ou lieu" }, { id: "date", type: "date", label: "Date de l'inventaire" }] },
        { titre: "Matériel", champs: [{ id: "objets", type: "table", label: "Matériel", nomLigne: "Objet", ajout: "Ajouter un objet", colonnes: [{ id: "nom", label: "Désignation", large: true }, { id: "qte", type: "number", label: "Quantité" }, { id: "etat", type: "select", label: "État", options: ETATS }, { id: "lieu", label: "Emplacement" }, { id: "resp", label: "Responsable (facultatif)" }], lignes: [{ nom: "", qte: "", etat: "bon", lieu: "", resp: "" }] }] }
      ],
      calcul: (v) => {
        const l = plein(v.objets, ["nom"]); if (!l.length) return "";
        const parEtat = ETATS.map((e) => [e.l, l.filter((x) => x.etat === e.v).length]).filter(([, n]) => n);
        return `<p><b>${l.length} ligne${l.length > 1 ? "s" : ""}</b>, ${somme(l, "qte").toLocaleString("fr-FR")} objets en tout</p><p>${parEtat.map(([e, n]) => `${e} : ${n}`).join(" · ")}</p>`;
      },
      csv: ["objets"]
    },

    /* ---------------- éducation populaire ---------------- */
    atelier: {
      titre: "Fiche de préparation d'atelier", typeDoc: "Préparation d'atelier",
      titreDoc: (v) => v.titre, meta: (v, h) => [h.dateFr(v.date), v.heure ? h.heureFr(v.heure) : "", v.lieu],
      sections: [
        { titre: "L'atelier", champs: [{ id: "titre", type: "text", label: "Titre de l'atelier" }, { id: "public", type: "text", label: "Public", placeholder: "Lycéennes et lycéens, habitants du quartier…" }, { id: "nombre", type: "number", label: "Nombre de personnes attendues" }, { id: "date", type: "date", label: "Date" }, { id: "heure", type: "time", label: "Heure de début" }, { id: "lieu", type: "text", label: "Lieu" }, { id: "duree", type: "number", label: "Durée prévue (minutes)" }] },
        { titre: "Objectifs", champs: [{ id: "objectifs", type: "liste", label: "À la fin, les personnes auront…", ajout: "Ajouter un objectif" }] },
        { titre: "Déroulé", aide: "Les horaires se calculent à partir de l'heure de début.", champs: [{ id: "etapes", type: "table", label: "Étapes", nomLigne: "Étape", ajout: "Ajouter une étape", colonnes: [{ id: "etape", label: "Étape", large: true }, { id: "duree", type: "number", label: "Durée (minutes)" },
          { id: "methode", type: "select", label: "Méthode", options: [{ v: "tour", l: "Tour de parole" }, { v: "groupes", l: "Petits groupes" }, { v: "expose", l: "Exposé" }, { v: "lecture", l: "Lecture collective" }, { v: "mouvant", l: "Débat mouvant" }, { v: "role", l: "Jeu de rôle" }, { v: "photo", l: "Photolangage" }, { v: "pause", l: "Pause" }, { v: "autre", l: "Autre" }] },
          { id: "materiel", label: "Matériel" }, { id: "qui", label: "Qui anime" }], lignes: [{ etape: "Accueil et présentations", duree: "15", methode: "tour", materiel: "", qui: "" }, { etape: "", duree: "", methode: "groupes", materiel: "", qui: "" }, { etape: "Bilan à chaud", duree: "10", methode: "tour", materiel: "", qui: "" }] }] },
        { titre: "Matériel", champs: [{ id: "materiel", type: "liste", label: "À apporter", ajout: "Ajouter du matériel" }] },
        { titre: "Accessibilité", champs: [{ id: "acces", type: "textarea", label: "Accessibilité et accueil" }] },
        { titre: "Bilan (après l'atelier)", champs: [{ id: "bilan", type: "textarea", label: "Ce qui s'est passé, ce qu'on changerait" }] }
      ],
      colonnesCalculees: { etapes: [horaire("heure")] },
      calcul: (v, h) => { const t = somme(plein(v.etapes, ["etape"]), "duree"), d = h.nb(v.duree); if (!t) return ""; return `<p><b>Déroulé : ${duree(t)}</b>${d ? (t > d ? ` · <b>${duree(t - d)} de trop</b> par rapport aux ${duree(d)} prévues` : t < d ? ` · ${duree(d - t)} de marge sur les ${duree(d)} prévues` : " · pile la durée prévue") : ""}${v.heure ? ` · fin vers ${h.heurePlus(v.heure, t)}` : ""}</p>`; },
      csv: ["etapes"]
    },

    lecture: {
      titre: "Fiche de lecture", typeDoc: "Fiche de lecture",
      titreDoc: (v) => v.titre, meta: (v) => [v.auteur, v.annee, v.editeur],
      sections: [
        { titre: "Le texte", champs: [{ id: "titre", type: "text", label: "Titre" }, { id: "auteur", type: "text", label: "Autrice ou auteur" }, { id: "annee", type: "text", label: "Année" }, { id: "editeur", type: "text", label: "Éditeur ou source" }, { id: "lecteur", type: "text", label: "Fiche faite par (facultatif)" }] },
        { titre: "Contexte", champs: [{ id: "contexte", type: "textarea", label: "Contexte", placeholder: "Quand, où, pourquoi ce texte a été écrit." }] },
        { titre: "La thèse", champs: [{ id: "these", type: "textarea", label: "La thèse en quelques phrases" }] },
        { titre: "Les idées", champs: [{ id: "idees", type: "liste", label: "Idées principales", ajout: "Ajouter une idée" }] },
        { titre: "Citations", champs: [{ id: "citations", type: "liste", label: "Citations recopiées mot pour mot, avec la page", ajout: "Ajouter une citation" }] },
        { titre: "Débats et limites", champs: [{ id: "debats", type: "textarea", label: "Débats et limites" }] },
        { titre: "Et aujourd'hui ?", champs: [{ id: "aujourdhui", type: "textarea", label: "Ce qui reste utile aujourd'hui" }] },
        { titre: "À retenir", champs: [{ id: "retenir", type: "liste", label: "À retenir", ajout: "Ajouter un point" }] },
        { titre: "Pour la discussion", champs: [{ id: "questions", type: "liste", label: "Questions pour en discuter en groupe", ajout: "Ajouter une question" }] }
      ]
    },

    bibliographie: {
      titre: "Bibliographie", titreDoc: (v) => v.titre || "Bibliographie",
      sections: [
        { titre: "La bibliographie", champs: [{ id: "titre", type: "text", label: "Titre", placeholder: "Pour aller plus loin sur…" }, { id: "intro", type: "textarea", label: "Présentation (facultatif)", lignesTexte: 3 },
          { id: "style", type: "select", label: "Présentation des références", options: [{ v: "auteur", l: "Autrice ou auteur, Titre, Éditeur, année" }, { v: "titre", l: "Titre, de l'autrice ou l'auteur (année)" }] },
          { id: "tri", type: "select", label: "Ordre", options: [{ v: "saisie", l: "Dans l'ordre de saisie" }, { v: "auteur", l: "Par autrice ou auteur" }, { v: "annee", l: "Par année" }] }] },
        { titre: "Références", aide: "Ne mets que des références vérifiées : titre, autrice ou auteur, éditeur et année exacts.", champs: [{ id: "refs", type: "table", label: "Références", nomLigne: "Référence", ajout: "Ajouter une référence", colonnes: [{ id: "auteur", label: "Autrice ou auteur" }, { id: "titre", label: "Titre", large: true }, { id: "editeur", label: "Éditeur" }, { id: "annee", label: "Année" }, { id: "lien", label: "Lien (facultatif)" }, { id: "note", type: "textarea", label: "Pourquoi le lire (facultatif)" }], lignes: [{ auteur: "", titre: "", editeur: "", annee: "", lien: "", note: "" }] }] }
      ],
      csv: ["refs"],
      apercu: (v, h) => `<div class="feuille"><p class="type">Bibliographie</p><h1>${h.esc(v.titre || "Bibliographie")}</h1>${h.paras(v.intro)}<ul class="biblio">${triRefs(v).map((r) => `<li>${refHtml(r, v.style, h.esc)}${r.note ? `<br><span class="note">${h.esc(r.note)}</span>` : ""}</li>`).join("")}</ul></div>`,
      texte: (v) => `# ${v.titre || "Bibliographie"}\n\n${v.intro ? v.intro.trim() + "\n\n" : ""}${triRefs(v).map((r) => `- ${refTexte(r, v.style)}${r.note ? `\n  ${r.note}` : ""}`).join("\n")}\n`,
      css: `.biblio { list-style: none; padding: 0; } .biblio li { margin: 0 0 10px; padding-left: 1.4em; text-indent: -1.4em; } .biblio .note { color: #444; font-size: 10pt; } .biblio a { color: #111; }`
    },

    projection: {
      titre: "Projection-débat", typeDoc: "Projection-débat",
      titreDoc: (v) => (v.film ? `Projection-débat : ${v.film}` : "Projection-débat"), meta: (v, h) => [h.dateFr(v.date), v.heure ? h.heureFr(v.heure) : "", v.lieu],
      sections: [
        { titre: "Le film", champs: [{ id: "film", type: "text", label: "Titre du film" }, { id: "real", type: "text", label: "Réalisation" }, { id: "annee", type: "text", label: "Année" }, { id: "duree", type: "number", label: "Durée du film (minutes)" },
          { id: "droits", type: "select", label: "Droits de projection", aide: "Une projection publique, même gratuite, demande en général l'accord de l'ayant droit (producteur, distributeur ou réalisateur).", options: [{ v: "verifier", l: "À vérifier avant de diffuser", d: "Contacte le distributeur ou la production : beaucoup de films militants sont prêtés volontiers pour une projection-débat." }, { v: "accord", l: "Accord de l'ayant droit obtenu", d: "" }, { v: "licence", l: "Licence de projection publique payée", d: "" }, { v: "libre", l: "Film sous licence libre ou dans le domaine public", d: "" }] }] },
        { titre: "La séance", champs: [{ id: "date", type: "date", label: "Date" }, { id: "heure", type: "time", label: "Heure de début" }, { id: "lieu", type: "text", label: "Lieu" }, { id: "presentation", type: "textarea", label: "Présentation avant le film (quelques phrases)" }] },
        { titre: "Le débat", champs: [{ id: "intervenants", type: "liste", label: "Invitées et invités", ajout: "Ajouter une personne" }, { id: "questions", type: "liste", label: "Questions pour lancer le débat", ajout: "Ajouter une question" }] },
        { titre: "Déroulé", champs: [{ id: "deroule", type: "table", label: "Déroulé", nomLigne: "Moment", ajout: "Ajouter un moment", colonnes: [{ id: "etape", label: "Moment", large: true }, { id: "duree", type: "number", label: "Durée (minutes)" }], lignes: [{ etape: "Accueil", duree: "15" }, { etape: "Présentation du film", duree: "5" }, { etape: "Film", duree: "" }, { etape: "Débat", duree: "45" }] }] },
        { titre: "Matériel", champs: [{ id: "materiel", type: "liste", label: "Matériel", ajout: "Ajouter du matériel", defaut: ["Vidéoprojecteur et écran", "Ordinateur ou lecteur, et le film testé à l'avance", "Son (enceintes, câbles)", "Rallonges et multiprises", "Micro pour le débat"] }] }
      ],
      colonnesCalculees: { deroule: [horaire("heure", dureeProjection)] },
      calcul: (v, h) => {
        const lignes = plein(v.deroule, ["etape"]), t = lignes.reduce((s, l) => s + dureeProjection(l, v), 0);
        const avert = v.droits === "verifier" ? "<p><b>Droits de projection à vérifier avant de diffuser.</b></p>" : "";
        return (t ? `<p><b>Durée totale : ${duree(t)}</b>${v.heure ? ` · fin vers ${h.heurePlus(v.heure, t)}` : ""}</p>` : "") + avert;
      }
    },

    animation: {
      titre: "Checklist d'animation", typeDoc: "Checklist d'animation",
      titreDoc: (v) => v.nom, meta: (v, h) => [h.dateFr(v.date)],
      sections: [
        { titre: "La séance", champs: [{ id: "nom", type: "text", label: "Atelier, réunion ou formation" }, { id: "date", type: "date", label: "Date" }] },
        { titre: "Avant", aide: "Une liste de départ, à adapter.", champs: [checklist("avant", "Avant", ["Objectifs de la séance écrits et partagés avec les autres animatrices et animateurs", "Déroulé minuté", "Salle vérifiée : place, chaises, lumière, accessibilité", "Matériel prêt (feutres, grandes feuilles, minuteur)", "Rôles répartis : animation, temps, prise de notes, accueil"])] },
        { titre: "Pendant", champs: [checklist("pendant", "Pendant", ["Accueillir chaque personne et présenter le déroulé", "Rappeler les règles de parole choisies ensemble", "Veiller à ce que la parole circule (tour de parole, temps limité)", "Garder une trace écrite visible de ce qui se dit", "Tenir les horaires, faire une pause"])] },
        { titre: "Après", champs: [checklist("apres", "Après", ["Bilan à chaud avec les participantes et participants", "Bilan entre animatrices et animateurs", "Envoyer le compte rendu ou les documents promis", "Ranger et rendre la salle"])] }
      ],
      calcul: (v) => avancement(v, ["avant", "pendant", "apres"])
    }
  };

  // Bibliographie : tri et présentation des références.
  function triRefs(v) {
    const l = plein(v.refs, ["titre", "auteur"]).slice();
    if (v.tri === "auteur") l.sort((a, b) => (a.auteur || "").localeCompare(b.auteur || "", "fr"));
    if (v.tri === "annee") l.sort((a, b) => nb(a.annee) - nb(b.annee));
    return l;
  }
  function refHtml(r, style, esc) {
    const titre = r.lien ? `<a href="${esc(r.lien)}"><cite>${esc(r.titre)}</cite></a>` : `<cite>${esc(r.titre)}</cite>`;
    if (style === "titre") return `${titre}${r.auteur ? `, de ${esc(r.auteur)}` : ""}${r.annee ? ` (${esc(r.annee)})` : ""}${r.editeur ? `, ${esc(r.editeur)}` : ""}.`;
    return [r.auteur ? esc(r.auteur) : "", titre, r.editeur ? esc(r.editeur) : "", r.annee ? esc(r.annee) : ""].filter(Boolean).join(", ") + ".";
  }
  function refTexte(r, style) {
    const titre = `*${r.titre}*`;
    const s = style === "titre" ? `${titre}${r.auteur ? `, de ${r.auteur}` : ""}${r.annee ? ` (${r.annee})` : ""}${r.editeur ? `, ${r.editeur}` : ""}.` : [r.auteur, titre, r.editeur, r.annee].filter(Boolean).join(", ") + ".";
    return s + (r.lien ? ` <${r.lien}>` : "");
  }
})();
