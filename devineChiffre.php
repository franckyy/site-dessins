<?php 
$title = "Deviner le chiffre";
$aDeviner = 150;
require 'head.php';
?>
<body>

<?php require 'header.php';?>

<?php
    if ($_GET['chiffre'] > $aDeviner) {
        echo ("<h3>Votre chiffre est trop grand !!! </h3>");
    } elseif($_GET['chiffre'] < $aDeviner){
        echo ("<h3>Votre chiffre est trop petit !!! </h3>");
    } else {
        echo ("<h3>Bravo vous avez trouvé le chiffre $aDeviner !!! </h3>");
    }
?>

<form action="/devineChiffre.php" method="GET">
    <input type="number" name="chiffre" placeholder="entre 0 et 1000">
    <button type="submit">deviner</button>
</form>

<?php require 'footer.php';?>