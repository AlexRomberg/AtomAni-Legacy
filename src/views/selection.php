<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/selection.css">

    <?php require('favicon.php') ?>

</head>

<?php
error_reporting(4);

$CardData = json_decode(file_get_contents("../res/experiments.json"), true);

function drawCard($name, $imgName, $id, $referenceSelf)
{
    if ($referenceSelf) {
        echo ('<a class="card" href="./selection.php?id=' . $id . '">');
    } else {
        echo ('<a class="card" href="./experiment.php?id=' . $id . '">');
    }
    echo ('<img src="../res/img/' . $imgName . '" alt="Cristal Imageexample"><div class="Text"><h2>' . $name . '</h2></div></a>');
}

function parseData($cardData, $path)
{
    if (!isset($path)) {
        return $cardData;
    } else {
        $returnJson = $cardData;
        $dir = explode('.', $path);

        $nextId = null;      // used to reproduce id structure of json
        foreach ($dir as $key) {
            $nextId .= $key;
            if (isset($returnJson[$nextId])) {
                $returnJson = $returnJson[$nextId]['subexperiments'];
                $nextId .= '.';
            } else {
                // path is wrong
                header('Location: ' . $_SERVER['HTTP_REFERER']);
                die;
            }
        }
    }
    return $returnJson;
}

function drawCardsOfLayer($data)
{
    foreach ($data as $key => $value) {
        drawCard($value['name'], $value['imgName'], $key, array_key_exists('subexperiments', $value));
    }
}
?>

<body>
    <div class="container">
        <?php
        $title = "Experimente";
        require('header.php')
        ?>
        <main>
            <div class="selection">
                <?php
                if (isset($_GET['id'])) {
                    $currentData = parseData($CardData, $_GET['id']);
                } else {
                    $currentData = $CardData;
                }
                drawCardsOfLayer($currentData);
                ?>
            </div>
        </main>
        <?php require("footer.php") ?>
    </div>
</body>