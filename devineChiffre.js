let chiffre = null;
let aDeviner = generateChiffreRand();

function generateChiffreRand() {
    let randomNr = Math.random() * 1001;
    chiffre = Math.floor(randomNr);
    return chiffre;
} 

function verifyChiffre(aDeviner) {
    let chiffreUser = document.getElementById("chiffreUser").value;
    if(chiffreUser > aDeviner){
        document.getElementById("textareaDC").innerHTML = "chiffre trop grand";
    } else if(chiffreUser < aDeviner){
        document.getElementById("textareaDC").innerHTML = "chiffre trop petit";
    } else {
        document.getElementById("textareaDC").innerHTML = "Bravo !!!";
        sleep(2000).then(() => document.getElementById("textareaDC").innerHTML = "Vous avez deviné le chiffre : " + aDeviner);
        sleep(200).then(() => aDeviner = generateChiffreRand());
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}