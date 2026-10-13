<?php 
$title = "Deviner le chiffre";
require 'head.php';
?>

<body>

<?php require 'header.php';?>

<div class="containerDC">
    <input class="champsJeuDC" id="chiffreUser" type="number" min="0" max="1000" name="chiffre" placeholder="entre 0 et 1000">
                
    <button class="champsJeuDC" id="btnDeviner" type="button" onclick="verifyChiffre()">DEVINER</button>

    <p id="textareaDC"></p>
</div>

<script src="./devineChiffre.js"></script>

<?php require 'footer.php';?>
