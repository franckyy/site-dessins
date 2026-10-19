const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const ballRadius = 6;

// ===== Palette du site =====
// Couleur d'une brique selon le nombre de coups restants pour la casser :
// 1 coup = vert, 2 coups = turquoise, 3 coups (ou plus) = bleu
const COULEURS_BRIQUES = {
    1: { haut: "#95F68B", face: "#46EB35", bas: "#14D200" },
    2: { haut: "#85ECE4", face: "#30D5C9", bas: "#00A094" },
    3: { haut: "#91B0EE", face: "#6590E4", bas: "#205BD0" }
};
const COULEUR_TEXTE = "#FFFFFF";
const COULEUR_BALLE = "#FFFFFF";
const COULEUR_HALO = "#85ECE4";

const paddleHeight = 10;
var paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleXoffset = 5;

// ===== Lancement de la balle =====
// Au départ et après chaque vie perdue, la balle est collée sur la plateforme.
// La touche ESPACE la libère, avec un angle qui dépend de la position de la plateforme.
// Angles mesurés sur le cercle trigonométrique (0° = vers la droite, 90° = tout droit vers le haut) :
//   plateforme tout à droite  -> ANGLE_EXTREME (20°)
//   plateforme tout à gauche  -> 180° - ANGLE_EXTREME (160°)
//   entre les deux            -> variation linéaire (milieu = 90°, tout droit)
const ANGLE_EXTREME = 20;       // degrés

// ===== Vitesse de la balle =====
// La balle part lentement, puis accélère à chaque brique détruite (jusqu'au plafond).
// Les vitesses sont exprimées en px par image ; l'affichage les convertit en px/s.
const PERIODE_MS = 10;                       // durée d'une image (même valeur que dans setInterval)
const IMAGES_PAR_SECONDE = 1000 / PERIODE_MS;
const VITESSE_DEPART = 3.5;                  // 350 px/s au lancement
const VITESSE_MAX = 9;                       // 900 px/s : plafond pour rester jouable
const PAS_ACCELERATION = 0.12;               // gain par brique détruite (plafond atteint vers la 46e brique sur 48)
let vitesse = VITESSE_DEPART;

// change la vitesse de la balle sans changer sa direction
function fixerVitesse(v){
    vitesse = Math.min(v, VITESSE_MAX);
    noterVitesse();
    const norme = Math.hypot(dx, dy);
    if(norme > 0){
        dx = dx / norme * vitesse;
        dy = dy / norme * vitesse;
    }
}
let balleCollee = true;
let x = canvas.width / 2;
let y = canvas.height - paddleHeight - ballRadius;
let dx = 0;
let dy = 0;

// angle de lancement (en radians) selon la position horizontale de la plateforme
function angleLancement(){
    const course = canvas.width - paddleWidth;
    const t = course > 0 ? paddleX / course : 0.5;   // 0 = tout à gauche, 1 = tout à droite
    const degres = (180 - ANGLE_EXTREME) + t * (2 * ANGLE_EXTREME - 180);
    return degres * Math.PI / 180;
}

function lancerBalle(){
    if(!balleCollee){
        return;
    }
    const angle = angleLancement();
    dx = vitesse * Math.cos(angle);
    dy = -vitesse * Math.sin(angle);
    balleCollee = false;
    noterVitesse();
}

function recollerBalle(){
    balleCollee = true;
    vitesse = VITESSE_DEPART;   // après une vie perdue, on repart lentement
    dx = 0;
    dy = 0;
}

// la balle suit la plateforme : centrée dessus, posée sur son bord supérieur
function positionnerBalleCollee(){
    x = paddleX + paddleWidth / 2;
    y = canvas.height - paddleHeight - ballRadius;
}

// ===== Rebond sur la plateforme =====
// L'endroit touché modifie l'angle de sortie de la balle (cercle trigonométrique) :
//   bord gauche -> + INFLUENCE_PLATEFORME degrés, bord droit -> - INFLUENCE_PLATEFORME degrés,
//   milieu -> aucun changement, variation linéaire entre les deux.
// L'angle final est toujours maintenu entre ANGLE_MIN_REBOND et ANGLE_MAX_REBOND.
const INFLUENCE_PLATEFORME = 20;   // degrés
const ANGLE_MIN_REBOND = 20;       // degrés
const ANGLE_MAX_REBOND = 160;      // degrés

