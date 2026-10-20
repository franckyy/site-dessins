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


def charger(fichier, champs, vide_ok=None):
    """Lit datas/<fichier>, contrôle la structure, renvoie les entrées valides.

    vide_ok(item, champ) -> True si ce champ a le droit d'être vide pour cette entrée
    (le champ doit alors exister, avec la valeur ""). Par défaut, rien n'est facultatif.
    """
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
        if not isinstance(item, dict):
            manque = list(champs)
        else:
            manque = []
            for c in champs:
                if item.get(c):
                    continue
                # champ vide autorisé seulement s'il existe et si vide_ok l'accepte
                if c in item and vide_ok is not None and vide_ok(item, c):
                    continue
                manque.append(c)
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
        if not existe(f"dessins/miniatures/labyrinthes/{dossier}{nom}.jpg"):
            warn(src, f"miniature manquante : dessins/miniatures/labyrinthes/{dossier}{nom}.jpg "
                      f"(lancer ./outils/generer_miniatures.sh)")
        if not existe(f"{base}.pdf"):
            warn(src, f"PDF manquant : {base}.pdf (le bouton Télécharger n'apparaîtra pas)")
        if not existe(f"{base}_solution.pdf"):
            warn(src, f"PDF solution manquant : {base}_solution.pdf (le bouton Solution n'apparaîtra pas)")


# Seule case autorisée à n'avoir aucun jeu associé (champ "file" vide)
CASE_SANS_JEU = "Bientot_disponible"


def verifier_jeux():
    src = "iconsJeux.json"
    vus = set()
    entrees = charger(src, ["nom", "file"],
                      vide_ok=lambda it, c: c == "file" and it.get("nom") == CASE_SANS_JEU)
    for it in entrees:
        nom, fichier = it["nom"], it["file"]
        if not existe(f"assets/iconsJeux/{nom}.jpg"):
            err(src, f"icône manquante : assets/iconsJeux/{nom}.jpg")
        if nom == CASE_SANS_JEU:
            # case « Bientôt disponible » : pas de jeu à vérifier ni de doublon à signaler
            if fichier:
                warn(src, f"« {nom} » a un fichier ({fichier}) : le bouton JOUER s'affichera")
            continue
        if (nom, fichier) in vus:
            warn(src, f"« {nom} » ({fichier}) apparaît plusieurs fois : "
                      f"la même icône sera affichée plusieurs fois")
        vus.add((nom, fichier))
        if not existe(fichier):
            err(src, f"page du jeu introuvable : {fichier}")


def verifier_vocabulaire():
    src = "vocabulaire.json"
    vus_en, vus_fr = {}, {}
    entrees = charger(src, ["en", "fr", "theme"])
    for it in entrees:
        en, fr = it["en"], it["fr"]
        # article et genre du mot français (facultatifs : couleurs, nombres, adjectifs n'en ont pas)
        art, genre = it.get("art", ""), it.get("genre", "")
        if art not in ("", "le", "la", "les", "l'"):
            err(src, f"« {fr} » : article « {art} » inconnu (le, la, les, l' ou vide)")
        if genre not in ("", "m", "f"):
            err(src, f"« {fr} » : genre « {genre} » inconnu (m, f ou vide)")
        if art and not genre:
            err(src, f"« {fr} » : article « {art} » sans genre (m ou f)")
        if genre and not art:
            err(src, f"« {fr} » : genre « {genre} » sans article")
        if (art, genre) in (("le", "f"), ("la", "m")):
            err(src, f"« {fr} » : l'article « {art} » ne va pas avec le genre « {genre} »")
        for champ, valeur in (("en", en), ("fr", fr), ("theme", it["theme"])):
            if valeur != valeur.strip():
                err(src, f"« {valeur} » ({champ}) : espace en début ou en fin de texte")
        if en.strip().lower() == fr.strip().lower():
            warn(src, f"« {en} » : mot identique en anglais et en français (cartes indiscernables)")
        # deux paires avec le même mot rendraient le jeu ambigu (deux bonnes réponses possibles)
        if en.lower() in vus_en:
            err(src, f"« {en} » (en) apparaît plusieurs fois")
        if fr.lower() in vus_fr:
            err(src, f"« {fr} » (fr) apparaît plusieurs fois")
        vus_en[en.lower()] = True
        vus_fr[fr.lower()] = True
    if 0 < len(entrees) < 12:
        warn(src, "moins de 12 mots : le jeu Mémory bilingue sera indisponible")


def main():
    verifier_coloriages()
    verifier_labyrinthes()
    verifier_jeux()
    verifier_vocabulaire()

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
