# Rapport de traitement : Trotskisme

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/7**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/05-trotskisme.md` |
| Empreinte du contenu | `201483ac963df028eb5a79a24ca873c033a32b9c` |
| Identifiant de traitement | `05-trotskisme-201483a` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42600647183 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

J'ai créé le dossier `_src/encyclopedie/6-trotskisme.txt` (trois pages : histoire, idées, héritages) à partir du brouillon, dont le texte est conservé. Je n'ai fait qu'une correction : la date exacte de l'assassinat de Trotski est devenue « août 1940 ». J'ai ajouté des renvois internes vers des pages existantes et vérifié deux références (Alexander et Broué). Le dossier est court et plusieurs références sont à compléter par une personne, ce qui est détaillé dans le rapport. `familles.json` est inchangé, car le Trotskisme y figure déjà sans « voir ». Je n'ai pas pu lancer le générateur (il exige Windows).


## Garde-fou (périmètre des changements)

✅ Conforme

Fichiers créés :
- _src/encyclopedie/6-trotskisme.txt

Fichiers modifiés :
- Aucun.


## Tests automatiques (Windows, générateur du site)

| Résultat | Test | Détail |
|---|---|---|
| ✅ réussi | Génération du site (_src/build.ps1) | OK : 15 guides, 108 fiches, 42 livres, 36 ressources et 33 pages de dossiers générés. |
| ✅ réussi | Aucun avertissement du générateur sur l'encyclopédie |  |
| ✅ réussi | Pages du dossier générées dans encyclopedie/ | 3 page(s) : trotskisme-histoire, trotskisme-idees, trotskisme-heritages |
| ✅ réussi | Liens internes | 406 pages, 4 liens cassés |
| ✅ réussi | Aucune page existante supprimée ou vidée |  |
| ✅ réussi | Aucun brouillon dans la branche proposée |  |
| ⚠️ avertissement | Exclusion des brouillons dans publier.yml de main | Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon. |
| ⚠️ avertissement | Simulation de la copie vers _site (brouillon témoin) | Un brouillon serait copié avec le publier.yml de main. |

## Rapport détaillé de Claude

# Rapport d'intégration — Trotskisme

## 1. Résumé et décision
Brouillon court (≈ 11 Ko) sur le trotskisme (histoire, idées, héritages), équilibré : controverses (Kronstadt, centralisme, scissions) et critiques libertaires présentes. **Décision : intégrer**, dossier `_src/encyclopedie/6-trotskisme.txt` (trois pages). Le dossier est nettement plus court que les précédents : à étoffer éventuellement (POUM/Espagne, Mai 68 et la LCR, Ceylan, Amérique latine, procès de Moscou, figures comme Rosmer ou Mandel).

## 2. Doublons et recoupements
Aucun doublon massif. Renvois ajoutés vers : `experiences/makhno-critique-bolcheviks`, `bibliotheque/orage-a-petrograd`, `bibliotheque/le-communisme-n-existe-pas-en-urss` (Goldman), `antifascisme/index`, `universite/internationalisme`, `encyclopedie/mouvement-autonome-histoire` (#operaisme). Marxisme, Socialisme, Communisme, Communisme de conseils n'ont pas encore de dossier : mentionnés « en préparation », sans lien.

## 3. Corrections
- Assassinat : « le 20 août 1940 » → « en août 1940 ». Raison : Trotski est attaqué le 20 août et meurt le 21 ; la date exacte du brouillon était donc imprécise. Date non rouverte par une source dans cette session : à confirmer par la bande si on veut un jour précis.
- « Mouvements proches » et « Dans ce dossier » mis en forme HTML (note + liste) ; liens rendus internes. Section « Précautions historiques » ajoutée (reprise du ton des autres dossiers).
- Bibliographie : ajout d'une mention que Broué est lui-même proche du courant trotskiste (fait connu, à confirmer) ; ISBN/liens non ajoutés.
- Aucune autre réécriture ; Markdown converti en HTML.

## 4. Références vérifiées
- Alexander, *International Trotskyism, 1929–1985*, Duke University Press, 1991 : page de l'éditeur consultée (titre, auteur, année, « plus de soixante-cinq pays »).
- Broué, *Histoire de l'Internationale communiste 1919-1943*, Fayard, 1997 : notices de catalogues (AMSAB, BN Défense) via recherche web.
- Fondation de la IVe Internationale en 1938 à Périgny-sur-Yerres (chez Alfred Rosmer) : Wikipédia fr (mois précis non confirmé par cette page ; « septembre » repris du brouillon, conforme à mes connaissances).

## 5. À vérifier par une personne
- Années de parution de *La Révolution permanente* (1930), *La Révolution trahie* (1936), *Programme de transition* (1938) : non vérifiées en ligne, éditions françaises non précisées (pas d'éditeur inventé).
- Dates : exclusion 1927, Alma-Ata 1928, expulsion 1929, tentative de mai 1940, scission de 1953 (année confirmée par Wikipédia, pas le détail).
- Références précises des critiques de Goldman, Voline, Pannekoek : non fournies, signalées comme à compléter.
- Affirmations sur Sri Lanka, Amérique latine : générales, sans source.

## 6. Points éditoriaux
- Étoffer le dossier (voir plus haut) avant relecture finale.
- Le terme « État ouvrier dégénéré » est donné comme position de Trotski sans traduction critique supplémentaire.

## 7. Fichiers
Créé : `_src/encyclopedie/6-trotskisme.txt`. `familles.json` non modifié (Trotskisme y figure déjà, sans « voir »).

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
