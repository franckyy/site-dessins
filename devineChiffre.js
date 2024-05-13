
var aDeviner = null;
generateChiffreRand();

function generateChiffreRand() {
    let randomNr = Math.random() * 1001;
    aDeviner = Math.floor(randomNr);
} 

function verifyChiffre(aDeviner) {
    let chiffreUser = document.getElementById("chiffreUser").value;
    if(chiffreUser > aDeviner){
        document.getElementById("textareaDC").innerHTML = "chiffre trop grand ";
    } else if(chiffreUser < aDeviner){
        document.getElementById("textareaDC").innerHTML = "chiffre trop petit ";
    } else {
        let texteChiffre = aDeviner;
        document.getElementById("textareaDC").innerHTML = "Bravo !!!";
        sleep(3000).then(() => document.getElementById("textareaDC").innerHTML = "Vous avez deviné le chiffre : " + texteChiffre);
        aDeviner = generateChiffreRand();
        sleep(6000).then(() => document.getElementById("textareaDC").innerHTML = "Un nouveau nombre a été généré !");
        sleep(9000).then(() => document.getElementById("textareaDC").innerHTML = "");
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}