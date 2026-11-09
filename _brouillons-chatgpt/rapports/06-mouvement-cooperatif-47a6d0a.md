# Rapport de traitement : Mouvement coopératif

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/2**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/06-mouvement-cooperatif.md` |
| Empreinte du contenu | `47a6d0a2d23f4995e5f629f288b60b26f1ecaab0` |
| Identifiant de traitement | `06-mouvement-cooperatif-47a6d0a` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42598679943 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

Le brouillon est intégré tel quel en trois pages dans `_src/encyclopedie/6-mouvement-cooperatif.txt`, avec des renvois vers les pages existantes du site. Le « voir » a été retiré dans `familles.json`. Les faits (Fenwick 1761, Rochdale 1844, ACI 1895, principes) sont vérifiés sur le site de l'Alliance coopérative internationale. Restent à confirmer par une personne : la date de Robert Owen, les ancres `#villes` et `#lip`, et la bibliographie, très mince.


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
Brouillon court (environ 900 mots) sur le mouvement coopératif : Fenwick 1761, Rochdale 1844, principes de l'Alliance coopérative internationale (ACI), types de coopératives, limites. Décision : **intégrer**. Le texte est préservé et réparti en trois pages (histoire, idées, héritages).

## 2. Doublons et recoupements
Pas de doublon massif : les dossiers existants (anarchisme, communisme libertaire, anarcho-syndicalisme) ne traitent la coopération qu'en passant.
Renvois ajoutés vers :
- la rubrique Coopératives de `s-entraider` ;
- les parcours Autogestion et Histoire ouvrière ;
- la fiche *Champs, usines et ateliers* ;
- les portraits de Proudhon et de Kropotkine ;
- le glossaire (#cooperative) ;
- Espagne 1936 (Barcelone) et Lip ;
- les dossiers Anarcho-syndicalisme et Anarchisme.

## 3. Corrections
- Bibliographie : l'URL française « identité coopérative » du brouillon renvoie une erreur 404. Je l'ai remplacée par la page anglaise vérifiée (ica.coop/en/cooperatives/cooperative-identity). Le lien « Notre histoire » reste sur la version ccr.ica.coop, qui répond.
- Dernier point du brouillon (« dossier Les coopératives dans S'entraider ») : remplacé par des liens réels vers le site, car ce dossier n'existe pas.
- Ajouts de forme : titres de sections, blocs « Dans ce dossier » et « Mouvements proches ». Le texte du brouillon n'est pas modifié.

## 4. Références vérifiées (WebFetch, site de l'ACI)
- Fenwick, 14 mars 1761, société des tisserands.
- Rochdale 1844 : 28 artisans.
- ACI fondée à Londres le 19 août 1895.
- Définition de la coopérative et sept principes.

## 5. À vérifier par une personne
- Owen, *A New View of Society* (1813-1816) : non vérifié par une source externe. Les dates d'édition sont à confirmer.
- Les liens internes vers `espagne-1936-organisation.html#villes` et `action-directe-pratique.html#lip` sont repris de `s-entraider.html`. Les deux pages existent dans `_src/experiences/` ; les ancres `#villes` et `#lip` ne sont pas contrôlées ici.
- Bibliographie mince : l'ACI seulement (source institutionnelle du mouvement), aucun ouvrage d'historienne ou d'historien.
- Les principes actuels de l'ACI datent de 1995 ; le texte ne le précise pas. Je n'ai pas vérifié cette date.

## 6. Points éditoriaux à trancher
- Dossier très bref par rapport aux autres. Il manque la dimension internationale hors Europe, les débats précis (Proudhon, Marx, Kropotkine), le cas français, la Commune, l'Espagne, Mondragon. À compléter sans rien inventer.
- Chevauchement avec la rubrique S'entraider#cooperatives : les deux se renvoient l'un à l'autre.

## 7. Fichiers
- Créé : `_src/encyclopedie/6-mouvement-cooperatif.txt`
- Modifié : `_src/encyclopedie/familles.json` (retrait du « voir »)

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
