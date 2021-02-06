<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/experiment.css">
    <link rel="stylesheet" href="../css/controls.css">

    <?php require('favicon.php') ?>

    <!-- scripts -->
    <script src="../res/lib/jquery.min.js"></script>
    <script src="../res/lib/Chart.bundle.min.js"></script>
</head>

<body>
    <?php
    $title = "Simulation";
    require('header.php');
    ?>
    <main>
        <div class="simulationWindow">
            <div class="simulation">
                <!-- Simulation -->
                <canvas id="sim"></canvas>
            </div>
            <div class="controlPane">
                <!-- Controls -->
                <div id="chartsBox">
                    <h3>Diagramme</h3>
                    <div class="charts">
                    </div>
                </div>
                <div id="controlsBox">
                    <h3>Steuerung</h3>
                    <div class="controls">
                        <div class="control" id="temp" style="display: none;">
                            <h4></h4>
                            <input type="range" class="slider" id="inpTemp" min="0.997" max="1.003" value="1" step="0.001">
                        </div>
                        <div class="control" id="control" style="display: none;">
                            <h4></h4>
                            <span class="row space-even">
                                <buttom id="btnSpeed" class="btnRound btnSmall" value="1">1×</buttom>
                                <buttom id="btnStart" class="btnRound"><img class="btnPause" alt="Stop"></buttom>
                                <buttom id="btnReset" class="btnRound btnSmall"><img alt="Zurücksetzen"></buttom>
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