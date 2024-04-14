<?php 
$title = "Dessins";
require 'head.php';?>

<body>

<?php require 'header.php';?>
    
<h2>Dessins</h2>

<?php 
    $dir = 'dessins/jpg/';
    $json = file_get_contents('datas/images.json');
    $json_data = json_decode($json,true);
?>

<div class="grid-wrapper">
    <?php 
        foreach($json_data as $draw) {
            if($draw['couleur'] == 'true') {
    ?>
                <div>
                    <img id="dessin" src="<?php echo($dir . $draw["nom"] . '.jpg')?>" alt="dessin : <?= $draw['nom'] ?> ">
                </div>
    <?php               
            }
        }
    ?>
</div>

<script src="./index.js"></script>
</body>

<?php require 'footer.php';?>