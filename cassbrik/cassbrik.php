<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Casse briques</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap">
        <link rel="stylesheet" href="./cassbrik.css">
    </head>

    <body>
        <?php $largeurJeu = 1034; require __DIR__ . '/../logoJeu.php'; ?>

        <h1 class="titre">CASSE-BRIQUES</h1>

        <canvas id="myCanvas" width="1024" height="640"></canvas>

        <ul class="legende">
            <li><span class="pastille coup1"></span>1 coup</li>
            <li><span class="pastille coup2"></span>2 coups</li>
            <li><span class="pastille coup3"></span>3 coups</li>
        </ul>

        <button id="runButton">Start game</button>
        
        <script src="./cassbrik_draw.js"></script>
    </body>

</html>
