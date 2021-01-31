<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/menu.css">
    <link rel="stylesheet" href="../css/selection.css">

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/src/res/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/src/res/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/src/res/favicon/favicon-16x16.png">
    <link rel="manifest" href="/src/res/favicon/site.webmanifest">
    <link rel="mask-icon" href="/src/res/favicon/safari-pinned-tab.svg" color="#0002ff">
    <link rel="shortcut icon" href="/src/res/favicon/favicon.ico">
    <meta name="apple-mobile-web-app-title" content="AtomAni">
    <meta name="application-name" content="AtomAni">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-config" content="/src/res/favicon/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">

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
    <script>
        0
        // prevents css loading errors
    </script>
    <div class="container">
        <header>
            <a href="../../index.php"><img src="../res/logo.svg" alt="AtomAni-Logo"></a>
        </header>

        <main>
            <span class="title">
                <button id="back" onclick="history.back(-1);"><img src="../res/img/back.svg" alt="<"></button>
                <h1>Experimente</h1>
            </span>
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