<header>
        <img id="logoImg" src="assets/Logo_site_02.gif" alt="logo" >
            
        <ul class="header__menu">
            <li>
                <a  
                class="
                    <?php 
                        if($_SERVER['SCRIPT_NAME'] === '/index.php') {
                            echo "ulActive";
                        }
                    ?>
                "
                href="/index.php">Coloriages</a>
            </li>

            <li
                class="
                    <?php
                        if($_SERVER['SCRIPT_NAME'] === '/labyrinthes.php') {
                            echo "ulActive";
                        }
                    ?>
                ">
                <a  
                class="
                    <?php 
                        if($_SERVER['SCRIPT_NAME'] === '/labyrinthes.php') {
                            echo "ulActive";
                        }
                    ?>
                "
                href="/labyrinthes.php">Labyrinthes</a>
            </li>

            <li
                class="
                   <?php 
                        if($_SERVER['SCRIPT_NAME'] === '/jeux.php') {
                            echo "ulActive";
                        }
                   ?> 
                ">
                <a  
                class="
                    <?php 
                        if($_SERVER['SCRIPT_NAME'] === '/jeux.php') {
                            echo "ulActive";
                        }
                    ?>
                "
                href="/jeux.php">Jeux</a>
            </li>
        </ul>
        <div class="header__buttons">
            <a href="https://www.paypal.com/donate/?hosted_button_id=CUJ2FNRCT3RFE">Faire un don up</a>
        </div>
    </header>