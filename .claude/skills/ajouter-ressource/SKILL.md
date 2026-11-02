---
name: ajouter-ressource
description: Ajoute ou met à jour une fiche du Centre de ressources (bibliothèque documentaire) : livre, brochure, article, archive, podcast, documentaire, site indépendant, logiciel libre ou guide pratique, avec lien vers la source originale. À utiliser quand la personne colle l'adresse d'une ressource à référencer, ou demande de vérifier les fiches.
argument-hint: <adresse ou titre de la ressource>
---

# Ajouter une fiche au Centre de ressources

Le mode d'emploi complet (champs, vocabulaire, règles) est dans `_src/ressources/LISEZMOI.md` : le lire d'abord.

1. **Ouvrir la source originale** (WebFetch, ou le navigateur intégré si le site bloque les robots). Lire au moins sa page de présentation, et le contenu si possible. Si le site demande de passer une vérification anti-robot, ne pas la contourner : dire à la personne que la fiche attendra une vérification à la main.
2. **Remplir une fiche** sur le modèle de `_src/ressources/_modele.json`, dans le fichier JSON du bon type (`centres-et-sites.json`, `textes.json`, `archives-et-medias.json`, `outils-et-guides.json`, `sur-le-site.json`) ou dans un nouveau fichier.
   - Ne rien inventer : titre, auteur, date, éditeur, licence viennent de la source. Dans le doute, champ vide.
   - `resume` seulement à partir de ce qui a été lu ; `consultation` dit ce qui a été lu.
   - `nature` : militante, historique, universitaire, témoignage ou institutionnelle.
   - `verifie` : la date du jour (AAAA-MM-JJ).
   - `complements` : relier les fiches, dossiers et livres du site qui vont avec.
3. **Régénérer** (`powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1`) : aucun avertissement « Ressource … » ne doit sortir.
4. **Vérifier** la fiche `ressources/<id>` et sa présence sur `ressources/` avec les filtres (thématique, type), sur ordinateur et à 375 px.
5. Proposer de publier (`/publier`).

Pour **revérifier** des fiches : rouvrir chaque adresse, corriger ce qui a changé, mettre à jour `verifie`. Un lien mort qu'on ne peut pas remplacer : le signaler à la personne avant de retirer la fiche.
