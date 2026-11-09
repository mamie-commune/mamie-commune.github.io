# Rapport de traitement : Communisme

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/5**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/03-communisme.md` |
| Empreinte du contenu | `419812fbde60ac2acd9ff2a3065cee4a1ac1d767` |
| Identifiant de traitement | `03-communisme-419812f` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42600647183 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

Le dossier Communisme est intégré en trois pages dans `_src/encyclopedie/6-communisme.txt`. Le texte du brouillon est conservé, avec une seule correction factuelle (Cuba, 1959 puis 1961) et des renvois vers les dossiers Communisme libertaire et Anarchisme. Les trois ouvrages de la bibliographie sont vérifiés, mais le dossier reste court et peu développé hors d'Europe et de l'URSS.


## Garde-fou (périmètre des changements)

✅ Conforme

Fichiers créés :
- _src/encyclopedie/6-communisme.txt

Fichiers modifiés :
- Aucun.


## Tests automatiques (Windows, générateur du site)

| Résultat | Test | Détail |
|---|---|---|
| ✅ réussi | Génération du site (_src/build.ps1) | OK : 15 guides, 108 fiches, 42 livres, 36 ressources et 33 pages de dossiers générés. |
| ✅ réussi | Aucun avertissement du générateur sur l'encyclopédie |  |
| ✅ réussi | Pages du dossier générées dans encyclopedie/ | 3 page(s) : communisme-histoire, communisme-idees, communisme-heritages |
| ✅ réussi | Liens internes | 406 pages, 4 liens cassés |
| ✅ réussi | Aucune page existante supprimée ou vidée |  |
| ✅ réussi | Aucun brouillon dans la branche proposée |  |
| ⚠️ avertissement | Exclusion des brouillons dans publier.yml de main | Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon. |
| ⚠️ avertissement | Simulation de la copie vers _site (brouillon témoin) | Un brouillon serait copié avec le publier.yml de main. |

## Rapport détaillé de Claude

# Rapport d'intégration — Communisme

## 1. Résumé et décision
Brouillon de ~13 Ko sur le communisme (famille « Mouvements socialistes et ouvriers ») : histoire (des communismes pré-marxistes à 1991), idées (abolition des classes, libertaire/d'État, planification), héritages (communismes du XXe siècle, critiques libertaires et conseillistes, horizon actuel). Texte nuancé, conforme à la ligne éditoriale. **Décision : intégrer.** Le dossier est nettement plus court que les cinq dossiers existants (40 à 85 Ko) et ne couvre presque pas le communisme hors d'Europe/URSS (Chine, Cuba, Vietnam, Afrique : une phrase) : à étoffer ensuite.

## 2. Doublons et renvois
- Recoupement avec « Communisme libertaire » (dossier 2) et « Anarchisme » : le brouillon se limite à un paragraphe et renvoie vers eux (renvois ajoutés dans l'intro, la section idées et « Mouvements proches »).
- Renvois internes ajoutés : Commune de Paris, critique libertaire des bolcheviks (Kronstadt), livre *La Conquête du pain*, glossaire.
- « Socialisme », « Marxisme », « Communisme de conseils », « Trotskisme » n'ont pas de dossier : cités sans lien, indiqués « en préparation ».

## 3. Corrections
- Cuba : avant « à Cuba en 1959 » → après « à Cuba (révolution de 1959, régime qui se proclame communiste à partir de 1961) ». Raison : la révolution de 1959 n'était pas encore proclamée communiste ; le texte parlait de « régimes dirigés par des partis communistes ».
- Introduction courte ajoutée en tête de page 1 (exigée par le format) et blocs « Dans ce dossier », « Mouvements proches », renvois de bibliographie : éléments de structure, pas de réécriture.
- Mentions « XXe » mises en exposant HTML ; * * → `<cite>` ; l'URL OUP intégrée dans une notice ; « critique libertaire et conseilliste » précisée par un renvoi.
- Le reste du texte est conservé mot pour mot.

## 4. Références vérifiées
- Stephen A. Smith (dir.), *The Oxford Handbook of the History of Communism*, OUP : titre, éditeur et direction confirmés par Crossref (DOI 10.1093/oxfordhb/9780199602056.001.0001) ; la page academic.oup.com/edited-volume/35402 répond et porte ce titre.
- Lars T. Lih, *Lenin*, Reaktion Books (Critical Lives), 2011 : confirmé (site Reaktion, ISBN 9781861897930).
- McDermott et Agnew, *The Comintern*, Macmillan, 1996 : confirmé (catalogues, Springer).
- *La Conquête du pain* : livre présent sur le site.
- Liens internes vérifiés dans `_src/` et le dépôt (experiences/makhno-critique-bolcheviks, commune-de-paris-histoire, livres/la-conquete-du-pain, glossaire#communisme-libertaire, dossiers encyclopédie).

## 5. À vérifier par une personne
- **Année de l'Oxford Handbook** : Crossref donne 2013 (mise en ligne), le brouillon 2014 (édition imprimée, de mémoire). Conservé 2014 ; à confirmer.
- Marx, *Critique du programme de Gotha* et *Manifeste*, Kropotkine : sans édition ni lien (le brouillon n'en donnait pas) ; ajouter une édition française vérifiée si souhaité.
- Faits historiques courants (Morelly 1755, Cabet *Icarie* 1840, AIT 1864, Komintern 1919, interdiction des fractions 1921, 1956, 1968, 1989, 1991) : cohérents avec mes connaissances, non revérifiés un par un en ligne.
- Affirmation « famines » (URSS années 1930) et « système concentrationnaire » : formulation générale, à sourcer plus précisément (ex. Famine de 1932-1933, Goulag).

## 6. Points éditoriaux à trancher
- Étoffer le dossier (Chine, Cuba, Vietnam, mouvements anticoloniaux, partis communistes en France/Italie, résistance, femmes, répression des anarchistes en détail), pour atteindre la profondeur des autres dossiers.
- Pas de bibliographie en français : ajouter des ouvrages francophones vérifiés.
- Dossier « à relire par la bande » (marqueur conservé).
- `familles.json` : « Communisme » figure déjà sans « voir » ; aucune modification nécessaire.

## 7. Fichiers
- Créé : `_src/encyclopedie/6-communisme.txt` (3 pages).
- `familles.json` : inchangé.

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
