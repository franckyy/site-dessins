<?php 
$title = "Jeux";
require 'head.php';
$dir = 'assets/iconsjeux/';
$json = file_get_contents('datas/iconsJeux.json');
$json_data = json_decode($json,true);
?>
<body>
<?php require 'header.php';?>
<h3>Jeux</h3>

<div class="grid-wrapper">
    <?php 
        foreach($json_data as $icon) {  
    ?>
        <div>
            <img id="dessin" src="<?php echo($dir . $icon["nom"] . '.jpg')?>" alt="iconeJeu : <?= $icon['nom'] ?> ">
            <button class="btnDownload"
                    onclick="window.open('devineChiffre.php','main')">JOUER</button>
        </div>
    <?php
        }
    ?>
</div>

<a href="/devineChiffre.php">Jeu deviner le chiffre</a>
<?php require 'footer.php';?>