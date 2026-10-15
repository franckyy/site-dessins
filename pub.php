<?php
// Bandeau publicitaire vertical (format 160 x 600) à droite de l'écran, pour toutes les pages.
// - Pages avec en-tête (header.php) : le contenu est décalé pour libérer la place du bandeau.
// - Pages de jeu (logoJeu.php) : le jeu reste centré ; le bandeau n'apparaît que si l'écran
//   est assez large pour garder l'écart voulu entre le jeu et la publicité.
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
<?php endif; ?>
