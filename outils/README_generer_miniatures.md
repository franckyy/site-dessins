# Guide : `outils/generer_miniatures.sh`

## 1. À quoi sert l'outil

Les JPG complets des coloriages dépassent parfois 800 Ko. Afficher une grille entière de ces images alourdit les pages. Le script fabrique des **miniatures de 600 px de large** (qualité 80, métadonnées retirées) : la grille passe à environ 0,5 Mo.

Les pages du site (`index.php`, `labyrinthes.php`) affichent la miniature, avec un repli automatique sur l'image complète si elle n'existe pas. Les images d'origine ne sont **jamais modifiées** : le script ne fait que les lire.

| Source | Destination |
|---|---|
| `dessins/jpg/*.jpg` (coloriages) | `dessins/miniatures/` |
| `dessins/labyrinthes/NN/<nom>.jpg` | `dessins/miniatures/labyrinthes/NN/<nom>.jpg` |

Pour les labyrinthes, seules les entrées de `datas/labyrinthes.json` avec `"solution": "false"` sont traitées (les solutions ne sont pas affichées dans la grille).

## 2. Prérequis

- **ImageMagick** (le script accepte `magick` ou `convert`) :
  ```bash
  sudo apt install imagemagick
  ```
- **Python 3** (utilisé pour lire `datas/labyrinthes.json`).

## 3. Lancer le script

Toujours **depuis la racine du site** :

```bash
cd /home/oem/informatique/site-dessins
./outils/generer_miniatures.sh
```

Si tu obtiens `Permission denied`, rends-le exécutable une fois pour toutes :

```bash
chmod +x outils/generer_miniatures.sh
```

(ou lance-le avec `bash outils/generer_miniatures.sh`).

### Option

| Option | Effet |
|---|---|
| *(aucune)* | ne crée que les miniatures manquantes ou périmées |
| `-f` | régénère **toutes** les miniatures, même celles qui existent déjà |

## 4. Comment ça fonctionne

1. Il vérifie qu'ImageMagick est là, puis que `dessins/jpg` existe (sinon il s'arrête en te rappelant de lancer le script depuis la racine).
2. Il parcourt tous les `dessins/jpg/*.jpg`.
3. Il lit `datas/labyrinthes.json` et parcourt les labyrinthes à afficher. Si un fichier cité n'existe pas, il affiche « Attention : … introuvable, ignoré » et continue.
4. Pour chaque image, il **saute** la miniature si elle existe déjà et qu'elle est **plus récente** que l'originale (sauf avec `-f`).
5. Sinon il la crée : il corrige l'orientation, réduit à 600 px de large **seulement si l'image est plus large** (jamais d'agrandissement), puis compresse.
6. Il affiche une ligne par miniature créée (poids avant → après) et un bilan final.

Conséquence pratique : quand tu **remplaces** une image (par exemple un des dragons restants), sa miniature est refaite automatiquement au prochain lancement, car l'original est devenu plus récent. Si tu avais copié le nouveau fichier en conservant son ancienne date, utilise `-f`.

Le script ne supprime jamais rien : si tu retires un dessin, pense à supprimer aussi sa miniature à la main.

## 5. Exemple complet : ajouter un coloriage

Exemple avec un nouveau `Dragon_royal`.

1. Dépose `Dragon_royal_coul.jpg` dans `dessins/jpg/` (nom avec une majuscule).
2. Génère les miniatures :
   ```bash
   cd /home/oem/informatique/site-dessins
   ./outils/generer_miniatures.sh
   ```
   Sortie attendue (poids indicatifs) :
   ```
     Dragon_royal_coul.jpg     812 Ko ->     74 Ko
   Terminé : 1 miniature(s) créée(s), 38 déjà à jour.
   ```
3. Ajoute l'entrée dans `datas/images.json`, puis contrôle les fichiers cités :
   ```bash
   python3 outils/verifier_json.py
   ```
4. Recharge `http://localhost:8080` : la grille affiche la miniature.
5. Commite sur `dev` :
   ```bash
   git status
   git add -A
   git commit -m "Ajout de Dragon_royal avec sa miniature"
   git push origin dev
   ```

## 6. Dépannage

| Message ou symptôme | Cause et solution |
|---|---|
| `ImageMagick est requis` | `sudo apt install imagemagick` |
| `Dossier introuvable : dessins/jpg` | tu n'es pas à la racine du site : `cd /home/oem/informatique/site-dessins` |
| `Permission denied` | `chmod +x outils/generer_miniatures.sh` |
| `Attention : dessins/labyrinthes/… introuvable` | une entrée de `labyrinthes.json` pointe vers un fichier absent |
| `0 miniature(s) créée(s)` | tout est déjà à jour ; ajoute `-f` pour tout refaire |
| La grille montre encore l'ancienne image | relance avec `-f`, puis Ctrl+F5 dans le navigateur |

## 7. Réglages

Les deux valeurs sont en haut du script :

```bash
LARGEUR_MAX=600     # largeur maximale des miniatures, en px
QUALITE=80          # qualité JPEG
```

Si tu changes `LARGEUR_MAX`, lance ensuite `./outils/generer_miniatures.sh -f` pour que toutes les miniatures soient refaites à la nouvelle taille.
