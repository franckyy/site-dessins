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

<div class="grid-wrapper">
    <?php if (!empty($erreurJson)): ?>
        <p>Les jeux sont momentanément indisponibles.</p>
    <?php endif; ?>

    <?php foreach ($json_data as $icon): ?>
        <div>
            <img class="dessin" loading="lazy"
                 src="<?= htmlspecialchars($dir . $icon['nom'] . '.jpg') ?>"
                 alt="icône du jeu : <?= htmlspecialchars($icon['nom']) ?>">
            <?php if (!empty($icon['file'])): ?>
                <a class="btnDownload" href="<?= htmlspecialchars($icon['file']) ?>">JOUER</a>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
</div>

</body>

<?php require 'footer.php';?>
