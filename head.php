<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?php 
            if(isset($title)){ 
                echo $title; 
            } else { 
                echo 'Coloriages et loisirs'; 
            }
        ?>
    </title>

    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="./header.css">
    <link rel="stylesheet" href="./choixTheme.css">
    <link rel="stylesheet" href="./labyrinthes.css">
    <link rel="stylesheet" href="./responsive.css">
    <link rel="stylesheet" href="./devineChiffre.css">

</head>
