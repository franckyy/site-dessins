let aDeviner = generateChiffreRand();

function generateChiffreRand() {
    return Math.floor(Math.random() * 1001); // entre 0 et 1000
}

function verifyChiffre() {
    const zone = document.getElementById("textareaDC");
    const n = parseInt(document.getElementById("chiffreUser").value, 10);

    // Saisie vide, texte ou hors limites
    if (isNaN(n) || n < 0 || n > 1000) {
        zone.textContent = "Entre un nombre entre 0 et 1000";
        return;
    }

    if (n > aDeviner) {
        zone.textContent = "chiffre trop grand";
    } else if (n < aDeviner) {
        zone.textContent = "chiffre trop petit";
    } else {
        const trouve = aDeviner;
        zone.textContent = "Bravo !!!";
        aDeviner = generateChiffreRand();
        setTimeout(() => { zone.textContent = "Vous avez deviné le chiffre : " + trouve; }, 3000);
        setTimeout(() => { zone.textContent = "Un nouveau nombre a été généré !"; }, 6000);
        setTimeout(() => { zone.textContent = ""; }, 9000);
    }
}
