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
    <img id="logoImg" src="assets/Logo_site_02.gif" alt="logo">

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