function rebondSurPlateforme(){
    const v = Math.hypot(dx, dy);
    // angle avec lequel la balle repart vers le haut (avant l'influence de la plateforme)
    let angle = Math.atan2(Math.abs(dy), dx) * 180 / Math.PI;
    // 0 = bord gauche de la plateforme, 1 = bord droit
    const t = Math.min(1, Math.max(0, (x - paddleX) / paddleWidth));
    angle += INFLUENCE_PLATEFORME * (1 - 2 * t);
    angle = Math.min(ANGLE_MAX_REBOND, Math.max(ANGLE_MIN_REBOND, angle));
    const rad = angle * Math.PI / 180;
    dx = v * Math.cos(rad);
    dy = -v * Math.sin(rad);
}

// ===== Téléphone : affichage réduit et commandes tactiles =====
const ECRAN_TACTILE = window.matchMedia("(pointer: coarse)").matches;
// téléphone tenu en hauteur : un message cache le jeu (classes écrites sur <html> par cassbrik.php),
// la partie est en pause, sauf si le joueur a touché « Jouer quand même »
const RACINE = document.documentElement;
function enPause(){
    return RACINE.classList.contains("tel-portrait") && !RACINE.classList.contains("jeu-force");
}
const LARGEUR_ECRAN_REDUIT = 640;   // largeur du jeu à l'écran (px CSS) en dessous de laquelle l'affichage est réduit
const DECALAGE_REDUIT = 30;         // briques descendues de 30 px (pour laisser la place au tableau de bord agrandi)
const SENSIBILITE_TACTILE = 1.3;    // 1 = la plateforme suit exactement le doigt ; plus grand = elle va plus vite
let affichageReduit = false;        // recalculé à chaque image
let toucheX = null;                 // position du doigt (null = aucun doigt posé)
let toucheDebut = 0;
let toucheDeplacement = 0;
let dernierToucher = 0;

function drawConsigne(){
    const taille = affichageReduit ? 36 : 20;
    const lignes = ["Niveau " + (niveau + 1)];
    if(ECRAN_TACTILE){
        lignes.push("Glisse le doigt pour bouger");
        lignes.push("Touche l'écran pour lancer la balle");
    } else {
        lignes.push("Appuie sur ESPACE pour lancer la balle");
    }
    ctx.font = "bold " + taille + "px Roboto, Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.textAlign = "center";
    for(let i = 0; i < lignes.length; i++){
        ctx.fillText(lignes[i], canvas.width / 2, canvas.height * 0.55 + i * (affichageReduit ? 54 : 45));
    }
    ctx.textAlign = "left";
}

let rightPressed = false;
let leftPressed = false;

var interval = setInterval(draw, PERIODE_MS);

//on peut mettre 16 briques de 50 px de large sur une ligne
let brickRowCount = 0;           // fixé par chargerNiveau() selon la grille du niveau
const brickColumnCount = 16;
const brickWidth = 50;
const brickHeight = 15;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// ===== Niveaux =====
// Une grille par niveau : une chaîne par rangée (de haut en bas), un caractère par colonne
// (16 colonnes au maximum). Chiffre = nombre de coups pour casser la brique :
//   0 = pas de brique, 1 = 1 coup, 2 = 2 coups, 3 = 3 coups
// Pour ajouter un niveau : ajouter une grille à la fin de la liste.
const NIVEAUX = [
    // Niveau 1 : trois rangées pleines, surtout des briques à 1 coup
    [ "2222222222222222",
      "1111111111111111",
      "1111111111111111" ],
    // Niveau 2 : pyramide
    [ "0000001111000000",
      "0000011221100000",
      "0000112222110000",
      "0001122222211000",
      "0011222222221100" ],
    // Niveau 3 : damier
    [ "1212121212121212",
      "2121212121212121",
      "1212121212121212",
      "2121212121212121" ],
    // Niveau 4 : colonnes
    [ "2020202020202020",
      "2020202020202020",
      "2020202020202020",
      "2020202020202020",
      "3333333333333333" ],
    // Niveau 5 : dôme avec un creux
    [ "0011111111111100",
      "0112222222222110",
      "1122333333332211",
      "1122330000332211",
      "1122000000002211" ],
    // Niveau 6 : mur final
    [ "3333333333333333",
      "2222222222222222",
      "3322332233223322",
      "2323232323232323",
      "3333333333333333",
      "1111111111111111" ]
];

