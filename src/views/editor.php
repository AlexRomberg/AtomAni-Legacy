<?php

function addToFolderstructure($content, $cardData, $pathinfo, $id)
{
    $itemId = 0;
    if (isset($pathinfo[$id]) && $pathinfo[$id] != "") {
        $data = addToFolderstructure($content, $cardData[$pathinfo[$id]]['subexperiments'], $pathinfo, $id + 1);
        $cardData[$pathinfo[$id]]['subexperiments'] = $data['data'];
        $itemId = $data['itemId'];
    } else {
        $itemId = $id . "." . count($cardData);
        $cardData[] = $content;
    }
    return ["data" => $cardData, "itemId" => $itemId];
}

function createExperiment($id, $name, $image)
{
    $cardData = json_decode(file_get_contents("../res/experiments.json"), true);

    $content['name'] = $name;
    $content['imgName'] = $image;

    $data = addToFolderstructure($content, $cardData, explode('.', $id), 0);
    $cardData = $data['data'];

    file_put_contents("../res/experiments.json", json_encode($cardData, JSON_PRETTY_PRINT));

    return $data['itemId'];
}

if (isset($_POST['save'])) {
    $id = createExperiment($_POST['id'], $_POST['experimentName'], "exampleExperiment.svg");

    file_put_contents("../res/experiments/" . $id . ".json", json_encode(json_decode($_POST['data']), JSON_PRETTY_PRINT));

    header("Location: selection.php" . ($_POST['id'] == "" ? "" : "?id=" . $_POST['id']));
}

?>
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
    <link rel="stylesheet" href="../css/editor.css">

    <?php require('favicon.php') ?>

    <!-- scripts -->
    <script src="../res/lib/jquery.min.js"></script>
    <script src="../res/lib/Chart.bundle.min.js"></script>
    <script type="module" src="../js/editor.js"></script>
</head>

<body>
    <?php
    $title = "Simulation";
    require('header.php');
    ?>
    <main class="no-js">
        <div class="js-missing-message">
            <script>
                let main = Array.prototype.slice.call(document.getElementsByClassName("no-js")); // checks for working JS
                main[0].classList.remove('no-js');
            </script>
            <b>JavaScript ist deaktiviert.</b> Die Animation kann dadurch nicht angezeigt werden.
        </div>
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
                        <div class="chart">
                            <input type="checkbox" name="fps" id="fps">fps</input>
                            <hr>
                            <span>
                                <label for="fpsName">Diagramm Name</label>
                                <input type="text" name="fpsName" id="fpsName" value="fps">
                            </span>
                            <span>
                                <label for="fpsColor">Diagramm Farbe</label>
                                <input type="color" name="fpsColor" id="fpsColor" value="#0066FF">
                            </span>
                        </div>
                        <div class="chart">
                            <input type="checkbox" name="avgVel" id="avgVel">avgVel</input>
                            <hr>
                            <span>
                                <label for="avgVelName">Diagramm Name</label>
                                <input type="text" name="avgVelName" id="avgVelName" value="avgVel">
                            </span>
                            <span>
                                <label for="avgVelColor">Diagramm Farbe</label>
                                <input type="color" name="avgVelColor" id="avgVelColor" value="#0066FF">
                            </span>
                        </div>
                        <div class="chart">
                            <input type="checkbox" name="pres" id="pres">pres</input>
                            <hr>
                            <span>
                                <label for="presName">Diagramm Name</label>
                                <input type="text" name="presName" id="presName" value="pres">
                            </span>
                            <span>
                                <label for="presColor">Diagramm Farbe</label>
                                <input type="color" name="presColor" id="presColor" value="#0066FF">
                            </span>
                        </div>
                    </div>
                </div>
                <div id="controlsBox">
                    <h3>Steuerung</h3>
                    <div class="controls">
                        <div class="control">
                            <input type="checkbox" name="temp" id="temp">temp</input>
                            <hr>
                            <span>
                                <label for="tempName">Element Name</label>
                                <input type="text" name="tempName" id="tempName" value="temp">
                            </span>
                        </div>
                        <div class="control">
                            <input type="checkbox" name="control" id="control">control</input>
                            <hr>
                            <span>
                                <label for="controlName">Element Name</label>
                                <input type="text" name="controlName" id="controlName" value="control">
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="configuration">
            <div class="collumn">
                <h3>Atome</h3>
                <div class="list" id="atomList">
                    <button class="selectionBox add" id="addAtom"><img src="../res/img/add.svg" alt="Neu"></button>
                </div>
            </div>
            <div class="collumn">
                <h3>Wände</h3>
                <div class="list" id="wallList">
                    <button class="selectionBox add" id="addWall"><img src="../res/img/add.svg" alt="Neu"></button>
                </div>
            </div>
            <div class="collumn">
                <h3>Einstellungen</h3>
                <form action="editor.php" method="post">
                    <div class="list settings">
                        <div class="settingsBox">
                            <label for="experimentName">Experiment Name:</label>
                            <input type="text" pattern="^(?!\s*$).+" name="experimentName" id="experimentName" required>
                            <input type="hidden" name="id" value="<?php echo ((isset($_GET['id'])) ? $_GET['id'] : ""); ?>">
                            <input type="hidden" id="data" name="data" value='{" charts": [],"atoms": [],"walls": [],"controls": []}'>
                            <input type="submit" name="save" value="Speichern">
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </main>
    <?php require("footer.php") ?>
</body>