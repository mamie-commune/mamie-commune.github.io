# Rapport de traitement : Situationnisme

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/zz-test-automatisation-situationnisme.md` |
| Empreinte du contenu | `3d92d0b1b866491d90546b044edabb8909bb7c5a` |
| Identifiant de traitement | `zz-test-automatisation-situationnisme-3d92d0b` |
| Statut | **bloque** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42597623608 |

Claude a jugé que le dossier demande une décision humaine avant toute intégration.

## Résumé de Claude

Le brouillon est une fiche de test technique, pas un dossier rédigé. Il contient un sujet, des points à vérifier et trois références de départ, et demande lui-même de ne pas forcer l'intégration. Rien n'a été écrit dans `_src/`. Le rapport recense les recoupements (Mai 68, Mouvement autonome) et les points à vérifier.

## Raisons du blocage

- Le brouillon ne contient aucun texte à intégrer : il faudrait rédiger tout le dossier, ce qui n'est pas une intégration
- Il se déclare dossier témoin de test, à ne pas fusionner et à supprimer, et demande de ne pas forcer l'intégration
- Les faits et les références (dates, exclusions, éditions de Debord et de Jappe) ne sont pas fournis et seraient à établir : il y a un risque d'inventer

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

# Rapport — brouillon « TEST DE L'AUTOMATISATION — Situationnisme »

## 1. Résumé et décision
Le brouillon n'est pas un dossier rédigé. C'est une fiche de cadrage : un sujet (l'Internationale situationniste, 1957-1972), six points « à vérifier et développer », des questions éditoriales et trois références de départ. Il se présente lui-même comme un « dossier témoin technique » destiné à tester la chaîne d'automatisation. Il dit de ne pas le fusionner, de le supprimer après le test et de ne pas forcer l'intégration.

**Décision : bloquer.** Aucun fichier n'a été écrit dans `_src/`. Intégrer obligerait à rédiger trois pages entières (histoire, idées, héritages) sans texte de départ. Ce serait une rédaction nouvelle, pas une intégration. Elle ne pourrait pas être vérifiée dans ce cadre et irait contre la consigne du brouillon. Elle publierait aussi du contenu de test dans l'encyclopédie.

## 2. Doublons et recoupements
- `_src/encyclopedie/familles.json` : « Situationnisme » figure déjà dans la famille « Mouvements étudiants et autonomes », sans dossier et sans « voir ». Il n'y a donc rien à ranger.
- `_src/experiences/1z2-mai68.txt` : le dossier Mai 68 existe. Un futur dossier devra renvoyer vers lui pour ne pas réduire Mai 68 à l'IS. Aucun autre contenu du dépôt ne parle du situationnisme.
- `_src/encyclopedie/5-mouvement-autonome.txt` : proche par la famille et par la critique de l'auto-organisation. Un renvoi est à prévoir.
- Aucun renvoi n'a été ajouté, puisque rien n'a été créé.

## 3. Corrections apportées
Aucune : il n'y a pas de texte à corriger.

## 4. Références vérifiées
Aucune vérification externe n'a été menée. Intégrer a été jugé inopportun, et rien ne devait être publié sur la base de ces éléments.

## 5. Références et affirmations à vérifier par une personne
- Fondation de l'IS le 28 juillet 1957 à Cosio d'Arroscia, par fusion de l'Internationale lettriste, du Mouvement international pour un Bauhaus imaginiste et d'autres groupes.
- Rôles de Debord, Jorn, Bernstein, Pinot-Gallizio et Constant. Les exclusions et ruptures internes (par exemple 1958-1962 et 1970-1972) sont à établir en détail.
- Dissolution en 1972.
- Revue *Internationale situationniste*, 1958-1969 : numéros et archives à vérifier.
- Guy Debord, *La Société du spectacle* (1967) : édition à préciser.
- Anselm Jappe, *Guy Debord* : édition à préciser.
- Rôle réel de l'IS en Mai 68 (Strasbourg 1966, Enragés de Nanterre, Comité d'occupation de la Sorbonne) et mythologie rétrospective.

## 6. Points éditoriaux à trancher
- Faut-il un vrai dossier Situationnisme dans l'encyclopédie ? Dans ce cas, il faudra un brouillon réellement rédigé ou une commande de rédaction explicite.
- Le brouillon actuel doit être supprimé de `_brouillons-chatgpt/` après le test, comme il le demande.
- La Pull Request éventuelle doit rester en brouillon et être fermée sans fusion.

## 7. Fichiers créés ou modifiés
Aucun dans le dépôt. Seul ce rapport a été écrit.

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
