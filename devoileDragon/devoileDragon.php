<?php
// Jeu « Dévoile le dessin » : l'enfant répond à des multiplications pour effacer
// les tuiles qui cachent un coloriage. À la fin, il peut télécharger le PDF à colorier.
//
// Le dessin est tiré au hasard dans datas/images.json (script devoileDragon.js) : il utilise
// dessins/jpg/<nom>_coul.jpg (image cachée) et dessins/pdf/<nom>.pdf (bouton final, s'il existe).
// Les dessins déjà dévoilés pendant la session ne reviennent pas avant que tous soient passés.
$prefixe = '';   // '' = tous les coloriages ; 'Dragon_' = seulement les dragons, etc.
$racine  = dirname(__DIR__);

$json  = @file_get_contents($racine . '/datas/images.json');
$liste = $json !== false ? json_decode($json, true) : null;
$dessins = [];
foreach (is_array($liste) ? $liste : [] as $it) {
    $nom = $it['nom'] ?? '';
    if ($nom === '' || ($prefixe !== '' && strpos($nom, $prefixe) !== 0)) {
        continue;
    }
    $image = "/dessins/jpg/{$nom}_coul.jpg";
    $dim = @getimagesize($racine . $image);
    if ($dim === false) {
        continue;   // image introuvable : on ignore ce dessin
    }
    $pdf = "/dessins/pdf/{$nom}.pdf";
    $dessins[] = [
        'nom'   => $nom,
        'image' => $image,
        'ratio' => round($dim[0] / $dim[1], 4),   // largeur / hauteur
        'pdf'   => is_file($racine . $pdf) ? $pdf : null,
    ];
}
$jeuOk = count($dessins) > 0;
?>
<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dévoile le dessin : jeu de tables de multiplication</title>
        <meta name="description" content="Révise les tables de multiplication : chaque bonne réponse efface une tuile et dévoile un dessin à colorier.">
        <link rel="icon" href="/assets/Logo_site.gif">
        <link rel="stylesheet" href="/roboto/fonts.css">
        <link rel="stylesheet" href="./devoileDragon.css">
    </head>

    <body>
        <?php $largeurJeu = 900; require __DIR__ . '/../logoJeu.php'; ?>

        <main class="jeuDD">
            <h1 class="titreDD">DÉVOILE LE DESSIN</h1>

<?php if (!$jeuOk): ?>
            <p class="carteDD">Le jeu est momentanément indisponible.</p>
<?php else: ?>
            <!-- Écran 1 : choix des tables -->
            <section id="ecranChoix" class="carteDD">
                <p class="consigneDD">Réponds juste aux multiplications pour effacer les tuiles et découvrir le dessin caché !</p>

                <fieldset class="tablesDD">
                    <legend>Quelles tables veux-tu réviser ?</legend>
                    <div class="puces">
<?php for ($t = 2; $t <= 10; $t++): ?>
                        <label class="puce"><input type="checkbox" name="table" value="<?= $t ?>"<?= $t <= 5 ? ' checked' : '' ?>><span>Table de <?= $t ?></span></label>
<?php endfor; ?>
                    </div>
                    <div class="raccourcis">
                        <button type="button" id="btnToutes" class="lienDD">Toutes</button>
                        <button type="button" id="btnAucune" class="lienDD">Aucune</button>
                    </div>
                </fieldset>

                <p id="erreurChoix" class="erreurChoix" role="alert"></p>
                <button type="button" id="btnCommencer" class="boutonDD">COMMENCER</button>
            </section>

            <!-- Écran 2 : le jeu -->
            <section id="ecranJeu" hidden>
                <div class="infosDD">
                    <span id="infoProgres">0 / 24 tuiles</span>
                    <span id="infoErreurs">Erreurs : 0</span>
                    <button type="button" id="btnChanger" class="lienDD">Changer de tables</button>
                </div>

                <div id="plateau" class="plateau">
                    <div id="tuiles" class="tuiles"></div>
                </div>

                <div class="panneauDD">
                    <p id="messageDD" role="status" aria-live="polite">Choisis une tuile pour commencer !</p>

                    <form id="formDD" class="formDD" hidden autocomplete="off">
                        <label id="questionDD" class="questionDD" for="reponseDD"></label>
                        <input id="reponseDD" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" aria-describedby="messageDD">
                        <button type="submit" class="boutonDD">OK</button>
                    </form>

                    <div id="finDD" class="finDD" hidden>
                        <a id="lienPdf" class="boutonDD" href="#" download hidden>Télécharger le dessin à colorier</a>
                        <button type="button" id="btnRejouer" class="boutonDD secondaire">Rejouer</button>
                    </div>
                </div>
            </section>
<?php endif; ?>
        </main>

<?php if ($jeuOk): ?>
        <script type="application/json" id="donneesDessins"><?= json_encode($dessins, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES) ?></script>
        <script src="./devoileDragon.js"></script>
<?php endif; ?>
    </body>

</html>
