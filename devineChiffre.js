function generateChiffreRand() {
    let randomNr = Math.random() * 1001;
    let chiffre = Math.floor(randomNr);
    return chiffre;
} 

function verifyChiffre(aDeviner) {
    let chiffreUser = document.getElementById("chiffreUser").value;
    if(chiffreUser > aDeviner){
        alert("chiffre trop grand");
    } else if(chiffreUser < aDeviner){
        alert("chiffre trop petit");
    } else {
        alert("bravo !!!");
    }
}