<?php
// Logo cliquable des pages de jeu : fixé à gauche, centré en hauteur, hors du flux
// de la page (il ne décale jamais la fenêtre du jeu). Un seul fichier pour tous les jeux.
//
// Utilisation dans une page de jeu, juste après la balise body :
//   $largeurJeu = 520;
//   require 'logoJeu.php';
// Depuis un sous-dossier : require __DIR__ . '/../logoJeu.php';
// $largeurJeu = largeur du jeu en pixels : le logo rétrécit pour ne jamais le recouvrir.
// (Ne jamais écrire la balise de fermeture PHP dans un commentaire : elle arrête le code.)
$largeurJeu = isset($largeurJeu) ? max(0, (int) $largeurJeu) : 1100;
$seuil = $largeurJeu + 160; // en dessous, il n'y a plus la place pour le logo
?>
<style>
.logoJeu {
    /* espace libre entre le bord de l'écran et le bord du jeu (de chaque côté) */
    --libre: calc(50% - <?= $largeurJeu ?>px / 2);
    position: fixed;
    top: 50%;
    left: calc(var(--libre) / 2); /* centre du logo = milieu de l'espace libre */
    transform: translate(-50%, -50%);
    z-index: 10;
    width: min(288px, calc(var(--libre) - 20px));
}
.logoJeu img {
    display: block;
    width: 100%;
    height: auto;
}
/* Petit lien texte de secours quand l'écran est trop étroit pour le logo */
.lienAccueilJeu {
    display: none;
    position: fixed;
    left: 10px;
    bottom: 10px;
    z-index: 10;
    padding: 8px 14px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: normal;
    text-transform: none;
    text-decoration: none;
    text-shadow: none;
    color: #fff;
    background-color: #0C42AC;
    border-radius: 20px;
}
@media (max-width: <?= $seuil ?>px) {
    .logoJeu { display: none; }
    .lienAccueilJeu { display: inline-block; }
}
</style>
<a class="logoJeu" href="/index.php" title="Retour à l'accueil"><img src="/assets/Logo_site.gif" alt="Retour à l'accueil"></a>
<a class="lienAccueilJeu" href="/index.php">&larr; Accueil</a>