let niveau = 0;                 // index dans NIVEAUX (0 = niveau 1)
let score = 0;
const viesMax = 3;
let lives = viesMax;
let briquesRestantes = 0;
let bricks = [];                // bricks[colonne][rangée] = {x, y, status}

// ===== Records de la session =====
// Stockés dans sessionStorage : ils survivent au rechargement de la page (game over)
// et disparaissent à la fermeture de l'onglet.
function lireSession(cle){
    try { return Number(sessionStorage.getItem(cle)) || 0; } catch(e) { return 0; }
}
function ecrireSession(cle, valeur){
    try { sessionStorage.setItem(cle, String(valeur)); } catch(e) { /* stockage indisponible : on continue sans */ }
}
let meilleurScore = lireSession("cassbrik_meilleurScore");
let vitesseMaxSession = lireSession("cassbrik_vitesseMax");   // en px par image

function ajouterScore(points){
    score += points;
    if(score > meilleurScore){
        meilleurScore = score;
        ecrireSession("cassbrik_meilleurScore", meilleurScore);
    }
}

function noterVitesse(){
    if(vitesse > vitesseMaxSession){
        vitesseMaxSession = vitesse;
        ecrireSession("cassbrik_vitesseMax", vitesseMaxSession);
    }
}

// construit le tableau de briques du niveau n (0 = niveau 1)
function chargerNiveau(n){
    const grille = NIVEAUX[n];
    brickRowCount = grille.length;
    briquesRestantes = 0;
    bricks = [];
    for(let c = 0; c < brickColumnCount; c++){
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++){
            //status est le nombre de fois où il faut toucher la brique pour la détruire
            const status = Number(grille[r].charAt(c)) || 0;
            bricks[c][r] = {x:0, y:0, status: status};
            if(status >= 1){
                briquesRestantes++;
            }
        }
    }
}
chargerNiveau(niveau);

// toutes les briques sont détruites : niveau suivant, ou victoire après le dernier
function niveauTermine(){
    niveau++;
    if(niveau >= NIVEAUX.length){
        alert("Bravo ! Tu as terminé les " + NIVEAUX.length + " niveaux ! Score : " + score);
        document.location.reload();
        clearInterval(interval);
        return;
    }
    chargerNiveau(niveau);
    paddleX = (canvas.width - paddleWidth) / 2;
    recollerBalle();                // balle sur la plateforme, vitesse de départ
    positionnerBalleCollee();
}

// Rectangle aux coins arrondis
function rectArrondi(rx, ry, w, h, r){
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.arcTo(rx + w, ry, rx + w, ry + h, r);
    ctx.arcTo(rx + w, ry + h, rx, ry + h, r);
    ctx.arcTo(rx, ry + h, rx, ry, r);
    ctx.arcTo(rx, ry, rx + w, ry, r);
    ctx.closePath();
}

function drawLives(){
    if(affichageReduit){
        for(let i = 0; i < viesMax; i++){
            const cx = canvas.width - 24 - (viesMax - 1 - i) * 34;
            ctx.beginPath();
            ctx.arc(cx, 24, 11, 0, Math.PI * 2);
            ctx.lineWidth = 3;
            if(i < lives){
                ctx.fillStyle = "#46EB35";
                ctx.fill();
                ctx.strokeStyle = "#95F68B";
            } else {
                ctx.strokeStyle = "rgba(255,255,255,0.35)";
            }
            ctx.stroke();
            ctx.closePath();
        }
        return;
    }
    const espace = 22;
    const cy = 15;
    ctx.font = "bold 16px Roboto, Arial, sans-serif";
    ctx.fillStyle = COULEUR_TEXTE;
    ctx.textAlign = "right";
    ctx.fillText("Vies", canvas.width - 20 - (viesMax - 1) * espace - 18, 20);
    ctx.textAlign = "left";
    for(let i = 0; i < viesMax; i++){
        const cx = canvas.width - 20 - (viesMax - 1 - i) * espace;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        if(i < lives){
            ctx.fillStyle = "#46EB35";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#95F68B";
        } else {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
        }
        ctx.stroke();
        ctx.closePath();
    }
}

function drawScore(){
    if(affichageReduit){
        ctx.font = "bold 32px Roboto, Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = COULEUR_TEXTE;
        ctx.fillText("Score : " + score, 20, 38);
        return;
    }
    ctx.font = "bold 16px Roboto, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = COULEUR_TEXTE;
    ctx.fillText("Score : " + score, 20, 20);
    // meilleur score de la session, juste à droite du score (position fixe)
    ctx.fillStyle = COULEUR_HALO;
    ctx.fillText("Meilleur : " + meilleurScore, 150, 20);
}

