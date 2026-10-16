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
const VITESSE_BALLE = 6.3;      // px par image (identique à la vitesse du début : racine de 2² + 6²)
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
    dx = VITESSE_BALLE * Math.cos(angle);
    dy = -VITESSE_BALLE * Math.sin(angle);
    balleCollee = false;
}

function recollerBalle(){
    balleCollee = true;
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
    const vitesse = Math.hypot(dx, dy);
    // angle avec lequel la balle repart vers le haut (avant l'influence de la plateforme)
    let angle = Math.atan2(Math.abs(dy), dx) * 180 / Math.PI;
    // 0 = bord gauche de la plateforme, 1 = bord droit
    const t = Math.min(1, Math.max(0, (x - paddleX) / paddleWidth));
    angle += INFLUENCE_PLATEFORME * (1 - 2 * t);
    angle = Math.min(ANGLE_MAX_REBOND, Math.max(ANGLE_MIN_REBOND, angle));
    const rad = angle * Math.PI / 180;
    dx = vitesse * Math.cos(rad);
    dy = -vitesse * Math.sin(rad);
}

function drawConsigne(){
    ctx.font = "bold 20px Roboto, Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.textAlign = "center";
    ctx.fillText("Appuie sur ESPACE pour lancer la balle", canvas.width / 2, canvas.height * 0.62);
    ctx.textAlign = "left";
}

let rightPressed = false;
let leftPressed = false;

var interval = setInterval(draw, 10);

//on peut mettre 16 briques de 50 px de large sur une ligne
const brickRowCount = 3;
const brickColumnCount = 16;
const brickWidth = 50;
const brickHeight = 15;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Nombre de coups nécessaires pour casser les briques de chaque ligne
// (de haut en bas). Pour revenir à l'ancien jeu : [2, 2, 2]
const resistanceParLigne = [3, 2, 1];

let score = 0;
const viesMax = 3;
let lives = viesMax;
let briquesRestantes = brickRowCount * brickColumnCount;

//tableau contenant les colonnes et les lignes de briques
let bricks = [];
for(let c = 0; c < brickColumnCount; c++){
    bricks[c] = [];
    for(let r = 0; r < brickRowCount; r++){
        //status est le nombre de fois où il faut toucher la brique pour la détruire
        bricks[c][r] = {x:0, y:0, status: resistanceParLigne[r] || 1};
    }
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
    ctx.font = "bold 16px Roboto, Arial, sans-serif";
    ctx.fillStyle = COULEUR_TEXTE;
    ctx.textAlign = "left";
    ctx.fillText("Score : " + score, 20, 20);
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++){
        for(let r = 0; r < brickRowCount; r++){
            const b = bricks[c][r];
            // la position est toujours calculée : la détection des collisions s'en sert
            b.x = c * (brickWidth + brickPadding) + brickOffsetLeft;
            b.y = r * (brickHeight + brickPadding) + brickOffsetTop;
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
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.shadowColor = COULEUR_HALO;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COULEUR_BALLE;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawPaddle(){
    const py = canvas.height - paddleHeight;
    const degrade = ctx.createLinearGradient(0, py, 0, py + paddleHeight);
    degrade.addColorStop(0, "#95F68B");
    degrade.addColorStop(1, "#14D200");
    rectArrondi(paddleX, py, paddleWidth, paddleHeight, 5);
    ctx.fillStyle = degrade;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#85ECE4";
    ctx.stroke();
}

function draw(){
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
                        score = score + 10;
                        briquesRestantes--;
                    } else {
                        score++;
                    }
                    //fin du jeu : plus aucune brique
                    if(briquesRestantes === 0){
                        alert("Bravo ! c'est gagné !");
                        document.location.reload();
                        clearInterval(interval);
                    }
                }
            } 
        }
    }
}
