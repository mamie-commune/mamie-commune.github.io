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
   - guide numérique → `_src/guides/`
2. Pour **modifier**, trouver le fichier avec une recherche sur le titre ou l'identifiant et changer le texte dans le `.txt`, jamais dans le `.html` généré.
3. Pour **créer**, regarder une page voisine et suivre son format (section « Format des pages » de `CLAUDE.md`) :
   - ligne d'en-tête `=== identifiant | Catégorie | Titre | Signature · année | Résumé.` (sans signature pour les guides) ;
   - HTML ensuite, chaque `<h2>` avec un `id` ;
   - encadrés, frises, schémas SVG : classes listées dans `CLAUDE.md`.
4. Écrire avec nos mots : ton simple et direct, tutoiement, écriture inclusive avec le point médian. Jamais de copie d'un texte protégé. Vérifier les dates et les noms.
5. Régénérer : `powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1` (la sortie doit commencer par `OK :`).
6. Ouvrir la page dans l'aperçu, en largeur normale puis mobile (375 px), et la montrer.
7. Proposer de publier (`/publier`).
