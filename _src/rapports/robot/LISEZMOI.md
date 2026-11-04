# Robot d'audit

Scripts utilisés pour l'audit de novembre 2026 (Node.js 22 ou plus récent, Windows + Edge). Le serveur d'aperçu doit tourner (`.claude/launch.json`, port 8765).

- `node _src/rapports/robot/liens.js .` : liens internes de toutes les pages générées.
- `node _src/rapports/robot/audit.mjs . http://localhost:8765 sortie.json 1280` : ouvre chaque page dans Edge sans fenêtre et relève erreurs JavaScript, erreurs réseau, appels à d'autres sites, titres, images, champs, boutons, ancres, débordements. Mettre `375` pour la largeur téléphone.
- `node _src/rapports/robot/externes.mjs . externes.json` : teste toutes les adresses externes ; `retest.mjs . externes.json` reteste les échecs en relisant l'adresse complète dans la page.

Un échec n'est pas forcément un lien mort : certains sites bloquent les robots (403) ou ne répondent pas depuis tous les réseaux. Vérifier à la main avant de retirer un lien.
