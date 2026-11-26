# Mamie Commune — guide pour Claude

Site statique de ressources anarchistes, en français : révolutions, antifascisme, bibliothèque (livres complets + fiches), carte des lieux, vidéos, outils numériques. Publié sur GitHub Pages par `.github/workflows/publier.yml` à chaque envoi sur `main`.

La personne qui tient le site n'est pas développeuse : réponds en français simple, montre le résultat, et propose d'envoyer (commit + push) une fois qu'elle a validé.

Site en ligne : https://mamiecommune.org (hébergement IONOS Web Plus) · copie : https://mamie-commune.github.io · dépôt : `mamie-commune/mamie-commune.github.io`.

Chaque envoi sur `main` publie aux deux endroits (`.github/workflows/publier.yml`) : GitHub Pages, et IONOS par SFTP avec les secrets `IONOS_HOTE`, `IONOS_UTILISATEUR`, `IONOS_MOT_DE_PASSE` et la variable `IONOS_DOSSIER`. Ne jamais écrire ces accès dans le dépôt ni les demander en clair : la personne les saisit elle-même dans GitHub. Réglages Apache d'IONOS (HTTPS, sans www, cache) : `.htaccess` à la racine.

## Consignes permanentes (à relire avant chaque mission)

Ces principes valent pour toutes les missions. Les règles pratiques plus bas (droits, images, outils, carte, confidentialité) en sont l'application détaillée : en cas de doute, c'est la règle la plus prudente qui s'applique.

### 1. Présentation

Mamie Commune est une boîte à outils libertaire, une bibliothèque populaire et un espace d'éducation populaire. Le but est de rendre accessibles les savoirs, les expériences historiques et les outils nécessaires à l'autonomie collective.

Le projet est organisé en six espaces : **Apprendre, S'organiser, S'entraider, Se défendre, Créer, Trouver des alliés** (les six tiroirs de `$familles`, voir « Organisation du site » plus bas ; le menu principal en sept entrées les regroupe autrement, voir « Navigation principale »).

### 2. Orientation éditoriale

Le projet assume une orientation libertaire. Principes de référence : autonomie, autogestion, entraide, fédéralisme, démocratie directe, éducation populaire, antiautoritarisme, émancipation collective, libre partage des savoirs.

**Ligne radicale (consigne permanente, novembre 2026).** Mamie n'est pas neutre : le site parle depuis un point de vue franchement libertaire et radical. Il est contre l'État, le capital, le patriarcat, le racisme et le colonialisme, la police et les prisons ; il est pour l'autogestion, l'action directe, l'entraide et la démocratie directe.
- Les mots sont directs : exploitation, domination, répression, bourgeoisie, patronat. Pas de faux équilibre « d'un côté, de l'autre » entre les gens qui luttent et ceux qui les écrasent.
- Le léninisme, le stalinisme, la social-démocratie et le réformisme sont critiqués depuis une position anarchiste, sans tiédeur. Les dossiers sur d'autres courants (Famille 2 de l'Encyclopédie…) disent clairement ce que les libertaires leur reprochent.
- La radicalité ne remplace jamais l'exactitude : faits vérifiés et sourcés, aucune citation inventée. Les désaccords internes au mouvement libertaire restent exposés honnêtement. Pas d'appel à blesser des personnes, pas de mode d'emploi illégal détaillé.

- Ne pas transformer le site en propagande caricaturale : radical ne veut pas dire faux ni simpliste.
- Ne pas présenter tous les courants libertaires comme identiques.
- Exposer les divergences, les débats et les contradictions historiques.
- Le site doit rester accessible aux personnes qui découvrent ces idées.

### 3. Aucune intelligence artificielle dans le site

Aucune IA générative ne doit être intégrée au site. Interdits : API de génération de texte, chatbot, rédaction automatique, résumé automatique par IA, génération automatique de décisions ou de stratégies, analyse automatisée des opinions politiques.

Les outils reposent exclusivement sur des formulaires, des modèles prédéfinis, des champs personnalisables, des listes de choix, des calculs simples, une mise en page dynamique, des exports et des sauvegardes locales. **La personne qui utilise l'outil écrit, choisit et décide.**

### 4. Confidentialité

- Aucun compte obligatoire, aucune publicité, aucun traqueur publicitaire, aucune collecte superflue.
- Aucun envoi des champs remplis dans les outils.
- Aucun stockage automatique non expliqué (tout ce qui est gardé dans le navigateur est listé dans `confidentialite.html`).
- Priorité au traitement local, protection des informations sensibles, pas d'adresse privée sur la carte.
- Les contributions sont vérifiées avant publication.

### 5. Technologies

Avant toute modification, étudier les technologies déjà utilisées (site statique généré par `_src/build.ps1`, HTML, CSS et JavaScript écrits à la main, plus quelques bibliothèques libres copiées dans `assets/vendor/` : Leaflet pour la carte, pdf.js pour le lecteur ; rien n'est chargé depuis un autre site). Ne pas remplacer une technologie qui fonctionne sans raison. Privilégier : logiciels libres, formats ouverts, standards web, architecture simple, composants réutilisables, performance, accessibilité, compatibilité mobile, fonctionnement hors ligne.

### 6. Contenus

- Ne jamais inventer une source ou une citation.
- Chaque ressource comporte autant que possible : titre, auteur, date, type de source, nature de la source, langue, licence, lien original, date de vérification.
- Distinguer faits, analyses, témoignages et opinions.
- Ne pas republier d'œuvres protégées sans autorisation.

### 7. Identité graphique

Mamie Commune doit évoquer une bibliothèque populaire, un infokiosque, un journal militant, un atelier collectif, une culture graphique issue des affiches, des tracts photocopiés et des fanzines (direction « imprimerie militante » décrite dans « Direction artistique »).

À éviter : design corporate, interface SaaS générique, surenchère de symboles politiques, décoration inutile, animations excessives. **La lisibilité prime sur la décoration.**

### 8. Méthode de travail

Travailler par missions successives.

Avant de modifier : 1. examiner l'existant ; 2. identifier les dépendances ; 3. comprendre les conséquences ; 4. préserver les données ; 5. proposer une approche (et attendre l'accord).

Après chaque mission : 1. tester les fonctionnalités ; 2. vérifier les pages ; 3. contrôler les erreurs ; 4. vérifier le mobile ; 5. documenter les changements.

- Ne jamais prétendre avoir testé quelque chose qui ne l'a pas été.
- Ne jamais supprimer une fonctionnalité sans validation.

### 9. Principe général

Mamie Commune est un outil mis à disposition de celles et ceux qui veulent apprendre, s'organiser, s'entraider, se défendre et créer. Le site ne décide pas à leur place : il leur donne des ressources et des moyens pour agir ensemble.

## Raccourcis (`.claude/skills/`)

- `/ajouter-video <adresse TikTok>` : nouvelle publication TikTok.
- `/ajouter-lieu <nom, ville>` : lieu ou collectif sur la carte.
- `/ajouter-page <sujet>` : fiche de lecture, dossier, page antifascisme, guide.
- `/ajouter-ressource <adresse>` : fiche du Centre de ressources (bibliothèque documentaire).
- `/publier` : régénérer, vérifier, envoyer, suivre la mise en ligne.

La personne peut aussi demander en phrases normales : utilise le raccourci qui correspond.

## Depuis le web (claude.ai/code) ou un autre ordinateur

La publication sur GitHub (`.github/workflows/publier.yml`) **régénère toutes les pages** sur une machine Windows. Donc, sans PowerShell (session web, Linux, Mac) : modifier les sources (`_src/`, `data/`, `assets/`), commit, push sur `main`, et c'est en ligne en 2 à 3 minutes. Seuls les PDF des livres (`_src/pdf.ps1`, besoin de Windows + Edge) doivent être faits en local.

## Règle d'or

