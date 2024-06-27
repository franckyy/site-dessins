const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const ballRadius = 4;

let x = canvas.width / 2;
let dx = 2;
let y = canvas.height - 30;
let dy = -6;

const paddleHeight = 10;
var paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleXoffset = 5;

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

let score = 0;
let lives = 3;

//tableau contenant les colonnes et les lignes de briques
let bricks = [];
for(let c = 0; c < brickColumnCount; c++){
    bricks[c] = [];
    for(let r = 0; r < brickRowCount; r++){
        //status est le nombre de fois où il faut toucher la brique pour la détruire
        bricks[c][r] = {x:0, y:0, status: 2};
    }
}

function drawLives(){
    ctx.font = "16px arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives : " + lives, canvas.width - 65, 20);
}

function drawScore(){
    ctx.font = "16px arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score : " + score, 8, 20);
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++){
        for(let r = 0; r < brickRowCount; r++){
            if(bricks[c][r].status >= 1){
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBall(){
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    drawScore();
    drawLives();

    if(x + dx < ballRadius || x + dx > canvas.width - ballRadius){
        dx = -dx;
    }

    if(y + dy < ballRadius){
        dy = -dy;
    } else if(y + dy > canvas.height - ballRadius - paddleHeight){
        if(x > paddleX - paddleXoffset && x < paddleX + paddleWidth + paddleXoffset){
            dy = -dy;
        }else{
            lives--;
            if(!lives){
                alert("GAME OVER");
                document.location.reload();
                clearInterval(interval);
            } else {
                w = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) /2;
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

    x += dx;
    y += dy;
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e){
    if(e.key == "Right" || e.key == "ArrowRight"){
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
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
    let relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX < 0 && relativeX < canvas.width){
        paddleX = relativeX - paddleWidth / 2;
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
                    } else {
                        score++;
                    }
                    //fin du jeu
                    if(score == brickRowCount * brickColumnCount * 11 ){
                        alert("Bravo ! c'est gagné !");
                        document.location.reload();
                        clearInterval(interval);
                    }
                }
            } 
        }
    }
}