// vitesse de la balle (en px/s) et vitesse maximale de la session, en haut au centre
function drawSpeed(){
    if(affichageReduit){
        return;   // vitesse et vitesse maximale : seulement sur un grand écran
    }
    const pxParSeconde = Math.round(vitesse * IMAGES_PAR_SECONDE);
    const maxPxParSeconde = Math.round(vitesseMaxSession * IMAGES_PAR_SECONDE);
    const gauche = canvas.width / 2 - 140;
    ctx.font = "bold 16px Roboto, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = COULEUR_TEXTE;
    ctx.fillText("Vitesse : " + pxParSeconde + " px/s", gauche, 20);
    ctx.fillStyle = COULEUR_HALO;
    ctx.fillText("Max : " + (maxPxParSeconde || "-"), gauche + 170, 20);
}

// niveau actuel, à gauche des vies
function drawNiveau(){
    if(affichageReduit){
        ctx.font = "bold 32px Roboto, Arial, sans-serif";
        ctx.fillStyle = COULEUR_TEXTE;
        ctx.textAlign = "center";
        ctx.fillText("Niveau " + (niveau + 1) + " / " + NIVEAUX.length, canvas.width / 2, 38);
        ctx.textAlign = "left";
        return;
    }
    ctx.font = "bold 16px Roboto, Arial, sans-serif";
    ctx.fillStyle = COULEUR_TEXTE;
    ctx.textAlign = "right";
    ctx.fillText("Niveau " + (niveau + 1) + " / " + NIVEAUX.length, canvas.width - 140, 20);
    ctx.textAlign = "left";
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++){
        for(let r = 0; r < brickRowCount; r++){
            const b = bricks[c][r];
            // la position est toujours calculée : la détection des collisions s'en sert
            b.x = c * (brickWidth + brickPadding) + brickOffsetLeft;
            b.y = r * (brickHeight + brickPadding) + brickOffsetTop + (affichageReduit ? DECALAGE_REDUIT : 0);
            if(b.status >= 1){
                const couleur = COULEURS_BRIQUES[Math.min(b.status, 3)];
                const degrade = ctx.createLinearGradient(0, b.y, 0, b.y + brickHeight);
                degrade.addColorStop(0, couleur.haut);
                degrade.addColorStop(0.5, couleur.face);
                degrade.addColorStop(1, couleur.bas);
                rectArrondi(b.x, b.y, brickWidth, brickHeight, 4);
                ctx.fillStyle = degrade;
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = couleur.bas;
                ctx.stroke();
            }
        }
    }
}

