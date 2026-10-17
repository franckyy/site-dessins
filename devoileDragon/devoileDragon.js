// ===== Dévoile le dessin : jeu de tables de multiplication =====
// 24 tuiles cachent un coloriage tiré au hasard. Chaque tuile porte une multiplication.
// Bonne réponse : la tuile s'efface. Mauvaise réponse : la bonne réponse est affichée,
// la tuile se verrouille, puis revient après quelques bonnes réponses ailleurs.
(function () {
    'use strict';

    // ----- Réglages -----
    const COLONNES = 6;
    const LIGNES = 4;
    const TOTAL = COLONNES * LIGNES;
    const FACTEUR_MIN = 2;          // on multiplie les tables par 2, 3 ... jusqu'à FACTEUR_MAX
    const FACTEUR_MAX = 10;
    const CLE_DECOUVERTS = 'devoile_decouverts';   // sessionStorage : dessins déjà dévoilés
    const COUPS_VERROU = 2;         // bonnes réponses ailleurs avant qu'une tuile ratée revienne
    const FELICITATIONS = ['Bravo !', 'Super !', 'Exact !', 'Bien joué !', 'Excellent !', 'Parfait !'];

    // ----- Éléments de la page -----
    const $ = (id) => document.getElementById(id);
    const ecranChoix = $('ecranChoix');
    const ecranJeu = $('ecranJeu');
    const plateau = $('plateau');
    const grille = $('tuiles');
    const message = $('messageDD');
    const formulaire = $('formDD');
    const question = $('questionDD');
    const champ = $('reponseDD');
    const zoneFin = $('finDD');
    const infoProgres = $('infoProgres');
    const infoErreurs = $('infoErreurs');
    const erreurChoix = $('erreurChoix');
    const lienPdf = $('lienPdf');
    const DESSINS = JSON.parse($('donneesDessins').textContent);   // {nom, image, ratio, pdf}

    // ----- État de la partie -----
    // chaque tuile : {a, b, etat: 'cachee' | 'verrou' | 'revelee', verrou, bouton, libelle}
    let tuiles = [];
    let courante = null;            // index de la tuile en cours de réponse
    let erreurs = 0;
    let revelees = 0;
    let dessin = null;              // le dessin caché de la partie en cours

    function melanger(tab) {
        for (let i = tab.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tab[i], tab[j]] = [tab[j], tab[i]];
        }
        return tab;
    }

    // Choisit TOTAL multiplications parmi les tables demandées.
    // 3 × 7 et 7 × 3 comptent pour la même question. Si les tables choisies n'offrent pas assez
    // de questions différentes, on refait des tours de la liste mélangée.
    function construireQuestions(tables) {
        const vues = new Set();
        const reserve = [];
        tables.forEach((t) => {
            for (let b = FACTEUR_MIN; b <= FACTEUR_MAX; b++) {
                const cle = Math.min(t, b) + 'x' + Math.max(t, b);
                if (!vues.has(cle)) {
                    vues.add(cle);
                    reserve.push([t, b]);
                }
            }
        });
        const questions = [];
        while (questions.length < TOTAL) {
            melanger(reserve.slice()).forEach((q) => questions.push(q));
        }
        return questions.slice(0, TOTAL).map(([a, b]) => (Math.random() < 0.5 ? [a, b] : [b, a]));
    }

    // ----- Dessins déjà découverts pendant la session -----
    // Gardés dans sessionStorage : ils survivent au rechargement et disparaissent à la fermeture de l'onglet.
    function lireDecouverts() {
        try {
            const liste = JSON.parse(sessionStorage.getItem(CLE_DECOUVERTS));
            return Array.isArray(liste) ? liste.filter((n) => DESSINS.some((d) => d.nom === n)) : [];
        } catch (e) {
            return [];
        }
    }

    function ecrireDecouverts(liste) {
        try {
            sessionStorage.setItem(CLE_DECOUVERTS, JSON.stringify(liste));
        } catch (e) { /* stockage indisponible : on continue sans */ }
    }

    // Tire au hasard parmi les dessins pas encore découverts. Quand tous l'ont été, on repart
    // avec tous les dessins (sauf le tout dernier, pour ne pas le revoir aussitôt).
    function choisirDessin() {
        const faits = lireDecouverts();
        let restants = DESSINS.filter((d) => faits.indexOf(d.nom) === -1);
        if (restants.length === 0) {
            const dernier = faits[faits.length - 1];
            ecrireDecouverts([]);
            restants = DESSINS.filter((d) => d.nom !== dernier);
            if (restants.length === 0) {
                restants = DESSINS.slice();    // un seul dessin disponible
            }
        }
        return restants[Math.floor(Math.random() * restants.length)];
    }

    function noterDecouvert(d) {
        const faits = lireDecouverts();
        if (faits.indexOf(d.nom) === -1) {
            faits.push(d.nom);
            ecrireDecouverts(faits);
        }
        return faits.length;
    }

    // ----- Affichage -----
    function texteQuestion(t) {
        return t.a + ' × ' + t.b;
    }

    function majTuile(t, i) {
        const b = t.bouton;
        b.classList.toggle('revelee', t.etat === 'revelee');
        b.classList.toggle('verrou', t.etat === 'verrou');
        b.classList.toggle('choisie', i === courante);
        b.disabled = t.etat !== 'cachee';
        t.libelle.textContent = t.etat === 'verrou' ? '🔒' : texteQuestion(t);
        if (t.etat === 'revelee') {
            b.setAttribute('aria-label', 'tuile dévoilée');
        } else if (t.etat === 'verrou') {
            b.setAttribute('aria-label', 'tuile verrouillée, elle reviendra bientôt');
        } else {
            b.setAttribute('aria-label', t.a + ' fois ' + t.b);
        }
    }

    function majInfos() {
        infoProgres.textContent = revelees + ' / ' + TOTAL + ' tuiles';
        infoErreurs.textContent = 'Erreurs : ' + erreurs;
    }

    function dire(texte, type) {
        message.textContent = texte;
        message.className = type || '';
    }

    function creerTuiles() {
        grille.innerHTML = '';
        grille.style.setProperty('--cols', COLONNES);
        grille.style.setProperty('--rows', LIGNES);
        tuiles.forEach((t, i) => {
            const col = i % COLONNES;
            const lig = Math.floor(i / COLONNES);
            const bouton = document.createElement('button');
            bouton.type = 'button';
            bouton.className = 'tuile ' + ((col + lig) % 2 === 0 ? 'teinteA' : 'teinteB');
            // chaque tuile montre sa part du dessin lorsque le couvercle disparaît
            bouton.style.setProperty('--px', (COLONNES > 1 ? col / (COLONNES - 1) * 100 : 0) + '%');
            bouton.style.setProperty('--py', (LIGNES > 1 ? lig / (LIGNES - 1) * 100 : 0) + '%');
            const couvercle = document.createElement('span');
            couvercle.className = 'couvercle';
            const libelle = document.createElement('span');
            libelle.className = 'libelle';
            couvercle.appendChild(libelle);
            bouton.appendChild(couvercle);
            bouton.addEventListener('click', () => choisir(i));
            t.bouton = bouton;
            t.libelle = libelle;
            grille.appendChild(bouton);
            majTuile(t, i);
        });
    }

    // ----- Déroulement -----
    function demarrer() {
        const tables = Array.from(document.querySelectorAll('input[name="table"]:checked'))
            .map((c) => parseInt(c.value, 10));
        if (tables.length === 0) {
            erreurChoix.textContent = 'Choisis au moins une table.';
            return;
        }
        erreurChoix.textContent = '';
        dessin = choisirDessin();
        plateau.style.setProperty('--image', 'url("' + encodeURI(dessin.image) + '")');
        plateau.style.setProperty('--ratio', dessin.ratio);
        if (dessin.pdf) {
            lienPdf.href = dessin.pdf;
            lienPdf.hidden = false;
        } else {
            lienPdf.hidden = true;
        }
        tuiles = construireQuestions(tables).map(([a, b]) => ({ a, b, etat: 'cachee', verrou: 0 }));
        courante = null;
        erreurs = 0;
        revelees = 0;
        plateau.classList.remove('complet');
        zoneFin.hidden = true;
        formulaire.hidden = true;
        dire('Choisis une tuile pour commencer !');
        creerTuiles();
        majInfos();
        ecranChoix.hidden = true;
        ecranJeu.hidden = false;
    }

    function retourChoix() {
        ecranJeu.hidden = true;
        ecranChoix.hidden = false;
        $('btnCommencer').focus();
    }

    function choisir(i) {
        const t = tuiles[i];
        if (!t || t.etat !== 'cachee') {
            return;
        }
        const ancienne = courante;
        courante = i;
        if (ancienne !== null && ancienne !== i) {
            majTuile(tuiles[ancienne], ancienne);
        }
        majTuile(t, i);
        question.textContent = texteQuestion(t) + ' =';
        champ.value = '';
        formulaire.hidden = false;
        dire('Tape la réponse, puis appuie sur Entrée.');
        champ.focus();
    }

    function abandonnerChoix() {
        if (courante === null) {
            return;
        }
        const ancienne = courante;
        courante = null;
        majTuile(tuiles[ancienne], ancienne);
        formulaire.hidden = true;
        dire('Choisis une tuile.');
    }

    // une tuile verrouillée revient après COUPS_VERROU bonnes réponses ailleurs
    function faireAvancerVerrous() {
        tuiles.forEach((t, i) => {
            if (t.etat === 'verrou') {
                t.verrou--;
                if (t.verrou <= 0) {
                    debloquer(t, i);
                }
            }
        });
    }

    function debloquer(t, i) {
        t.etat = 'cachee';
        t.verrou = 0;
        majTuile(t, i);
        t.bouton.classList.add('revient');
        setTimeout(() => t.bouton.classList.remove('revient'), 1800);
    }

    // s'il ne reste que des tuiles verrouillées, on les libère toutes : le jeu ne reste jamais bloqué
    function eviterBlocage() {
        if (revelees < TOTAL && !tuiles.some((t) => t.etat === 'cachee')) {
            tuiles.forEach((t, i) => {
                if (t.etat === 'verrou') {
                    debloquer(t, i);
                }
            });
        }
    }

    function bonneReponse(t, i) {
        t.etat = 'revelee';
        revelees++;
        courante = null;
        majTuile(t, i);
        formulaire.hidden = true;
        faireAvancerVerrous();
        eviterBlocage();
        majInfos();
        if (revelees === TOTAL) {
            fin();
        } else {
            dire(FELICITATIONS[Math.floor(Math.random() * FELICITATIONS.length)] + ' Choisis une autre tuile.', 'ok');
        }
    }

    function mauvaiseReponse(t, i) {
        erreurs++;
        t.etat = 'verrou';
        t.verrou = COUPS_VERROU;
        courante = null;
        majTuile(t, i);
        formulaire.hidden = true;
        eviterBlocage();
        const suite = t.etat === 'cachee' ? ' Tu peux la retenter tout de suite !' : ' Cette tuile reviendra bientôt.';
        dire('Pas tout à fait : ' + texteQuestion(t) + ' = ' + (t.a * t.b) + '.' + suite, 'ko');
        majInfos();
    }

    function fin() {
        plateau.classList.add('complet');
        formulaire.hidden = true;
        zoneFin.hidden = false;
        const nb = noterDecouvert(dessin);
        let texte = erreurs === 0
            ? 'Bravo ! Tu as dévoilé tout le dessin sans aucune erreur !'
            : 'Bravo ! Tu as dévoilé tout le dessin (' + erreurs + (erreurs > 1 ? ' erreurs' : ' erreur') + ').';
        if (DESSINS.length > 1) {
            texte += nb >= DESSINS.length
                ? ' Tu as découvert tous les dessins : on recommence avec tous !'
                : ' Dessins découverts : ' + nb + ' sur ' + DESSINS.length + '.';
        }
        dire(texte, 'ok');
    }

    // ----- Évènements -----
    formulaire.addEventListener('submit', (e) => {
        e.preventDefault();
        if (courante === null) {
            return;
        }
        const saisie = champ.value.trim();
        if (!/^\d+$/.test(saisie)) {
            dire('Tape un nombre.', 'ko');
            champ.focus();
            return;
        }
        const t = tuiles[courante];
        if (parseInt(saisie, 10) === t.a * t.b) {
            bonneReponse(t, courante);
        } else {
            mauvaiseReponse(t, courante);
        }
    });

    champ.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            abandonnerChoix();
        }
    });

    $('btnCommencer').addEventListener('click', demarrer);
    $('btnChanger').addEventListener('click', retourChoix);
    $('btnRejouer').addEventListener('click', retourChoix);
    $('btnToutes').addEventListener('click', () => {
        document.querySelectorAll('input[name="table"]').forEach((c) => { c.checked = true; });
    });
    $('btnAucune').addEventListener('click', () => {
        document.querySelectorAll('input[name="table"]').forEach((c) => { c.checked = false; });
    });
})();