**Les pages HTML du site sont générées. Ne jamais les modifier à la main.** On modifie les sources dans `_src/` (ou les fichiers de données listés plus bas), puis on régénère :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1
```

Le script affiche par exemple `OK : 9 guides, 107 fiches, 37 livres et 31 pages de dossiers générés.` Toute autre sortie est une erreur à corriger avant d'envoyer.

## Où se trouve quoi

| Je veux changer… | Fichier source | Régénérer ? |
|---|---|---|
| L'en-tête, le menu, le pied de page | `_src/layout.html` (menu : liste `$navItems` dans `_src/build.ps1`) | oui |
| L'accueil et les pages d'index | `_src/pages/*.html` (`index.html`, `carte.html`, `videos.html`, `mentions-legales.html`, `recherche.html`, `404.html` (page introuvable), `lecteur.html`, et `guides.html` / `bibliotheque.html` / `experiences.html` / `antifascisme.html` qui deviennent les `index.html` des dossiers) | oui |
| Un dossier Histoires de luttes, ancienne rubrique « Révolutions », adresses en `experiences/` (Commune, Makhno, Espagne 1936, Black Panthers, Mai 68, Stonewall et FHAR, MLAC, zapatistes, ZAD, Rojava, Gilets jaunes). L'ordre des fichiers suit la chronologie (`0z-makhno`, `1z1-panthers`, `2z-zad`… : PowerShell trie les noms en ignorant les tirets) | `_src/experiences/*.txt` | oui |
| Une page Antifascisme | `_src/antifascisme/*.txt` | oui |
| Une fiche du Guide de manif | `_src/manif/*.txt`. La **catégorie** de la fiche est sa sous-rubrique (« Legal Team »…) : pour une **nouvelle sous-rubrique** (premiers secours, préparation, après la manif…), créer un fichier `_src/manif/2-nom.txt` avec une nouvelle catégorie, le filtre apparaît tout seul. Toujours préciser le pays quand c'est du droit (la fiche Legal Team est du droit **français**). Les modèles de lettres pour contester un PV sont dans `_src/textes/modeles-pv/` ; les PDF (`manif/modeles/`) se refont avec `powershell -ExecutionPolicy Bypass -File _src/modeles-pv.ps1` (Windows + Edge, en local) | oui |
| Un portrait des Figures de l'anarchisme (penseuses, penseurs, militantes, militants) | `_src/figures/*.txt` (même format que les fiches ; catégories « Penser l'anarchie », « Femmes en lutte », « Syndicalistes et journalistes », « Révolutionnaires »). Photo d'époque dans `assets/img/revolutions/figure-*.jpg` (via `_src/images-revolutions.ps1`, crédit dans `credits.txt`), sections vie / idées / zones d'ombre / à lire / sources. |
| Une fiche Agir ensemble (AG, collectif, caisse, grève, lycée, tract, affiches) | `_src/agir/*.txt` (la catégorie = la sous-rubrique : « Décider ensemble », « Monter un collectif », « Faire grève », « Faire passer le message », « Prendre soin du collectif », « Lutter au lycée ») ; page d'index `_src/pages/agir.html` | oui |
| Les affiches et tracts à imprimer | `_src/affiches/*.html` (A4, style dans `affiche.css`, lettres de rançon par `rancon.js`), puis `powershell -ExecutionPolicy Bypass -File _src/affiches.ps1` (Windows + Edge, en local) qui fabrique `agir/affiches/<nom>.pdf` et l'aperçu `.png` ; les présenter dans la fiche `affiches-et-tracts` de `_src/agir/3-diffuser.txt`. Ces fichiers sont envoyés avec le reste | non |
| « À la une » de l'accueil et dates des pages | automatiques : `_src/build.ps1` note la date d'arrivée de chaque nouvelle page dans `_src/textes/apparitions.txt` ; elle s'affiche en haut de la page (« Ajouté le… ») et `{{NOUVEAUTES}}` montre la plus récente en grand puis le fil des sept suivantes (une seule entrée par dossier d'Histoires de luttes). Les « Parcours » de l'accueil sont écrits à la main dans `_src/pages/index.html` | oui |
| Un dossier de l'Encyclopédie des mouvements (`encyclopedie/`) | `_src/encyclopedie/*.txt` (trois pages par mouvement) et `_src/encyclopedie/familles.json` (les sept familles). Voir « Encyclopédie des mouvements » plus bas | oui |
| Une fiche de lecture | `_src/bibliotheque/*.txt` | oui |
| Un parcours de l’Université populaire (`universite/`) | `_src/universite/*.txt` (même format que les fiches ; catégories « Les idées », « L’histoire », « Les pratiques » ; sections présentation, objectifs, modules `<ol class="parcours-modules">`, textes de référence, archives, vidéos, glossaire `<p class="parcours-mots">`, questions `<ol class="parcours-questions">`, bibliographie, sources). Page d’accueil `_src/pages/universite.html`. Les modules renvoient vers les pages déjà sourcées du site ; bibliographie : seulement des références vérifiées (reprises des dossiers du site). Pas de compte ni de points ; depuis novembre 2026, chaque module se coche « fait » (progression gardée dans le navigateur, clé `mamie-parcours:<page>`, code à la fin de `assets/site.js`), avec « Imprimer le parcours » et « Mettre le parcours et ses lectures dans mon dossier ». Parcours ajoutés en novembre 2026 (L'histoire) : Histoire de la CNT, Makhnovtchina, Expériences zapatistes, Communes et expériences révolutionnaires, Culture et histoire des ZAD ; chacun a un module ou une question sur les débats internes | oui |
| La chronologie de l’Université populaire | `_src/universite/chronologie.json` (date AAAA, AAAA-MM ou AAAA-MM-JJ, `quand`, `theme`, `titre`, `texte`, `lien`, `source` [titre, adresse] obligatoire). Page `_src/universite/chronologie.html`, script `assets/chronologie.js`, données générées `data/chronologie.js`. Chaque date doit être vérifiée (dossier du site ou source de référence) | oui |
| Une fiche du Centre de ressources (archive, brochure, article, podcast, site, logiciel, guide… avec lien vers la source originale) | `_src/ressources/*.json` (mode d'emploi, champs et vocabulaire dans `_src/ressources/LISEZMOI.md`, modèle `_modele.json`). Génère `ressources/<id>.html`, la page `ressources/` (recherche à filtres, `assets/ressources.js`) et `data/ressources.js`. Ne jamais inventer de référence ni résumer ce qu'on n'a pas lu : le champ `consultation` dit ce qui a été lu | oui |
| Un guide Outils numériques | `_src/guides/*.txt` | oui |
| Un livre complet (texte du domaine public) | source `.muse` dans `_src/textes/sources/` + une ligne dans `_src/textes/livres.txt` | oui, puis PDF (voir plus bas) |
| Un livre fourni en PDF | le PDF dans `livres/pdf/` + une ligne dans `_src/textes/livres-pdf.txt` (seulement avec l'accord des ayants droit). Un livre sous droits qu'on ne copie pas (Éditions Divergences sur Calaméo) : même ligne, avec deux colonnes en plus, l'adresse où le lire et le texte du bouton | oui |
| Une structure sur la carte | `data/lieux.geojson` (une structure par ligne ; voir « Données de la carte » et `/ajouter-lieu`) | oui (génère `data/lieux.js`) |
| Une vidéo TikTok | `data/videos.js` (une ligne par publication) | non |
| Les couleurs, polices, mise en page | `assets/style.css` | non |
| Les lettres de rançon, le menu mobile | `assets/site.js` | non |
| La barre de recherche (en haut) et la page `recherche.html` | `assets/recherche.js` ; l'index `data/recherche.js` est refait à chaque régénération (titres, résumés, intertitres, début des textes) et les lieux viennent de `data/lieux.js` | oui pour l'index |

Fichiers générés (ne pas modifier) : `index.html`, `carte.html`, `videos.html`, `commencer.html` (Par où commencer ?), `rejoindre.html` (Rejoins la bande), les six pages de tiroir (`apprendre.html`, `s-organiser.html`, `s-entraider.html`, `se-defendre.html`, `creer.html`, `trouver-des-allies.html`), `glossaire.html`, `recherche.html`, `404.html`, `partage.html` (renvoi vers le guide Signal), `lecteur.html`, `mentions-legales.html` à la racine, tout `guides/`, `bibliotheque/`, `ressources/`, `experiences/`, `antifascisme/`, `manif/`, `agir/`, `livres/*.html`, et `data/guides.js`, `data/bibliotheque.js`, `data/livres.js`, `data/experiences.js`, `data/antifascisme.js`.

## Mise en ligne publique (novembre 2026)

- `_src/build.ps1` écrit `sitemap.xml` (toutes les pages publiques, adresses propres, sauf 404, sans-connexion, renvois, lecteur, packs et fichiers commençant par `_`) et `robots.txt`. L'aperçu au partage (`og:image` = `assets/mamie-logo-1080.png`, `twitter:card`) est dans `_src/layout.html`.
- **Mentions légales** (`_src/pages/mentions-legales.html`) : éditeur anonyme non professionnel (LCEN art. 6-III-2, identité donnée à IONOS), contact par message privé Instagram ou TikTok **seulement** (pas d'adresse mail, choix de la personne), personnage de Mamie créé par la bande, libre de reproduction militante non commerciale. Toute nouvelle source de contenu (film, son, image, données) ou nouveau service extérieur s'y ajoute, et dans `confidentialite.html`.

## Adresses propres

Dans les sources, on écrit les liens normalement (`page.html`, `dossier/index.html`). À la génération, `_src/build.ps1` (`Clean-Links`) les transforme en `page` et `dossier/` : les adresses publiques n'ont ni `.html` ni `index.html`. Sur IONOS, `.htaccess` sert `page.html` pour `/page` et redirige les anciennes adresses en `.html`. Dans le JavaScript (`assets/*.js`, `data/videos.js`), écrire directement les liens sans `.html`. Une page supprimée garde un renvoi : règle dans `.htaccess` + petite page de renvoi générée dans `build.ps1` (exemple : `partage` → `guides/signal`).

## Sélection de la bande selon l'actualité (accueil)

La section « La sélection de la bande » de l'accueil suit l'actualité française, **sans intelligence artificielle** :
- `_src/actualite/themes.json` : les flux de presse lus (franceinfo, Reporterre, Rapports de force, Basta!, Politis, L'Humanité), et une douzaine de thèmes écrits par la bande. Chaque thème a une liste de mots (sans accents ni majuscules ; `grev*` attrape grève, grévistes…) et des pages du site avec leur titre, leur phrase et un mot de Mamie. Plus « defaut » : les trois cartes quand l'actualité ne donne rien.
- `_src/actualite.ps1` lit les titres des sept derniers jours, compte pour chaque thème les titres qui contiennent un de ses mots, et écrit `data/actualite.json` (thèmes les plus cités, trois titres d'exemple chacun). Il ne réécrit le fichier que si les trois premiers thèmes changent, ou tous les trois jours.
- Le workflow `actualite.yml` le lance **chaque matin** (5 h 20 UTC) et republie le site si ça a changé ; à la main : `gh workflow run actualite.yml`.
- `_src/build.ps1` fabrique `{{SELECTION}}` : une carte par thème (première page pas encore prise), complétée par « defaut », l'étiquette « Dans l'actu », et le dépliant « Les titres qui ont guidé ce choix ». Un fichier de plus de 10 jours est ignoré.
- Pour régler : retirer un mot trop large (« policier » attrape tous les faits divers), ajouter un thème, changer les pages. Toujours des pages qui existent : le générateur avertit sinon.

## Carte du mouvement du 17 Octobre

Page `mouvement-17-octobre` (source `_src/pages/mouvement-17-octobre.html`, script `assets/mobilisations.js`). Les données (`data/mobilisations.js`) sont **recopiées** de https://17octobregiletjaune.net/carte/ par `_src/mobilisations.ps1` : ne jamais les modifier à la main. Le workflow `mobilisations.yml` les met à jour **toutes les heures** et republie le site s'il y a du nouveau ; à la main : `gh workflow run mobilisations.yml`. Pour ajouter une mobilisation, c'est sur leur carte, pas chez nous.

## Images des dossiers

Les photos des dossiers Histoires de luttes sont dans `assets/img/revolutions/`, avec auteur, licence et source dans `credits.txt`. Elles viennent toutes de **Wikimedia Commons** : documents d'époque dans le domaine public, ou photos de reportage sous licence libre (CC0, CC BY, CC BY-SA). **Jamais d'image générée par IA, ni de photo colorisée** (demande expresse). Chaque image a une légende et un crédit (auteur · licence · lien Commons) : `<figure class="photo">` (`photo photo--portrait` pour une image en hauteur). Pour en ajouter : compléter la liste dans `_src/images-revolutions.ps1` et le relancer.

## Renvois entre les rubriques (novembre 2026)

- **Automatiques**, calculés par `_src/build.ps1` (fonctions `Renvois-Html` et `Lieux-De`, juste avant `Build-Collection`) : toute page citée par un parcours de `_src/universite/*.txt` reçoit l'encadré « Dans l'université populaire » ; toute page citée dans les `liens` d'une lecture de `_src/audio/catalogue.json` reçoit « À écouter » ; toute fiche du centre de ressources citée dans les `ressources` d'une structure de `data/lieux.geojson` reçoit « Sur la carte des collectifs ». Ça vaut pour les collections (histoires de luttes, fiches, portraits, encyclopédie, guides…), les livres complets et les fiches de ressources : il suffit d'écrire le lien dans le parcours, la lecture ou la structure.
- **Fiches d'archives** : « montré dans » (les pages) et les parcours qui passent par ces pages. **Photos des dossiers** : lien « fiche d'archive ». **Carte** : chaque catégorie propose ses lectures dans `RES_CAT` de `assets/carte.js` (parcours, archives, audio), sans doublon avec les `ressources` de la structure.
- **Vers « Mon dossier »** : bouton sous le titre de chaque fiche, et bouton du suivi des modules pour un parcours entier.
- Après une modification d'un script de `assets/`, vérifier la syntaxe : `node --check assets/<fichier>.js`.

## Graphe des luttes (`graphe/`, novembre 2026)
- Données : `_src/graphe/graphe.json` (éléments, relations, références, parcours), documentées dans `_src/graphe/LISEZMOI.md`. Application : `_src/pages/graphe.html` + `assets/graphe.js` (SVG, sans bibliothèque). Le build fabrique `data/graphe.js`, une fiche par élément (`graphe/<id>.html`, type « Fiche du graphe », dans la recherche et Mon dossier) et un renvoi « Dans le graphe des luttes » sur chaque page du site citée.
- **Le build refuse de générer le site** si une relation n'a pas de source, de texte ou de statut (fait, interpretation, controverse, hypothese), si un identifiant ou une référence est inconnu, ou si une page citée n'existe pas.
- Jamais de relation par simple proximité chronologique ; une interprétation nomme son historienne ou son historien ; une référence n'entre dans `references` qu'après vérification.
- Favoris et parcours personnels : clé `mamie-graphe` du navigateur (listée dans Confidentialité), versés dans Mon dossier. Signalements : le formulaire prépare un message pour la bande (Instagram ou TikTok), rien n'est envoyé.
- À venir (pas commencé) : le comparateur des courants et l'atelier d'argumentation, qui se brancheront sur les mêmes identifiants.

## Archives historiques (`archives/`, novembre 2026)

- Une **fiche documentaire par image d'archive** du site (`assets/img/revolutions/`) : titre, date, autrice ou auteur, type (photographie, portrait, affiche, tract, journal, document, gravure), mouvement, territoire, provenance, source vérifiable (notice Wikimedia Commons), statut juridique, description accessible (le texte alternatif), contexte (notre légende et les pages où le document est montré), transcription quand elle existe.
- Fabriquées par `node _src/archives.mjs` (à relancer après tout ajout dans `credits.txt`) dans `_src/archives/archives.json`, à partir de `credits.txt`, des légendes des pages et de la date relevée sur Commons. **Rien n'est inventé** : date absente → « inconnue » ; date seulement dans notre légende, approximative, ou différente de celle de Commons → avertissement « à vérifier » sur la fiche ; territoire introuvable → « non précisé ». Corrections à la main (transcription d'une affiche, date vérifiée) dans `_src/archives/corrections.json`, appliquées par le script.
- Pages générées par `_src/build.ps1` : `archives/<id>.html` et `archives/index.html` (filtres période, territoire, mouvement, type, tri par date : `assets/archives.js`, adresse partageable `archives?mouvement=…`). `Render-Page` ajoute « fiche d'archive » au crédit de chaque `figure.photo` du site. Jamais d'image d'illustration présentée comme une archive.

## Format des pages (`_src/experiences`, `_src/antifascisme`, `_src/bibliotheque`, `_src/guides`)

Chaque page commence par une ligne d'en-tête, puis du HTML :

```
=== identifiant-de-page | Catégorie | Titre | Signature · année | Résumé en une phrase.
<p>Introduction…</p>
<h2 id="contexte">Contexte</h2>
<p>…</p>
```

- `identifiant-de-page` devient le nom du fichier (`identifiant-de-page.html`) : minuscules, tirets, pas d'accents. Ne pas renommer une page existante (cela casse les liens).
- La catégorie sert aux filtres. Thèmes existants de la bibliothèque : État & pouvoir, Économie & propriété, Révolution & stratégie, Action directe & syndicalisme, Individu & morale, Féminisme & société, Histoire & luttes, Antifascisme.
- Pour les guides, il n'y a pas de signature : `=== slug | Catégorie | Titre | Résumé`.
- Chaque `<h2>` doit avoir un `id` : il alimente le sommaire à droite.
- Liens entre pages : chemins relatifs (`../bibliotheque/au-cafe.html`, `extreme-droite-familles.html`). Jamais de lien absolu vers le site lui-même.
- L'ordre des fichiers (`1-…`, `2-…`) fixe l'ordre des pages et les liens « précédent / suivant ».

Éléments de mise en page disponibles dans ces pages :
- `<div class="note"><p>…</p></div>` : encadré jaune.
- `<div class="tbl"><table>…</table></div>` : tableau.
- `<ol class="timeline"><li><b>1871</b><span>…</span></li></ol>` : frise chronologique.
- `<ol class="principes"><li><b>Servir</b>et non se servir</li></ol>` : principes en cartes.
- `<figure class="schema"><div class="schema__scroll"><svg viewBox="0 0 720 …">…</svg></div><figcaption><b>Schéma 1.</b> …</figcaption></figure>` : schéma. Classes SVG : `bx` (boîte), `bx-r` (boîte rose), `bx-d` (pointillés), `t` (texte), `tb` (gros titre), `s` (petit texte), `sr` (étiquette rouge), `ar` (flèche rouge, avec un `<marker>` dont l'id est unique dans la page), `ln` (ligne), `ld` (ligne pointillée).
- `<figure class="horde"><a href="…jpg"><img …></a><figcaption>…</figcaption></figure>` : grande image cliquable (schémas de La Horde).
- `<blockquote><p>« … »</p></blockquote>` : courte citation en bande noire (textes du domaine public, mot pour mot, ou bien on reformule sans guillemets).

### Sources (obligatoire en fin de page)

Toutes les fiches, pages de dossiers, pages Antifascisme, fiches manif et guides se terminent par :

```html
<h2 id="sources">Sources et pour aller plus loin</h2>
<div class="ressources">
<section><h3>Lire</h3><ul>
<li><b><cite>Titre du livre</cite></b>, Autrice ou Auteur, Éditeur, année.<span>Pourquoi le lire, en une phrase.</span></li>
<li><a href="autre-fiche.html">Une fiche du site</a><span>…</span></li>
</ul></section>
<section><h3>Regarder</h3><ul>…</ul></section>
<section><h3>Sur le web</h3><ul><li><a href="https://…" rel="noopener">Nom du site</a><span>…</span></li></ul></section>
</div>
```

- Chaque carte (`section`) a un titre court (`Lire`, `Regarder`, `Sur le web`, `Sites officiels`, `Se faire aider`…). Les guides numériques utilisent le titre « Liens utiles et pour aller plus loin » et une carte « Source » vers Libérons nos ordis.
- **Vérifier chaque lien externe** avant de le mettre (il répond et c'est la bonne page). Wikipédia : vérifier le titre exact de l'article. Ne citer un livre (éditeur, année) que si l'on en est sûr ; jamais de référence inventée.
- Fiches de lecture : la carte **« Le texte original »** est ajoutée toute seule par `_src/build.ps1` en tête du bloc (notre livre complet s'il existe, et l'adresse du texte sur la Bibliothèque anarchiste lue dans `_src/textes/originaux.txt`, une ligne `identifiant-de-fiche=adresse` vérifiée). Pour une nouvelle fiche, ajouter sa ligne.
- Plan des fiches de lecture : Contexte, La thèse, Les idées, Débats et limites (y compris les zones d'ombre des auteurs), Et aujourd'hui ?, À retenir, Sources.

## Encyclopédie des mouvements (`encyclopedie/`, novembre 2026)

Une encyclopédie populaire des mouvements politiques et sociaux, rangée dans le tiroir Apprendre et sous l'entrée « Bibliothèque » du menu (lien « Encyclopédie des mouvements » du menu déroulant, à la place de « Centre de ressources », qui reste dans la page Bibliothèque).

- **Familles** : `_src/encyclopedie/familles.json` (mode d'emploi dans le champ `_lisezmoi`). Sept familles, chacune avec sa page générée `encyclopedie/<id>.html` : présentation, mouvements, « Déjà sur le site ». Un mouvement sans dossier s'affiche « Dossier en préparation », sans lien (pas de rubrique fictive), avec au besoin un renvoi `voir` vers une page existante.
- **Dossiers** : `_src/encyclopedie/<n>-<mouvement>.txt`, même format que les Histoires de luttes. La **catégorie** de chaque page est le nom exact du mouvement dans `familles.json`. Trois pages dans l'ordre : histoire et origines (`<mouvement>-histoire`), idées et théories (`-idees`), expériences et héritages (`-heritages`). Le nom de chaque onglet se fixe par `<!-- onglet : … -->` en première ligne du texte ; le découpage s'adapte au sujet.
- **Navigation** : barre « 1 · 2 · 3 » (`.dossier-nav`) en haut de chaque page du dossier. **Renvois automatiques** : toute fiche, portrait, lutte, parcours, page antifascisme, fiche agir/manif ou guide vers lequel un dossier fait un lien reçoit en bas un encadré « Dans l'encyclopédie des mouvements » (`.ency-renvoi`). Il suffit donc d'écrire le lien dans le dossier.
- **Accueil** : `_src/pages/encyclopedie.html` (`{{ENCY_FAMILLES}}`, `{{NB_ENCY}}`), filtres par famille (`data/encyclopedie.js`, `window.ENCYCLOPEDIE`). Les pages entrent dans la recherche.
- **Méthode demandée** : un dossier à la fois, terminé et vérifié avant le suivant (ordre : Anarchisme, puis Communisme libertaire après validation, puis Socialisme et Marxisme, puis les familles). Dossiers substantiels (organisations, journaux, congrès, scissions, débats, figures, dimension internationale : Afrique, Asie, Amériques, Moyen-Orient, mouvements autochtones), faits distingués des interprétations, échecs et contradictions présentés, aucune référence inventée. Chaque page porte `<p class="doc__relire">` « à relire par la bande » tant qu'une deuxième personne ne l'a pas relue.

## Données de la carte (`data/lieux.geojson`)

La source est `data/lieux.geojson` : **une structure par ligne** (GeoJSON `Feature`, longitude puis latitude), téléchargeable telle quelle depuis la carte (données publiques, ODbL). `_src/build.ps1` en tire `data/lieux.js` (ne pas le modifier à la main) et contrôle chaque fiche : catégorie connue, champs remplis, identifiant unique, doublon probable (même nom, même département), date de vérification, et alerte sur un numéro de portable ou une adresse de rue. Mode d'emploi complet, modèle de ligne et règles de protection : `.claude/skills/ajouter-lieu/SKILL.md` (`/ajouter-lieu`).

- Champs : `id`, `nom`, `categorie`, `organisation`, `ville`, `departement`, `pays`, `portee` (`local`, ou `national` sans point sur la carte avec un lien `annuaire` vers l'annuaire local officiel), `description`, `site`, `contact` (seulement un contact publié par la structure), `source`, `sourceUrl`, `verifie` (AAAA-MM-JJ), `etat` (`a-jour` ou `a-reverifier`), `note`, `ressources`.
- Catégories (`$catLieux` dans `build.ps1`) : `libertaire`, `syndicat`, `association`, `antifa`, `librairie` (libertaires et indépendantes), `lieu` (lieux autogérés), `cooperative`, `centre-social`, `feministe`, `antiraciste`, `media`, `solidarite`, et depuis novembre 2026 (carte de l'autonomie) `infokiosque`, `bibliotheque`, `cantine`, `radio`, `imprimerie`, `atelier`. Une catégorie sans fiche n'est pas proposée sur la carte. Les anciens liens `carte?type=fa`, `ucl`, `numerique` restent valides.
- Champs facultatifs : `specialites` (étiquettes), `activites`, `horaires` (publiés par la structure seulement), `accueil`. Filtre par **région** (`carte?reg=bretagne`, découpage de 2016 dans `REG` de `assets/carte.js`), combinable avec catégories, département et recherche. Exports de la sélection : GeoJSON, CSV (avec la région), **carnet d'adresses HTML** autonome (lisible hors ligne) et **carnet à imprimer en PDF** (fenêtre d'impression du navigateur) ; jamais de coordonnées GPS dans les carnets. Le signalement propose aussi « Proposer une modification ».
- La carte (`assets/carte.js`) : recherche par nom, ville ou département écrit, liste des départements, filtres par catégorie, case « masquer les fiches à revérifier », fiche (site, contact public, annuaire, source, « Vérifiée le… » ou « À revérifier » / « Informations anciennes » au-delà de 12 mois, liens du site), export GeoJSON et CSV de la sélection. Adresses partageables : `carte?q=`, `carte?dep=35`, `carte?type=syndicat,lieu`.
- **Proposition** et **signalement** : deux formulaires qui préparent un message (texte à copier ou fichier `.json`) à envoyer par message privé Instagram ou TikTok. Rien n'est envoyé ni enregistré, rien n'est publié sans vérification. Le placement d'une proposition est arrondi au kilomètre ; le bouton « Placer » interroge la Base Adresse Nationale (service public) avec le nom de la ville seulement.
- **Protection** : jamais de domicile, de coordonnée personnelle, de localisation de personnes ni d'information exposant des militantes et militants. Position au niveau de la ville. Un signalement « information dangereuse » se traite immédiatement.

## Vidéos (`data/videos.js`)

**Affichage.** Vignettes compactes dessinées en local (`assets/videos.js`) : 8 sur la page Vidéos puis « Voir les plus anciennes », 4 sur l'accueil (`data-limit`). Un clic ouvre le lecteur TikTok dans la grande fenêtre de lecture, en vertical.

Copier une ligne, changer `id` (le nombre à la fin de l'adresse TikTok), `type` (`video` ou `photo`), `date`, `titre`, `vues`, `texte`, `tags`, et éventuellement `lien` vers une page du site. Le lecteur utilisé après le clic est `https://www.tiktok.com/player/v1/<id>` (dans `assets/videos.js`) : l'ancien `embed/v2` donnait des écrans noirs.

Le documentaire *Les Damnés de la Commune* est dans `_src/pages/videos.html`. Le fichier `.mp4` (1,7 Go) n'est **pas** dans le dépôt. Il est rangé dans la release GitHub `film`, et copié sur IONOS dans `films/` par le workflow `film-ionos.yml` : c'est cette copie que lit le site (`data-src="films/…"`), car GitHub sert les films comme des fichiers binaires que les téléphones refusent de lire. La release reste en secours (`data-secours`). Pour un autre film : `gh release upload film <fichier.mp4>` (2 Go maximum, nom sans espaces ni accents, vidéo H.264 + son AAC), puis `gh workflow run film-ionos.yml`, puis une nouvelle fiche `.doc` sur le même modèle. Une série en plusieurs épisodes (modèle : *Ni Dieu ni maître*, fichiers `ni-dieu-ni-maitre-1.mp4`…) garde une affiche qui lance le premier épisode, plus une liste `<ol class="doc__eps">` avec un `<button class="doc__ep" data-src data-secours>` par épisode. La publication normale ne touche jamais au dossier `films/` d'IONOS. Ne jamais nommer un dossier comme une page (`videos/` casserait la page `/videos`). Ne jamais ajouter de `.mp4` au dépôt.

**Catalogue « Films et documentaires »** (section `#documentaires` de `_src/pages/videos.html`, novembre 2026) : un rayon de jaquettes dans `<div class="catalogue">`, filtré par genre et par thème (`assets/videos.js`). Chaque film est un `<article class="doc" id="…" data-type="documentaire|serie|fiction" data-themes="…">` : jaquette (`.doc__poster` avec la photo `.doc__photo` — vignette `assets/yt/<id>.jpg` pour YouTube, sinon une image d'archive créditée de `assets/img/revolutions/` et une ligne `.doc__credit` —, l'étiquette de langue `.doc__langue` « VF », « VOST FR »…), étiquettes, titre `<h3>`, bouton `.doc__regarder`, puis tout le texte dans `<details class="doc__fiche"><summary>La fiche du film</summary>…</details>`. Un nouveau thème = un bouton `data-theme` de plus dans `.catalogue__outils`. L'adresse `videos#<id>` ouvre la fiche. Sous-titres traduits automatiquement par YouTube : `data-sous-titres="fr"` et `data-sous-titres-source="<langue de la piste à traduire>"` sur l'affiche (bouton **ST** du lecteur, touche C).

**Vidéos YouTube** (chargées seulement au clic, lecteur youtube-nocookie) :
- un documentaire en grand : une fiche `<article class="doc">` (modèle : *ANTIFA, chasseurs de skins* dans `_src/pages/videos.html`) avec `data-embed="https://www.youtube-nocookie.com/embed/<id>?autoplay=1&amp;rel=0"` sur le bouton `.doc__poster` (ajouter `doc__poster--noir` pour une affiche noire). La page doit charger `assets/videos.js`.
- une série de vidéos dans une page (dossier, fiche) : un bloc `<div class="ytwall">` de cartes `<figure class="yt">` (modèle : section « En vidéo » de `_src/experiences/2-zapatistes.txt`). Marche sur toutes les pages (code dans `assets/site.js`).
- `<id>` = les 11 caractères après `v=` ou `youtu.be/`. Pour une playlist, lire la liste des vidéos sur sa page YouTube et faire une carte par vidéo.
- Les miniatures sont téléchargées toutes seules par `_src/build.ps1` dans `assets/yt/<id>.jpg` (en local comme lors de la publication) et affichées en noir et blanc, en couleur au survol.
- Toutes les vidéos YouTube et les films s'ouvrent dans le lecteur en grand (`window.mamiePlayer` dans `assets/site.js`). C'est un **lecteur maison** aux couleurs du site, le même pour les films du serveur (`<video>`) et pour YouTube (lecteur youtube-nocookie sans ses commandes, piloté par messages, sans script YouTube en plus) : lecture, ±10 s, barre de progression, son, vitesse, plein écran, raccourcis clavier (espace ou K, flèches, J, L, M, F), et « Reprendre à… » pour les vidéos de plus de 10 minutes (position gardée dans le navigateur). En plein écran, les commandes et le curseur s'effacent après 2,5 s de lecture sans mouvement (classe `is-repos`) ; si le navigateur refuse le vrai plein écran, le lecteur s'agrandit à toute la fenêtre (`player--grand`). Sur iPhone et iPad, le bouton plein écran des films du serveur ouvre le lecteur plein écran d'Apple (pas possible pour YouTube : agrandissement à la fenêtre). Les TikToks gardent le lecteur TikTok.

## Bibliothèque audio (`audio/`, novembre 2026)

- **Uniquement en français** (demande expresse) et **uniquement des voix humaines**, jamais de voix de synthèse.
- **Droits** : seulement des enregistrements qu'on a le droit de diffuser. LibriVox (lectures bénévoles versées au domaine public, textes du domaine public) convient. **Littérature audio** (et les fichiers repris par les Archives marxistes) demande l'accord préalable des voix : ne rien reprendre sans cet accord écrit (contact@litteratureaudio.com).
- **Catalogue** : `_src/audio/catalogue.json` (mode d'emploi dans `_lisezmoi`). Pour une lecture LibriVox : écrire `librivoxId`, puis `node _src/audio.mjs`, qui remplit pistes, voix, durée, licence et source du texte depuis LibriVox et archive.org. Les fichiers restent chez archive.org et ne sont chargés qu'au clic sur lecture (page Confidentialité).
- **Pages** générées par `_src/build.ps1` : `audio/index.html` (modèle `_src/audio/index.html`, collections Textes et lectures, Histoire orale, Éducation populaire, Culture militante ; une collection vide affiche son encadré `<template id="vide-…">`) et `audio/<id>.html`.
- **Lecteur** `assets/audio.js` : lecture, ±15 s, barre, volume, vitesse, pistes, enchaînement, raccourcis, position gardée (`mamie-ecoute:<id>`), transcription synchronisée si la piste a un fichier WebVTT (`vtt`), téléchargement OGG et MP3.
- **Contributions de la bande** : outil `outils/enregistrement` (autorisation d'enregistrement : crédit de la voix, licence, diffusion, droit de retrait). Un enregistrement hors domaine public doit porter `consentement` (le générateur avertit sinon).

## Livres complets et PDF

1. Ajouter le fichier `.muse` dans `_src/textes/sources/` (vérifier que l'autrice ou l'auteur **et** la personne qui a traduit sont mortes depuis plus de 70 ans, ou que les droits sont accordés). Pour un livre diffusé avec l'accord de ses ayants droit, ajouter `#droits accord` dans l'en-tête Muse : la couverture du PDF, le colophon et le crédit de la page le disent au lieu de « domaine public ». C'est le cas de *Dix questions sur l'anarchisme* et *Dix questions sur l'antifascisme*, convertis depuis leur PDF Libertalia (les PDF d'origine ne sont plus dans le dépôt).
2. Ajouter une ligne dans `_src/textes/livres.txt` : `fichier-source | identifiant | thème | fiche liée | présentation`.
3. Régénérer, puis fabriquer le PDF (Windows + Microsoft Edge nécessaires, à faire en local) :
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File _src/pdf.ps1
   ```
   Les PDF vont dans `livres/pdf/` et doivent être envoyés avec le reste.

## Aperçu local

Le serveur d'aperçu est décrit dans `.claude/launch.json` (nom : `mamie-commune`, port 8765). Après une modification : régénérer, puis ouvrir la page concernée dans l'aperçu et vérifier aussi en largeur mobile (375 px).

## Direction artistique (à respecter)

**Référence absolue depuis le 23 novembre 2026 : la vidéo de Mamie faite à la main, sans IA** (Instagram, reel DgF6CZcoI_8). Le site en est le prolongement ; la charte est sur la page « La boîte à images » (`_src/pages/boite-a-images.html`), et en deux couches à la fin de `assets/style.css` (« DA VIDÉO DE MAMIE » puis « CHARTE VIDÉO, 2e passe »), qui priment sur tout ce qui est décrit plus bas (directions précédentes : collage, imprimerie militante, atelier de collectif autonome).
- **Papiers** : chaque grande section est un papier froissé d'une couleur (`assets/img/papier-froisse.svg`, `node _src/matieres.mjs`), déchiré en haut sur du noir (`--dechire`). Palette de la vidéo : crème `--p-beige`, bleu ciel `--p-bleu`, bleu nuit `--p-nuit`, kraft `--p-kraft`, ocre `--p-ocre`, rouge `--p-rouge`, fuchsia `--p-rose` (flammes découpées `assets/img/flammes.svg`), anthracite, blanc texturé. **Le rouge et le noir ne dominent pas** ; deux sections voisines n'ont jamais le même papier. En-têtes de page colorés par rubrique (`.gtitle--<dossier>`) et par thème pour les parcours (`data-parcours`).
- **Lettres** : Archivo Black pour les étiquettes noires (titres, intertitres, sous-titres : choisie le 23 novembre 2026, Poppins refusée pour ça), Poppins (texte courant, boutons, menus), Libre Baskerville (légendes, noms, documents, titres de cartes), Great Vibes (quelques surtitres seulement), locales dans `assets/fonts.css`. Les titres de page et de section sont des **sous-titres** : un mot par étiquette noire, le mot fort en fuchsia (`tags()` dans `assets/site.js`, `data-fort` pour choisir le mot). Noms sur étiquette jaune. Pas de pochoir, pas de machine à écrire, pas de cursive partout. Le logo garde ses lettres de rançon.
- **Formes** : photos et fiches sur papier blanc au bord dentelé (`--dentelle`), posées de travers ; légendes en serif sur bande déchirée (`--bande`) ; textes longs dans une boîte crème arrondie ; tampons en néon ; boutons en pastilles. Accueil : papiers superposés (`.feuilles`) et petits dessins (`.doodle`) autour de Mamie découpée.
- **Pictogrammes** naïfs au trait noir (`node _src/pictos.mjs` → `assets/img/pictos/`) : un par catégorie de la carte (filtres en étiquettes de papier, fiches), plus enveloppe, bulle, casque, dossier, etc.
- **Rubriques** : pochettes colorées et lecteur-cassette (audio), chemise kraft à onglet (Mon dossier), modules en feuilles décalées (université), documents posés sur une table anthracite (archives).
- **Mouvement** : apparition douce des papiers au défilement (fin de `assets/site.js`), dessins qui flottent ; rien si `prefers-reduced-motion` ou lecture facile. Lecture facile : ni froissé, ni cursive, ni rotation, ni découpe.
- Contrastes vérifiés en clair et en sombre avec un script de mesure ; en sombre, les papiers blancs gardent toujours l'encre foncée.


**Direction « imprimerie militante » (validée le 17 novembre 2026, « fais ça partout »).** Affiches de la CNT-FAI, tracts photocopiés, fanzines, presses ouvrières, DIY. Elle est posée en **dernière couche** de `assets/style.css` (bloc « DIRECTION « IMPRIMERIE MILITANTE » » et ses corrections), par-dessus le collage qui reste dessous :
- **Polices** (locales, OFL, `assets/fonts.css`) : `--pochoir` (nom historique) = Big Shoulders Display 900 : titres de page `.gtitle h1`, titres de section, accroche de l'accueil, lettrine. **Plus de pochoir ni d'encre vieillie sur les titres** (jugés militaires, novembre 2026) ; `--affiche` Big Shoulders Display 700-900 (titres, navigation, étiquettes, boutons) ; `--main` Permanent Marker (mots de Mamie, annotations) ; Special Elite (`--mono`, chapeaux, légendes, dates). Pas de serif élégant.
- **Palette** : `--noir`, `--rouge`, `--rouge-sombre`, `--papier`, `--gris`, `--kraft`, `--jaune`. `--pink` pointe sur le rouge ; le rose `--rose` sert d'accent (voir plus bas). Grain de photocopie `--photocopie` (bruit SVG très léger) sur le fond, les sections et les en-têtes.
- **Repères** : accueil en affiche (diagonale rouge et noire, Mamie au centre, « Ni dieu ni maître » au pochoir détouré) ; titres de section au pochoir sur bande noire avec tampon rouge ; sélection de la bande en tracts punaisés ; dernières publications en affiche rouge et pile de brochures ; en-têtes de page noirs bordés de rouge ; intertitres en bandes rouges et noires alternées ; photos en photocopie noir et blanc avec tampon « archive » ; sommaire en bloc noir ; boutons à angle droit.
- **Lettres de rançon** : seulement le logo, le titre de l'accueil, les jaquettes de films et les affiches (`data-ransom`). Les titres de page sont en Big Shoulders.
- **Contraste** : sur fond noir, liens et étiquettes en jaune (le rouge y est trop sombre) ; les tracts gardent du papier clair et de l'encre noire même en mode sombre. Toute nouvelle règle sur fond noir ou rouge se vérifie dans les deux modes.
- **Lecture facile** : `--pochoir`, `--affiche`, `--main` y redeviennent la police simple ; tout élément penché de la direction est dans la liste `.facile … { transform: none }` du même bloc.

**Renforcement « imprimerie anarchiste » (novembre 2026, fin de `assets/style.css`)** : on enrichit, on ne remplace rien (demande expresse : garder fond crème, logo découpé, mascotte, étoile, bandeau noir, structure de l'accueil). Trame de points `--trame` dans le coin de l'affiche rouge et derrière l'appel à contribution ; numéros 01 à 06 sur les sections de l'accueil ; étoile rouge dans leurs tampons. Un détail par section : tracts pliés et jaunis (sélection), fiches de catalogue lignées et perforées avec leur cote (bibliothèque), pellicule autour du film (vidéothèque), drapeau rouge et noir en coin (lieux), fiches numérotées au pochoir avec étiquette noire (guides), tampon « Appel à la bande » et surligneur rose (contribuer), liseré en diagonale en haut du pied de page. **Le rose `--rose` revient en accent** (mot fort de la bulle de Mamie, surligneur du gras dans les fiches, appel) : jamais en aplat. Ne pas étendre les textures à tous les blocs.

**Atelier d'un collectif autonome (novembre 2026, validé, fin de `assets/style.css`)** : Makhno et la CNT, culture autonome, ZAD, sérigraphies zapatistes, fanzines, infokiosques ; **jamais d'imagerie militaire** (ni armes, ni uniformes, ni miliciens) : coopératives, occupations, pancartes, fresques, champs. Même typographie, le travail porte sur la composition :
- titres de section en **bande de papier déchirée** (`--dechire`), de travers, une couleur par section (noir, rouge, rose, crème) ; en-tête des fiches au bas arraché ; intertitres découpés ;
- **collages d'archives** (`.collage`) : photo de `assets/img/revolutions/` (crédit dans `credits.txt`), cadre blanc scotché, tirage en deux couleurs (noir et blanc tramé, rouge et noir, rose et noir), **crédit visible** en `figcaption`. Sur l'accueil : pancarte des Soulèvements (sélection), usine occupée en 1936 (sous le fil, dans `$collageUsine` de `build.ps1`), fresque zapatiste (lieux) ;
- **linogravures** dessinées en SVG par `_src/gravures.mjs` → `assets/img/gravures/` (blé, maïs, soleil sur un champ, chat noir du sabotage, flèche et cercle au feutre, agrafe) : décoratives (`alt=""`), jamais d'image générée ;
- **annotations au feutre** (`.feutre`, Permanent Marker) seulement en détail : flèche « lis ça avant d'y aller », chiffre entouré, « ça repousse déjà » ; agrafes sur les fiches pratiques, pointillé « à découper » (`.decoupe-ici`).
Lecture facile : rien de penché, gravures et feutre masqués. Mode sombre : gravures inversées. Téléphone : collages sous le titre, gravures masquées.

Ce qui suit décrit la couche collage d'origine (toujours dessous : découpes fanzine, scotch, compartiments).

Collage de papier découpé, d'après les vidéos TikTok de @mamie_commune. Repères relevés dans les vidéos : sous-titres un mot par bande noire avec le mot fort en rose (`data-tags`, mot forcé avec `data-fort="mot"`), bande noire au bord déchiré en haut, notes à la machine à écrire sur papier crème scotché (`.note`), photos et gravures d'époque collées de travers (`.horde`, cartes vidéo), dates sur bandeau rouge (`.timeline`). Le reste : fond crème moucheté, trame de points, grande étoile rouge à cinq branches, titres en lettres de rançon (générées automatiquement par `assets/site.js`), étiquettes noires et roses, bandeaux rouges façon banderole, bords déchirés (`clip-path: var(--torn)`), ombres décalées noires. Couleurs dans `:root` de `assets/style.css` : papier `#ebe3d1`, encre `#171414`, rouge `#e1301c`, rose `#ff5aa8`, jaune `#f5b63b`. Polices locales (`assets/fonts.css`) : Archivo Black (titres), Archivo (texte), Special Elite (machine à écrire), Alfa Slab One. **Aucune ressource externe** (polices, scripts, CDN) : tout est dans `assets/`.

**La voix du site : Mamie et sa bande.** Ce sont Mamie et « la bande à Mamie » qui racontent la lutte, et le site est leur **grande boîte à outils militante**, rangée en six tiroirs (les six familles). La bande reste collective, sans personnages nommés : « la bande à Mamie », « les camarades de Mamie », « on ». Les introductions (accueil, haut de chaque rubrique, encadrés `callout`, première phrase des fiches) parlent avec cette voix : souvenirs de lutte, conseils de vieille camarade, humour sec, jamais de nostalgie molle. Les fiches sont signées « la bande à Mamie ». Le corps des fiches reste factuel et sourcé : la voix donne le ton, pas les faits.

Ton des textes : simple, direct, tutoiement, pas de jargon, phrases courtes. écriture inclusive avec **mots fusionnés, sans point médian** (choix de la bande, 26 novembre 2026) : « toustes », « celleux », « iels », « elleux », « travailleureuses », « lecteurices », « auteurices » ; quand aucune forme fusionnée n'existe, doublets (« militantes et militants », « chacune et chacun ») ou mots neutres (« les gens », « la personne »), ou phrase tournée autrement (« tu reçois une convocation »). Jamais de point médian « · » : il gêne les lecteurs d'écran. On ne touche jamais aux livres du domaine public, aux citations ni aux titres d'œuvres (« Sortez couvert·es »).

Accessibilité : un seul `<h1>` par page et pas de saut de niveau de titre ; texte alternatif sur chaque image ; contraste suffisant (texte clair sur `--red-hi`, pas sur `--red`). Le bouton « Aa Lecture facile » (barre de recherche) ajoute la classe `facile` à `<html>` : police simple, texte plus grand, titres sans lettres de rançon, rien de penché. Tout nouvel élément penché (`rotate`) doit être ajouté à la liste `.facile … { transform: none }` de `assets/style.css`. Logo : Mamie **détourée, sans fond** (``assets/mamie-logo-192.webp`` dans l'en-tête et le pied de page, ``mamie-logo-480.webp`` sur l'accueil, original transparent ``mamie-logo-1080.png`` pour les visuels). On les refait avec ``powershell -ExecutionPolicy Bypass -File _src/logo-detoure.ps1``. Jamais ``mamie.webp`` (300 Ko, avec fond) dans les pages. Plus d'image de Mamie en entier.

## Navigation principale : sept entrées (novembre 2026)

Le menu, le pied de page, le fil d'Ariane et le bloc de bas de page suivent `$menu` dans `_src/build.ps1` : **Accueil, Bibliothèque, Vidéothèque, S'organiser, Se défendre, Lieux et mobilisations, Entraide**. Chaque entrée a sa page d'accueil (`bibliotheque/`, `videos`, `s-organiser`, `se-defendre`, `trouver-des-allies`, `s-entraider` : adresses inchangées), une phrase, un menu déroulant de **5 liens au plus** (ou aucun : lien direct) et la liste des clés de `$familles` qui lui appartiennent (`cles`). Pour rattacher une nouvelle rubrique, ajouter sa clé dans `cles` de la bonne entrée.

- **Fil d'Ariane** : l'entrée s'insère après « Accueil », sauf si le fil la nomme déjà. Une page dont le fil s'arrête sur le nom de l'entrée (`Accueil / Se défendre`) est la page d'accueil de la rubrique : pas d'ajout ni de bas de page.
- **Bas de page** (`<nav class="suite">`) : 4 portes de la rubrique et « ← Retour à la rubrique ». Il remplace l'ancien « Dans le même tiroir ».
- **Pages de rubrique** : un sommaire court sous le titre (`<nav class="sommaire-rubrique">`, liens vers les sections). Les longues listes de cartes se replient avec `data-plie="9"` (`assets/accueil.js`).
- **En-tête** : sur ordinateur, le logo mène à l'accueil ; sur téléphone, bandeau d'édition masqué, recherche derrière la loupe (`#loupeBtn`), menu en accordéon (une entrée ouverte à la fois). Clavier : flèche bas ouvre et parcourt, Échap referme (`assets/site.js`).
- **Accueil** façon journal (`_src/pages/index.html`) : présentation, sélection de la bande (3 pages choisies selon l'actualité, voir « Sélection selon l'actualité »), dernières publications (1 + 4), bibliothèque, vidéothèque, lieux et mobilisations, guides pratiques, appel à contribution. Ne pas en refaire un catalogue : 4 à 6 éléments par section.
- Blocs déplacés de l'ancien accueil : frise des luttes → `apprendre.html` ; « Avant d'aller en manif » → `se-defendre.html` ; quatre parcours transversaux → `universite.html` (#fils) ; questions fréquentes → `commencer.html` (#faq).

## Identité graphique (novembre 2026)

Pas de nouvelles illustrations de Mamie (demande expresse) : l'identité tient au portrait existant, à la typographie et à des éléments faits en code, sans image générée.
- **Tampon** (`.tampon`) en haut des fiches, selon leur type (`$tampons` dans `build.ps1` : « Fais tourner », « Lu par la bande », « Mémoire des luttes », « Droit français »…), ajouté par `Render-Page`.
- **Mamie dit** (`.mamie-dit`) : portrait et phrase sous l'introduction des pages sans fiche (rubriques, outils, contribution), phrase par entrée du menu dans `$mamieDit`. Le ton seulement, jamais une information.
- **Sobriété (novembre 2026, fin de `assets/style.css`)** : un seul effet fort par bloc. Les lettres de rançon sont réservées au logo, au titre de l’accueil, aux jaquettes et aux affiches (les titres de page sont en pochoir, voir « Direction artistique »). Les étiquettes (`.eyebrow`, `.kicker`, `.rubrique__n`, `.card__tag`) sont du texte rouge, plus des boîtes ; la fiche d'identité des pages (`.gmeta`) est une ligne de texte ; le gras n'est plus surligné ; ni étoile ni trame dans les en-têtes de page (l'accueil garde les siennes) ; cartes et photos posées droites, sans scotch sur les cartes. Ne pas réempiler les effets.
- **Compartiments fanzine** (fin de `assets/style.css`) : les blocs en grille (`.rubrique`, `.card`, `.step`, `.mode`, `.ency-fam`, `.principes li`, liens de `.frise` et de `.aussi`) alternent sept découpes au lieu d'un seul rectangle déchiré : page scotchée, feuille de cahier coupée aux ciseaux, étiquette kraft à œillet, papier quadrillé arraché en bas, fiche cornée, page de carnet à spirale, ticket encoché. Une section sur deux décale l'ordre. Les photos (`.photo`) sont tenues par un scotch, deux scotchs d'angle ou une punaise. Tout en CSS, sans image ; « Lecture facile » retire rotations et motifs. Un nouveau type de bloc en grille s'ajoute aux listes `:is(…)` de ce bloc plutôt que de recevoir son propre rectangle.
- **Grain de photocopie** (`--grain`, filtre SVG) sur les en-têtes, **note de marge** (`.annot`), **scotch** (`.scotch`).
- Page **La boîte à images** (`boite-a-images.html`) : couleurs, polices, éléments, portrait de Mamie à télécharger, et toutes les archives de `assets/img/revolutions/credits.txt` (générées dans `{{ARCHIVES}}`). Une image d'archive sans ligne de crédit déclenche un avertissement.

## Organisation du site : six tiroirs (catégories internes)

Tout le site se range en six familles (« tiroirs » de la boîte à outils), définies **une seule fois** dans `_src/build.ps1` (`$familles`). Chacune a sa page de tiroir (`_src/pages/<page>.html`) qui présente ses rubriques avec des cartes vers les ressources existantes :
- **Apprendre** (`apprendre.html`) : Bibliothèque, Université populaire (`universite/`), Théorie politique, Histoire des luttes, Figures historiques, Glossaire (`glossaire.html`), Culture militante ;
- **S'organiser** (`s-organiser.html`) : Assemblées générales, Collectifs, Syndicalisme, Autogestion, Grèves (dont le 17 Octobre), Organisation collective (`agir/` et le guide lycée) ;
- **S'entraider** (`s-entraider.html`) : Mutualisme, Caisses de solidarité, Cantines populaires, Coopératives, Bibliothèques populaires ;
- **Se défendre** (`se-defendre.html`) : Droits, Ressources juridiques, Antifascisme, Féminisme, Protection numérique, Premiers secours ;
- **Créer** (`creer.html`) : Affiches, Tracts, Fanzines, Journaux, Médias indépendants ;
- **Trouver des alliés** (`trouver-des-allies.html`) : Carte des collectifs, Syndicats, Associations, Librairies, Lieux autogérés, Médias indépendants (liens `carte.html?type=…`).

Contribuer (`contribuer.html`) et Rejoins la bande (`rejoindre.html`) sont hors tiroirs : bandeau du haut, colonne « La bande à Mamie » du pied de page, et tiroir Trouver des alliés.

Le menu (une entrée par tiroir qui déplie ses rubriques, plus « Tout le tiroir »), le pied de page (`{{PIED}}`), le sélecteur de recherche (`{{FAMOPTS}}`, champ `f` de `data/recherche.js`), le **fil d'Ariane** (le tiroir est ajouté tout seul après « Accueil ») et le bloc **« Dans le même tiroir »** en bas de chaque page en découlent. Une page appartient à la rubrique dont le **début d'adresse est le plus long** (`agir/caisse-de-solidarite` passe avant `agir/`) : c'est aussi elle qui est soulignée dans le menu. Une rubrique sans page à elle (début d'adresse vide) pointe vers sa section de la page de tiroir (`s-entraider.html#cantines`). Couleurs : Apprendre jaune, S'organiser rose, S'entraider ocre, Se défendre rouge brique, Créer rouge, Trouver des alliés noir (classes `fam--…`). Pour une nouvelle rubrique : l'ajouter dans `$familles` avec sa clé de menu, son adresse, son nom, une description courte et le début de ses adresses (séparés par `|`), puis sa section sur la page de tiroir.

**Pas de rubrique fictive** : quand une rubrique n'a pas encore de fiche dédiée (cantines, coopératives, fanzines…), sa section de tiroir relie ce qui existe déjà sur le site et le dit dans un encadré « Pas encore de fiche pratique », avec un lien vers Contribuer. Quand la fiche est écrite, remplacer l'encadré par sa carte.

La carte accepte `carte.html?type=syndicat` (plusieurs : `?type=fa,ucl`) pour n'afficher d'abord que ces catégories, et `?q=` pour chercher.

**Types de contenu** (`$types` dans `_src/build.ps1`) : Histoire de lutte, Fiche de lecture, Fiche pratique, Guide pratique, Guide juridique (fiches Legal Team), Guide numérique, Dossier antifasciste, Livre, Vidéo. Ils s'affichent en haut de chaque page et servent de filtres sur la page de résultats de la recherche. Les documentaires (`_src/pages/videos.html`) et les vidéos TikTok (`data/videos.js`) sont aussi dans la recherche.

## Les outils de Mamie (`outils/`)

18 outils à remplir soi-même, rangés dans le tiroir S'organiser (rubrique « Les outils de Mamie », clé `boite-outils`) et reliés depuis Créer et S'entraider. **Règle absolue : aucune intelligence artificielle** (pas de LLM, pas d'API d'IA, pas de texte généré ou proposé par la machine) : des champs, des choix prédéfinis, des calculs simples, des mises en page et des exports. Rien n'est envoyé à un serveur, aucun compte. **Rien n'est enregistré automatiquement** (pas de `localStorage` pour les saisies) : on garde son travail en téléchargeant un brouillon `.json`, qu'on rouvre avec « Ouvrir un brouillon ». Quitter la page avec des saisies non enregistrées déclenche l'avertissement du navigateur.

- Pages : `_src/outils/<nom>.html` (en-tête comme les pages, 3e champ `boite-outils`, scripts `outils-modeles.js` puis `outils.js`), `index.html` = page de la rubrique, avec les quatre façons de décider (vote, consensus, consentement, mandat) présentées sans en imposer une.
- Moteur : `assets/outils.js`. Un outil = `<div data-outil="nom">`. Les documents (AG, compte rendu, mandat, charte, tract, communiqué, checklists, caisse, cantine, inventaire, atelier, fiche de lecture, bibliographie, projection-débat) sont décrits dans `assets/outils-modeles.js` (`window.OUTILS_MODELES`) : sections de champs (`text`, `textarea`, `date`, `time`, `number` — accepte la virgule —, `select`, `cases`, `liste`, `table`), et au besoin `calcul`, `colonnesCalculees`, `csv`, `apercu`/`texte`/`css` pour une mise en page propre. Le minuteur, l'affiche (dessin sur `<canvas>`, PNG à 150 points par pouce) et le quiz ont leur propre code dans `outils.js`.
- Aperçu : une `iframe` qui contient exactement la feuille imprimée (réduite à l'écran, taille réelle à l'impression). Exports : impression ou PDF par la fenêtre d'impression du navigateur, Markdown, texte copié, CSV au point-virgule (LibreOffice, Excel), PNG pour l'affiche.
- Pour un nouvel outil de document : ajouter son modèle dans `outils-modeles.js`, une page dans `_src/outils/`, une carte dans `_src/outils/index.html`. Le tester en remplissant chaque champ et en vérifiant chaque bouton (aucun bouton factice, aucun résultat inventé).

## Autonomie numérique : annuaire, mode hors ligne, packs, confidentialité

- **Annuaire des logiciels libres** (`logiciels/`, tiroir Se défendre, rubrique « Logiciels libres ») : une fiche par logiciel dans `_src/logiciels/logiciels.json` (`nom`, `categorie`, `fonction`, `remplace`, `description`, `licence` + `licenceSource`, `plateformes`, `site`, `documentation`, `difficulte` + `difficulteDit`, `limites`, `guide`, `verifie`). Vocabulaire (`$logCats`, `$logPf`, `$logDif`) dans `_src/build.ps1`, page `_src/logiciels/index.html` (marqueurs `{{LOGI_…}}`), filtres `assets/logiciels.js`, données ouvertes copiées dans `data/logiciels.json`. Licence relevée sur le dépôt officiel ou Wikidata, chaque lien ouvert le jour de la vérification. **Jamais de promesse de sécurité absolue** : le générateur avertit si une fiche contient « garanti », « 100 % », « inviolable »…
- **Guides** ajoutés dans `_src/guides/6-autonomie.txt` (logiciels libres, protéger ses données, mots de passe, chiffrement, héberger des services, outils collaboratifs) : écrits par la bande, ils portent leur propre ligne `class="credit"` (CC BY-SA), pas celle de Libérons nos ordis.
- **Site installable et hors ligne** : `manifest.webmanifest` (racine), icônes `assets/icone-512.png` et `icone-masquable-*.png` (refaites par `_src/icones-pwa.ps1`), service worker `sw.js` **généré** depuis `_src/sw.js` (version = empreinte des sources, liste de départ `$depart` dans `build.ps1`, vérifiée à chaque génération). Pages : réseau d'abord puis copie ; fichiers : copie d'abord. Il ignore les autres sites, les films, les PDF. Caches : `mamie-coquille-<version>`, `mamie-pages` (300 fichiers), `mamie-garde` (pages gardées à la demande). Mise à jour : bandeau « Nouvelle version de Mamie » (`assets/hors-ligne.js`), jamais de rechargement sans clic. Bouton « Garder hors ligne / Imprimer ou PDF » sous le titre des pages qui ont une `.gmeta`. Pages `hors-ligne.html` (installation, packs, gestion, « Tout effacer ») et `sans-connexion.html` (page servie sans réseau, liens absolus comme la 404).
- **Packs hors ligne** (`packs/<id>.html`) : définis dans `$packs` de `build.ps1` (uniquement des pages existantes, plus les parties `special/…` : méthodes de décision, feuilles vierges d'AG, glossaire, annuaire, chronologie). Fichier HTML autonome (style `_src/packs/pack.css` dedans, liens écrits en entier vers mamiecommune.org, photos et vidéos retirées). PDF en local : `powershell -ExecutionPolicy Bypass -File _src/packs-pdf.ps1` (Windows + Edge), puis régénérer pour afficher le bouton PDF.
- **Mon dossier** (`mon-dossier.html`, novembre 2026) : le créateur de packs personnalisés. On choisit des documents (fiches, guides, livres, histoires de luttes, dossiers, portraits, parcours, ressources, lectures audio : tout ce que liste `data/recherche.js` sauf rubriques, outils et vidéos), depuis la page ou avec le bouton « Ajouter à mon dossier » de la barre sous le titre des fiches (`assets/hors-ligne.js`), on les range et on nomme le dossier. Sorties fabriquées dans le navigateur par `assets/dossier.js` : **HTML autonome** (page d'accueil, sommaire, documents, original de chaque page, tableau sources-auteurs-licences, date ; photos retirées, légendes gardées, liens écrits en entier), **PDF** par la fenêtre d'impression, **ZIP** (format stocké, sans bibliothèque) avec le dossier complet, chaque document séparé, les PDF des livres et la liste des écoutes (.m3u et .txt, les sons restent chez archive.org). Liste gardée dans le navigateur (`mamie-dossier`, page Confidentialité).
- **Confidentialité** (`confidentialite.html`) : liste **chaque** serveur contacté et chaque clé gardée dans le navigateur. Toute nouvelle fonction qui appelle un autre site ou garde quelque chose dans le navigateur doit y être ajoutée (et dans les mentions légales).

## Droits et sources

- Livres complets : domaine public uniquement, sauf accord écrit (*Dix questions sur l'antifascisme* : accord de La Horde).
- Fiches de lecture : rédigées avec nos mots, jamais de copie de texte protégé.
- Guides numériques : adaptés de « Libérons nos ordis » (CC BY-SA), mentionner la source.
- Schéma et carte de La Horde : reproduits avec leur accord (`assets/horde/`).
- Mettre à jour `_src/pages/mentions-legales.html` si un nouveau type de contenu ou un nouveau service externe est ajouté.

## Avant d'envoyer

1. `_src/build.ps1` sans erreur.
2. Vérifier les liens internes (aucun lien cassé) :
   ```powershell
   Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch '\\_src\\' } | ForEach-Object { $f = $_; $h = [IO.File]::ReadAllText($f.FullName); foreach ($m in [regex]::Matches($h, '(?:href|src)="([^"#:?]+\.(html|pdf|webp|svg|js|css|jpg|woff2))')) { if (-not (Test-Path (Join-Path $f.DirectoryName $m.Groups[1].Value))) { "$($f.Name) -> $($m.Groups[1].Value)" } } }
   ```
3. Regarder la page modifiée dans l'aperçu.
4. Commit avec un message en français qui dit ce qui a changé, puis push sur `main` : la publication se fait toute seule en 2 à 3 minutes (onglet « Actions » du dépôt GitHub).

## Mode sombre

Bouton « ☾ Sombre / ☀ Clair » dans la barre de recherche (`#themeBtn`, code dans `assets/site.js`). Le site est en **mode clair par défaut** (demande expresse), même si le système est en sombre ; le choix du bouton est gardé dans le navigateur (`localStorage` `mamie-theme`) et appliqué avant l'affichage par le petit script dans `<head>` de `_src/layout.html` (`html[data-theme="dark"|"light"]`). Les couleurs sombres sont dans `:root[data-theme="dark"]` de `assets/style.css`.

Règles pour toute nouvelle couleur dans le CSS :
- texte et bordures : `var(--ink)` (s'inverse en sombre) ; fonds : `var(--paper)`, `var(--paper-2)`, `var(--panel-2)` ;
- texte posé sur du jaune, du rose ou du blanc : `var(--on-color)` (toujours foncé) ; sur du rouge ou un noir fixe : `var(--on-dark)` (toujours clair) ;
- liens et petits textes rouges : `var(--red-txt)` ; ombres décalées : `var(--shadow)` ; trames et pointillés : `rgba(var(--ink-rgb), .2)`, ombres floues : `rgba(var(--shade-rgb), .5)` ;
- jamais de `#fff` ni de `#171414` en dur pour du texte ou un fond de carte.
