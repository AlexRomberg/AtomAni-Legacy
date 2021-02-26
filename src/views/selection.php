<?php
error_reporting(0);
$CardData = json_decode(file_get_contents("../res/experiments.json"), true);
if (isset($_GET['id'])) {
    $currentData = parseData($CardData, $_GET['id']);
} else {
    $currentData = $CardData;
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
    <link rel="stylesheet" href="../css/selection.css">

    <?php require('favicon.php') ?>

</head>

<?php
function drawCard($name, $imgName, $id, $reference)
{
    echo ('<a class="card" href="./' . $reference . '.php?id=' . $id . '">');
    echo ('<img src="../res/img/menuIcons/' . $imgName . '" alt="Missing Folder Icon"><div class="Text"><h2>' . $name . '</h2></div></a>');
}

function parseData($cardData, $path)
{
    if (!isset($path)) {
        return $cardData;
    } else {
        $returnJson = $cardData;
        $dir = explode('.', $path);

        foreach ($dir as $key) {
            if (isset($returnJson[$key])) {
                $returnJson = $returnJson[$key]['subexperiments'];
            } else {
                // path is wrong
                header('Location: selection.php');
                die;
            }
        }
    }
    return $returnJson;
}

function drawCardsOfLayer($data)
{
    $key = 0;
    foreach ($data as $value) {
        drawCard($value['name'], $value['imgName'], (isset($_GET['id']) ? $_GET['id'] . "." : "") . $key, (array_key_exists('subexperiments', $value) ? "selection" : "experiment"));
        $key++;
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
                drawCardsOfLayer($currentData);
                drawCard("Editor", "add.svg", (isset($_GET['id']) ? $_GET['id'] : ""), "new");
                ?>
            </div>
        </main>
        <?php require("footer.php") ?>
    </div>
</body>