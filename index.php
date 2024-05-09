<?php 
$title = "Dessins";
require 'head.php';
$dir = 'dessins/jpg/';
$json = file_get_contents('datas/images.json');
$json_data = json_decode($json,true);
$themes = ["Tout"];
$themesColo = filter_input(INPUT_POST, 'themesColo', FILTER_UNSAFE_RAW);
?>

<body>

<?php require 'header.php';?>

<form class="selectColo" action="<?= htmlspecialchars($_SERVER['PHP_SELF'])?>" method="post">
        <?php
        foreach($json_data as $draw){
            if(in_array($draw['theme'], $themes)) {
            
            } else {
                $themes[] = $draw['theme'];
            }
        }

        ?>

        <label>Choisissez un thème de coloriage : </label>
        <select name="themesColo">
            <?php
                foreach($themes as $theme){
            ?>
                    <option value="<?= $theme ?>"><?= $theme ?></option>
            <?php
                }
            ?>
        </select>
        <button type="submit">Select</button>
</form>

<div class="grid-wrapper">
    <?php 
        foreach($json_data as $draw) {
            if(($draw['theme'] == $themesColo) || ($themesColo == 'Tout')) {
               
    ?>
                <div>
                    <img id="dessin" src="<?php echo($dir . $draw["nom"] . '_coul.jpg')?>" alt="dessin : <?= $draw['nom'] ?> ">
                    <button class="btnDownload"
                            onclick="<?php echo("openImg('" . $draw["nom"] . "')") ?>">Download</button>
                </div>
    <?php          
            }
        }
    ?>
</div>

<script src="./index.js"></script>

<script src="./devineChiffre.js"></script>
</body>

<?php require 'footer.php';?>