---
name: ajouter-lieu
description: Ajoute, corrige, revérifie ou retire une structure de la carte des collectifs (groupe libertaire, syndicat, association, collectif antifasciste, librairie, lieu autogéré, coopérative, centre social, association féministe ou antiraciste, média, structure de solidarité). À utiliser dès qu'on parle d'un lieu à mettre sur la carte, d'une proposition ou d'un signalement reçu par message.
argument-hint: <nom de la structure et ville, ou proposition / signalement reçu>
---

# Ajouter ou corriger une structure sur la carte

La source est `data/lieux.geojson` : **une structure par ligne** (un objet GeoJSON `Feature`). `data/lieux.js` en est tiré par `_src/build.ps1` : ne jamais le modifier à la main.

## Règles de protection (non négociables)

- Jamais de domicile privé, de coordonnée personnelle (portable, adresse perso, nom d'une personne), d'information confidentielle, de localisation de personnes, ni rien qui puisse exposer des militantes et militants.
- Position **au niveau de la ville** (deux décimales suffisent). Une adresse de rue seulement pour un lieu ouvert au public qui la publie lui-même.
- Contact : seulement ce que la structure publie elle-même (site, formulaire, adresse de contact du collectif).
- Ne jamais inventer une structure. Une proposition reçue n'est publiée qu'après vérification.
- Un signalement « information personnelle ou dangereuse » : retirer l'information **tout de suite**, vérifier après.

## Vérifier une proposition (reçue par message Instagram ou TikTok, texte ou fichier `proposition-….json`)

1. La structure existe-t-elle ? Ouvrir son site officiel ou la page publique citée en source (WebFetch ou le navigateur intégré). Sans source publique sûre : ne pas publier, le dire à la personne.
2. Doublon ? Chercher le nom et la ville dans `data/lieux.geojson`.
3. Écrire la ligne (modèle ci-dessous), avec `verifie` = la date du jour, `etat` = `a-jour`.
4. Ne jamais commiter les fichiers de proposition eux-mêmes.

## Modèle d'une ligne

```json
{"type":"Feature","geometry":{"type":"Point","coordinates":[-1.68,48.11]},"properties":{"id":"nom-ville","nom":"Nom exact","categorie":"solidarite","organisation":"","ville":"Rennes (35)","departement":"35","pays":"France","portee":"local","description":"Une phrase simple.","site":"https://…","contact":"","source":"Site officiel de la structure","sourceUrl":"https://…","verifie":"2026-11-02","etat":"a-jour","note":"","ressources":[]}},
```

- `coordinates` : **longitude d'abord**, puis latitude.
- `categorie` : `libertaire` (avec `organisation` : Fédération anarchiste, Union communiste libertaire…), `syndicat`, `association`, `antifa`, `librairie`, `lieu` (lieu autogéré), `cooperative`, `centre-social`, `feministe`, `antiraciste`, `media`, `solidarite`. Liste et couleurs : `$catLieux` dans `_src/build.ps1`.
- Réseau national sans lieu précis : `"geometry": null`, `"portee": "national"`, et `"annuaire"` = la page officielle « près de chez vous ».
- `ressources` : liens du site en plus de ceux de la catégorie, `[{"titre":"…","url":"page-du-site"}]`.

## Signalement d'une information fausse ou ancienne

- Structure fermée, introuvable : `"etat": "a-reverifier"`, `"verifie": ""`, et une `note` qui dit ce qui a été constaté. Si la fermeture est confirmée, retirer la ligne.
- Changement de ville, de site ou de contact : corriger après vérification, mettre `verifie` à la date du jour.

## Après chaque modification

1. Régénérer : `powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1`. Les avertissements « Carte : … » (doublon, champ vide, portable, adresse de rue, catégorie inconnue) doivent être traités.
2. Ouvrir `carte` dans l'aperçu, chercher la ville, ouvrir la fiche : catégorie, site, source, « Vérifiée le … ».
3. Proposer de publier (`/publier`).
