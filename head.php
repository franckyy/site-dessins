<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title ?? 'Coloriages et loisirs') ?></title>
    <?php if (!empty($metaDescription)): ?>
    <meta name="description" content="<?= htmlspecialchars($metaDescription) ?>">
    <?php endif; ?>
    <link rel="icon" href="./assets/Logo_site_02.gif">

    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="./header.css">
    <link rel="stylesheet" href="./choixTheme.css">
    <link rel="stylesheet" href="./labyrinthes.css">
    <link rel="stylesheet" href="./responsive.css">
    <link rel="stylesheet" href="./devineChiffre.css">
    <link rel="stylesheet" href="./coloriage.css">
    <link rel="stylesheet" href="./legal.css">

</head>
