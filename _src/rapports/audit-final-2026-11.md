# Audit final de Mamie Commune — 4 novembre 2026

Audit fait sur la version locale (non publiée) qui contient l'autonomie numérique. Le dossier `_src/` n'est pas mis en ligne : ce rapport reste privé.

**Méthode.** Rien n'est noté « vérifié » sans avoir été testé ici :
- un robot (Edge sans fenêtre, protocole DevTools) a ouvert **les 379 pages** du site, en largeur ordinateur (1280 px) puis téléphone (375 px), et relevé erreurs JavaScript, erreurs réseau, appels à d'autres sites, structure des titres, images, champs, boutons, identifiants, ancres et débordements ;
- les fonctions ont été essayées à la main dans le navigateur (clics, clavier, fichiers, serveur coupé) ;
- les **597 adresses externes** ont été testées, puis les échecs retestés un par un ;
- les articles de loi ont été relus sur Légifrance.

## 1. Fonctionnalités terminées (testées)

| Fonction | Ce qui a été testé | Résultat |
|---|---|---|
| Navigation | 379 pages ouvertes, liens internes de toutes les pages, fil d'Ariane, menu des six tiroirs | 0 erreur, 0 lien interne cassé (hors films, voir 6) |
| Recherche | Barre et page `recherche?q=signal`, aussi sans connexion | Résultats affichés |
| Bibliothèque, livres | Lecteur PDF (La Conquête du pain, 273 pages) | S'affiche |
| Centre de ressources | 36 fiches ouvertes par le robot ; liens de source testés | OK |
| Outils pratiques | Tract, compte rendu, caisse, inventaire : saisie, aperçu, calculs (120,50 € → solde et objectif justes), impression, Markdown, CSV, brouillon enregistré puis rouvert, mauvais fichier refusé | OK après corrections (voir 4) |
| Exports | Markdown, CSV (point-virgule, guillemets, BOM), brouillon JSON, GeoJSON et CSV de la carte | Contenu des fichiers vérifié |
| Carte | Filtre `?dep=35` (7 structures), recherche, fiche, export GeoJSON (213 lignes) et CSV (7 structures), formulaire de proposition | OK. Portable et adresse de rue refusés, champ manquant signalé |
| Parcours pédagogiques | 13 parcours et chronologie ouverts par le robot | 0 erreur |
| Annuaire des logiciels | 18 fiches, filtre `?pf=android` (7 sur 18), adresse partageable, JSON | OK |
| Site installable | Manifeste lu, 4 icônes (192, 512, masquables) chargées, service worker actif et en contrôle | Critères techniques remplis |
| Mode hors ligne | **Serveur réellement arrêté** : page gardée avec styles et polices, pack, outil compte rendu, recherche, page « Pas de connexion » | OK |
| Mises à jour | Nouvelle version simulée : bandeau, clic « Mettre à jour », rechargement | OK, aucun rechargement sans clic |
| Effacement | « Tout effacer sur cet appareil » | Caches et service worker supprimés |
| Packs | 6 packs HTML + 6 PDF ; 298 liens vers le site vérifiés ; ancres internes | OK après correction |

## 2. Fonctionnalités incomplètes ou non testables ici

