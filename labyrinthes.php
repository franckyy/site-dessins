<?php 
$title = "Labyrinthes";
require 'head.php';
?>
<body>
<?php require 'header.php';?>
<h3>Labyrinthes</h3>

<?php 
    $dir = 'dessins/labyrinthes/';
    $json = file_get_contents('datas/labyrinthes.json');
    $json_data = json_decode($json,true);
?>

<div class="grid-wrapper">
    <?php 
        foreach($json_data as $draw) {
            if($draw['solution'] == 'false') {
    ?>
                <div>
                   <img id="dessin" src="<?php echo($dir . $draw['dossier'] . $draw['nom'] . '.jpg')?>" alt="labyrinthe : <?= $draw['nom'] ?> ">
                    <button class="btnDownloadLaby">Download</button>
                </div>
    <?php               
            }
        }
    ?>
</div>

<script src="./index.js"></script>
</body>

<?php require 'footer.php';?>