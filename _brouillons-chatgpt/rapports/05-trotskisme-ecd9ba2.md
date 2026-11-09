# Rapport de traitement : Trotskisme

| | |
|---|---|
| Brouillon | `_brouillons-chatgpt/dossiers/05-trotskisme.md` |
| Empreinte du contenu | `ecd9ba2b56e3a7934c3c37fc1a6a60bba974cfdb` |
| Identifiant de traitement | `05-trotskisme-ecd9ba2` |
| Statut | **bloque** |
| Exécution | https://github.com/mamie-commune/mamie-commune.github.io/actions/runs/42598679943 |

Claude a jugé que le dossier demande une décision humaine avant toute intégration.

## Résumé de Claude

Le brouillon est une notice d'environ 700 mots, globalement exacte. Elle est très loin du format et de la profondeur des dossiers de l'encyclopédie (trois pages, 43 à 86 Ko). L'intégrer reviendrait à écrire l'essentiel du contenu, ce qui est contraire à la règle de préserver le texte et de ne rien inventer. Aucun fichier n'a été écrit dans `_src/` ; le rapport est dans `rapport.md`.

## Raisons du blocage

- Brouillon trop mince : environ 700 mots, sans structure en trois pages, sans « Dans ce dossier » ni « Mouvements proches », alors que CLAUDE.md demande des dossiers substantiels (organisations, scissions, débats, figures, dimension internationale).
- Omissions éditoriales majeures pour une encyclopédie libertaire : Kronstadt, le POUM et l'Espagne, les débats sur la nature de l'URSS, les scissions de la Quatrième Internationale et le trotskisme hors d'Europe. Il faudrait écrire ces contenus sans texte de départ ni source vérifiée.
- Les dossiers Socialisme, Marxisme et Communisme de la même famille n'existent pas encore, alors que la méthode demande un dossier à la fois dans l'ordre. Les renvois internes ne pourraient pas pointer vers eux.
- Bibliographie incomplète et non vérifiable : le lien du chapitre de la Cambridge History of Communism a renvoyé une erreur 503, et les éditions françaises des œuvres de Trotski ne sont pas indiquées.

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

# Rapport — brouillon « Trotskisme » (05-trotskisme.md)

## 1. Résumé et décision

**Décision : bloquer (aucun fichier écrit dans `_src/`).**

Le brouillon fait environ 700 mots. C'est une notice de synthèse, avec une bibliographie de cinq lignes. Elle est exacte dans les grandes lignes. Elle n'a pas le format de dossier de l'encyclopédie : pas de découpage en trois pages (histoire, idées, héritages), pas de « Dans ce dossier », pas de « Mouvements proches ».

Les dossiers déjà publiés font de 43 à 86 Ko. `CLAUDE.md` demande des dossiers « substantiels » : organisations, journaux, congrès, scissions, débats, figures, dimension internationale, échecs et contradictions. Le brouillon n'aborde presque rien de cela :
- Il ne dit rien de Kronstadt, du rôle de Trotski dans la répression de 1921 ni de la guerre civile.
- Il ne dit rien de l'entrisme, du débat sur la nature de l'URSS (Shachtman, Cliff, Mandel, Pablo, Healy…) ni des scissions de la Quatrième Internationale.
- Il ne dit rien du trotskisme en France (OCI, LCR, Lutte ouvrière, NPA), en Amérique latine, au Sri Lanka ni en Bolivie.
- Il ne dit rien des procès de Moscou, de l'affaire Sedov, ni du rapport avec les anarchistes (Makhno, Kronstadt, Espagne 1936–37 et le POUM).

Intégrer reviendrait à écrire plus de 95 % du contenu. Cela irait contre la règle « préserve le texte, pas de réécriture » et obligerait à produire sans source des dates et des noms que je ne peux pas tous vérifier ici.

