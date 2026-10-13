#!/usr/bin/env bash
# Génère les miniatures de la grille des coloriages.
# Source : dessins/jpg/*.jpg   ->   Destination : dessins/miniatures/
# Usage (depuis la racine du site) : ./outils/generer_miniatures.sh
# Option -f : régénère toutes les miniatures, même si elles existent déjà.

set -euo pipefail

SRC="dessins/jpg"
DEST="dessins/miniatures"
LARGEUR_MAX=600     # px : assez net sur écran Retina pour une cellule de 250-400 px
QUALITE=80

FORCE=0
[[ "${1:-}" == "-f" ]] && FORCE=1

if command -v magick >/dev/null 2>&1; then
    IM="magick"
elif command -v convert >/dev/null 2>&1; then
    IM="convert"
else
    echo "ImageMagick est requis :  sudo apt install imagemagick" >&2
    exit 1
fi

[[ -d "$SRC" ]] || { echo "Dossier introuvable : $SRC (lance le script depuis la racine du site)" >&2; exit 1; }
mkdir -p "$DEST"

crees=0; ignorees=0
shopt -s nullglob
for f in "$SRC"/*.jpg; do
    nom="$(basename "$f")"
    sortie="$DEST/$nom"
    if [[ $FORCE -eq 0 && -f "$sortie" && "$sortie" -nt "$f" ]]; then
        ignorees=$((ignorees + 1))
        continue
    fi
    # "600x>" : réduit seulement si la largeur dépasse 600 px, n'agrandit jamais
    "$IM" "$f" -auto-orient -resize "${LARGEUR_MAX}x>" -strip \
          -interlace Plane -sampling-factor 4:2:0 -quality "$QUALITE" "$sortie"
    printf '  %-45s %6s Ko -> %6s Ko\n' "$nom" \
        "$(( $(stat -c %s "$f") / 1024 ))" "$(( $(stat -c %s "$sortie") / 1024 ))"
    crees=$((crees + 1))
done

echo "Terminé : $crees miniature(s) créée(s), $ignorees déjà à jour."
