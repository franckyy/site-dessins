let aDeviner = generateChiffreRand();
let essais = 0;
let timers = [];

function generateChiffreRand() {
    return Math.floor(Math.random() * 1001); // entre 0 et 1000
}

// Affiche un message et applique la couleur correspondant à l'état
function afficher(texte, etat) {
    const zone = document.getElementById("textareaDC");
    zone.textContent = texte;
    zone.className = etat ? "etat-" + etat : "";
}

function majEssais() {
    document.getElementById("essaisDC").textContent = "Essais : " + essais;
}

function verifyChiffre() {
    const champ = document.getElementById("chiffreUser");
    const n = parseInt(champ.value, 10);

    // On annule les messages programmés après une victoire
    timers.forEach(clearTimeout);
    timers = [];

    // Saisie vide, texte ou hors limites
    if (isNaN(n) || n < 0 || n > 1000) {
        afficher("Entre un nombre entre 0 et 1000", "info");
        return;
    }

    essais++;
    majEssais();

    if (n > aDeviner) {
        afficher("Trop grand ! ▼", "grand");
    } else if (n < aDeviner) {
        afficher("Trop petit ! ▲", "petit");
    } else {
        const trouve = aDeviner;
        const nbEssais = essais;
        afficher("Bravo !!!", "gagne");
        aDeviner = generateChiffreRand();
        essais = 0;
        timers.push(setTimeout(() => {
            afficher("Trouvé : " + trouve + " en " + nbEssais + " essai" + (nbEssais > 1 ? "s" : ""), "gagne");
        }, 3000));
        timers.push(setTimeout(() => {
            afficher("Un nouveau nombre a été généré !", "info");
            majEssais();
        }, 6000));
        timers.push(setTimeout(() => { afficher("", ""); }, 9000));
    }

    champ.select();
}

// Touche Entrée = DEVINER
document.getElementById("chiffreUser").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        verifyChiffre();
    }
});
