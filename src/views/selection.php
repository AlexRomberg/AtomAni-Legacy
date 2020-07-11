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

/*

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