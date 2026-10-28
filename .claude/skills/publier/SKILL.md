---
name: publier
description: Met en ligne les modifications du site Mamie Commune (régénère, vérifie les liens, commit et push sur main, suit la publication GitHub Pages). À utiliser quand la personne dit « publie », « mets en ligne », « envoie », « c'est bon ».
---

# Publier le site

1. **Régénérer** (sur Windows) :
   `powershell -NoProfile -ExecutionPolicy Bypass -File _src/build.ps1`
   La sortie doit commencer par `OK :`. Sinon, corriger avant d'aller plus loin.
   Sur un ordinateur sans PowerShell (session web claude.ai/code, Linux) : sauter cette étape, la publication sur GitHub régénère toute seule.
2. **Vérifier les liens internes** avec la commande de la section « Avant d'envoyer » de `CLAUDE.md` (Windows seulement). Aucune ligne ne doit sortir.
3. **Résumer** à la personne, en une ou deux phrases simples, ce qui va partir (`git status --short`, `git diff --stat`). Ne jamais envoyer de `.mp4` (le film est sur la release GitHub « film »).
4. **Envoyer** :
   ```
   git add -A
   git commit -m "<ce qui a changé, en français>"
   git push origin main
   ```
   Sur Windows, si `git` n'est pas trouvé : `& "C:\Program Files\Git\cmd\git.exe"`.
5. **Suivre la publication** : `gh run watch -R mamie-commune/mamie-commune.github.io --exit-status` sur la dernière exécution (`gh run list -R mamie-commune/mamie-commune.github.io -L 1`). Sur Windows : `& "C:\Program Files\GitHub CLI\gh.exe"`.
6. **Vérifier en ligne** la page modifiée sur https://mamiecommune.org (et sa copie https://mamie-commune.github.io) (attendre une minute si l'ancienne version s'affiche encore), puis donner le lien à la personne.
