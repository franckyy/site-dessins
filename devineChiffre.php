<?php 
$title = "Deviner le chiffre";
require 'head.php';
?>

<body>

<?php $largeurJeu = 520; require 'logoJeu.php'; ?>

<div class="pageDC">
<main class="containerDC">
    <h2 class="titreDC">Devine le chiffre</h2>
    <p class="consigneDC">J'ai choisi un nombre entre 0 et 1000. À toi de le trouver !</p>

    <input class="champsJeuDC" id="chiffreUser" type="number" min="0" max="1000" name="chiffre" placeholder="entre 0 et 1000">

    <button class="champsJeuDC" id="btnDeviner" type="button" onclick="verifyChiffre()">DEVINER</button>

    <p id="textareaDC" role="status" aria-live="polite"></p>
    <p id="essaisDC">Essais : 0</p>
</main>
</div>

<script src="./devineChiffre.js"></script>
</body>

<?php require 'footer.php';?>
