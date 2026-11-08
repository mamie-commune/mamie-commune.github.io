# Espace de travail — contenus ChatGPT

Cet espace sert à échanger des textes éditoriaux entre ChatGPT et Claude Code avant leur intégration dans le site.

## Règles

- Les fichiers de cet espace sont des brouillons : ils ne sont pas publiés directement.
- Ne pas déplacer automatiquement leur contenu vers les pages publiques.
- Vérifier chaque dossier : exactitude historique, bibliographie, liens et cohérence avec la ligne éditoriale de Mamie Commune.
- Préserver les distinctions entre courants, mouvements, organisations, événements et expériences.
- Éviter les doublons avec les dossiers déjà présents dans l'encyclopédie.
- Ne jamais fusionner cette branche dans `main` sans validation humaine explicite.
- Ne jamais déclencher de déploiement IONOS depuis cette branche.

## Organisation

- `dossiers/` : textes encyclopédiques complets au format Markdown.
- `instructions/` : consignes éditoriales et techniques pour leur traitement.

## Workflow

1. ChatGPT ajoute ou actualise un brouillon dans cette branche.
2. Claude Code relit le contenu et vérifie les fichiers existants du site.
3. Claude Code propose les adaptations nécessaires dans une branche de travail dédiée ou dans cette branche après coordination.
4. Les changements sont testés localement.
5. Une Pull Request vers `main` est créée uniquement lorsque le responsable du projet le demande et après validation du contenu et du rendu.
