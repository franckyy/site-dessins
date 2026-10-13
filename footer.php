<?php $cfgPied = require 'config_site.php'; ?>
<footer class="pied">
    <nav>
        <a href="mentions-legales.php">Mentions légales</a>
        <a href="confidentialite.php">Politique de confidentialité</a>
    </nav>
    <p>&copy; <?= date('Y') ?> <?= htmlspecialchars($cfgPied['nom_site']) ?></p>
</footer>
</body>
</html>
