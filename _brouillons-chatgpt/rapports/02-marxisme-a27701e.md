# Rapport de traitement : Marxisme

**Pull Request : https://github.com/mamie-commune/mamie-commune.github.io/pull/4**

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/02-marxisme.md` |
| Empreinte du contenu | `a27701e05c9cd95c3a6e6ece01d3fa241dd50967` |
| Identifiant de traitement | `02-marxisme-a27701e` |
| Statut | **propose** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42600647183 |

Analyse, garde-fou et tests réussis : une Pull Request en brouillon est proposée vers main.

## Résumé de Claude

Le brouillon sur le marxisme est nuancé, sans doublon massif. Je l'ai converti en HTML dans `_src/encyclopedie/6-marxisme.txt` (trois pages), avec des renvois internes vérifiés. Les références en ligne (SEP, Larousse, DOI Chattopadhyay) répondent. Le rapport liste ce qu'une personne doit encore relire : éditions des œuvres, éditeur scientifique du Handbook, affirmations sans source.


## Garde-fou (périmètre des changements)

✅ Conforme

Fichiers créés :
- _src/encyclopedie/6-marxisme.txt

Fichiers modifiés :
- Aucun.


## Tests automatiques (Windows, générateur du site)

| Résultat | Test | Détail |
|---|---|---|
| ✅ réussi | Génération du site (_src/build.ps1) | OK : 15 guides, 108 fiches, 42 livres, 36 ressources et 33 pages de dossiers générés. |
| ✅ réussi | Aucun avertissement du générateur sur l'encyclopédie |  |
| ✅ réussi | Pages du dossier générées dans encyclopedie/ | 3 page(s) : marxisme-histoire, marxisme-idees, marxisme-heritages |
| ✅ réussi | Liens internes | 406 pages, 4 liens cassés |
| ✅ réussi | Aucune page existante supprimée ou vidée |  |
| ✅ réussi | Aucun brouillon dans la branche proposée |  |
| ⚠️ avertissement | Exclusion des brouillons dans publier.yml de main | Absente sur main : elle n'arrivera qu'avec la fusion de contenus-chatgpt (commit 835421d). Sans effet tant que main ne contient aucun brouillon. |
| ⚠️ avertissement | Simulation de la copie vers _site (brouillon témoin) | Un brouillon serait copié avec le publier.yml de main. |

## Rapport détaillé de Claude

# Rapport d'intégration — brouillon « Marxisme »

## 1. Résumé et décision
Brouillon court (≈ 14 Ko) sur le marxisme, famille « Mouvements socialistes et ouvriers » : histoire (Marx et Engels, AIT, Deuxième Internationale, 1917, stalinisme), idées (matérialisme historique, aliénation, État, hégémonie), héritages (marxismes anticoloniaux, féministes, écologistes, critiques). Ton nuancé, pluralité des courants, critiques libertaires présentes, pas de recopie d'œuvre protégée. **Décision : intégrer**, en conservant le texte du brouillon.

## 2. Doublons et recoupements
- Aucun dossier marxiste existant dans l'encyclopédie. Recoupements légers avec `mouvement-autonome-histoire` (opéraïsme), `anarchisme-histoire` (rupture de 1872), `experiences/commune-de-paris-histoire`, `experiences/makhno-critique-bolcheviks` (Kronstadt).
- Renvois ajoutés : dossier Anarchisme et fiche `figures/bakounine` (rupture de 1872) ; `makhno-critique-bolcheviks` (Kronstadt) ; `commune-de-paris-histoire` ; `mouvement-autonome-histoire#operaisme` ; parcours `histoire-ouvriere`, `autogestion` ; fiche `le-communisme-n-existe-pas-en-urss` ; `glossaire`. Tous existent dans `_src/` (vérifié).

## 3. Corrections apportées
- Mise en forme : Markdown → HTML, trois pages, identifiants de titres, blocs « Dans ce dossier », « Mouvements proches », sources en `.ressources`, `<p class="doc__relire">`.
- Ajout d'un paragraphe d'introduction (page 1) et d'une conclusion (page 3) : le brouillon n'en avait pas ; la conclusion ne reprend que ce que dit la section « Critiques et limites ». Raison : format imposé.
- *La Révolution russe* de Luxemburg : le brouillon la date « 1918 » ; écrite en 1918, publiée en 1922 → « écrite en 1918 » (ma connaissance, non revérifiée en ligne).
- Mouvements proches (Socialisme, Communisme, Communisme de conseils, Trotskisme) : sans dossier, cités en texte simple « en préparation », sans lien.
- Aucun « voir » à retirer dans `familles.json` pour Marxisme : fichier non modifié.

## 4. Références vérifiées
- Stanford Encyclopedia of Philosophy, « Karl Marx » : la page répond, révision du 27 mars 2025 (WebFetch).
- Larousse, « Marxisme » : l'adresse répond, article « marxisme » (WebFetch).
- Chattopadhyay, « Karl Marx and Friedrich Engels on Communism » : existe, DOI 10.1093/oxfordhb/9780199602056.013.002 (Crossref, mis en ligne 2013). Le brouillon indiquait 2014 (édition imprimée) : j'ai retiré l'année et ajouté le DOI.
- Dates historiques du brouillon (1848, 1864, 1867, 1872, 1889, 1903, 1919, 1920, 1924, 1929 ; Gramsci 1891-1937) : cohérentes avec mes connaissances ; non revérifiées une à une en ligne.

## 5. À vérifier par une personne
- Direction de l'ouvrage *Oxford Handbook of the History of Communism* (éditeur scientifique) et année d'impression : non confirmées, donc non indiquées.
- Éditions françaises des œuvres citées (éditeurs, traductions) : le brouillon n'en donne pas, je n'en ai pas ajouté.
- Affirmations générales sur Mariátegui, Cabral, Federici, Vogel, Mao, Ho Chi Minh : plausibles, sans source précise dans le brouillon.
- Les Cahiers de prison : dates « 1929-1935 » à confirmer.

## 6. Points éditoriaux à trancher
- Le dossier est assez court par rapport aux dossiers déjà publiés (ni organisations détaillées, ni dimension asiatique/africaine développée, ni Rosa Luxemburg/Kautsky approfondis) : à compléter ultérieurement.
- Le tutoiement et la voix de Mamie sont absents (ton neutre, comme les autres dossiers de l'encyclopédie).
- Famille « Mouvements socialistes et ouvriers » : Socialisme et Communisme n'ont pas encore de dossier ; ordre prévu à confirmer.

## 7. Fichiers créés ou modifiés
- Créé : `_src/encyclopedie/6-marxisme.txt` (trois pages : `marxisme-histoire`, `marxisme-idees`, `marxisme-heritages`).
- Modifié : aucun. Le générateur n'a pas pu être lancé ici (Windows requis) ; les liens internes ont été vérifiés par recherche des identifiants.

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
