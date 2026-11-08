# Automatisation : de ChatGPT à la Pull Request

Workflow : `.github/workflows/traiter-brouillons.yml` (scripts dans `.github/brouillons/`).

## Ce qui se passe, sans intervention

1. ChatGPT dépose ou modifie un fichier Markdown dans `_brouillons-chatgpt/dossiers/` sur la branche `contenus-chatgpt`.
2. GitHub lance le workflow « Traiter les brouillons ChatGPT ». Il repère les brouillons qui n'ont pas encore de rapport final (identifiés par leur nom et l'empreinte de leur contenu : un brouillon modifié est retraité, un brouillon inchangé ne l'est jamais deux fois). Dix au plus par exécution, un à la fois.
3. **Analyse par Claude** (Linux, lecture seule) : Claude lit le brouillon, `CLAUDE.md`, ces instructions et l'encyclopédie existante, vérifie faits et références, puis écrit le dossier dans `_src/encyclopedie/` et un rapport. Il peut décider de **bloquer** si une décision humaine est nécessaire.
4. **Garde-fou** (script, sans IA) : seuls la création de `_src/encyclopedie/<n>-<mouvement>.txt` et la modification de `_src/encyclopedie/familles.json` sont acceptées, sans retirer aucune famille, aucun mouvement ni aucune ressource. Tout le reste bloque.
5. **Tests** (Windows) : génération du site avec `_src/build.ps1`, pages du dossier présentes, liens internes, aucune page supprimée, aucun brouillon copié vers le site.
6. **Proposition** (script, sans IA) : si tout est bon, branche `integration/<identifiant>` créée depuis `main`, et **Pull Request en brouillon** vers `main`, avec le rapport complet en description.
7. **Rapport** déposé dans `_brouillons-chatgpt/rapports/<identifiant>.md` (ou `rapports/echecs/` en cas de panne technique, pour que le brouillon soit retraité).

## Ce qui ne se passe jamais automatiquement

Aucune fusion, aucun envoi sur `main`, aucun lancement du workflow de publication, aucun accès aux secrets IONOS ou à GitHub Pages. Claude ne reçoit aucun jeton GitHub. Publier = relire la PR, la sortir du mode brouillon (« Ready for review »), puis la fusionner : c'est une décision humaine.

## Statuts d'un rapport

| Statut | Signification |
|---|---|
| `propose` | PR en brouillon ouverte vers `main`. |
| `bloque` | Claude demande une décision humaine : rien n'est proposé. |
| `non-conforme` | Le garde-fou a refusé des changements hors périmètre : rien n'est proposé. |
| `tests-echoues` | La génération ou les tests ont échoué : rien n'est proposé. |
| `echec-technique` | Panne (authentification, interruption) : rapport dans `rapports/echecs/`, le brouillon sera retraité. |

## Relancer

- Un brouillon modifié est retraité automatiquement.
- Après une panne : onglet **Actions** du dépôt, exécution concernée, **Re-run all jobs**, ou nouveau dépôt dans `dossiers/`.
- Pour forcer le retraitement d'un brouillon inchangé : supprimer son rapport `rapports/<identifiant>.md`, puis redéposer ou relancer.