Autre point : la famille « Mouvements socialistes et ouvriers » n'a encore aucun dossier (Socialisme, Marxisme et Communisme n'existent pas). La méthode demandée est un dossier à la fois, dans l'ordre. Un dossier Trotskisme arriverait avant les dossiers Marxisme et Communisme dont il dépend, et ses renvois « Mouvements proches » ne pointeraient vers rien.

## 2. Doublons et recoupements

- Aucun doublon massif. `_src/encyclopedie/` contient seulement Anarchisme, Communisme libertaire, Anarcho-syndicalisme, Communalisme libertaire et Mouvement autonome.
- Recoupements possibles à vérifier par une personne : `experiences/` (Makhno, Espagne 1936, pour Kronstadt et le POUM) et `anarchisme-idees.html#marxismes` (conseils ouvriers, marxisme).
- Aucun renvoi ajouté, puisque rien n'a été intégré.
- `familles.json` : « Trotskisme » est déjà dans la famille 2, sans « voir ». Rien à retirer.

## 3. Corrections au texte

Aucune. Remarques de fond, à trancher avant toute reprise :
- « Trotski est exclu du parti en 1927, expulsé d'URSS en 1929 » : cohérent avec l'historiographie courante.
- « Quatrième Internationale fondée en septembre 1938, près de Paris » : confirmé par la page Marx200 (« Paris 1938 »). À préciser avant publication : la conférence s'est tenue à Périgny, près de Paris, ce que je n'ai pas vérifié dans une source consultée.
- « Assassiné en août 1940 au Mexique par un agent du NKVD » : fait établi, mais la formule est à vérifier ligne par ligne (attaque le 20 août, mort le 21). La page Marx200 consultée ne le détaille pas.
- La présentation de la révolution permanente est correcte mais très abrégée. Une présentation critique est attendue dans un dossier : débat avec Staline, Boukharine et les mencheviks, et critiques libertaires.
- Le brouillon ne mentionne pas le rôle de Trotski à Kronstadt (1921) ni dans l'interdiction des fractions. Dans une encyclopédie libertaire, ce silence serait une omission éditoriale importante, que « Une histoire à examiner de façon critique » ne comble pas.

## 4. Références vérifiées

- Marx200, « Left-wing opposition and the Fourth International (Trotskyism) » : la page répond (WebFetch) et correspond au titre indiqué. Auteur non indiqué sur la page.

## 5. À vérifier par une personne

- *The Cambridge History of Communism*, chapitre « Trotsky and Trotskyism » : le lien PDF a renvoyé une erreur 503. Il n'a donc pas pu être vérifié. Le titre exact du chapitre, ses auteurs, le volume (la référence n'est pas donnée) et la date sont à confirmer (par exemple via Crossref ou le catalogue de Cambridge University Press).
- Trotski, *La Révolution permanente* (1930), *La Révolution trahie* (1936) et *Programme de transition* (1938) : dates plausibles pour les originaux. Les éditions françaises ne sont pas données (éditeur, traducteur). Je n'ai pas pu les contrôler ; rien n'a été complété.
- Le brouillon ne donne aucune ressource en français, ni source libertaire critique (par exemple sur Kronstadt).

## 6. Points éditoriaux à trancher

- Faut-il d'abord écrire les dossiers Socialisme, Marxisme et Communisme, comme le veut l'ordre de la méthode ?
- Faut-il faire rédiger un vrai brouillon en trois parties : histoire et origines, idées et théories, héritages ? Les passages à couvrir sont les scissions, la France, l'international, Kronstadt, le POUM et les débats avec les libertaires.
- Faut-il garder la formule « marxistes révolutionnaires ou bolcheviks-léninistes » ? Elle est exacte, mais il faudrait rappeler que « bolchevik-léniniste » était l'appellation de l'Opposition de gauche.

## 7. Fichiers créés ou modifiés

Aucun dans `_src/`. Seul ce rapport a été écrit.

---
Ce rapport a été produit automatiquement par le workflow « Traiter les brouillons ChatGPT ». Rien n'est publié tant que la Pull Request n'a pas été relue, sortie du mode brouillon et fusionnée par une personne.
