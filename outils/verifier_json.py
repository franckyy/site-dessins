#!/usr/bin/env python3
"""Vérifie que tous les fichiers cités dans les JSON du site existent.

Usage (depuis n'importe où) :  python3 outils/verifier_json.py
Code de sortie : 0 = aucune erreur (les avertissements ne comptent pas),
                 1 = au moins une erreur.

ERREUR        = le visiteur verrait une image cassée ou une page introuvable.
Avertissement = le site fonctionne, mais quelque chose manque ou semble oublié
                (bouton masqué, miniature absente, dessin non référencé...).
"""
import json
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent

erreurs = []
avertissements = []


def err(source, msg):
    erreurs.append(f"[{source}] {msg}")


def warn(source, msg):
    avertissements.append(f"[{source}] {msg}")


def existe(chemin):
    # is_file() est sensible à la casse sous Linux, comme le serveur de production
    return (RACINE / chemin).is_file()


def charger(fichier, champs):
    """Lit datas/<fichier>, contrôle la structure, renvoie les entrées valides."""
    chemin = RACINE / "datas" / fichier
    if not chemin.is_file():
        err(fichier, "fichier JSON introuvable")
        return []
    try:
        data = json.loads(chemin.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        err(fichier, f"JSON invalide : {e}")
        return []
    if not isinstance(data, list):
        err(fichier, "le JSON doit être une liste")
        return []
    valides = []
    for i, item in enumerate(data, 1):
        manque = [c for c in champs if not isinstance(item, dict) or not item.get(c)]
        if manque:
            err(fichier, f"entrée n°{i} : champ(s) manquant(s) ou vide(s) : {', '.join(manque)}")
        else:
            valides.append(item)
    return valides


def verifier_coloriages():
    src = "images.json"
    vus = set()
    for it in charger(src, ["nom", "theme"]):
        nom = it["nom"]
        if nom in vus:
            err(src, f"« {nom} » apparaît plusieurs fois")
        vus.add(nom)
        if not nom[0].isupper():
            warn(src, f"« {nom} » : un nom d'image doit commencer par une majuscule")
        if not existe(f"dessins/jpg/{nom}_coul.jpg"):
            err(src, f"image manquante : dessins/jpg/{nom}_coul.jpg")
        if not existe(f"dessins/miniatures/{nom}_coul.jpg"):
            warn(src, f"miniature manquante : dessins/miniatures/{nom}_coul.jpg "
                      f"(lancer ./outils/generer_miniatures.sh)")
        if not existe(f"dessins/pdf/{nom}.pdf"):
            warn(src, f"PDF manquant : dessins/pdf/{nom}.pdf (le bouton Télécharger n'apparaîtra pas)")

    # Dessins présents sur le disque mais oubliés dans le JSON
    dossier = RACINE / "dessins" / "jpg"
    if dossier.is_dir():
        for f in sorted(dossier.glob("*_coul.jpg")):
            nom = f.name[: -len("_coul.jpg")]
            if nom not in vus:
                warn(src, f"{f.name} existe dans dessins/jpg mais n'est pas dans images.json")


def verifier_labyrinthes():
    src = "labyrinthes.json"
    for it in charger(src, ["nom", "solution", "dossier"]):
        # labyrinthes.php n'affiche que les entrées dont solution vaut "false"
        if it["solution"] != "false":
            continue
        nom, dossier = it["nom"], it["dossier"]
        if not dossier.endswith("/"):
            err(src, f"« {nom} » : le dossier « {dossier} » doit se terminer par « / »")
            continue
        base = f"dessins/labyrinthes/{dossier}{nom}"
        if not existe(f"{base}.jpg"):
            err(src, f"image manquante : {base}.jpg")
        if not existe(f"{base}.pdf"):
            warn(src, f"PDF manquant : {base}.pdf (le bouton Télécharger n'apparaîtra pas)")
        if not existe(f"{base}_solution.pdf"):
            warn(src, f"PDF solution manquant : {base}_solution.pdf (le bouton Solution n'apparaîtra pas)")


def verifier_jeux():
    src = "iconsJeux.json"
    vus = set()
    for it in charger(src, ["nom", "file"]):
        nom, fichier = it["nom"], it["file"]
        if (nom, fichier) in vus:
            warn(src, f"« {nom} » ({fichier}) apparaît plusieurs fois : "
                      f"la même icône sera affichée plusieurs fois")
        vus.add((nom, fichier))
        if not existe(f"assets/iconsJeux/{nom}.jpg"):
            err(src, f"icône manquante : assets/iconsJeux/{nom}.jpg")
        if not existe(fichier):
            err(src, f"page du jeu introuvable : {fichier}")


def main():
    verifier_coloriages()
    verifier_labyrinthes()
    verifier_jeux()

    for ligne in erreurs:
        print(f"ERREUR         {ligne}")
    for ligne in avertissements:
        print(f"Avertissement  {ligne}")
    if erreurs or avertissements:
        print()
    print(f"{len(erreurs)} erreur(s), {len(avertissements)} avertissement(s).")
    if not erreurs and not avertissements:
        print("Tout est en ordre.")
    sys.exit(1 if erreurs else 0)


if __name__ == "__main__":
    main()
