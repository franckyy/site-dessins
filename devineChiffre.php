<?php 
$title = "Deviner le chiffre";
require 'head.php';
?>

<script src="./devineChiffre.js"></script>

<body>

<?php require 'header.php';?>

<div class="containerDC">
    <input class="champsJeuDC" id="chiffreUser" type="text" name="chiffre" placeholder="entre 0 et 1000">
                
    <button class="champsJeuDC" id="btnDeviner" type="button" onclick="verifyChiffre(aDeviner)">DEVINER</button>

    <p id="textareaDC"></p>
</div>

<?php require 'footer.php';?>