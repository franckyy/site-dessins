<header>
        <img src="assets/Logo_Site.gif" alt="logo" >
            

        <ul class="header__menu">
            <li 
                class="
                    <?php 
                        if($ulActive === 'index') {
                            echo "ulActive";
                        }
                    ?>
                ">
                <a href="/index.php">Dessins</a>
            </li>

            <li
                class="
                    <?php
                        if($ulActive === 'labyrinthes') {
                            echo "ulActive";
                        }
                    ?>
                ">
                <a href="/labyrinthes.php">Labyrinthes</a>
            </li>

            <li
                class="
                   <?php 
                        if($ulActive === 'jeux') {
                            echo "ulActive";
                        }
                   ?> 
                ">
                <a href="/jeux.php">Jeux</a>
            </li>
        </ul>
        <div class="header__buttons">
            <a href="#">Sign in</a>
            <a href="#">Sign up</a>
        </div>
    </header>