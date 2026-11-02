# Centre de ressources : ajouter une fiche documentaire

Le centre de ressources (`ressources/` sur le site) est la bibliothèque documentaire de Mamie Commune : une fiche par ressource extérieure ou intérieure au site (livre, brochure, article, archive, podcast, documentaire, site indépendant, logiciel libre, guide pratique), avec un lien vers la source originale.

Les fiches sont rangées dans ce dossier, au format **JSON** (texte simple, lisible, sans logiciel particulier). Un fichier peut contenir **une fiche** (un objet `{ … }`) ou **une liste de fiches** (`[ { … }, { … } ]`). Les fichiers dont le nom commence par `_` sont ignorés (comme `_modele.json`).

Fichiers actuels : `centres-et-sites.json`, `textes.json`, `archives-et-medias.json`, `outils-et-guides.json`, `sur-le-site.json`. Pour une nouvelle fiche, on peut l'ajouter dans le fichier qui correspond, ou créer un fichier à son nom (`ma-ressource.json`).

## En cinq étapes

1. **Lire la ressource.** Ouvrir la source originale. Lire au moins sa page de présentation, et si possible le contenu lui-même.
2. **Copier le modèle** `_modele.json` et remplir chaque champ (voir plus bas).
3. **Vérifier l'adresse** : elle répond, c'est la bonne page, c'est la source originale (pas une copie).
4. **Régénérer le site** :
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1
   ```
   Le générateur contrôle chaque fiche et affiche un avertissement en cas de champ vide, de valeur inconnue ou d'identifiant en double.
5. **Regarder la fiche** sur `ressources/<id>` et sur la page du centre, puis publier.

## Les champs

| Champ | Ce qu'on y met |
|---|---|
| `id` | Identifiant unique, en minuscules, chiffres et tirets, sans accent. Il devient l'adresse de la fiche. Ne plus le changer ensuite. |
| `titre` | Le titre exact, tel qu'il apparaît à la source. |
| `auteurs` | Liste des autrices, auteurs ou collectifs : `["Emma Goldman"]`. |
| `date` | Année ou période, en texte : `"1911"`, `"1889-1890"`, `"depuis 1957"`. Vide si on ne la connaît pas. La recherche par époque utilise la première année trouvée. |
| `type` | Un seul parmi : `livre`, `brochure`, `article`, `archive`, `podcast`, `documentaire`, `site`, `logiciel`, `guide`. |
| `themes` | Une ou plusieurs thématiques parmi la liste plus bas. |
| `niveau` | `decouverte` (pour débuter), `intermediaire` ou `approfondi`. |
| `langues` | Liste : `fr`, `en`, `es`, `it`, `de`, `pt`, `multilingue`. |
| `format` | En clair : « Texte en ligne, PDF », « Radio en direct », « Système à lancer depuis une clé USB »… |
| `nature` | D'où parle la source : `militante`, `historique` (document d'époque), `universitaire`, `temoignage` ou `institutionnelle`. |
| `presentation` | Ce qu'est la ressource : qui la publie, quand, sous quelle forme. Une ou deux phrases. |
| `resume` | Ce qu'elle dit ou contient, **écrit seulement à partir de ce qu'on a lu**. Vide si on n'a pas lu le contenu (la fiche l'indique alors). |
| `consultation` | Ce qu'on a lu pour écrire la fiche : « Texte intégral sur… », « Page d'accueil du site », « Notice du catalogue ». |
| `source` | Le site ou l'institution qui publie la ressource d'origine. |
| `url` | L'adresse de la source originale. Pour une ressource du site : chemin relatif, `../livres/la-conquete-du-pain.html`. |
| `licence` | Seulement si elle est indiquée à la source (ou « Domaine public » quand c'est certain). Sinon vide. |
| `verifie` | Date de la vérification, au format `AAAA-MM-JJ`. À mettre à jour à chaque revérification. |
| `complements` | Liste de liens utiles : `{ "titre": "…", "url": "…" }`. Vers une autre fiche du centre : `autre-id.html` ; vers une page du site : `../dossier/page.html`. |

## Les thématiques

`anarchisme` (Anarchisme), `communisme-libertaire` (Communisme libertaire), `syndicalisme-revolutionnaire` (Syndicalisme révolutionnaire), `autogestion` (Autogestion), `histoire-ouvriere` (Histoire ouvrière), `antifascisme` (Antifascisme), `feminisme` (Féminisme), `luttes-queer` (Luttes queer), `antiracisme` (Antiracisme), `anticolonialisme` (Anticolonialisme), `ecologie-sociale` (Écologie sociale), `communalisme` (Communalisme), `internationalisme` (Internationalisme), `education-populaire` (Éducation populaire), `droits-sociaux` (Droits sociaux), `culture-militante` (Culture militante), `autonomie-numerique` (Autonomie numérique).

Pour ajouter une thématique, un type, une langue ou une nature : compléter la liste correspondante (`$resThemes`, `$resTypes`, `$resLangues`, `$resNatures`) dans `_src/build.ps1`, et ce fichier.

## Les règles de la bande

- **Ne jamais inventer** une référence, un auteur, une date, un éditeur ou une licence. Dans le doute, on laisse le champ vide.
- **Ne jamais résumer ce qu'on n'a pas lu.** Le champ `consultation` dit honnêtement ce qui a été consulté ; le `resume` ne va pas plus loin.
- **Ne pas republier** d'œuvre protégée : la fiche présente et renvoie vers la source. Les livres complets publiés sur le site sont seulement ceux du domaine public ou diffusés avec l'accord des ayants droit.
- **Privilégier la source originale** (le site de l'éditeur, de l'archive, de l'auteur) plutôt qu'une copie.
- **Dire d'où ça parle** avec le champ `nature` : un témoignage n'est pas une étude universitaire, un tract n'est pas un document d'archives.
- Écriture du site : français simple, tutoiement dans les textes de la bande, écriture inclusive sans point médian.

## Sources à explorer pour les prochaines fiches

Déjà fichées : CIRA (Lausanne et Marseille), FICEDL, infokiosques.net, Bibliothèque anarchiste, libcom.org, La Contemporaine, le Maitron, Archives du féminisme, La Horde, Radio Libertaire, Framasoft, Internationale des fédérations anarchistes, Défenseur des droits, Archives Autonomies (Le Père Peinard), catalogue de la BnF (Les Temps nouveaux), INA (fresques régionales).

Pas encore fichées :
- **Gallica** (BnF) : le site bloque les vérifications automatiques ; à consulter à la main. La notice BnF des *Temps nouveaux* donne déjà le lien Gallica.
- **INA** : chercher d'autres archives (Lip, Mai 68, MLAC) sur ina.fr et ses fresques.
- **« Luttes Locales »** et **« Interpole »** : la bande n'a pas trouvé de source sûre à ces noms. Si tu connais leur adresse, ajoute-la.
- Pistes repérées, à vérifier : le catalogue REBAL (rebal.info), où apparaissent des notices du CIRA ; Archives Autonomies pour d'autres journaux ; RetroNews pour la presse ancienne.
