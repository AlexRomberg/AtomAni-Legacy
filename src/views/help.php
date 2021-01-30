<!DOCTYPE html>
<!--
Copyright (c) 2021 Alexander Romberg
-->

<head>
    <title>AtomAni</title>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">

    <!-- stylesheets -->
    <link rel="stylesheet" href="../css/general.css">
    <link rel="stylesheet" href="../css/menu.css">
    <link rel="stylesheet" href="../css/help.css">
</head>

<body>
    <script>
        0
        // prevents css loading errors
    </script>
    <div class="container">
        <header>
            <a href="../../index.php"><img src="../res/logo.svg" alt="AtomAni-Logo"></a>
        </header>
        <div class="help-container">
            <nav>
                <h2>Hilfe</h2>
                <ul>
                    <li><a href="help.php#AtomAni">AtomAni</a></li>
                    <li><a href="help.php#Selection">Experimentwahl</a></li>
                    <li><a href="help.php#Simulation">Simulation</a></li>
                    <li><a href="help.php#Script">Simulationsskript</a></li>
                    <li><a href="help.php#Credits">Mitwirkende</a></li>
                </ul>
            </nav>
            <main>
                <img id="AtomAni" class="center" src="../res/logo.svg">
                <p>AtomAni ist ein Programm, um die Atombewegung von Edelgasen zu simulieren.</p><p>Es ist im Rahmen einer Projektarbeit an der Informatikmittelschule Frauenfeld entstanden.</p><p>Der Name leitet sich aus den Wörtern Atom und Animation ab.</p><p>Als Grundlage für die Entwicklung diente das 2008 erschienene Programm Atomarium.</p>
                <h1 id="Selection">Experimentwahl</h1>
                In der Experimentwahl werden die verfügbaren Experimente angezeigt. Sie können in Ordner gruppiert werden, um einen besseren Überblick zu bekommen. Tippen Sie auf eine der Kacheln, um sie zu öffnen.
                <h1 id="Simulation">Simulation</h1>
                Die Simulation besteht aus zwei Bereichen, dem Simulationsbereich und dem Informationsbereich.
                <h2>Simulationsbereich</h2>
                In diesem Bereich werden die Atome als bewegte Kugeln dargestellt. Der Kameraausschnitt der Simulation lässt sich frei definieren, somit können die Atome von allen Seiten betrachtet werden.
                <ul>
                    <li>Durch Klicken/Tippen und Ziehen lässt sich die Kamera drehen.</li>
                    <li>Durch Scrollen oder Auseinanderziehen mit zwei Fingern lässt sich die Simulation vergrössern.</li>
                    <li>Durch Ziehen mit Rechtsklick oder Wischen mit zwei Fingern lässt sich die Kamera verschieben.</li>
                </ul>
                <h2>Informationsbereich</h2>
                <p>Hier werden die Diagramme und Steuerelemente angezeigt. Diagramme dienen der Visualisierung der Daten. Sie werden in der Simulationskonfiguration aktiviert. Durch Steuerelemente lässt sich die Animation kontrollieren.</p>
                <p>Es stehen zurzeit folgende Diagramme und Steuerelemente zur Verfügung:</p>
                <h3>Diagramme</h3>
                <ul>
                    <li>Bilder pro Sekunde [fps]</li>
                    <li>Durchschnittliche Atomgeschwindigkeit [avgVel]</li>
                </ul>
                <h3>Steuerelemente</h3>
                <ul>
                    <li>Kühlen/Heizen (Schieberegler) [temp]</li>
                    <li>Simulationsbedienung (Simulationsgeschwindigkeit, Starten/Stoppen, Zurücksetzen) [control]</li>
                </ul>
                <h1 id="Script">Simulationsskript</h1>
                Eine Simulation wird durch eine <a href="https://www.json.org/json-de.html">JSON</a> Datei beschrieben. Diese muss aus mindestens vier Attributen bestehen.
                <h3>Beispiel</h3>
                <code>{
    "charts": [],
    "atoms": [],
    "walls": [],
    "controls": []
}</code>
                <h2>Diagramme [charts]</h2>
                <p>Diagramme lassen sich mit Hilfe von IDs anzeigen. Diese sind im Abschnitt Informationsbereich in eckigen Klammern notiert.</p>
                <p>Ein Diagramm besteht aus folgenden Informationen:</p>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Erklärung</th>
                        <th>Beispiel</th>
                    </tr>
                    <tr>
                        <td>
                            id
                        </td>
                        <td>
                            Kürzel, das die Art des Diagramms bestimmt
                        </td>
                        <td>
                            "avgVel"
                        </td>
                    </tr>
                    <tr>
                        <td>
                            title
                        </td>
                        <td>
                            Text, der über dem Diagramm steht
                        </td>
                        <td>
                            "Geschwindigkeit"
                        </td>
                    </tr>
                    <tr>
                        <td>
                            lineColor
                        </td>
                        <td>
                            Linienfarbe des Diagramms
                        </td>
                        <td>
                            "rgba(0,0,200,1)"
                        </td>
                    </tr>
                    <tr>
                        <td>
                            fillColor
                        </td>
                        <td>
                            Füllfarbe des Bereichs unter der Linie
                        </td>
                        <td>
                            "rgba(0,0,170,0.4)"
                        </td>
                    </tr>
                </table>
                <h3>Beispiel</h3>
                <code>"charts": [{
    "id": "avgVel",
    "title": "Geschwindigkeit",
    "lineColor": "rgba(0,0,200,1)",
    "fillColor": "rgba(0,0,170,0.4)"
}]</code>
                <h2>Atome [atoms]</h2>
                <p>Atome könne einzeln oder als Gitter platziert werden und haben verschiedene Atomtypen (Farben).</p>
                <p>Ein Atom oder eine Atom-Struktur (Gitter) besteht aus folgenden Informationen:</p>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Erklärung</th>
                        <th>Beispiel</th>
                    </tr>
                    <tr>
                        <td>
                            type
                        </td>
                        <td>
                            Beschreibung ob Gitter ("grid") oder Einzelatom ("single")
                        </td>
                        <td>
                            "grid"
                        </td>
                    </tr>
                    <tr>
                        <td>
                            x, y, z
                        </td>
                        <td>
                            Raumkoordinate zur Positionierung im Raum
                        </td>
                        <td>
                            -60
                        </td>
                    </tr>
                    <tr>
                        <td>
                            width, height, depth
                        </td>
                        <td>
                            Anzahl Atome im Gitter, in der jeweiligen Richtung<br><i>Nur bei type:grid</i>.
                        </td>
                        <td>
                            5
                        </td>
                    </tr>
                    <tr>
                        <td>
                            atomType
                        </td>
                        <td>
                            Kürzel, zur Bestimmung des Atom-Typs (ne, ar, kr)
                        </td>
                        <td>
                            "ne"
                        </td>
                    </tr>
                </table>
                <h3>Beispiel</h3>
                <code>"atoms": [{
    "type": "grid",
    "x": -60,
    "y": -60,
    "z": -60,
    "width": 5,
    "height": 5,
    "depth": 5,
    "atomType": "ne"
},
{
    "type": "single",
    "x": 200,
    "y": -180,
    "z": 240,
    "atomType": "ar"
}]</code>
                <h2>Wände [walls]</h2>
                <p>Wände können in Form von Boxen erstellt werden.</p>
                <p>Eine Box besteht aus folgenden Informationen:</p>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Erklärung</th>
                        <th>Beispiel</th>
                    </tr>
                    <tr>
                        <td>
                            x, y, z
                        </td>
                        <td>
                            Raumkoordinate zur Positionierung im Raum
                        </td>
                        <td>
                            -300
                        </td>
                    </tr>
                    <tr>
                        <td>
                            width, height, depth
                        </td>
                        <td>
                            Grösse in Pixeln in der jeweiligen Richtung
                        </td>
                        <td>
                            600
                        </td>
                    </tr>
                </table>
                <h3>Beispiel</h3>
                <code>"walls": [{
    "x": -300,
    "y": -300,
    "z": -300,
    "width": 600,
    "height": 600,
    "depth": 600
}]</code>
                <h2>Kontrollelemente [controls]</h2>
                Kontrollelemente lassen sich mithilfe von IDs auswählen.
                Ein Kontrollelement besteht aus folgenden Informationen:
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Erklärung</th>
                        <th>Beispiel</th>
                    </tr>
                    <tr>
                        <td>id</td>
                        <td>Kürzel, das die Art des Kontrollelements bestimmt.</td>
                        <td>"temp"</td>
                    </tr>
                    <tr>
                        <td>name</td>
                        <td>Bezeichnung, die über dem Element angezeigt wird.</td>
                        <td>"Kühlen/Heizen"</td>
                    </tr>
                </table>
                <h3>Beispiel</h3>
                <code>"controls": [{
    "id": "temp",
    "name": "Kühlen/Heizen"
}]</code>
                <h1 id="Credits">Mitwirkende</h1>
                <h3>Entwicklung</h3>
                <p>Alexander Romberg</p>
                <h3>Betreuung</h3>
                <p>Sven Nüesch</p>
                <h3>Im Auftrag von</h3>
                <p>Dr. Jörg Engweiler</p>
                <h3>Unterstützer</h3>
                <p>Dario Romandini</p>
                <p>Hans-Ueli Ehrensperger</p>
                <p>Dr. Johannes Keller</p>
                <p>Dr. Markus Romberg</p>
                <p>Philipp Reinhard</p>
                <p style="height: 40px"></p>
            </main>
        </div>
        <?php require("footer.php") ?>
    </div>
</body>
