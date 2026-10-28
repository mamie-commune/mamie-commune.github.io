---
name: ajouter-video
description: Ajoute une publication TikTok de @mamie_commune à la page Vidéos (et à l'accueil). À utiliser quand la personne colle une adresse TikTok ou parle d'une nouvelle vidéo.
argument-hint: <adresse TikTok>
---

# Ajouter une vidéo TikTok

1. Prendre l'identifiant : le grand nombre à la fin de l'adresse (`…/video/7698664524739546401` ou `…/photo/…`). `video` ou `photo` selon l'adresse ; `photo` = carrousel.
2. Si possible, lire la publication (titre, texte, hashtags, nombre de vues, date) en ouvrant `https://www.tiktok.com/player/v1/<id>?description=1` dans le navigateur. Sinon, demander à la personne le titre et une phrase de description.
3. Ajouter une ligne **en haut** de la liste dans `data/videos.js` (la plus récente en premier), sur le modèle des lignes existantes :
   `{ id: "…", type: "video", date: "AAAA-MM-JJ", titre: "Titre court", vues: "1 234", texte: "Une ou deux phrases, avec nos mots.", tags: ["…"], lien: ["page.html", "Texte du lien"] },`
   `lien` est facultatif : une page du site en rapport (dossier, carte, fiche).
4. Pas besoin de régénérer. Ouvrir `videos.html` dans l'aperçu, cliquer sur la couverture et vérifier que la vidéo se lance.
5. Proposer de publier (`/publier`).
