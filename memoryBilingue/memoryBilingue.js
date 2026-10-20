// ===== Mémory bilingue : associer un mot anglais à sa traduction française =====
// Chaque paire = une carte anglaise + une carte française. On retourne deux cartes :
// si elles forment une paire elles restent visibles, sinon elles se recachent.
// Les mots déjà joués pendant la session ne reviennent pas avant que tous soient passés
// (mémorisés dans sessionStorage, comme pour « Dévoile le dessin »).
(function () {
    'use strict';

    // ----- Réglages -----
    const DELAI_RETOUR = 1100;               // durée d'affichage de deux cartes différentes (ms)
    const CLE_VUS = 'memory_bilingue_vus';   // sessionStorage : mots déjà joués
    // Genre du mot français, affiché dans un coin de la carte, dans la langue de la carte
    const GENRES = {
        m: { fr: 'masculin', en: 'masculine' },
        f: { fr: 'féminin', en: 'feminine' }
    };
    const FELICITATIONS = ['Bravo !', 'Super !', 'Exact !', 'Bien joué !', 'Excellent !', 'Parfait !'];

    // ----- Éléments de la page -----
    const $ = (id) => document.getElementById(id);
    const ecranChoix = $('ecranChoix');
    const ecranJeu = $('ecranJeu');
    const grille = $('grilleMB');
    const message = $('messageMB');
    const zoneFin = $('finMB');
    const recap = $('recapMB');
    const infoPaires = $('infoPaires');
    const infoCoups = $('infoCoups');
    const infoTemps = $('infoTemps');
    const erreurChoix = $('erreurChoix');
    const ligneVoix = $('ligneVoix');
    const optVoix = $('optVoix');
    const MOTS = JSON.parse($('donneesVocabulaire').textContent);   // {en, fr, theme}

    // ----- État de la partie -----
    let cartes = [];            // {id, langue, texte, bouton, etat: 'cachee' | 'visible' | 'trouvee'}
    let motsPartie = [];        // les mots de la partie en cours
    let premiere = null;        // première carte retournée du coup en cours
    let verrou = false;         // vrai pendant que deux cartes différentes restent affichées
    let minuteurRetour = null;
    let chrono = null;
    let debut = 0;
    let coups = 0;
    let trouvees = 0;
    let reglage = null;         // {themes, paires} pour « Rejouer »

    // La lecture à voix haute n'existe pas partout : on cache l'option si le navigateur ne sait pas
    const voixOk = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    ligneVoix.hidden = !voixOk;

    function melanger(tab) {
        for (let i = tab.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tab[i], tab[j]] = [tab[j], tab[i]];
        }
        return tab;
    }

    // ----- Mots déjà joués dans la session -----
    function lireVus() {
        try {
            return new Set(JSON.parse(sessionStorage.getItem(CLE_VUS) || '[]'));
        } catch (e) {
            return new Set();
        }
    }
    function ecrireVus(vus) {
        try {
            sessionStorage.setItem(CLE_VUS, JSON.stringify(Array.from(vus)));
        } catch (e) { /* stockage indisponible : on joue sans mémoire */ }
    }

    // Tire `n` mots parmi les thèmes choisis, de préférence des mots pas encore joués.
    // Si le réservoir est épuisé, on recommence avec tous les mots de ces thèmes.
    function choisirMots(themes, n) {
        const reservoir = MOTS.filter((m) => themes.indexOf(m.theme) !== -1);
        if (reservoir.length < n) {
            return null;
        }
        const vus = lireVus();
        let dispo = reservoir.filter((m) => !vus.has(m.en));
        if (dispo.length < n) {
            reservoir.forEach((m) => vus.delete(m.en));
            dispo = reservoir.slice();
        }
        const choix = melanger(dispo.slice()).slice(0, n);
        choix.forEach((m) => vus.add(m.en));
        ecrireVus(vus);
        return choix;
    }

    // ----- Lecture à voix haute (facultative) -----
    // Le navigateur prend sinon la voix par défaut de l'appareil (souvent robotique sur
    // ordinateur, eSpeak sous Linux) : on choisit la meilleure voix disponible pour la langue.
    const LANGUES_VOIX = {
        fr: ['fr-fr', 'fr-ca', 'fr-be', 'fr-ch', 'fr'],
        en: ['en-gb', 'en-us', 'en-au', 'en']
    };
    const VOIX_BONNES = /natural|neural|online|google|premium|enhanced|siri|hq/i;
    const VOIX_MAUVAISES = /espeak|festival|flite|mbrola/i;
    let voixAppareil = [];

    function chargerVoix() {
        try { voixAppareil = window.speechSynthesis.getVoices(); } catch (e) { voixAppareil = []; }
    }
    if (voixOk) {
        chargerVoix();
        // la liste des voix arrive souvent après le chargement de la page
        window.speechSynthesis.addEventListener('voiceschanged', chargerVoix);
    }

    function meilleureVoix(langue) {
        const prefs = LANGUES_VOIX[langue];
        let meilleure = null;
        let meilleureNote = -1;
        voixAppareil.forEach(function (v) {
            const rang = prefs.indexOf(v.lang.toLowerCase().replace('_', '-'));
            if (rang === -1) {
                return; // autre langue : écartée
            }
            let note = 100 - rang * 10;
            if (VOIX_BONNES.test(v.name)) { note += 50; }
            if (VOIX_MAUVAISES.test(v.name)) { note -= 80; }
            if (!v.localService) { note += 5; }
            if (note > meilleureNote) {
                meilleureNote = note;
                meilleure = v;
            }
        });
        return meilleure;
    }

    function parler(texte, langue) {
        if (!voixOk || !optVoix.checked) {
            return;
        }
        try {
            window.speechSynthesis.cancel();
            const lecture = new SpeechSynthesisUtterance(texte);
            lecture.lang = langue === 'en' ? 'en-GB' : 'fr-FR';
            lecture.rate = 0.9;
            const voix = meilleureVoix(langue === 'en' ? 'en' : 'fr');
            if (voix) {
                lecture.voice = voix;
            }
            window.speechSynthesis.speak(lecture);
        } catch (e) { /* pas de voix disponible : tant pis */ }
    }

    // ----- Chronomètre -----
    function formaterTemps(secondes) {
        const m = Math.floor(secondes / 60);
        const s = secondes % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }
    function demarrerChrono() {
        if (chrono !== null) {
            return;
        }
        debut = Date.now();
        chrono = setInterval(() => {
            infoTemps.textContent = 'Temps : ' + formaterTemps(Math.floor((Date.now() - debut) / 1000));
        }, 500);
    }
    function arreterChrono() {
        if (chrono !== null) {
            clearInterval(chrono);
            chrono = null;
        }
    }

    // ----- Affichage -----
    function dire(texte, etat) {
        message.textContent = texte;
        message.className = etat || '';
    }
    function majInfos() {
        infoPaires.textContent = 'Paires : ' + trouvees + ' / ' + motsPartie.length;
        infoCoups.textContent = 'Coups : ' + coups;
    }
    // Mot français avec son article : « la chemise », « l'ami » (pas d'espace après l'apostrophe)
    function frComplet(m) {
        if (!m.art) {
            return m.fr;
        }
        return m.art + (m.art.slice(-1) === "'" ? '' : ' ') + m.fr;
    }
    // Mot anglais avec « the » quand le mot français a un article (« the shirt » = « la chemise »).
    // Couleurs, nombres et adjectifs n'ont pas d'article en français : ils restent seuls en anglais.
    function enComplet(m) {
        return m.art ? 'the ' + m.en : m.en;
    }
    function nomLangue(langue) {
        return langue === 'en' ? 'anglais' : 'français';
    }

    function montrer(carte) {
        carte.etat = 'visible';
        carte.bouton.classList.add('retournee');
        carte.bouton.setAttribute('aria-label', carte.texte + ' (' + nomLangue(carte.langue) +
            (carte.bouton.dataset.genre ? ', ' + carte.bouton.dataset.genre : '') + ')');
        parler(carte.texte, carte.langue);
    }
    function cacher(carte) {
        carte.etat = 'cachee';
        carte.bouton.classList.remove('retournee', 'erreur');
        carte.bouton.setAttribute('aria-label', 'Carte cachée');
    }

    function creerCarte(id, langue, texte, genre) {
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'carte langue-' + langue;
        bouton.setAttribute('aria-label', 'Carte cachée');

        const dos = document.createElement('span');
        dos.className = 'dos';
        dos.setAttribute('aria-hidden', 'true');
        dos.textContent = '?';

        const face = document.createElement('span');
        face.className = 'face';
        const etiquette = document.createElement('span');
        etiquette.className = 'etiquette';
        etiquette.textContent = langue === 'en' ? 'EN' : 'FR';
        const mot = document.createElement('span');
        mot.className = 'mot';
        mot.textContent = texte;
        face.appendChild(etiquette);
        if (genre && GENRES[genre]) {
            // le genre est écrit dans la langue de la carte, avec une couleur par genre
            const badge = document.createElement('span');
            badge.className = 'genre genre-' + genre;
            badge.textContent = GENRES[genre][langue];
            face.appendChild(badge);
            bouton.dataset.genre = GENRES[genre][langue];
        }
        face.appendChild(mot);

        bouton.appendChild(dos);
        bouton.appendChild(face);

        const carte = { id: id, langue: langue, texte: texte, bouton: bouton, etat: 'cachee' };
        bouton.addEventListener('click', () => clicCarte(carte));
        return carte;
    }

    // ----- Déroulement d'un coup -----
    function clicCarte(carte) {
        if (verrou || carte.etat !== 'cachee') {
            return;
        }
        demarrerChrono();
        montrer(carte);

        if (premiere === null) {
            premiere = carte;
            dire('Maintenant, cherche sa traduction !');
            return;
        }

        const a = premiere;
        premiere = null;
        coups++;

        if (a.id === carte.id) {
            a.etat = carte.etat = 'trouvee';
            a.bouton.classList.add('trouvee');
            carte.bouton.classList.add('trouvee');
            trouvees++;
            const mot = motsPartie[carte.id];
            const felicitation = FELICITATIONS[Math.floor(Math.random() * FELICITATIONS.length)];
            majInfos();
            if (trouvees === motsPartie.length) {
                finPartie();
            } else {
                dire(felicitation + ' ' + enComplet(mot) + ' = ' + frComplet(mot), 'ok');
            }
        } else {
            verrou = true;
            a.bouton.classList.add('erreur');
            carte.bouton.classList.add('erreur');
            majInfos();
            dire('Ce n\u2019est pas la bonne paire, essaie encore !', 'ko');
            minuteurRetour = setTimeout(() => {
                cacher(a);
                cacher(carte);
                verrou = false;
                minuteurRetour = null;
                dire('Retourne une carte !');
            }, DELAI_RETOUR);
        }
    }

    function finPartie() {
        arreterChrono();
        const secondes = Math.floor((Date.now() - debut) / 1000);
        grille.classList.add('complet');
        dire('Bravo ! ' + motsPartie.length + ' paires trouvées en ' + coups + ' coups et ' +
             formaterTemps(secondes) + ' !', 'ok');

        recap.textContent = '';
        motsPartie.forEach((m) => {
            const li = document.createElement('li');
            const en = document.createElement('span');
            en.className = 'recapEn';
            en.textContent = enComplet(m);
            const fr = document.createElement('span');
            fr.className = 'recapFr';
            fr.textContent = frComplet(m);
            li.appendChild(en);
            li.appendChild(document.createTextNode(' = '));
            li.appendChild(fr);
            recap.appendChild(li);
        });
        zoneFin.hidden = false;
    }

    // ----- Début et sortie de partie -----
    function remettreAZero() {
        arreterChrono();
        if (minuteurRetour !== null) {
            clearTimeout(minuteurRetour);
            minuteurRetour = null;
        }
        if (voixOk) {
            try { window.speechSynthesis.cancel(); } catch (e) { /* rien */ }
        }
        verrou = false;
        premiere = null;
        coups = 0;
        trouvees = 0;
        grille.textContent = '';
        grille.classList.remove('complet');
        zoneFin.hidden = true;
        infoTemps.textContent = 'Temps : 0:00';
    }

    function lancerPartie(themes, paires) {
        const choix = choisirMots(themes, paires);
        if (choix === null) {
            erreurChoix.textContent = 'Il n\u2019y a pas assez de mots : choisis plus de thèmes ou moins de paires.';
            return false;
        }
        erreurChoix.textContent = '';
        remettreAZero();
        reglage = { themes: themes, paires: paires };
        motsPartie = choix;

        cartes = [];
        choix.forEach((m, i) => {
            cartes.push(creerCarte(i, 'en', enComplet(m), m.genre));
            cartes.push(creerCarte(i, 'fr', frComplet(m), m.genre));
        });
        melanger(cartes);
        grille.dataset.total = String(cartes.length);
        cartes.forEach((c) => grille.appendChild(c.bouton));

        majInfos();
        dire('Retourne une première carte !');
        ecranChoix.hidden = true;
        ecranJeu.hidden = false;
        return true;
    }

    function revenirAuxReglages() {
        remettreAZero();
        ecranJeu.hidden = true;
        ecranChoix.hidden = false;
    }

    // ----- Écran de réglages -----
    function casesThemes() {
        return Array.prototype.slice.call(document.querySelectorAll('input[name="theme"]'));
    }
    $('btnToutes').addEventListener('click', () => casesThemes().forEach((c) => { c.checked = true; }));
    $('btnAucune').addEventListener('click', () => casesThemes().forEach((c) => { c.checked = false; }));

    $('btnCommencer').addEventListener('click', () => {
        const themes = casesThemes().filter((c) => c.checked).map((c) => c.value);
        if (themes.length === 0) {
            erreurChoix.textContent = 'Choisis au moins un thème.';
            return;
        }
        const choisie = document.querySelector('input[name="paires"]:checked');
        lancerPartie(themes, choisie ? parseInt(choisie.value, 10) : 6);
    });
    $('btnRejouer').addEventListener('click', () => {
        if (reglage && !lancerPartie(reglage.themes, reglage.paires)) {
            revenirAuxReglages();
        }
    });
    $('btnChanger').addEventListener('click', revenirAuxReglages);
    $('btnReglages').addEventListener('click', revenirAuxReglages);
})();
