---
name: ajouter-page
description: Écrit ou modifie une page de contenu du site Mamie Commune : fiche de lecture (Bibliothèque), dossier Révolutions, page Antifascisme ou guide Outils numériques. À utiliser quand la personne demande une nouvelle fiche, un nouveau dossier, ou une correction de texte.
argument-hint: <sujet de la page>
---

# Ajouter ou modifier une page

1. Choisir le dossier :
   - fiche de lecture → `_src/bibliotheque/`
   - dossier sur une révolution → `_src/experiences/`
   - antifascisme → `_src/antifascisme/`
   - guide de manif → `_src/manif/` (la catégorie = la sous-rubrique : Legal Team…)
   - fiche Agir ensemble (AG, collectif, caisse, tract, affiches) → `_src/agir/` (la catégorie = la sous-rubrique)
   - guide numérique → `_src/guides/`
2. Pour **modifier**, trouver le fichier avec une recherche sur le titre ou l'identifiant et changer le texte dans le `.txt`, jamais dans le `.html` généré.
3. Pour **créer**, regarder une page voisine et suivre son format (section « Format des pages » de `CLAUDE.md`) :
   - ligne d'en-tête `=== identifiant | Catégorie | Titre | Signature · année | Résumé.` (sans signature pour les guides) ;
   - HTML ensuite, chaque `<h2>` avec un `id` ;
   - encadrés, frises, schémas SVG : classes listées dans `CLAUDE.md`.
   - pour une fiche de lecture, suivre le plan : Contexte (qui écrit, quand, pourquoi), La thèse, Les idées dans l'ordre, Débats et limites, Et aujourd'hui ?, À retenir ;
   - finir **toute** page par `<h2 id="sources">Sources et pour aller plus loin</h2>` et un `<div class="ressources">` de cartes `<section><h3>Lire</h3><ul><li>…</li></ul></section>` (voir « Sources » dans `CLAUDE.md`). Chaque lien externe doit être **vérifié** (il répond, et c'est la bonne page) ; un livre sans lien : titre, auteur, éditeur, année, uniquement si on en est sûr. Pour une nouvelle fiche de lecture, ajouter l'adresse du texte original sur la Bibliothèque anarchiste dans `_src/textes/originaux.txt`.
4. Écrire avec nos mots : ton simple et direct, tutoiement, écriture inclusive **sans point médian** (mots neutres, doublets « militantes et militants », phrases tournées autrement ; voir « Ton des textes » dans `CLAUDE.md`). Jamais de copie d'un texte protégé. Vérifier les dates et les noms.
5. Régénérer : `powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1` (la sortie doit commencer par `OK :`).
6. Ouvrir la page dans l'aperçu, en largeur normale puis mobile (375 px), et la montrer.
7. Proposer de publier (`/publier`).
