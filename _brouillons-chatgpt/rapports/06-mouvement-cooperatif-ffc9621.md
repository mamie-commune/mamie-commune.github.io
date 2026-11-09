# Rapport de traitement : Mouvement coopératif

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/8**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/06-mouvement-cooperatif.md` |
| Empreinte du contenu | `ffc9621e5fb83ddb209d16cc823a1814b48215cd` |
| Identifiant de traitement | `06-mouvement-cooperatif-ffc9621` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42600647183 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

Le dossier est intégré en trois pages dans `_src/encyclopedie/6-mouvement-cooperatif.txt`, avec des renvois vers les dossiers existants. Le « voir » du mouvement a été retiré de `familles.json`. J'ai corrigé un lien de l'Alliance coopérative internationale qui renvoyait une erreur 404 et retiré une référence trop vague (Patmore et Balnave). Plusieurs affirmations non sourcées, la bibliographie courte et la perspective surtout européenne sont signalées dans le rapport. Je n'ai pas pu lancer le générateur du site.


## Garde-fou (périmètre des changements)

✅ Conforme

Fichiers créés :
- _src/encyclopedie/6-mouvement-cooperatif.txt

Fichiers modifiés :
- _src/encyclopedie/familles.json


## Tests automatiques (Windows, générateur du site)

| Résultat | Test | Détail |
|---|---|---|
| ✅ réussi | Génération du site (_src/build.ps1) | OK : 15 guides, 108 fiches, 42 livres, 36 ressources et 33 pages de dossiers générés. |
| ✅ réussi | Aucun avertissement du générateur sur l'encyclopédie |  |
| ✅ réussi | Pages du dossier générées dans encyclopedie/ | 3 page(s) : mouvement-cooperatif-histoire, mouvement-cooperatif-idees, mouvement-cooperatif-heritages |
| ✅ réussi | Liens internes | 406 pages, 4 liens cassés |
| ✅ réussi | Aucune page existante supprimée ou vidée |  |
| ✅ réussi | Aucun brouillon dans la branche proposée |  |
| ⚠️ avertissement | Exclusion des brouillons dans publier.yml de main | Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon. |
| ⚠️ avertissement | Simulation de la copie vers _site (brouillon témoin) | Un brouillon serait copié avec le publier.yml de main. |

## Rapport détaillé de Claude

# Rapport — Mouvement coopératif

## 1. Résumé et décision
Brouillon court (trois parties : histoire, idées, héritages) sur le mouvement coopératif, famille « Mouvements socialistes et ouvriers ». Texte sobre, nuancé (limites, contradictions, Mondragón). **Décision : intégrer.**

## 2. Doublons et recoupements
Aucun doublon massif. Les dossiers Anarchisme, Anarcho-syndicalisme et Mouvement autonome évoquent la coopération en passant. Renvois ajoutés : anarcho-syndicalisme (#syndicalisme-revolutionnaire), mouvement autonome (#auto-organisation), parcours `entraide-mutualisme`, `histoire-ouvriere`, `autogestion`, Commune de Paris, tiroir S'entraider (#cooperatives). Les dossiers Socialisme et Marxisme n'existent pas encore : cités sans lien.

## 3. Corrections
- Lien ACI « Identité, valeurs et principes » : l'adresse du brouillon (`/fr/coop%C3%A9ratives/identite-cooperative-valeurs-et-principes`) renvoie une erreur 404. Remplacée par `https://ica.coop/fr/cooperatives/identite-cooperative` (page vérifiée, définition et sept principes).
- Bibliographie « Greg Patmore et Nikola Balnave, travaux sur… » : retirée, référence trop vague pour être citée.
- Titres `h2` numérotés et identifiants ajoutés, introduction courte ajoutée (reprend le texte de présentation), « Dans ce dossier » et « Mouvements proches » ajoutés selon le format des dossiers existants.
- Le texte du brouillon n'est sinon pas modifié. « Mouvements proches » du brouillon (Socialisme, Anarchisme…) conservé, avec liens vers les dossiers existants.
- `familles.json` : « voir » du Mouvement coopératif retiré.

## 4. Références vérifiées
- ACI, « Notre histoire » (ccr.ica.coop) : répond ; confirme Rochdale 1844, 28 artisans, et fondation de l'ACI à Londres le 19 août 1895, premier congrès.
- ACI, « Identité, valeurs et principes coopératifs » : répond ; définition et sept principes conformes.
- Birchall, *The International Co-operative Movement*, Manchester University Press, 1997 : confirmée (notice Université de Stirling, ISBN 9780719048234 ; WorldCat).

## 5. À vérifier par une personne
- Non vérifiés en ligne : Fenwick Weavers' Society 1761 ; associations ouvrières de production parisiennes des années 1830 ; dates et rôles de Raiffeisen et Schulze-Delitzsch ; Mondragón « années 1950 » et critiques citées (écarts de rémunération, salariés non membres) — affirmations générales sans source dans le brouillon.
- Owen, *A New View of Society* (1813-1816) et Marx, *La Guerre civile en France* (1871) : œuvres connues, mais ni édition ni passage précis donnés ; la lecture de Marx sur les coopératives mériterait une citation exacte (voir aussi son Adresse inaugurale de 1864).
- Le brouillon ne cite aucune source sur Mondragón ni sur la France : bibliographie à étoffer.
- Dossier très court comparé aux autres ; perspective internationale limitée (Europe surtout ; rien sur l'Amérique latine, l'Asie, l'Afrique, le rôle des femmes ou le colonialisme).

## 6. Points éditoriaux à trancher
- Enrichir le dossier (coopératives hors Europe, lien avec Proudhon et le mutualisme, coopératives libertaires comme en Espagne 1936) ?
- Le lien ACI « Notre histoire » est sur le sous-domaine régional ccr.ica.coop : acceptable ?

## 7. Fichiers
- Créé : `_src/encyclopedie/6-mouvement-cooperatif.txt`
- Modifié : `_src/encyclopedie/familles.json` (retrait du « voir »)
- Non testé : génération du site (Windows requis).

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
