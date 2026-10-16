<?php
// Bandeau publicitaire vertical (format 160 x 600) à droite de l'écran, pour toutes les pages.
// - Pages avec en-tête (header.php) : le contenu est décalé pour libérer la place du bandeau.
// - Pages de jeu (logoJeu.php) : le jeu reste centré ; le bandeau n'apparaît que si l'écran
//   est assez large pour garder l'écart voulu entre le jeu et la publicité.
// - Page avec deux bandeaux (à gauche et à droite, contenu centré sur l'écran) : la page met
//   $pubDeuxCotes = true; juste avant require 'header.php'. Le bandeau de gauche n'apparaît que si
//   l'écran est assez large ($seuilDeuxCotes) ; en dessous, seul le bandeau de droite reste.
// Pour l'instant c'est une maquette. Le jour où AdSense est prêt : remplacer le contenu de
// la div "pubEmplacement" par le code fourni par Google.
$pubVisible = true;     // false = aucun bandeau et aucun espace réservé

if ($pubVisible):
    $largeurPub = 160;  // px : largeur du format standard « gratte-ciel large » (160 x 600)
    $hauteurPub = 600;  // px
    $ecartPub   = 151;  // px entre le contenu (ou le jeu) et la publicité
    $margeBord  = 10;   // px entre la publicité et le bord de l'écran
    $reserve    = $largeurPub + $ecartPub + $margeBord;   // place prise à droite
    $jeu        = isset($largeurJeu);                      // vrai sur une page de jeu
    $deuxCotes  = !$jeu && !empty($pubDeuxCotes);          // vrai si la page veut un bandeau de chaque côté
    $seuilDeuxCotes = 1500;   // px : largeur d'écran minimale pour afficher le bandeau de gauche
    // à gauche, l'en-tête garde juste la place du bandeau (le logo ne doit pas passer dessous)
    $reserveEntete  = $largeurPub + $margeBord + 10;
    // en dessous de cette largeur d'écran, il n'y a plus la place : on masque le bandeau
    $seuilLargeur = $jeu ? ((int) $largeurJeu + 2 * $reserve + 20) : 1100;
    $seuilHauteur = $hauteurPub + 40;
    $largeurMini  = $seuilLargeur + 1;   // à partir de là, le bandeau est affiché
    $hauteurMini  = $seuilHauteur + 1;
?>
<style>
.pubLateral {
    position: fixed;
    top: 50%;
    right: <?= $margeBord ?>px;
    transform: translateY(-50%);
    width: <?= $largeurPub ?>px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.pubEtiquette {
    font-size: 11px;
    letter-spacing: 1px;
    text-align: center;
    text-transform: uppercase;
    text-shadow: none;
    color: #0C42AC;
}
.pubEmplacement {
    width: <?= $largeurPub ?>px;
    height: <?= $hauteurPub ?>px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #0C42AC;
    background-color: rgba(255, 255, 255, 0.55);
    border: 2px dashed #0C42AC;
    border-radius: 10px;
}
<?php if (!$jeu): ?>
/* Pages à contenu pleine largeur : quand le bandeau est affiché, on réserve la colonne de droite.
   L'en-tête reste pleine largeur, et la grille n'a plus de marge à droite : l'écart entre la
   grille et la publicité est exactement celui demandé. */
@media (min-width: <?= $largeurMini ?>px) and (min-height: <?= $hauteurMini ?>px) {
    body { padding-right: <?= $reserve ?>px; }
    header { margin-right: -<?= $reserve ?>px; padding-right: <?= $reserve ?>px; }
    .grid-wrapper { margin-right: 0; }
}
<?php endif; ?>
<?php if ($deuxCotes): ?>
/* Bandeau de gauche : symétrique de celui de droite, le contenu reste centré sur l'écran.
   Même écart (151 px) entre le contenu et chaque bandeau. */
.pubGauche {
    right: auto;
    left: <?= $margeBord ?>px;
}
@media (min-width: <?= $seuilDeuxCotes ?>px) and (min-height: <?= $hauteurMini ?>px) {
    body { padding-left: <?= $reserve ?>px; }
    header { margin-left: -<?= $reserve ?>px; padding-left: <?= $reserveEntete ?>px; }
}
@media (max-width: <?= $seuilDeuxCotes - 1 ?>px) {
    .pubGauche { display: none; }
}
<?php endif; ?>
@media (max-width: <?= $seuilLargeur ?>px), (max-height: <?= $seuilHauteur ?>px) {
    .pubLateral { display: none; }
}
@media print {
    .pubLateral { display: none; }
}
</style>
<aside class="pubLateral" aria-label="Publicité">
    <span class="pubEtiquette">Publicité</span>
    <div class="pubEmplacement">
        <!-- Code AdSense à coller ici -->
        <?= $largeurPub ?> &times; <?= $hauteurPub ?>
    </div>
</aside>
<?php if ($deuxCotes): ?>
<aside class="pubLateral pubGauche" aria-label="Publicité">
    <span class="pubEtiquette">Publicité</span>
    <div class="pubEmplacement">
        <!-- Code AdSense à coller ici (bandeau de gauche) -->
        <?= $largeurPub ?> &times; <?= $hauteurPub ?>
    </div>
</aside>
<?php endif; ?>
<?php endif; ?>
