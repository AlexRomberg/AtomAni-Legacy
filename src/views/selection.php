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
error_reporting(0);

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
    $returnJson = $cardData;
    if (!isset($path)) {
        return $cardData;
    } else {
        $dir = explode('.', $path);

        $nextId = null;      // used to reproduce id structure of json
        foreach ($dir as $key) {
            $nextId .= $key;
            $returnJson = $returnJson[$nextId]['subexperiments'];
            $nextId .= '.';
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
            <h1>Experiments</h1>
            <div class="selection">
                <?php
                $currentData = parseData($CardData, $_GET['id']);
                drawCardsOfLayer($currentData);
                ?>
            </div>
        </main>
        <footer>
            ©Alexander, Dario
        </footer>
    </div>
</body>