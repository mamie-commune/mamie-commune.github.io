# Mamie Commune — guide pour Claude

Site statique de ressources anarchistes, en français : révolutions, antifascisme, bibliothèque (livres complets + fiches), carte des lieux, vidéos, outils numériques. Publié sur GitHub Pages par `.github/workflows/publier.yml` à chaque envoi sur `main`.

La personne qui tient le site n'est pas développeuse : réponds en français simple, montre le résultat, et propose d'envoyer (commit + push) une fois qu'elle a validé.

Site en ligne : https://mamiecommune.org (hébergement IONOS Web Plus) · copie : https://mamie-commune.github.io · dépôt : `mamie-commune/mamie-commune.github.io`.

Chaque envoi sur `main` publie aux deux endroits (`.github/workflows/publier.yml`) : GitHub Pages, et IONOS par SFTP avec les secrets `IONOS_HOTE`, `IONOS_UTILISATEUR`, `IONOS_MOT_DE_PASSE` et la variable `IONOS_DOSSIER`. Ne jamais écrire ces accès dans le dépôt ni les demander en clair : la personne les saisit elle-même dans GitHub. Réglages Apache d'IONOS (HTTPS, sans www, cache) : `.htaccess` à la racine.

## Raccourcis (`.claude/skills/`)

- `/ajouter-video <adresse TikTok>` : nouvelle publication TikTok.
- `/ajouter-lieu <nom, ville>` : lieu ou collectif sur la carte.
- `/ajouter-page <sujet>` : fiche de lecture, dossier, page antifascisme, guide.
- `/publier` : régénérer, vérifier, envoyer, suivre la mise en ligne.

La personne peut aussi demander en phrases normales : utilise le raccourci qui correspond.

## Depuis le web (claude.ai/code) ou un autre ordinateur

La publication sur GitHub (`.github/workflows/publier.yml`) **régénère toutes les pages** sur une machine Windows. Donc, sans PowerShell (session web, Linux, Mac) : modifier les sources (`_src/`, `data/`, `assets/`), commit, push sur `main`, et c'est en ligne en 2 à 3 minutes. Seuls les PDF des livres (`_src/pdf.ps1`, besoin de Windows + Edge) doivent être faits en local.

## Règle d'or

