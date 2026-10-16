<?php
$dir    = 'dessins/jpg/';
$dirPdf = 'dessins/pdf/';

// Lecture du JSON
$json = @file_get_contents('datas/images.json');
$json_data = $json !== false ? json_decode($json, true) : null;
if (!is_array($json_data)) {
    $json_data = [];
}

// Liste blanche : on n'accepte qu'un nom présent dans le JSON
$nom = filter_input(INPUT_GET, 'nom', FILTER_UNSAFE_RAW) ?: '';
$draw = null;
foreach ($json_data as $d) {
    if (($d['nom'] ?? null) === $nom) {
        $draw = $d;
        break;
    }
}

// Dessin inconnu : vraie page 404 (important pour Google)
if ($draw === null) {
    http_response_code(404);
    $title = 'Coloriage introuvable';
    require 'head.php';
    ?>
    <body>
    <?php require 'header.php'; ?>
    <main class="fiche-coloriage">
        <h1>Coloriage introuvable</h1>
        <p class="fiche-description">Ce coloriage n'existe pas ou a été déplacé.</p>
        <p class="fiche-liens"><a href="index.php">Voir tous les coloriages</a></p>
    </main>
    <?php
    require 'footer.php';
    exit;
}

// Titre et description (valeurs de repli si absentes du JSON)
$titre = $draw['titre'] ?? str_replace('_', ' ', $draw['nom']);
$description = $draw['description']
    ?? "Coloriage « $titre » à imprimer gratuitement en PDF. Un dessin à colorier pour petits et grands.";

$title = "Coloriage $titre à imprimer";
$metaDescription = $description;

$image = $dir . $draw['nom'] . '_coul.jpg';
$pdf   = $dirPdf . $draw['nom'] . '.pdf';
$taille = file_exists($image) ? @getimagesize($image) : false; // largeur/hauteur : évite que la page « saute »

require 'head.php';
?>
<body>

<?php require 'header.php'; ?>

<main class="fiche-coloriage">
    <h1>Coloriage <?= htmlspecialchars($titre) ?></h1>

    <div class="fiche-image">
        <img src="<?= htmlspecialchars($image) ?>"
             alt="Coloriage <?= htmlspecialchars($titre) ?> à imprimer"
             <?php if ($taille): ?>width="<?= (int)$taille[0] ?>" height="<?= (int)$taille[1] ?>"<?php endif; ?>>

        <?php if (file_exists($pdf)): ?>
            <a class="btnTelecharger" href="<?= htmlspecialchars($pdf) ?>" download>Télécharger (PDF)</a>
        <?php endif; ?>
    </div>

    <p class="fiche-description"><?= htmlspecialchars($description) ?></p>

    <?php if (!file_exists($pdf)): ?>
        <p class="fiche-description">Le PDF de ce coloriage sera bientôt disponible.</p>
    <?php endif; ?>

    <p class="fiche-liens">
        <a href="index.php?themesColo=<?= urlencode($draw['theme']) ?>">Plus de coloriages « <?= htmlspecialchars($draw['theme']) ?> »</a>
        &middot;
        <a href="index.php">Tous les coloriages</a>
    </p>
</main>


<?php require 'footer.php'; ?>
