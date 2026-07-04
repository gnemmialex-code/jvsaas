# 🎨 Images d'inspiration GTA 5 — entraînement du modèle

**Dépose ici tes 44 images d'inspiration au style GTA 5** (artworks Rockstar,
loading screens, box arts, fan arts de qualité…).

## Pourquoi ce dossier ?

Le modèle de génération (`gnemmialex-code/gta-style-version-sec`) est un
**fine-tune Flux LoRA** : il n'accepte qu'UNE image d'entrée par génération
(la photo de l'utilisateur). Impossible donc de lui passer des images
d'inspiration au moment de la génération.

➡️ La façon LA PLUS PUISSANTE d'utiliser ces 44 images : **ré-entraîner le
LoRA avec**. C'est exactement comme ça que le modèle actuel a été créé
(via `replicate/fast-flux-trainer`), mais avec plus d'images de meilleure
qualité, le style appris devient beaucoup plus fort et fidèle.

## Conseils pour les images

- **Format** : JPG ou PNG, idéalement ≥ 1024 px de côté.
- **Variété** : mélange de portraits, plans larges, personnages hommes/femmes,
  décors urbains Los Santos, éclairages différents (jour/nuit/golden hour).
- **Pureté du style** : uniquement du VRAI style GTA V (illustration peinte,
  contours marqués, cel-shading) — pas de screenshots in-game flous ni de
  photos réelles, elles diluent le style.
- **Sans texte** : évite les images avec logos/texte incrustés (le LoRA
  apprendrait à générer du texte).

## Ré-entraîner (10 minutes, sur replicate.com)

1. Zippe le contenu de ce dossier : `gta5-inspiration.zip`.
2. Va sur https://replicate.com/replicate/fast-flux-trainer/train
   (le même trainer que pour le modèle actuel).
3. **Destination** : ton modèle existant `gnemmialex-code/gta-style-version-sec`
   (ça crée une nouvelle version, l'ancienne reste utilisable) — ou un nouveau modèle.
4. **input_images** : upload le zip.
5. **trigger_word** : ⚠️ garde exactement **`gta 5 style version sec`**
   (le code du site l'injecte automatiquement en tête de chaque prompt —
   si tu changes le trigger, il faudra le changer aussi dans
   `scripts/pipeline.ts` → `LORA_TRIGGER`).
6. **lora_type** : `style` (on apprend un style graphique, pas un sujet).
7. Lance l'entraînement (~20-30 min), puis récupère le **hash de la nouvelle
   version** (onglet Versions du modèle).
8. Colle-le dans `.env.local` :
   ```
   REPLICATE_IMG2IMG_MODEL=gnemmialex-code/gta-style-version-sec:NOUVEAU_HASH
   ```
9. Redémarre `next dev` et compare les résultats (le toggle admin
   « Script de génération interne » permet de tester avec/sans le script).

## Ce qui est déjà en place côté code

- Le trigger LoRA `gta 5 style version sec` est injecté automatiquement dans
  chaque prompt (sans lui, le style appris ne s'activait presque pas).
- `lora_scale: 1.1` et `guidance_scale: 3.5` renforcent le style.
- `num_inference_steps: 40` pour un rendu plus détaillé.
- Un bloc « GTA 5 ART DIRECTION » complet est ajouté au prompt quand le style
  GTA 5 est sélectionné (visible dans Dashboard → Paramètres → Script de
  génération interne, admin uniquement).