- **Installation réelle sur téléphone** (Android, iPhone) : pas d'appareil ici. Seuls les critères techniques ont été contrôlés.
- **Lecteurs d'écran** : pas de test avec NVDA, VoiceOver ou TalkBack. Seule la structure a été contrôlée : titres, libellés, noms des boutons, repères de page, texte des images.
- **Mentions légales** : deux textes restent entre crochets, à remplir par la personne qui édite le site (le contact de l'éditeur, l'autrice ou l'auteur du dessin de Mamie). Je ne peux pas les inventer.
- **Films** (`films/*.mp4`) : ils sont seulement sur IONOS, donc pas testables en local. C'est voulu.

## 3. Tests

**Réussis**
- 379 pages × 2 largeurs.
  - Aucune erreur JavaScript après correction (il y en avait une).
  - Aucune erreur réseau.
  - Aucun débordement horizontal à 375 px.
- Langue `fr` et un seul titre principal sur chaque page (le lecteur PDF corrigé).
- Aucune image sans texte alternatif.
- Aucun champ de formulaire sans libellé.
- Aucun bouton ni lien sans nom accessible.
- Clavier :
  - le premier Tab atteint « Aller au contenu », avec un contour visible ;
  - menu mobile corrigé (voir 4).
- Contrastes mesurés sur 10 pages, en clair et en sombre : tous au-dessus de 4,5:1 (ou 3:1 pour les grands textes) après correction de la lettre rouge.
- Confidentialité :
  - au chargement, le seul site extérieur contacté est le fond de carte OpenStreetMap (pages carte et 17 Octobre), comme l'annonce la page Confidentialité ;
  - aucun appel extérieur pendant l'usage des outils ;
  - aucun cookie, aucune mesure d'audience, aucun traqueur.
- Secrets : aucun mot de passe, jeton ou clé dans les 743 fichiers suivis ni dans les 62 enregistrements de l'historique. Les accès IONOS passent par les secrets GitHub.
- Champs piégés (`<img onerror>`) dans les outils : affichés comme du texte, jamais exécutés.
- Brouillons piégés (`__proto__`, mauvais types) : ignorés.
- Performances (serveur local) : chargement médian de 90 ms, au plus 967 ms. Pages les plus lourdes : livres complets et grands schémas (1,1 à 1,7 Mo).

**Échoués au premier passage, corrigés depuis** : voir la section 4.

**Non concluants**
- Les contrastes posés sur une image ou un dégradé ne sont pas mesurables par le robot.
- Les temps de chargement sont mesurés en local, pas sur un vrai réseau mobile.

## 4. Problèmes corrigés

| Problème | Correction |
|---|---|
| Brouillon rouvert : aucun message « Brouillon ouvert » (le bouton était perdu après l'attente du fichier) | Bouton gardé avant l'attente (`assets/outils.js`) |
| Brouillon : une valeur du mauvais type (objet au lieu d'un texte) était acceptée et affichait « [object Object] » | Seuls les champs connus, et du bon type, sont repris |
| CSV : une cellule commençant par `=` ou `@` pouvait être lue comme une formule par un tableur | Cellule neutralisée par une apostrophe |
| Lecteur PDF : pdf.js 3.11.174 est touché par la faille CVE-2024-4367 (code exécuté depuis un PDF piégé) | `isEvalSupported: false` (la mesure de protection officielle) |
| Menu sur téléphone : après « Menu », Tab sautait le menu ouvert ; Échap ne le fermait pas | Focus placé dans le menu, Échap ferme et revient au bouton (`assets/site.js`) |
| Lettre de rançon rouge du logo : contraste 3,98:1 | Fond rouge foncé `--red-hi` (6,7:1) |
| Page « Pas de connexion » : erreur JavaScript quand une copie disparaît pendant l'inventaire | Copie manquante ignorée |
| Packs : ancres internes mortes (glossaire, fiche Legal Team) et deux titres principaux dans un pack | Ancres renumérotées avec leurs titres, titres de page rétrogradés |
| Page « Faire un tract » : identifiant `contenu` en double avec le lien « Aller au contenu » | Renommé |
| Page Antifascisme : lien vers une section `#agir` qui n'existe pas | Lien vers la fiche « Comment agir » |
| Carte : saut de titre (h1 → h4) dans les fiches | Titre de fiche en h2, même apparence |
| Lecteur PDF : pas de titre principal | Titre du livre en h1 |
| Carte : une ancienne proposition restait affichée sous un message d'erreur | Masquée quand le formulaire est incomplet |
| Liens externes morts | Maitron (Louise Michel, Saïl Mohamed) : notices du Dictionnaire des anarchistes ; Wikipédia Itō Noe → « Noe Itō » ; loi antiterroriste de 1986 → bon titre d'article ; RA-Forum Reclus (404) et Linux Mint FR (le nom de domaine ne répond plus) retirés |
| IONOS : `sw.js` et le manifeste pouvaient rester un an en cache, ce qui retarde les mises à jour | `Cache-Control: no-cache` et type du manifeste (`.htaccess`). **Pas testable en local** (pas d'Apache ici) : à contrôler après publication |

## 5. Sources

- **Liens externes** : 597 adresses testées.
  - 563 répondent du premier coup. Les « 404 » sur des adresses Wikipédia ou Commons à parenthèses venaient de l'outil de test ; relues en entier, elles répondent.
  - Corrigés : voir la section 4.
  - **Injoignables d'ici, à revérifier depuis un autre réseau** (ne sont pas déclarés morts) : noblogs.org (brochure « Sortez couverts »), expansive.info, mrap.fr (carte), monde-libertaire.fr (erreur 503, déjà vue en octobre), renverse.co (lent).
  - **Bloqués pour les robots mais en ligne** : Gallica, assistance Signal (403).
- **Sources juridiques** relues sur Légifrance le 4 novembre 2026, conformes à ce que dit le site :
  - Code de l'environnement : L581-13 (affichage d'opinion gratuit), R581-2 (4 m² minimum, puis selon la population), L581-29 (retrait aux frais de qui a collé), L581-34 (amende de 7 500 €) ;
  - Code de la sécurité intérieure : L212-1 (dissolution d'associations et de groupements de fait).
- **Non revérifié dans cet audit** :
  - le contenu détaillé de la fiche Legal Team (source : Coordination contre la répression, septembre 2024) ;
  - les dates et sources de chacun des 43 événements de la chronologie, et les auteurs, dates et éditeurs des fiches de lecture, déjà sourcés lors de leur rédaction.

  Ils n'ont pas été relus un par un ici.
- **Licences** :
  - logiciels de l'annuaire : relevées le 2 novembre 2026 (dépôts officiels, Wikidata) ;
  - photos : crédits dans `assets/img/revolutions/credits.txt` (non recontrôlés photo par photo).

## 6. Problèmes restants

1. **pdf.js 3.11.174** est ancien. La faille connue est neutralisée, mais il faudrait passer à pdf.js 4.x.
2. **Leaflet.markercluster** : la version n'est pas indiquée dans le fichier, impossible de la vérifier. Leaflet 1.9.4 est à jour.
3. **Livres complets** (texte converti) : quelques sauts de niveaux de titres (Mémoires de Louise Michel, Qu'est-ce que la propriété ?…) et 3 renvois de notes sans cible. Le problème vient de la conversion des textes sources, pas des pages du site.
4. **Mentions légales** : contact de l'éditeur et crédit du dessin de Mamie à compléter.
5. **Liens injoignables d'ici** : liste en section 5.
6. Les fiches de la carte marquées « À revérifier » et les sources de plus de 12 mois sont signalées sur la carte, mais pas encore revérifiées.

## 7. Recommandations

- Remplir les deux mentions entre crochets avant de communiquer sur la nouvelle version.
- Tester l'installation sur un vrai Android et un vrai iPhone, et faire lire une page à un lecteur d'écran (TalkBack ou VoiceOver).
- Mettre pdf.js à jour (4.x) lors d'un prochain chantier, puis retester le lecteur.
- Revérifier depuis un autre réseau les cinq sites injoignables, et remplacer ceux qui sont vraiment morts.
- Relancer cet audit avant chaque grosse publication : les scripts du robot sont rangés dans `_src/rapports/robot/` avec leur mode d'emploi.
- Après publication, vérifier sur mamiecommune.org que `sw.js` est servi avec `Cache-Control: no-cache` (réglage `.htaccess` non testable en local).
