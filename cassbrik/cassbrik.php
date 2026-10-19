<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Casse briques</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap">
        <!-- ?v=<date du fichier> : le navigateur du téléphone recharge le fichier dès qu'il change -->
        <link rel="stylesheet" href="./cassbrik.css?v=<?= (int) @filemtime(__DIR__ . '/cassbrik.css') ?>">
        <script>
        // Téléphone : portrait ou paysage est déduit de la taille réelle de la fenêtre
        // (plus fiable que la règle CSS « orientation »). Le résultat est écrit en classes sur <html>.
        (function(){
            var racine = document.documentElement;
            var tactile = window.matchMedia("(pointer: coarse)").matches;
            function maj(){
                var l = window.innerWidth, h = window.innerHeight;
                racine.classList.toggle("tactile", tactile);
                racine.classList.toggle("tel-portrait", tactile && h > l && l <= 700);
                racine.classList.toggle("tel-paysage", tactile && l >= h && h <= 600);
                if(l >= h){ racine.classList.remove("jeu-force"); }   // une fois en paysage, le message reviendra si on repasse en portrait
            }
            maj();
            window.addEventListener("resize", maj);
            window.addEventListener("orientationchange", maj);
            document.addEventListener("DOMContentLoaded", maj);
            // bouton « Jouer quand même » du message
            window.forcerJeu = function(){ racine.classList.add("jeu-force"); };
        })();
        </script>
    </head>

    <body>
        <?php $largeurJeu = 1034; require __DIR__ . '/../logoJeu.php'; ?>

        <!-- affiché seulement sur un téléphone tenu en hauteur (voir cassbrik.css) -->
        <div id="tournerEcran" role="alert">
            <div class="telephone" aria-hidden="true"></div>
            <p>Tourne ton téléphone<br>en mode paysage pour jouer</p>
            <button type="button" id="jouerQuandMeme" onclick="forcerJeu()">Jouer quand même</button>
        </div>

        <h1 class="titre">CASSE-BRIQUES</h1>

        <canvas id="myCanvas" width="1024" height="640"></canvas>

        <ul class="legende">
            <li><span class="pastille coup1"></span>1 coup</li>
            <li><span class="pastille coup2"></span>2 coups</li>
            <li><span class="pastille coup3"></span>3 coups</li>
        </ul>

        <button id="runButton">Start game</button>
        
        <script src="./cassbrik_draw.js?v=<?= (int) @filemtime(__DIR__ . '/cassbrik_draw.js') ?>"></script>
    </body>

</html>
