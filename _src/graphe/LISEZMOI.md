# Le Graphe des luttes — données

Tout le graphe vient d'un seul fichier : `graphe.json`. Le code (`assets/graphe.js`) ne change pas quand on ajoute du contenu.
`_src/build.ps1` le vérifie, puis fabrique `data/graphe.js` (l'application `graphe/`), une fiche par élément
(`graphe/<id>.html`, dans la recherche et utilisable dans « Mon dossier ») et les renvois « Dans le graphe des luttes »
sur les pages du site citées.

## Règle d'or : rien d'inventé

- Une relation n'est jamais tracée parce que deux choses ont eu lieu à la même époque.
- Chaque relation a un **texte** qui la justifie, un **statut** et au moins une **source** vérifiable.
- Chaque élément a au moins une source.
- Le statut dit ce qu'on sait :
  - `fait` : fait historique établi ;
  - `interpretation` : lecture d'une historienne ou d'un historien, nommé dans le texte ;
  - `controverse` : les spécialistes ou les mouvements ne sont pas d'accord ;
  - `hypothese` : piste non prouvée, à présenter comme telle.
- Pas de citation entre guillemets sans la source exacte (page, édition).
- Écriture du site : tutoiement, mots fusionnés pour l'écriture inclusive, jamais de point médian.

**Le build refuse de générer le site** si une relation n'a pas de source, de texte ou de statut, si un identifiant
ou une référence est inconnu, ou si une page du site citée n'existe pas. Le message dit exactement quoi corriger.

## Les champs

### `references`
La bibliographie commune : `{ "id": { auteur, titre, edition, annee, url?, langue? } }`.
Une référence n'est ajoutée qu'après vérification qu'elle existe : autrice ou auteur, titre, éditeur et année.
Mettre `"langue": "en"` pour un ouvrage en anglais, qui s'affiche alors « (en anglais) ».

### `noeuds` (éléments)
| champ | contenu |
|---|---|
| `id` | minuscules, chiffres, tirets ; c'est l'adresse de la fiche (`graphe/<id>`) |
| `type` | `personne`, `courant`, `evenement`, `organisation`, `publication`, `concept`, `experience`, `lutte` |
| `nom`, `dates` | le nom affiché ; les dates en clair (« 1809-1865 », « 18 mars - 28 mai 1871 ») |
| `annee`, `fin` | un nombre : l'année qui place l'élément dans la frise ; `fin` facultatif (sert aux filtres de période) |
| `courants` | identifiants des courants associés (éléments de type `courant`) |
| `resume` | une phrase |
| `contexte` | la présentation (un paragraphe, faits sourcés) |
| `pages` | pages du site : `[["figures/proudhon", "Portrait de Proudhon"], …]`, adresse sans `.html` |
| `sources` | `[{ "ref": "jourdain", "precision": "chap. 2" }]` |

### `liens` (relations)
`{ de, vers, type, statut, texte, sources }`. Le `type` est l'un des dix de `relations` (influence, collaboration,
opposition, affiliation, participation, transmission, publication, succession, convergence, critique). Le sens compte :
« `de` *a influencé* `vers` ». Le graphe affiche le sens inverse automatiquement chez l'autre élément.

### `parcours`
`{ id, titre, intro, etapes: [{ n: "<id d'élément>", texte }] }` : une suite d'étapes commentées, suivies avec
« Étape suivante ». Chaque étape renvoie à un élément existant.

## Ajouter un élément, pas à pas
1. Vérifier les sources (livre en main ou notice de bibliothèque), et les ajouter à `references` si besoin.
2. Ajouter l'élément dans `noeuds`, et au moins une relation dans `liens`.
3. Générer le site : `powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1`.
4. Ouvrir `graphe/?n=<id>` et la fiche `graphe/<id>` pour relire.

## Signalements
Les visiteuses et visiteurs signalent depuis le graphe (bouton « Signaler ») : le formulaire prépare un message
qu'iels envoient en message privé à la bande (Instagram ou TikTok), avec l'élément, la relation et la source proposée.
Rien n'est envoyé ni enregistré par le site.

## Données gardées dans le navigateur
`mamie-graphe` : `{ favoris: [ids], parcours: [{ nom, ids }], actif }`. Rien ne quitte l'appareil.
Favoris et parcours se versent dans « Mon dossier » (clé `mamie-dossier`, éléments `graphe/<id>`).