**Les pages HTML du site sont générées. Ne jamais les modifier à la main.** On modifie les sources dans `_src/` (ou les fichiers de données listés plus bas), puis on régénère :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1
```

Le script affiche par exemple `OK : 29 guides, 103 fiches, 37 livres et 12 pages de dossiers générés.` Toute autre sortie est une erreur à corriger avant d'envoyer.

## Où se trouve quoi

| Je veux changer… | Fichier source | Régénérer ? |
|---|---|---|
| L'en-tête, le menu, le pied de page | `_src/layout.html` (menu : liste `$navItems` dans `_src/build.ps1`) | oui |
| L'accueil et les pages d'index | `_src/pages/*.html` (`index.html`, `carte.html`, `videos.html`, `mentions-legales.html`, `recherche.html`, `404.html` (page introuvable), `lecteur.html`, et `guides.html` / `bibliotheque.html` / `experiences.html` / `antifascisme.html` qui deviennent les `index.html` des dossiers) | oui |
| Un dossier Révolutions (Commune, Espagne 1936, zapatistes, Rojava) | `_src/experiences/*.txt` | oui |
| Une page Antifascisme | `_src/antifascisme/*.txt` | oui |
| Une fiche du Guide de manif | `_src/manif/*.txt`. La **catégorie** de la fiche est sa sous-rubrique (« Legal Team »…) : pour une **nouvelle sous-rubrique** (premiers secours, préparation, après la manif…), créer un fichier `_src/manif/2-nom.txt` avec une nouvelle catégorie, le filtre apparaît tout seul. Toujours préciser le pays quand c'est du droit (la fiche Legal Team est du droit **français**). Les modèles de lettres pour contester un PV sont dans `_src/textes/modeles-pv/` ; les PDF (`manif/modeles/`) se refont avec `powershell -ExecutionPolicy Bypass -File _src/modeles-pv.ps1` (Windows + Edge, en local) | oui |
| Une fiche de lecture | `_src/bibliotheque/*.txt` | oui |
| Un guide Outils numériques | `_src/guides/*.txt` | oui |
| Un livre complet (texte du domaine public) | source `.muse` dans `_src/textes/sources/` + une ligne dans `_src/textes/livres.txt` | oui, puis PDF (voir plus bas) |
| Un livre fourni en PDF | le PDF dans `livres/pdf/` + une ligne dans `_src/textes/livres-pdf.txt` | oui |
| Un lieu sur la carte | `data/lieux.js` (une ligne par lieu) | non |
| Une vidéo TikTok | `data/videos.js` (une ligne par publication) | non |
| Les couleurs, polices, mise en page | `assets/style.css` | non |
| Les lettres de rançon, le menu mobile | `assets/site.js` | non |
| La barre de recherche (en haut) et la page `recherche.html` | `assets/recherche.js` ; l'index `data/recherche.js` est refait à chaque régénération (titres, résumés, intertitres, début des textes) et les lieux viennent de `data/lieux.js` | oui pour l'index |

Fichiers générés (ne pas modifier) : `index.html`, `carte.html`, `videos.html`, `recherche.html`, `404.html`, `partage.html` (renvoi vers le guide Signal), `lecteur.html`, `mentions-legales.html` à la racine, tout `guides/`, `bibliotheque/`, `experiences/`, `antifascisme/`, `livres/*.html`, et `data/guides.js`, `data/bibliotheque.js`, `data/livres.js`, `data/experiences.js`, `data/antifascisme.js`.

## Adresses propres

Dans les sources, on écrit les liens normalement (`page.html`, `dossier/index.html`). À la génération, `_src/build.ps1` (`Clean-Links`) les transforme en `page` et `dossier/` : les adresses publiques n'ont ni `.html` ni `index.html`. Sur IONOS, `.htaccess` sert `page.html` pour `/page` et redirige les anciennes adresses en `.html`. Dans le JavaScript (`assets/*.js`, `data/videos.js`), écrire directement les liens sans `.html`. Une page supprimée garde un renvoi : règle dans `.htaccess` + petite page de renvoi générée dans `build.ps1` (exemple : `partage` → `guides/signal`).

## Carte du mouvement du 17 Octobre

Page `mouvement-17-octobre` (source `_src/pages/mouvement-17-octobre.html`, script `assets/mobilisations.js`). Les données (`data/mobilisations.js`) sont **recopiées** de https://17octobregiletjaune.net/carte/ par `_src/mobilisations.ps1` : ne jamais les modifier à la main. Le workflow `mobilisations.yml` les met à jour **toutes les heures** et republie le site s'il y a du nouveau ; à la main : `gh workflow run mobilisations.yml`. Pour ajouter une mobilisation, c'est sur leur carte, pas chez nous.

## Images des dossiers

Les photos des dossiers Révolutions sont dans `assets/img/revolutions/`, avec auteur, licence et source dans `credits.txt`. Elles viennent toutes de **Wikimedia Commons** : documents d'époque dans le domaine public, ou photos de reportage sous licence libre (CC0, CC BY, CC BY-SA). **Jamais d'image générée par IA, ni de photo colorisée** (demande expresse). Chaque image a une légende et un crédit (auteur · licence · lien Commons) : `<figure class="photo">` (`photo photo--portrait` pour une image en hauteur). Pour en ajouter : compléter la liste dans `_src/images-revolutions.ps1` et le relancer.

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

## Données de la carte (`data/lieux.js`)

Une ligne par lieu : `["Nom", "categorie", latitude, longitude, "Ville (dép.)", "Description courte."]`.
Catégories : `fa`, `ucl`, `syndicat`, `librairie`, `lieu`, `media`, `numerique`, `antifa` (couleurs et noms dans `CATEGORIES_LIEUX` en haut du fichier). Position au niveau de la ville, **jamais d'adresse privée**.

## Vidéos (`data/videos.js`)

Copier une ligne, changer `id` (le nombre à la fin de l'adresse TikTok), `type` (`video` ou `photo`), `date`, `titre`, `vues`, `texte`, `tags`, et éventuellement `lien` vers une page du site. Le lecteur utilisé après le clic est `https://www.tiktok.com/player/v1/<id>` (dans `assets/videos.js`) : l'ancien `embed/v2` donnait des écrans noirs.

Le documentaire *Les Damnés de la Commune* est dans `_src/pages/videos.html`. Le fichier `.mp4` (1,7 Go) n'est **pas** dans le dépôt. Il est rangé dans la release GitHub `film`, et copié sur IONOS dans `films/` par le workflow `film-ionos.yml` : c'est cette copie que lit le site (`data-src="films/…"`), car GitHub sert les films comme des fichiers binaires que les téléphones refusent de lire. La release reste en secours (`data-secours`). Pour un autre film : `gh release upload film <fichier.mp4>` (2 Go maximum, nom sans espaces ni accents, vidéo H.264 + son AAC), puis `gh workflow run film-ionos.yml`, puis une nouvelle fiche `.doc` sur le même modèle. La publication normale ne touche jamais au dossier `films/` d'IONOS. Ne jamais nommer un dossier comme une page (`videos/` casserait la page `/videos`). Ne jamais ajouter de `.mp4` au dépôt.

**Vidéos YouTube** (chargées seulement au clic, lecteur youtube-nocookie) :
- un documentaire en grand : une fiche `<article class="doc">` (modèle : *ANTIFA, chasseurs de skins* dans `_src/pages/videos.html`) avec `data-embed="https://www.youtube-nocookie.com/embed/<id>?autoplay=1&amp;rel=0"` sur le bouton `.doc__poster` (ajouter `doc__poster--noir` pour une affiche noire). La page doit charger `assets/videos.js`.
- une série de vidéos dans une page (dossier, fiche) : un bloc `<div class="ytwall">` de cartes `<figure class="yt">` (modèle : section « En vidéo » de `_src/experiences/2-zapatistes.txt`). Marche sur toutes les pages (code dans `assets/site.js`).
- `<id>` = les 11 caractères après `v=` ou `youtu.be/`. Pour une playlist, lire la liste des vidéos sur sa page YouTube et faire une carte par vidéo.
- Les miniatures sont téléchargées toutes seules par `_src/build.ps1` dans `assets/yt/<id>.jpg` (en local comme lors de la publication) et affichées en noir et blanc, en couleur au survol.
- Toutes les vidéos YouTube et les films s'ouvrent dans le lecteur en grand (`window.mamiePlayer` dans `assets/site.js`).

## Livres complets et PDF

1. Ajouter le fichier `.muse` dans `_src/textes/sources/` (vérifier que l'autrice ou l'auteur **et** la personne qui a traduit sont mortes depuis plus de 70 ans, ou que les droits sont accordés).
2. Ajouter une ligne dans `_src/textes/livres.txt` : `fichier-source | identifiant | thème | fiche liée | présentation`.
3. Régénérer, puis fabriquer le PDF (Windows + Microsoft Edge nécessaires, à faire en local) :
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File _src/pdf.ps1
   ```
   Les PDF vont dans `livres/pdf/` et doivent être envoyés avec le reste.

## Aperçu local

Le serveur d'aperçu est décrit dans `.claude/launch.json` (nom : `mamie-commune`, port 8765). Après une modification : régénérer, puis ouvrir la page concernée dans l'aperçu et vérifier aussi en largeur mobile (375 px).

## Direction artistique (à respecter)

Collage de papier découpé, d'après les vidéos TikTok de @mamie_commune. Repères relevés dans les vidéos : sous-titres un mot par bande noire avec le mot fort en rose (`data-tags`, mot forcé avec `data-fort="mot"`), bande noire au bord déchiré en haut, notes à la machine à écrire sur papier crème scotché (`.note`), photos et gravures d'époque collées de travers (`.horde`, cartes vidéo), dates sur bandeau rouge (`.timeline`). Le reste : fond crème moucheté, trame de points, grande étoile rouge à cinq branches, titres en lettres de rançon (générées automatiquement par `assets/site.js`), étiquettes noires et roses, bandeaux rouges façon banderole, bords déchirés (`clip-path: var(--torn)`), ombres décalées noires. Couleurs dans `:root` de `assets/style.css` : papier `#ebe3d1`, encre `#171414`, rouge `#e1301c`, rose `#ff5aa8`, jaune `#f5b63b`. Polices locales (`assets/fonts.css`) : Archivo Black (titres), Archivo (texte), Special Elite (machine à écrire), Alfa Slab One. **Aucune ressource externe** (polices, scripts, CDN) : tout est dans `assets/`.

Ton des textes : simple, direct, tutoiement, pas de jargon, phrases courtes. écriture inclusive **sans point médian** : mots neutres (« les gens », « la personne », « le corps enseignant », « une délégation »), doublets (« militantes et militants », « une avocate ou un avocat », « chacune et chacun »), ou phrase tournée autrement (« tu reçois une convocation » plutôt que « tu es convoqué·e »). Jamais de « · », de « iel » ni de « toustes » : ils gênent la lecture et les lecteurs d'écran. Seule exception : un titre d'œuvre publiée (« Sortez couvert·es »).

Accessibilité : un seul `<h1>` par page et pas de saut de niveau de titre ; texte alternatif sur chaque image ; contraste suffisant (texte clair sur `--red-hi`, pas sur `--red`). Le bouton « Aa Lecture facile » (barre de recherche) ajoute la classe `facile` à `<html>` : police simple, texte plus grand, titres sans lettres de rançon, rien de penché. Tout nouvel élément penché (`rotate`) doit être ajouté à la liste `.facile … { transform: none }` de `assets/style.css`. Logo : Mamie **détourée, sans fond** (``assets/mamie-logo-192.webp`` dans l'en-tête et le pied de page, ``mamie-logo-480.webp`` sur l'accueil, original transparent ``mamie-logo-1080.png`` pour les visuels). On les refait avec ``powershell -ExecutionPolicy Bypass -File _src/logo-detoure.ps1``. Jamais ``mamie.webp`` (300 Ko, avec fond) dans les pages. Plus d'image de Mamie en entier.

## Organisation du site : trois familles

Tout le site se range en trois familles, définies **une seule fois** dans `_src/build.ps1` (`$familles`) : **Apprendre** (Révolutions, Bibliothèque, Vidéos), **S''organiser** (Carte des collectifs, Mouvement du 17 Octobre, Antifascisme), **Se défendre** (Guide de manif, Outils numériques). Le menu (une entrée par famille qui déplie ses rubriques), le pied de page (`{{PIED}}`), l''accueil (`{{FAMILLES}}`) et la recherche (champ `f` de `data/recherche.js`, sélecteur « Chercher dans ») en découlent. Couleurs : Apprendre jaune, S''organiser rose, Se défendre rouge (classes `fam--apprendre`, `fam--organiser`, `fam--defendre`). Pour une nouvelle rubrique : l''ajouter dans `` avec sa clé de menu, son adresse, son nom, une description courte et le début de ses adresses.

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
