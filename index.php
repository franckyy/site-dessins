<?php 
$title = "Dessins";
require 'head.php';?>

<body>

<?php require 'header.php';?>
    
<h2>Dessins</h2>

<?php 
    $dir = 'dessins/jpg/';
    $files = scandir($dir);
?>

<div class="grid-wrapper">
    <?php 
        foreach($files as $file) {
            if($file == "." || $file == "..") {

            } else {
                if(stripos($file, "_coul") != false) {
    ?>
                    <div>
                        <img id="dessin" src="<?php echo($dir . $file)?>" alt="dessin : ' . $file . '">
                    </div>
    <?php               
                }
            }
        }
    ?>
</div>

<script src="./index.js"></script>
</body>

<?php require 'footer.php';?>