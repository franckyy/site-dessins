<?php 
$title = "popupColoriage";
require 'head.php';
?>

<body>
<p>Veillez renseigner votre email afin de recevoir votre coloriage :</p>
<form onsubmit="return gestionMail(this)">
    <input type="email" placeholder="votre email">
    <button type="submit">VALIDER</button>
</form>

<script src="./indpopupColoriage.js"></script>

</body>

<?php require 'footer.php' ?>