<?php
$cfg = require 'config_site.php';
$ou  = fn(string $v): string => $v !== '' ? htmlspecialchars($v) : '<span class="a-completer">[à compléter]</span>';

$title = 'Mentions légales';
$metaDescription = 'Mentions légales du site ' . $cfg['nom_site'] . ' : éditeur, hébergeur et propriété intellectuelle.';
require 'head.php';
?>
<body>

<?php require 'header.php'; ?>

<main class="page-legale">
    <h1>Mentions légales</h1>

    <h2>Éditeur du site</h2>
    <?php if ($cfg['editeur_nom'] !== ''): ?>
        <p>Le site <?= htmlspecialchars($cfg['nom_site']) ?> est édité par <?= htmlspecialchars($cfg['editeur_nom']) ?><?= $cfg['editeur_adresse'] !== '' ? ', ' . htmlspecialchars($cfg['editeur_adresse']) : '' ?>.
        L'éditeur est également le directeur de la publication.</p>
    <?php else: ?>
        <p>Le site <?= htmlspecialchars($cfg['nom_site']) ?> est édité à titre non professionnel par un particulier qui a choisi de rester anonyme, conformément à la loi. L'hébergeur du site dispose de son identité.</p>
    <?php endif; ?>
    <p>Contact :
        <?php if ($cfg['contact_email'] !== ''): ?>
            <a href="mailto:<?= htmlspecialchars($cfg['contact_email']) ?>"><?= htmlspecialchars($cfg['contact_email']) ?></a>
        <?php else: ?>
            <span class="a-completer">[à compléter]</span>
        <?php endif; ?>
    </p>

    <h2>Hébergeur</h2>
    <p>Le site est hébergé par <?= $ou($cfg['hebergeur_nom']) ?>,
       <?= $ou($cfg['hebergeur_adresse']) ?>,
       téléphone : <?= $ou($cfg['hebergeur_tel']) ?>.</p>

    <h2>Propriété intellectuelle et usage des dessins</h2>
    <?php /* À adapter selon tes choix : usage autorisé des PDF, droits sur les dessins. */ ?>
    <p>Les dessins, labyrinthes, jeux et textes de ce site sont protégés par le droit d'auteur.
       Les fichiers à colorier peuvent être téléchargés et imprimés pour un usage personnel, familial ou pédagogique
       (à la maison, en classe), sans but commercial. Toute autre reproduction ou diffusion nécessite l'autorisation de l'éditeur.</p>

    <h2>Liens externes</h2>
    <p>Le lien « Faire un don » mène vers le service PayPal, qui est indépendant de ce site : aucune donnée de paiement n'est traitée ici.
       L'éditeur n'est pas responsable du contenu des sites vers lesquels pointent d'éventuels liens externes.</p>

    <h2>Données personnelles</h2>
    <p>Le traitement des données des visiteurs est décrit dans la <a href="confidentialite.php">politique de confidentialité</a>.</p>

    <h2>Droit applicable</h2>
    <p>Le site et ses mentions légales sont soumis au droit français.</p>

    <p class="maj">Dernière mise à jour : <?= htmlspecialchars($cfg['derniere_maj']) ?></p>
</main>

<?php require 'footer.php'; ?>
