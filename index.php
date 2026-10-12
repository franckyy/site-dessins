<?php 
$title = "Coloriages";
require 'head.php';
$dir = 'dessins/jpg/';

// Lecture du JSON avec gestion d'erreur
$json = @file_get_contents('datas/images.json');
$json_data = $json !== false ? json_decode($json, true) : null;
if (!is_array($json_data)) {
    $json_data = [];
    $erreurJson = true;
}

// Liste des thèmes construite depuis le JSON, sans doublons
$themes = array_merge(['Tout'], array_values(array_unique(array_column($json_data, 'theme'))));

// GET + valeur par défaut + liste blanche
$themesColo = filter_input(INPUT_GET, 'themesColo', FILTER_UNSAFE_RAW) ?: 'Tout';
if (!in_array($themesColo, $themes, true)) {
    $themesColo = 'Tout';
}
?>

<body>

<?php require 'header.php';?>

<form class="selectColo" action="index.php" method="get">
    <label for="themesColo">Choisissez un thème de coloriage : </label>
    <select name="themesColo" id="themesColo">
        <?php foreach ($themes as $theme): ?>
            <option value="<?= htmlspecialchars($theme) ?>" <?= $theme === $themesColo ? 'selected' : '' ?>>
                <?= htmlspecialchars($theme) ?>
            </option>
        <?php endforeach; ?>
    </select>
    <button type="submit">Select</button>
</form>

<div class="grid-wrapper">
    <?php if (!empty($erreurJson)): ?>
        <p>Les coloriages sont momentanément indisponibles.</p>
    <?php endif; ?>

    <?php foreach ($json_data as $draw): ?>
        <?php if ($themesColo === 'Tout' || $draw['theme'] === $themesColo): ?>
            <div>
                <img class="dessin" loading="lazy"
                     src="<?= htmlspecialchars($dir . $draw['nom'] . '_coul.jpg') ?>"
                     alt="dessin : <?= htmlspecialchars($draw['nom']) ?>">
                <button class="btnDownload"
                        onclick="openImg('<?= htmlspecialchars($draw['nom'], ENT_QUOTES) ?>')">Download</button>
            </div>
        <?php endif; ?>
    <?php endforeach; ?>
</div>

<script src="./index.js"></script>
</body>

<?php require 'footer.php';?>
