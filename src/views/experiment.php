<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/menu.css">
    <link rel="stylesheet" href="../css/experiment.css">
    <link rel="stylesheet" href="../css/controls.css">

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

    <!-- scripts -->
    <script src="../res/lib/jquery.min.js"></script>
    <script src="../res/lib/Chart.bundle.min.js"></script>
</head>

<body>
    <script>
        0
        // prevents css loading errors
    </script>
    <header>
        <a href="../../index.php"><img src="../res/logo.svg" alt="AtomAni-Logo"></a>
    </header>
    <main>
        <span class="title">
            <button id="back" onclick="history.back(-1);"><img src="../res/img/back.svg" alt="<"></button>
            <h1>Simulation</h1>
        </span>
        <div class="simulationWindow">
            <div class="simulation">
                <!-- Simulation -->
                <canvas id="sim"></canvas>
            </div>
            <div class="controlPane">
                <!-- Controls -->
                <div>
                    <h3>Diagramme</h3>
                    <div class="diagramms">
                    </div>
                </div>
                <div>
                    <h3>Steuerung</h3>
                    <div class="controlls">
                        <div class="controll" id="temp" style="display: none;">
                            <h4></h4>
                            <input type="range" class="slider" id="inpTemp" min="0.997" max="1.003" value="1" step="0.001">
                        </div>
                        <div class="controll" id="control" style="display: none;">
                            <h4></h4>
                            <span class="row space-even">
                                <buttom id="btnSpeed" class="btnRound" value="1">1×</buttom>
                                <buttom id="btnStart" class="btnRound"><img src="../res/img/btnPause.png" alt="Stop"></buttom>
                                <buttom id="btnReset" class="btnRound"><img src="../res/img/btnReload.png" alt="Zurücksetzen"></buttom>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <?php require("footer.php") ?>
    <script type="module">
        import * as Experiment from '../js/experiment.js';
        let simulationScript = <?php
                                if (isset($_GET['id'])) {
                                    if (file_exists('../res/experiments/' . $_GET['id'] . '.json')) {
                                        echo (file_get_contents('../res/experiments/' . $_GET['id'] . '.json'));
                                    } else {
                                        header('Location: selection.php');
                                    }
                                } else {
                                    header('Location: selection.php');
                                }
                                ?>;
        Experiment.initSimulation(simulationScript);
    </script>
</body>