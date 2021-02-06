<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">

    <?php require('favicon.php') ?>

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/menu.css">
    <link rel="stylesheet" href="../css/help.css">
</head>

<body>
    <?php
    $title = "Hilfe";
    require('header.php')
    ?>
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
</body>