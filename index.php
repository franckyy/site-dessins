<?php 
$title = "Dessins";
require 'head.php';
$dir = 'dessins/jpg/';
$json = file_get_contents('datas/images.json');
$json_data = json_decode($json,true);
$themes = ["Tout"];
$themesColo = filter_input(INPUT_POST, 'themesColo', FILTER_SANITIZE_STRING);
?>

<body>

<?php require 'header.php';?>

<form action="<?= htmlspecialchars($_SERVER['PHP_SELF'])?>" method="post">
    <div class="selectColo">
        <?php
        foreach($json_data as $draw){
            if(in_array($draw['theme'], $themes)) {
            
            } else {
                $themes[] = $draw['theme'];
            }
        }

        ?>

        <select name="themesColo">
            <?php
                foreach($themes as $theme){
            ?>
                    <option><?= $theme ?></option>
            <?php
                }
            ?>
        </select>
    </div>
    
    <div>
        <button type="submit">Select</button>
    </div>
</form>

<pre>
    <?php
        print_r($themesColo);
    ?>
</pre>

<div class="grid-wrapper">
    <?php 
        foreach($json_data as $draw) {
            if($draw['couleur'] == 'true') {
    ?>
                <div>
                    <img id="dessin" src="<?php echo($dir . $draw["nom"] . '.jpg')?>" alt="dessin : <?= $draw['nom'] ?> ">
                    <button class="btnDownload">Download</button>
                </div>
    <?php               
            }
        }
    ?>
</div>

<script src="./index.js"></script>
</body>

<?php require 'footer.php';?>