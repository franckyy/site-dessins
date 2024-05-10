<?php 
$title = "Deviner le chiffre";
$aDeviner = 150;
require 'head.php';
?>

<script src="./devineChiffre.js"></script>

<script  type="text/javaScript">
    let aDeviner = generateChiffreRand();
</script>

<body>

<?php require 'header.php';?>

<?php
    if (isset($_GET['chiffre'])){
        if ($_GET['chiffre'] > $aDeviner) {
            echo ("<h3>Votre chiffre est trop grand !!! </h3>");
        } elseif($_GET['chiffre'] < $aDeviner){
            echo ("<h3>Votre chiffre est trop petit !!! </h3>");
        } else {
            echo ("<h3>Bravo vous avez trouvé le chiffre $aDeviner !!! </h3>");
        }
    }
?>

<div class="containerDC">

    <input class="champsJeuDC" id="chiffreUser" type="text" name="chiffre" placeholder="entre 0 et 1000" 
    value="
        <?
            if (isset($_GET['chiffre'])){
                echo (htmlentities($_GET['chiffre'])); 
            }
        ?>
    ">
                
    <button class="champsJeuDC" id="btnDeviner" type="button" onclick="verifyChiffre(aDeviner)">DEVINER</button>

    <p id="textareaDC"></p>
</div>

<?php require 'footer.php';?>