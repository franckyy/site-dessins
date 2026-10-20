<?php
// Jeu « Mémory bilingue » : l'enfant retourne des cartes pour associer un mot anglais
// à sa traduction française. Les mots viennent de datas/vocabulaire.json
// (champs : en, fr, art, genre, theme). Le tirage et la partie sont gérés par memoryBilingue.js.
$racine = dirname(__DIR__);

$json  = @file_get_contents($racine . '/datas/vocabulaire.json');
$liste = $json !== false ? json_decode($json, true) : null;
$mots = [];
$themes = [];   // thème => nombre de mots
foreach (is_array($liste) ? $liste : [] as $it) {
    $en    = trim($it['en'] ?? '');
    $fr    = trim($it['fr'] ?? '');
    $theme = trim($it['theme'] ?? '');
    $art   = trim($it['art'] ?? '');     // article du mot français : le, la, l', les (vide = aucun)
    $genre = trim($it['genre'] ?? '');   // genre du mot français : m, f (vide = aucun)
    if ($en === '' || $fr === '' || $theme === '') {
        continue;   // entrée incomplète : on l'ignore
    }
    if (!in_array($genre, ['m', 'f'], true)) {
        $genre = '';
    }
    $mots[] = ['en' => $en, 'fr' => $fr, 'art' => $art, 'genre' => $genre, 'theme' => $theme];
    $themes[$theme] = ($themes[$theme] ?? 0) + 1;
}
$jeuOk = count($mots) >= 12;   // au minimum de quoi faire une partie de 6 paires

// Versions des fichiers : le navigateur recharge le CSS et le JS dès qu'on les modifie
$vCss = @filemtime(__DIR__ . '/memoryBilingue.css') ?: 1;
$vJs  = @filemtime(__DIR__ . '/memoryBilingue.js') ?: 1;
?>
<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mémory bilingue : jeu de vocabulaire anglais-français</title>
        <meta name="description" content="Retourne les cartes et retrouve les paires : chaque mot anglais avec sa traduction française.">
        <link rel="icon" href="/assets/Logo_site.gif">
        <link rel="stylesheet" href="/roboto/fonts.css">
        <link rel="stylesheet" href="./memoryBilingue.css?v=<?= $vCss ?>">
    </head>

    <body>
        <?php $largeurJeu = 900; require __DIR__ . '/../logoJeu.php'; ?>

        <main class="jeuMB">
            <h1 class="titreMB">MÉMORY BILINGUE</h1>

<?php if (!$jeuOk): ?>
            <p class="carteMB">Le jeu est momentanément indisponible.</p>
<?php else: ?>
            <!-- Écran 1 : réglages -->
            <section id="ecranChoix" class="carteMB">
                <p class="consigneMB">Retourne deux cartes à la fois : trouve un mot anglais et sa traduction française !</p>

                <fieldset class="reglageMB">
                    <legend>Quels thèmes ?</legend>
                    <div class="puces">
<?php foreach ($themes as $theme => $nb): ?>
                        <label class="puceMB"><input type="checkbox" name="theme" value="<?= htmlspecialchars((string) $theme) ?>" checked><span class="themeMB"><?= htmlspecialchars((string) $theme) ?> <small>(<?= (int) $nb ?>)</small></span></label>
<?php endforeach; ?>
                    </div>
                    <div class="raccourcis">
                        <button type="button" id="btnToutes" class="lienMB">Tous</button>
                        <button type="button" id="btnAucune" class="lienMB">Aucun</button>
                    </div>
                </fieldset>

                <fieldset class="reglageMB">
                    <legend>Combien de paires ?</legend>
                    <div class="puces">
<?php foreach ([6, 9, 12] as $n): ?>
                        <label class="puceMB"><input type="radio" name="paires" value="<?= $n ?>"<?= $n === 6 ? ' checked' : '' ?>><span><?= $n ?> paires</span></label>
<?php endforeach; ?>
                    </div>
                </fieldset>

                <label id="ligneVoix" class="voixMB" hidden>
                    <input type="checkbox" id="optVoix"> Écouter les mots quand je retourne une carte
                </label>

                <p id="erreurChoix" class="erreurChoix" role="alert"></p>
                <button type="button" id="btnCommencer" class="boutonMB">COMMENCER</button>
            </section>

            <!-- Écran 2 : la partie -->
            <section id="ecranJeu" hidden>
                <div class="infosMB">
                    <span id="infoPaires">Paires : 0 / 0</span>
                    <span id="infoCoups">Coups : 0</span>
                    <span id="infoTemps">Temps : 0:00</span>
                    <button type="button" id="btnChanger" class="lienMB">Changer les réglages</button>
                </div>

                <div id="grilleMB" class="grilleMB" data-total="16"></div>

                <div class="panneauMB">
                    <p id="messageMB" role="status" aria-live="polite">Retourne une première carte !</p>

                    <div id="finMB" class="finMB" hidden>
                        <ul id="recapMB" class="recapMB"></ul>
                        <div class="boutonsFin">
                            <button type="button" id="btnRejouer" class="boutonMB">Rejouer</button>
                            <button type="button" id="btnReglages" class="boutonMB secondaire">Changer les réglages</button>
                        </div>
                    </div>
                </div>
            </section>
<?php endif; ?>
        </main>

<?php if ($jeuOk): ?>
        <script type="application/json" id="donneesVocabulaire"><?= json_encode($mots, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
        <script src="./memoryBilingue.js?v=<?= $vJs ?>"></script>
<?php endif; ?>
    </body>

</html>
