# Rapport de traitement : Situationnisme

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/1**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/zz-test-reel-situationnisme.md` |
| Empreinte du contenu | `61c49435bca3efbec3df29a2e560944af507f753` |
| Identifiant de traitement | `zz-test-reel-situationnisme-61c4943` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42597623608 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

Le dossier témoin (très court) est intégré dans `_src/encyclopedie/6-situationnisme.txt` : trois pages, texte du brouillon conservé mot pour mot, renvois vers Mai 68 et Mouvement autonome. `familles.json` reste inchangé, car le mouvement était déjà rangé sans « voir ». Le dossier est très mince (pas de débats ni de critiques) et une affirmation sur le Comité pour le maintien des occupations n'a pas été retrouvée par la recherche web. Le rapport détaille ces points.


## Garde-fou (périmètre des changements)

✅ Conforme

Fichiers créés :
- _src/encyclopedie/6-situationnisme.txt

Fichiers modifiés :
- Aucun.


## Tests automatiques (Windows, générateur du site)

| Résultat | Test | Détail |
|---|---|---|
| ✅ réussi | Génération du site (_src/build.ps1) | OK : 15 guides, 108 fiches, 42 livres, 36 ressources et 33 pages de dossiers générés. |
| ✅ réussi | Aucun avertissement du générateur sur l'encyclopédie |  |
| ✅ réussi | Pages du dossier générées dans encyclopedie/ | 3 page(s) : situationnisme-histoire, situationnisme-idees, situationnisme-heritages |
| ✅ réussi | Liens internes | 406 pages, 4 liens cassés |
| ✅ réussi | Aucune page existante supprimée ou vidée |  |
| ✅ réussi | Aucun brouillon dans la branche proposée |  |
| ⚠️ avertissement | Exclusion des brouillons dans publier.yml de main | Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon. |
| ⚠️ avertissement | Simulation de la copie vers _site (brouillon témoin) | Un brouillon serait copié avec le publier.yml de main. |

## Rapport détaillé de Claude

# Rapport — Situationnisme

## 1. Résumé et décision
Brouillon-témoin très court (quelques phrases par partie), qui se dit lui-même « ne pas fusionner ». Intégré tel quel, mis au format. **Décision : intégrer** (test de la chaîne). Le dossier n'est pas substantiel au sens de CLAUDE.md : à compléter avant toute vraie publication.

## 2. Doublons et recoupements
Aucun doublon. Recoupement léger avec Mai 68 (`experiences/mai-68-histoire.html`) et le dossier Mouvement autonome : renvois ajoutés.

## 3. Corrections
Texte du brouillon conservé mot pour mot. Ajouts : introduction, conclusion, note signalant le caractère court du dossier, blocs « Dans ce dossier » et « Mouvements proches ». Aucune correction de fond.

## 4. Références vérifiées (WebSearch)
- Fondation en juillet 1957 à Cosio d'Arroscia, dissolution en 1972 (Centre Pompidou, Wikipédia).
- Debord, *La Société du spectacle*, Buchet-Chastel, 1967 (libraires, situationnisteblog).
- Vaneigem, *Traité de savoir-vivre…*, Gallimard, 1967 (une notice d'archive indique 1968 ; 1967 est la date majoritaire).

## 5. À vérifier par une personne
- Participation des situationnistes au Comité pour le maintien des occupations : non retrouvée par la recherche web, conservée car écrite dans le brouillon.
- Revue 1958-1969 : non confirmée par ma recherche.
- Aucun lien externe ajouté.

## 6. Points éditoriaux
Le dossier omet débats internes, exclusions, critiques et dimension internationale, exigés par la ligne éditoriale. Aucun « voir » à retirer : Situationnisme figurait déjà sans « voir ».

## 7. Fichiers
Créé : `_src/encyclopedie/6-situationnisme.txt`. `familles.json` inchangé.

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
