<?php
$cfg = require 'config_site.php';

$title = 'Politique de confidentialité';
$metaDescription = 'Politique de confidentialité du site ' . $cfg['nom_site'] . ' : données collectées, cookies et droits des visiteurs.';
require 'head.php';

$contact = $cfg['contact_email'] !== ''
    ? '<a href="mailto:' . htmlspecialchars($cfg['contact_email']) . '">' . htmlspecialchars($cfg['contact_email']) . '</a>'
    : '<span class="a-completer">[adresse de contact à compléter]</span>';
?>
<body>

<?php require 'header.php'; ?>

<main class="page-legale">
    <h1>Politique de confidentialité</h1>

    <h2>Qui est responsable ?</h2>
    <p>Le responsable du site <?= htmlspecialchars($cfg['nom_site']) ?> est son éditeur, présenté dans les
       <a href="mentions-legales.php">mentions légales</a>. Pour toute question sur vos données : <?= $contact ?>.</p>

    <h2>Quelles données sont collectées ?</h2>
    <p>Le site ne propose ni compte, ni formulaire, ni commentaire : l'éditeur ne vous demande aucune donnée personnelle.</p>
    <p>Comme tout serveur web, l'hébergeur enregistre toutefois des journaux techniques de connexion
       (adresse IP, date et heure, pages ou fichiers demandés, type de navigateur). Ils servent à assurer le fonctionnement
       et la sécurité du site ; leur durée de conservation est fixée par l'hébergeur.</p>

    <h2>Cookies et traceurs</h2>
    <?php if (empty($cfg['publicite'])): ?>
        <p>Ce site ne dépose aucun cookie ni traceur non indispensable : pas de publicité, pas de mesure d'audience, pas de réseau social intégré.
           Les polices de caractères sont hébergées sur le site lui-même, sans appel à un service extérieur.</p>
    <?php else: ?>
        <p>Ce site affiche de la publicité fournie par Google AdSense. Google et ses partenaires peuvent utiliser des cookies et des identifiants
           pour afficher des annonces et mesurer leur efficacité. Ces traceurs ne sont déposés qu'avec votre consentement, que vous pouvez
           accepter, refuser ou modifier à tout moment depuis le bandeau de choix des cookies du site.
           Plus d'informations : <a href="https://policies.google.com/technologies/partner-sites">comment Google utilise les données des sites partenaires</a>.</p>
        <p>Refuser les cookies n'empêche pas d'utiliser le site : les coloriages, labyrinthes et jeux restent accessibles.</p>
    <?php endif; ?>

    <h2>Service tiers : PayPal</h2>
    <p>Le lien « Faire un don » vous conduit sur le site de PayPal. Les données que vous y saisissez sont traitées par PayPal selon sa propre
       politique de confidentialité ; l'éditeur du site n'y a pas accès.</p>

    <h2>Vos droits</h2>
    <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de limitation concernant vos données.
       Pour les exercer, écrivez à <?= $contact ?>. Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation
       auprès de la <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>.</p>

    <p class="maj">Dernière mise à jour : <?= htmlspecialchars($cfg['derniere_maj']) ?></p>
</main>

<?php require 'footer.php'; ?>
