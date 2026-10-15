#!/usr/bin/env bash
# Génère les miniatures des grilles du site.
#   Coloriages  : dessins/jpg/*.jpg                       ->  dessins/miniatures/
#   Labyrinthes : dessins/labyrinthes/NN/<nom>.jpg        ->  dessins/miniatures/labyrinthes/NN/<nom>.jpg
#                 (seulement les labyrinthes listés dans datas/labyrinthes.json, sans les solutions)
# Usage (depuis la racine du site) : ./outils/generer_miniatures.sh
# Option -f : régénère toutes les miniatures, même si elles existent déjà.

set -euo pipefail

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

crees=0; ignorees=0

# miniaturiser <source.jpg> <destination.jpg>
miniaturiser() {
    local f="$1" sortie="$2"
    if [[ $FORCE -eq 0 && -f "$sortie" && "$sortie" -nt "$f" ]]; then
        ignorees=$((ignorees + 1))
        return
    fi
    mkdir -p "$(dirname "$sortie")"
    # "600x>" : réduit seulement si la largeur dépasse 600 px, n'agrandit jamais
    "$IM" "$f" -auto-orient -resize "${LARGEUR_MAX}x>" -strip \
          -interlace Plane -sampling-factor 4:2:0 -quality "$QUALITE" "$sortie"
    printf '  %-55s %6s Ko -> %6s Ko\n' "${sortie#dessins/miniatures/}" \
        "$(( $(stat -c %s "$f") / 1024 ))" "$(( $(stat -c %s "$sortie") / 1024 ))"
    crees=$((crees + 1))
}

# --- Coloriages ---------------------------------------------------------
SRC="dessins/jpg"
DEST="dessins/miniatures"
[[ -d "$SRC" ]] || { echo "Dossier introuvable : $SRC (lance le script depuis la racine du site)" >&2; exit 1; }

shopt -s nullglob
for f in "$SRC"/*.jpg; do
    miniaturiser "$f" "$DEST/$(basename "$f")"
done

# --- Labyrinthes --------------------------------------------------------
# La liste vient du JSON : on ne traite que les labyrinthes réellement affichés.
if [[ -f datas/labyrinthes.json ]]; then
    while IFS= read -r chemin; do
        [[ -z "$chemin" ]] && continue
        if [[ -f "dessins/labyrinthes/$chemin" ]]; then
            miniaturiser "dessins/labyrinthes/$chemin" "$DEST/labyrinthes/$chemin"
        else
            echo "  Attention : dessins/labyrinthes/$chemin introuvable, ignoré" >&2
        fi
    done < <(python3 - <<'PY'
import json
for it in json.load(open("datas/labyrinthes.json", encoding="utf-8")):
    if it.get("solution") == "false":
        print(f'{it["dossier"]}{it["nom"]}.jpg')
PY
)
fi

echo "Terminé : $crees miniature(s) créée(s), $ignorees déjà à jour."
