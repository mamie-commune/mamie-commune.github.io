---
name: ajouter-lieu
description: Ajoute, corrige ou retire un lieu (groupe, syndicat, librairie, lieu autogéré, média, collectif antifa…) sur la carte du site. À utiliser dès qu'on parle d'un lieu ou d'un collectif à mettre sur la carte.
argument-hint: <nom du lieu et ville>
---

# Ajouter un lieu sur la carte

1. Ouvrir `data/lieux.js`. Vérifier que le lieu n'y est pas déjà (chercher le nom et la ville).
2. Choisir la catégorie : `fa` (Fédération anarchiste), `ucl` (Union communiste libertaire), `syndicat`, `librairie`, `lieu` (lieu autogéré, squat, bar asso), `media`, `numerique`, `antifa`.
3. Ajouter une ligne dans le bloc de la même catégorie :
   `["Nom", "categorie", latitude, longitude, "Ville (dép.)", "Description courte."],`
   - Coordonnées **du centre de la ville**, quatre décimales, jamais d'adresse privée ni de domicile.
   - Description : une phrase simple, tutoiement si besoin, écriture inclusive sans point médian (« militantes et militants », « les personnes »).
4. Pour retirer un lieu, supprimer sa ligne ; pour le corriger, modifier la ligne.
5. Pas besoin de régénérer. Ouvrir `carte.html` dans l'aperçu, chercher la ville et vérifier que le point apparaît avec la bonne couleur.
6. Proposer de publier (`/publier`).
