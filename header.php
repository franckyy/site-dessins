<?php
// Menu : URL => libellé (ajouter une page = ajouter une ligne)
$pagesMenu = [
    '/index.php'        => 'Coloriages',
    '/labyrinthes.php'  => 'Labyrinthes',
    '/jeux.php'         => 'Jeux',
];
$pageCourante = $_SERVER['SCRIPT_NAME'];
?>
<header>
    <a class="logoLien" href="/index.php" title="Retour à l'accueil">
        <img id="logoImg" src="assets/Logo_site.gif" alt="Retour à l'accueil">
    </a>

    <ul class="header__menu">
        <?php foreach ($pagesMenu as $url => $libelle): ?>
            <?php $actif = ($pageCourante === $url) ? 'ulActive' : ''; ?>
            <li class="<?= $actif ?>">
                <a class="<?= $actif ?>" href="<?= htmlspecialchars($url) ?>"><?= htmlspecialchars($libelle) ?></a>
            </li>
        <?php endforeach; ?>
    </ul>

    <div class="header__buttons">
        <a href="https://www.paypal.com/donate/?hosted_button_id=CUJ2FNRCT3RFE">Faire un don</a>
    </div>
</header>
