# Rapport de traitement : Socialisme

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/3**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/01-socialisme.md` |
| Empreinte du contenu | `78abd6b1a91da84050a607ec83aec481a5a01e82` |
| Identifiant de traitement | `01-socialisme-78abd6b` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42600647183 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

Le brouillon est intégré tel quel en trois pages (`_src/encyclopedie/6-socialisme.txt`), avec des renvois internes vers la Commune, le 1er Mai, Bakounine et les parcours de l'université populaire. Les liens Larousse et Routledge et la référence d'Eley ont été vérifiés. Le dossier reste court et plusieurs dates sont à faire vérifier (Engels, Luxemburg, Cole). Le rapport est dans rapport.md.


## Garde-fou (périmètre des changements)

✅ Conforme

Fichiers créés :
- _src/encyclopedie/6-socialisme.txt

Fichiers modifiés :
- Aucun.


## Tests automatiques (Windows, générateur du site)

| Résultat | Test | Détail |
|---|---|---|
| ✅ réussi | Génération du site (_src/build.ps1) | OK : 15 guides, 108 fiches, 42 livres, 36 ressources et 33 pages de dossiers générés. |
| ✅ réussi | Aucun avertissement du générateur sur l'encyclopédie |  |
| ✅ réussi | Pages du dossier générées dans encyclopedie/ | 3 page(s) : socialisme-histoire, socialisme-idees, socialisme-heritages |
| ✅ réussi | Liens internes | 406 pages, 4 liens cassés |
| ✅ réussi | Aucune page existante supprimée ou vidée |  |
| ✅ réussi | Aucun brouillon dans la branche proposée |  |
| ⚠️ avertissement | Exclusion des brouillons dans publier.yml de main | Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon. |
| ⚠️ avertissement | Simulation de la copie vers _site (brouillon témoin) | Un brouillon serait copié avec le publier.yml de main. |

## Rapport détaillé de Claude

# Rapport — brouillon « Socialisme »

## 1. Résumé et décision
Brouillon de ~16 Ko sur le socialisme (histoire, idées, héritages), famille « Mouvements socialistes et ouvriers ». Texte sobre, pluraliste, cohérent avec la ligne éditoriale. **Décision : intégrer** (`_src/encyclopedie/6-socialisme.txt`, trois pages).

## 2. Doublons et recoupements
- Pas de doublon massif. Recoupements partiels : Commune de Paris, 1er Mai, AIT/Bakounine (dossier Anarchisme), autogestion, internationalisme.
- Renvois internes ajoutés : `experiences/commune-de-paris-histoire`, `bibliotheque/le-1er-mai`, `figures/bakounine`, `universite/histoire-ouvriere`, `universite/autogestion`, `universite/internationalisme`, `glossaire#internationalisme`, dossiers Anarchisme, Communisme libertaire, Anarcho-syndicalisme.

## 3. Corrections
- Cole : « 7 volumes » → « Cinq tomes, publiés en sept volumes » (précision ; à confirmer).
- « John O'Neill » : la notice Routledge affiche « John Oneill » ; orthographe usuelle conservée.
- Ajouts de structure (pas de fond) : introduction courte, blocs « Dans ce dossier » et « Sources », « Précautions historiques » (dossier de synthèse brève), mention « en préparation » des dossiers voisins.
- Texte historique non modifié.

## 4. Références vérifiées
- Larousse, « Socialisme » : page ouverte ; elle place bien propriété et État au centre de la définition.
- Routledge Encyclopedia of Philosophy, « Socialism » : la page existe (accès partiel).
- Eley, *Forging Democracy*, OUP 2002 : confirmé via Crossref.
- Liens internes : pages existantes dans `_src/`.

## 5. À vérifier par une personne
- Engels (1880) et Luxemburg (1899) : dates non confirmées par une notice consultée ; aucune édition ajoutée.
- Cole : tomes/volumes et années.
- Faits non sourcés ligne à ligne : Owen et saint-simoniens (apparition du mot), rôle du congrès de 1889 dans le 1er Mai, détails du SPD (1875, réorganisation).
- Dossier très court par rapport aux autres : pas d'organisations, journaux ou congrès détaillés, ni de développement sur l'Afrique, l'Asie, les Amériques.

## 6. Points éditoriaux à trancher
- Étoffer le dossier (socialismes hors d'Europe, régimes « socialistes », social-démocratie après 1945).
- Les dossiers voisins (Marxisme, Communisme…) n'existent pas encore.
- `familles.json` contenait « Socialisme » sans « voir » : inchangé.

## 7. Fichiers
- Créé : `_src/encyclopedie/6-socialisme.txt`.

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
