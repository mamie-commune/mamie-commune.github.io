# Mamie Commune — guide pour Claude

Site statique de ressources anarchistes, en français : révolutions, antifascisme, bibliothèque (livres complets + fiches), carte des lieux, vidéos, outils numériques. Publié sur GitHub Pages par `.github/workflows/publier.yml` à chaque envoi sur `main`.

La personne qui tient le site n'est pas développeuse : réponds en français simple, montre le résultat, et propose d'envoyer (commit + push) une fois qu'elle a validé.

Site en ligne : https://mamie-commune.github.io · dépôt : `mamie-commune/mamie-commune.github.io`.

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
| L'accueil et les pages d'index | `_src/pages/*.html` (`index.html`, `carte.html`, `videos.html`, `partage.html`, `mentions-legales.html`, `lecteur.html`, et `guides.html` / `bibliotheque.html` / `experiences.html` / `antifascisme.html` qui deviennent les `index.html` des dossiers) | oui |
| Un dossier Révolutions (Commune, Espagne 1936, zapatistes, Rojava) | `_src/experiences/*.txt` | oui |
| Une page Antifascisme | `_src/antifascisme/*.txt` | oui |
| Une fiche de lecture | `_src/bibliotheque/*.txt` | oui |
| Un guide Outils numériques | `_src/guides/*.txt` | oui |
| Un livre complet (texte du domaine public) | source `.muse` dans `_src/textes/sources/` + une ligne dans `_src/textes/livres.txt` | oui, puis PDF (voir plus bas) |
| Un livre fourni en PDF | le PDF dans `livres/pdf/` + une ligne dans `_src/textes/livres-pdf.txt` | oui |
| Un lieu sur la carte | `data/lieux.js` (une ligne par lieu) | non |
| Une vidéo TikTok | `data/videos.js` (une ligne par publication) | non |
| Les couleurs, polices, mise en page | `assets/style.css` | non |
| Les lettres de rançon, le menu mobile | `assets/site.js` | non |

Fichiers générés (ne pas modifier) : `index.html`, `carte.html`, `videos.html`, `partage.html`, `lecteur.html`, `mentions-legales.html` à la racine, tout `guides/`, `bibliotheque/`, `experiences/`, `antifascisme/`, `livres/*.html`, et `data/guides.js`, `data/bibliotheque.js`, `data/livres.js`, `data/experiences.js`, `data/antifascisme.js`.

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

## Données de la carte (`data/lieux.js`)

Une ligne par lieu : `["Nom", "categorie", latitude, longitude, "Ville (dép.)", "Description courte."]`.
Catégories : `fa`, `ucl`, `syndicat`, `librairie`, `lieu`, `media`, `numerique`, `antifa` (couleurs et noms dans `CATEGORIES_LIEUX` en haut du fichier). Position au niveau de la ville, **jamais d'adresse privée**.

## Vidéos (`data/videos.js`)

Copier une ligne, changer `id` (le nombre à la fin de l'adresse TikTok), `type` (`video` ou `photo`), `date`, `titre`, `vues`, `texte`, `tags`, et éventuellement `lien` vers une page du site. Le lecteur utilisé après le clic est `https://www.tiktok.com/player/v1/<id>` (dans `assets/videos.js`) : l'ancien `embed/v2` donnait des écrans noirs.

Le documentaire *Les Damnés de la Commune* est dans `_src/pages/videos.html`. Le fichier `.mp4` (1,7 Go) n'est **pas** dans le dépôt : c'est le fichier joint de la release GitHub `film` (`…/releases/download/film/les-damnes-de-la-commune.mp4`), lu par l'attribut `data-src` du bouton `.doc__poster`. Pour un autre film : `gh release upload film <fichier.mp4>` (2 Go maximum, nom sans espaces ni accents), puis une nouvelle fiche `.doc` sur le même modèle. Ne jamais ajouter de `.mp4` au dépôt.

## Livres complets et PDF

1. Ajouter le fichier `.muse` dans `_src/textes/sources/` (vérifier que l'auteur·ice **et** le traducteur·ice sont morts depuis plus de 70 ans, ou que les droits sont accordés).
2. Ajouter une ligne dans `_src/textes/livres.txt` : `fichier-source | identifiant | thème | fiche liée | présentation`.
3. Régénérer, puis fabriquer le PDF (Windows + Microsoft Edge nécessaires, à faire en local) :
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File _src/pdf.ps1
   ```
   Les PDF vont dans `livres/pdf/` et doivent être envoyés avec le reste.

## Aperçu local

Le serveur d'aperçu est décrit dans `.claude/launch.json` (nom : `mamie-commune`, port 8765). Après une modification : régénérer, puis ouvrir la page concernée dans l'aperçu et vérifier aussi en largeur mobile (375 px).

## Direction artistique (à respecter)

Collage de papier découpé, d'après les vidéos TikTok de @mamie_commune : fond crème moucheté, trame de points, grande étoile rouge à cinq branches, titres en lettres de rançon (générées automatiquement par `assets/site.js`), étiquettes noires et roses, bandeaux rouges façon banderole, bords déchirés (`clip-path: var(--torn)`), ombres décalées noires. Couleurs dans `:root` de `assets/style.css` : papier `#ebe3d1`, encre `#171414`, rouge `#e1301c`, rose `#ff5aa8`, jaune `#f5b63b`. Polices locales (`assets/fonts.css`) : Archivo Black (titres), Archivo (texte), Special Elite (machine à écrire), Alfa Slab One. **Aucune ressource externe** (polices, scripts, CDN) : tout est dans `assets/`.

Ton des textes : simple, direct, tutoiement, écriture inclusive avec le point médian (militant·es), pas de jargon.

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