function drawBall(){
    ctx.beginPath();
    ctx.arc(x, y, affichageReduit ? ballRadius * 1.5 : ballRadius, 0, Math.PI * 2);   // dessin plus gros en affichage réduit, la collision ne change pas
    ctx.shadowColor = COULEUR_HALO;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COULEUR_BALLE;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawPaddle(){
    const py = canvas.height - paddleHeight;
    // dégradé horizontal : extrémités vert clair (95F68B), centre vert foncé (14D200)
    const degrade = ctx.createLinearGradient(paddleX, 0, paddleX + paddleWidth, 0);
    degrade.addColorStop(0, "#95F68B");
    degrade.addColorStop(0.5, "#14D200");
    degrade.addColorStop(1, "#95F68B");
    rectArrondi(paddleX, py, paddleWidth, paddleHeight, 5);
    ctx.fillStyle = degrade;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#85ECE4";
    ctx.stroke();
}

function draw(){
    if(enPause()){
        return;   // message « tourne ton téléphone » affiché : partie en pause
    }
    affichageReduit = canvas.getBoundingClientRect().width < LARGEUR_ECRAN_REDUIT;
    if(balleCollee){
        positionnerBalleCollee();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    if(!balleCollee){
        collisionDetection();
    }
    drawScore();
    drawSpeed();
    drawNiveau();
    drawLives();
    if(balleCollee){
        drawConsigne();
    }

    if(!balleCollee){
        if(x + dx < ballRadius || x + dx > canvas.width - ballRadius){
            dx = -dx;
        }

        if(y + dy < ballRadius){
            dy = -dy;
        } else if(y + dy > canvas.height - ballRadius - paddleHeight){
            if(x > paddleX - paddleXoffset && x < paddleX + paddleWidth + paddleXoffset){
                rebondSurPlateforme();
            }else{
                lives--;
                if(!lives){
                    alert("GAME OVER");
                    document.location.reload();
                    clearInterval(interval);
                } else {
                    // nouvelle vie : plateforme au centre, balle collée dessus
                    paddleX = (canvas.width - paddleWidth) / 2;
                    recollerBalle();
                    positionnerBalleCollee();
                }
            }
        }
    }

    if(rightPressed){
        paddleX += 7;
        if(paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }
    } else if(leftPressed){
        paddleX -= 7;
        if(paddleX < 0){
            paddleX = 0;
        }
    }

    if(!balleCollee){
        x += dx;
        y += dy;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e){
    if(e.key == "Right" || e.key == "ArrowRight"){
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    } else if (e.code == "Space" || e.key == " " || e.key == "Spacebar") {
        e.preventDefault();   // évite que la page défile
        lancerBalle();
    }
}

function keyUpHandler(e){
    if(e.key == "Right" || e.key == "ArrowRight"){
        rightPressed = false;
    } else if(e.key == "Left" || e.key == "ArrowLeft"){
        leftPressed = false;
    }
}

function mouseMoveHandler(e){
    if(Date.now() - dernierToucher < 1000){
        return;   // le téléphone simule une souris après un toucher : on l'ignore
    }
    // position de la souris dans le canvas (tient compte d'un éventuel redimensionnement CSS)
    const rect = canvas.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) * canvas.width / rect.width;
    if(relativeX > 0 && relativeX < canvas.width){
        paddleX = relativeX - paddleWidth / 2;
        if(paddleX < 0){
            paddleX = 0;
        } else if(paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }
    }
}

function collisionDetection(){
    for(let c = 0; c < brickColumnCount; c++){
        for(let r = 0; r < brickRowCount; r++){
            let b = bricks[c][r];
            if(b.status >= 1){
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status -= 1;
                    //mise à jour du score
                    if(b.status < 1){
                        ajouterScore(10);
                        briquesRestantes--;
                        fixerVitesse(vitesse + PAS_ACCELERATION);
                    } else {
                        ajouterScore(1);
                    }
                    //niveau terminé : plus aucune brique (on sort, la grille vient de changer)
                    if(briquesRestantes === 0){
                        niveauTermine();
                        return;
                    }
                }
            } 
        }
    }
}

// ===== Commandes tactiles =====
// Glisser le doigt n'importe où : la plateforme suit le mouvement (déplacement relatif : le doigt ne cache pas la plateforme).
// Toucher bref sans glisser : lance la balle quand elle est collée à la plateforme.
function toucheSurCommande(e){
    return e.target.closest && e.target.closest("a, button");
}

document.addEventListener("touchstart", function(e){
    dernierToucher = Date.now();
    if(toucheSurCommande(e) || e.touches.length !== 1){
        return;
    }
    toucheX = e.touches[0].clientX;
    toucheDebut = Date.now();
    toucheDeplacement = 0;
    e.preventDefault();
}, {passive: false});

document.addEventListener("touchmove", function(e){
    dernierToucher = Date.now();
    if(toucheX === null || e.touches.length < 1){
        return;
    }
    const nouveauX = e.touches[0].clientX;
    const delta = nouveauX - toucheX;
    toucheX = nouveauX;
    toucheDeplacement += Math.abs(delta);
    const rect = canvas.getBoundingClientRect();
    paddleX += delta * (canvas.width / rect.width) * SENSIBILITE_TACTILE;
    if(paddleX < 0){
        paddleX = 0;
    } else if(paddleX + paddleWidth > canvas.width){
        paddleX = canvas.width - paddleWidth;
    }
    e.preventDefault();
}, {passive: false});

document.addEventListener("touchend", function(){
    dernierToucher = Date.now();
    if(toucheX === null){
        return;
    }
    const bref = (Date.now() - toucheDebut) < 300 && toucheDeplacement < 10;
    toucheX = null;
    if(bref){
        lancerBalle();
    }
}, false);

document.addEventListener("touchcancel", function(){
    toucheX = null;
}, false);

// Bouton « Start game » : lance la balle (comme la touche ESPACE)
document.getElementById("runButton").addEventListener("click", function(){
    lancerBalle();
    this.blur();   // évite qu'un appui sur ESPACE ne « clique » encore le bouton
}, false);
