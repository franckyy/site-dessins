<header>
        <img id="logoImg" src="assets/Logo_Site_02.gif" alt="logo" >
            
        <ul class="header__menu">
            <li 
                class="
                    <?php 
                        if($_SERVER['SCRIPT_NAME'] === '/index.php') {
                            echo "ulActive";
                        }
                    ?>
                ">
                <a href="/index.php">Coloriages</a>
            </li>

            <li
                class="
                    <?php
                        if($_SERVER['SCRIPT_NAME'] === '/labyrinthes.php') {
                            echo "ulActive";
                        }
                    ?>
                ">
                <a href="/labyrinthes.php">Labyrinthes</a>
            </li>

            <li
                class="
                   <?php 
                        if($_SERVER['SCRIPT_NAME'] === '/jeux.php') {
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