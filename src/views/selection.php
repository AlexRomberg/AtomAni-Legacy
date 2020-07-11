<!DOCTYPE html>
<!--
Copyright (c) 2020 Alexander Romberg, Dario Romandini
-->

<head>
    <title>AtomAni</title>

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/menu.css">
    <link rel="stylesheet" href="../css/selection.css">

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Muli:wght@500&display=swap" rel="stylesheet">
</head>

<?php
    $CardData = json_decode(file_get_contents("../res/experiments.json"), true);

    function drawCard($name, $imgName, $id, $referenceSelf) {
        echo('<li class="card">');
        if ($referenceSelf) {
            echo('<a href="./selection.php?id='.$id.'">');
        } else {
            echo('<a href="./experiment.php?id='.$id.'">');
        }
        echo('<img src="../res/'.$imgName.'" alt="Cristal Imageexample"><div class="Text"><h2>'.$name.'</h2></div></a></li>');
    }

    function parseData($cardData, $path) {
        $returnJson = $cardData;
        if (!isset($path)) {
            return $cardData;
        } else {
            $dir = explode('.',$path);

            $nextId = null;      // used to reproduce id structure of json
            foreach ($dir as $key) {
                $nextId .= $key;
                $returnJson = $returnJson[$nextId]['subexperiments'];
                $nextId .= '.';
            }
        }
        return $returnJson;
    }

    function drawCardsOfLayer($data) {
        foreach ($data as $key => $value) {
            drawCard($value['name'], $value['imgName'], $key, array_key_exists('subexperiments', $value));
        }
    }
?>

<body>
    <div class="container">
        <header>
            <a href="../../index.php"><img src="../res/logo.svg" alt="AtomAni-Logo"></a>
        </header>

        <main>
            <h1>Experiments</h1>
            <ul class="selection">
                <?php
                    $currentData = parseData($CardData, $_GET['id']);
                    drawCardsOfLayer($currentData);
                ?>
            </ul>
        </main>
        <footer>
            ©Alexander, Dario
        </footer>
    </div>
</body>