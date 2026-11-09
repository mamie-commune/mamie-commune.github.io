# Rapport de traitement : Socialisme

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/01-socialisme.md` |
| Empreinte du contenu | `a443dba6b1d9caac8669ca51b7cb681912e2c70a` |
| Identifiant de traitement | `01-socialisme-a443dba` |
| Statut | **bloque** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42598679943 |

Claude a jugé que le dossier demande une décision humaine avant toute intégration.

## Résumé de Claude

Le brouillon est une synthèse générale d'environ 6 Ko, sans commune mesure avec les dossiers substantiels de l'encyclopédie (43 à 86 Ko). Je n'ai pu vérifier aucune référence, et le renvoi vers « Histoire ouvrière » est inexact : c'est un parcours, pas un dossier de l'encyclopédie. L'intégrer exigerait de rédiger un dossier entier, ce qui demande une décision humaine. Rien n'a été écrit dans _src/.

## Raisons du blocage

- Texte trop court et trop général pour un dossier de trois pages : manquent organisations, congrès, scissions, figures et dimension internationale
- Étoffer le texte reviendrait à rédiger le dossier, ce qui contredit la règle de préserver le brouillon sans rien inventer
- Aucune référence vérifiable : liens non testés, Engels sans édition, auteurs à confirmer
- Le renvoi « dossier Histoire ouvrière » est faux : c'est un parcours de l'université populaire
- Le brouillon traite peu les désaccords avec la tradition libertaire, qui est l'angle éditorial du site

## Garde-fou (périmètre des changements)

❌ Non conforme

Fichiers créés :
- Aucun.

Fichiers modifiés :
- Aucun.

Problèmes :
- Aucun nouveau dossier n'a été créé.


## Tests automatiques (Windows, générateur du site)

Non exécutés.

## Rapport détaillé de Claude

# Rapport — brouillon « Socialisme » (01-socialisme.md)

## 1. Résumé et décision

Le brouillon (environ 6 Ko) est une présentation générale du socialisme : origines au XIXe siècle, débats sur la réforme et la révolution, sur l'État et sur les partis, puis social-démocratie et communisme, critiques et points à retenir.

**Décision : bloquer.** Aucun fichier n'a été écrit dans `_src/`.

Le texte est un article de synthèse, pas un dossier d'encyclopédie. Les dossiers existants font de 43 à 86 Ko et comptent trois pages chacun. `CLAUDE.md` exige des dossiers « substantiels » : organisations, journaux, congrès, scissions, débats, figures et dimension internationale. Intégrer le brouillon tel quel produirait un dossier très en dessous du standard. L'étoffer relèverait de la rédaction d'un dossier entier, ce qui n'est pas l'intégration d'un texte fourni, et contredirait la règle de préserver le texte et de ne rien inventer.

## 2. Doublons et recoupements

- Aucun doublon direct avec les cinq dossiers existants : anarchisme, communisme libertaire, anarcho-syndicalisme, communalisme libertaire, mouvement autonome.
- Recoupements probables avec les dossiers anarchistes sur la Première Internationale, la querelle avec les marxistes et l'État. Ils seraient à traiter par des renvois internes, non vérifiés ici faute de dossier rédigé.
- Le brouillon renvoie vers « le dossier "Histoire ouvrière" déjà présent dans l'encyclopédie ». C'est inexact : « Histoire ouvrière » est un parcours de l'université populaire (`universite/histoire-ouvriere.html`, cité dans `familles.json`), pas un dossier de l'encyclopédie. Il faudrait corriger le renvoi.
- Mention de « Marxisme », « Communisme » et « Communisme de conseils » : ces mouvements sont des entrées séparées de la famille « Mouvements socialistes et ouvriers ». Le brouillon traite le communisme en quelques lignes, d'où un risque de chevauchement quand ces dossiers seront écrits.

## 3. Corrections apportées

Aucune : rien n'a été modifié.

## 4. Références vérifiées

Aucune. Je n'ai pas pu ouvrir les liens (les commandes réseau ont été refusées dans cet environnement). Aucune vérification n'a donc été faite, ni positive ni négative.

## 5. Références et affirmations à vérifier par une personne

- Isabelle Garo, « Socialisme », *Dictionnaire de la philosophie*, Larousse : le lien et l'attribution à Isabelle Garo sont à contrôler.
- John O'Neill, « Socialism », *Routledge Encyclopedia of Philosophy* : l'auteur, l'adresse et l'accès (probablement payant) sont à contrôler.
- Notice « Socialism » de la *Stanford Encyclopedia of Philosophy* : l'adresse est plausible, mais la notice n'a pas été ouverte et l'auteur n'est pas indiqué.
- Engels, *Socialisme utopique et socialisme scientifique* (1880) : référence sans édition ni éditeur. Il faudrait une édition française précise, ou le texte en ligne vérifié.
- Les noms de Saint-Simon, Fourier, Leroux et Owen sont corrects en soi. Le texte ne donne ni date ni œuvre, ni rien sur la place d'Owen et des coopératives.
- Aucune source n'est donnée pour les affirmations historiques (fractures du XXe siècle, bureaucraties, répressions).
- La bibliographie est trop mince pour un dossier : peu de références en français, aucune sur l'histoire ouvrière hors d'Europe.

## 6. Points éditoriaux à trancher

- Choix à faire : étoffer le brouillon en dossier complet en trois pages (histoire, idées, héritages), ou le laisser comme introduction de famille, par exemple dans `presentation` de la famille « Mouvements socialistes et ouvriers ».
- Contenu manquant par rapport à la ligne éditoriale : perspective internationale (hors Europe), Première et Deuxième Internationales, SFIO et SPD, révolutions de 1848, Commune, répression, place des femmes et du colonialisme dans les partis socialistes (la SFIO et la question coloniale par exemple), rapports avec les libertaires (Marx contre Bakounine).
- Le brouillon est quasi muet sur les désaccords précis avec la tradition libertaire, qui est l'angle du site.
- Il faudra une relecture par la bande (`doc__relire`) quand le dossier sera étoffé.

## 7. Fichiers créés ou modifiés

Aucun dans le dépôt. Seul ce rapport est écrit.

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
