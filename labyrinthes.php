<?php 
$title = "Labyrinthes";
require 'head.php';
$dir = 'dessins/labyrinthes/';

// Lecture du JSON avec gestion d'erreur
$json = @file_get_contents('datas/labyrinthes.json');
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
        <p>Les labyrinthes sont momentanément indisponibles.</p>
    <?php endif; ?>

    <?php foreach ($json_data as $draw): ?>
        <?php if ($draw['solution'] === 'false'): ?>
            <?php
                $base = $dir . $draw['dossier'] . $draw['nom'];
                $pdf = $base . '.pdf';
                $pdfSolution = $base . '_solution.pdf';
            ?>
            <div>
                <img class="dessin" loading="lazy"
                     src="<?= htmlspecialchars($base . '.jpg') ?>"
                     alt="labyrinthe : <?= htmlspecialchars($draw['nom']) ?>">
                <div class="laby-actions">
                    <?php if (file_exists($pdf)): ?>
                        <a class="btnLaby" href="<?= htmlspecialchars($pdf) ?>" download>Télécharger</a>
                    <?php endif; ?>
                    <?php if (file_exists($pdfSolution)): ?>
                        <a class="btnLaby" href="<?= htmlspecialchars($pdfSolution) ?>" download>Solution</a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>
    <?php endforeach; ?>
</div>


<?php require 'footer.php';?>
