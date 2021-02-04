<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="../res/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../res/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../res/favicon/favicon-16x16.png">
    <link rel="manifest" href="../res/favicon/site.webmanifest">
    <link rel="mask-icon" href="../res/favicon/safari-pinned-tab.svg" color="#0002ff">
    <link rel="shortcut icon" href="../res/favicon/favicon.ico">
    <meta name="apple-mobile-web-app-title" content="AtomAni">
    <meta name="application-name" content="AtomAni">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-config" content="../res/favicon/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">


    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/menu.css">
    <link rel="stylesheet" href="../css/help.css">
</head>

<body>
    <script>
        0
        // prevents css loading errors
    </script>
    <div class="container">
        <header>
            <a href="../../index.php"><img src="../res/logo.svg" alt="AtomAni-Logo"></a>
        </header>
        <div class="help-container">
            <nav>
                <h2>Hilfe</h2>
                <ul>
                    <li><a href="help.php#AtomAni">AtomAni</a></li>
                    <li><a href="help.php#Selection">Experimentwahl</a></li>
                    <li><a href="help.php#Simulation">Simulation</a></li>
                    <li><a href="help.php#Script">Simulationsskript</a></li>
                    <li><a href="help.php#FAQ">Häufige Fragen</a></li>
                    <li><a href="help.php#Licenses">Bi­b­lio­theken</a></li>
                    <li><a href="help.php#Credits">Mitwirkende</a></li>
                </ul>
            </nav>
            <main>
                <?php
                $helpText = file_get_contents('help.md');

                require("Parsedown.php");
                require("ParsedownExtra.php");

                $Parsedown = new Parsedown();
                $Extra = new ParsedownExtra();
                echo $Extra->text($helpText);
                ?>
                <p style="height: 40px"></p>
            </main>
        </div>
        <?php require("footer.php") ?>
    </div>
</body>