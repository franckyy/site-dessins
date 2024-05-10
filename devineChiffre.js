function generateChiffreRand() {
    let randomNr = Math.random() * 1001;
    let chiffre = Math.floor(randomNr);
    return chiffre;
} 

function verifyChiffre(aDeviner) {
    let chiffreUser = document.getElementById("chiffreUser").value;
    if(chiffreUser > aDeviner){
        document.getElementById("textareaDC").innerHTML = "chiffre trop grand";
    } else if(chiffreUser < aDeviner){
        document.getElementById("textareaDC").innerHTML = "chiffre trop petit";
    } else {
        document.getElementById("textareaDC").innerHTML = "Bravo, vous avez deviné le chiffre : " + aDeviner;
    }
}