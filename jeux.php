<?php 
$title = "Jeux";
require 'head.php';
$dir = 'assets/iconsJeux/';

// Lecture du JSON avec gestion d'erreur
$json = @file_get_contents('datas/iconsJeux.json');
$json_data = $json !== false ? json_decode($json, true) : null;
if (!is_array($json_data)) {
    $json_data = [];
    $erreurJson = true;
}
?>
<body>
<?php require 'header.php';?>
<h3>Jeux</h3>

<div class="grid-wrapper grid-jeux">
    <?php if (!empty($erreurJson)): ?>
        <p>Les jeux sont momentanément indisponibles.</p>
    <?php endif; ?>

    <?php foreach ($json_data as $icon): ?>
        <?php
            $nom     = $icon['nom'];
            $file    = $icon['file'] ?? '';
            $libelle = str_replace('_', ' ', $nom);
            $src     = $dir . $nom . '.jpg';
        ?>
        <div>
            <?php if ($file !== ''): ?>
                <a class="lienJeu" href="<?= htmlspecialchars($file) ?>"
                   aria-label="Jouer : <?= htmlspecialchars($libelle) ?>">
                    <img class="dessin" loading="lazy"
                         src="<?= htmlspecialchars($src) ?>"
                         alt="icône du jeu : <?= htmlspecialchars($libelle) ?>">
                </a>
            <?php else: ?>
                <img class="dessin" loading="lazy"
                     src="<?= htmlspecialchars($src) ?>"
                     alt="<?= htmlspecialchars($libelle) ?>">
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
</div>

</body>

<?php require 'footer.php';?>
