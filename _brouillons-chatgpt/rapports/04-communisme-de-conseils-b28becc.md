# Rapport de traitement : Communisme de conseils

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/6**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/04-communisme-de-conseils.md` |
| Empreinte du contenu | `b28becc80748d4a89bc1366a62690030e7f8ad7b` |
| Identifiant de traitement | `04-communisme-de-conseils-b28becc` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42600647183 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

J'ai créé le dossier en trois pages `_src/encyclopedie/6-communisme-de-conseils.txt`. Le texte du brouillon est conservé, avec quelques corrections (Mattick émigré dès 1926, DOI vérifiés, notice Rahnema complétée), des renvois internes et l'encadré « Précautions historiques ». `familles.json` n'a pas besoin de changer. Le dossier reste plus léger que les autres, et plusieurs dates sont à faire vérifier, notamment celle de Pannekoek, *Les Conseils ouvriers* : détails dans le rapport.


## Garde-fou (périmètre des changements)

✅ Conforme

Fichiers créés :
- _src/encyclopedie/6-communisme-de-conseils.txt

Fichiers modifiés :
- Aucun.


## Tests automatiques (Windows, générateur du site)

| Résultat | Test | Détail |
|---|---|---|
| ✅ réussi | Génération du site (_src/build.ps1) | OK : 15 guides, 108 fiches, 42 livres, 36 ressources et 33 pages de dossiers générés. |
| ✅ réussi | Aucun avertissement du générateur sur l'encyclopédie |  |
| ✅ réussi | Pages du dossier générées dans encyclopedie/ | 3 page(s) : communisme-de-conseils-histoire, communisme-de-conseils-idees, communisme-de-conseils-heritages |
| ✅ réussi | Liens internes | 406 pages, 4 liens cassés |
| ✅ réussi | Aucune page existante supprimée ou vidée |  |
| ✅ réussi | Aucun brouillon dans la branche proposée |  |
| ⚠️ avertissement | Exclusion des brouillons dans publier.yml de main | Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon. |
| ⚠️ avertissement | Simulation de la copie vers _site (brouillon témoin) | Un brouillon serait copié avec le publier.yml de main. |

## Rapport détaillé de Claude

# Rapport — Communisme de conseils

## 1. Résumé et décision
Brouillon court (~11 000 caractères) sur le communisme de conseils : conseils de 1905/1917, Allemagne 1918-1923, Pannekoek/Gorter, héritages, limites. Orientation conforme (distinctions entre courants, limites présentées). Décision : **intégrer** (dossier 6, trois pages). Le dossier est nettement plus court que les cinq existants.

## 2. Doublons et recoupements
- Tableau comparatif du « communisme de conseils » dans `1-anarchisme.txt` et `2-communisme-libertaire.txt` : pas de répétition de fond.
- Opéraïsme/autonomie : renvoi vers `mouvement-autonome-histoire.html#operaisme`.
- Renvois ajoutés : anarchisme, communisme libertaire, anarcho-syndicalisme, Makhnovtchina (soviets libres), Mai 68, Rojava, parcours Autogestion, glossaire (soviet, autogestion).
- Aucun fichier existant modifié ; `familles.json` : le mouvement y figure déjà sans « voir », rien à changer.

## 3. Corrections
- « Paul Mattick, exilé aux États-Unis » → « émigré aux États-Unis dès 1926 » : il a quitté l'Allemagne avant le nazisme (connaissance générale, à confirmer).
- Résumé « Dans ce dossier » : « révolutions allemande et hongroise » retiré car la Hongrie n'est traitée que pour 1956 (pas 1919).
- Bibliographie : lien Brill (403) remplacé par le DOI vérifié ; notice Rahnema complétée (vol. 103, 2023, DOI) ; Pannekoek 1936 précisé (signé « J.H. », *International Council Correspondence*, avril 1936).
- Ajout de passages de liaison (renvois internes, encadré « Précautions historiques », « Mouvements proches ») sans changer le fond.

## 4. Références vérifiées
- Muldoon, *Intellectual History Review* 31(2), 2021 : Crossref.
- Bourrinet, *The Dutch and German Communist Left*, Brill, 2017, DOI 10.1163/9789004325937 : Crossref.
- Pannekoek, « Workers' Councils », 1936 : page Marxists.org.
- Rahnema, *ILWCH* 103, 2023, DOI 10.1017/S0147547922000308 : recherche web (Cambridge Core).

## 5. À vérifier par une personne
- Date de première parution de Pannekoek, *Les Conseils ouvriers* (« 1946-1947 » non vérifié) ; édition française éventuelle.
- Titre français de Gorter (*Lettre ouverte au camarade Lénine* / *Réponse à Lénine*) et édition française.
- Faits de chronologie (fondation KPD, KAPD, AAUD, GIK, Spartacusbond, S. ou B. 1948) non revérifiés en ligne : connaissance générale concordante.
- Mattick : année d'émigration.

## 6. Points éditoriaux
- Dossier léger par rapport aux autres : manquent la Hongrie 1919 et 1956 en détail, les conseils d'usine de Turin (1919-1920), Kronstadt, Otto Rühle, Gramsci, Mattick et Cajo Brendel, Socialisme ou Barbarie plus en détail, une dimension hors Europe.
- Les trois pages ont peu d'images et pas de portraits (Pannekoek) : à ajouter via Wikimedia Commons.
- Les dossiers Marxisme/Communisme/Socialisme n'existent pas encore.

## 7. Fichiers
- Créé : `_src/encyclopedie/6-communisme-de-conseils.txt`
- Non modifié : `_src/encyclopedie/familles.json`

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
