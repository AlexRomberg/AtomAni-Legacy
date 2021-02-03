![AtomAni-Logo](../res/logo.svg) {#AtomAni .center}
AtomAni ist ein Programm, um die Atombewegung von Edelgasen zu simulieren.<br>
Es ist im Rahmen einer Projektarbeit an der Informatikmittelschule Frauenfeld entstanden.<br>
Der Name leitet sich aus den Wörtern Atom und Animation ab.<br>
Als Grundlage für die Entwicklung diente das 2008 erschienene Programm Atomarium.

# Experimentwahl {#Selection}
In der Experimentwahl werden die verfügbaren Experimente angezeigt. Sie können in Ordner gruppiert werden, um einen besseren Überblick zu bekommen. Tippen Sie auf eine der Kacheln, um sie zu öffnen.

# Simulation {#Simulation}
Die Simulation besteht aus zwei Bereichen, dem Simulationsbereich und dem Informationsbereich.

## Simulationsbereich
In diesem Bereich werden die Atome als bewegte Kugeln dargestellt. Der Kameraausschnitt der Simulation lässt sich frei definieren, somit können die Atome von allen Seiten betrachtet werden.
- Durch Klicken/Tippen und Ziehen lässt sich die Kamera drehen.
- Durch Scrollen oder Auseinanderziehen mit zwei Fingern lässt sich die Simulation vergrössern.
- Durch Ziehen mit Rechtsklick oder Wischen mit zwei Fingern lässt sich die Kamera verschieben.

## Informationsbereich
Hier werden die Diagramme und Steuerelemente angezeigt. Diagramme dienen der Visualisierung der Daten. Sie werden in der Simulationskonfiguration aktiviert. Durch Steuerelemente lässt sich die Animation kontrollieren.
Es stehen zurzeit folgende Diagramme und Steuerelemente zur Verfügung:

### Diagramme
- Bilder pro Sekunde [fps]
- Durchschnittliche Atomgeschwindigkeit [avgVel]
- Durchschnittlicher Druck in Box [pres]

### Steuerelemente
- Kühlen/Heizen (Schieberegler) [temp]
- Simulationsbedienung (Simulationsgeschwindigkeit, Starten/Stoppen, Zurücksetzen) [control]

# Simulationsskript {#Script}
Eine Simulation wird durch eine [JSON](https://www.json.org/json-de.html) Datei beschrieben. Diese muss aus mindestens vier Attributen bestehen.

### Beispiel
```
{
    "charts": [],
    "atoms": [],
    "walls": [],
    "controls": []
}
```

## Diagramme [charts]
Diagramme lassen sich mit Hilfe von IDs anzeigen. Diese sind im Abschnitt Informationsbereich in eckigen Klammern notiert.<br>
Ein Diagramm besteht aus folgenden Informationen:

| Name      | Erklärung                                  | Beispiel            |
| --------- | ------------------------------------------ | ------------------- |
| id        | Kürzel, das die Art des Diagramms bestimmt | "avgVel"            |
| title     | Text, der über dem Diagramm steht          | "Geschwindigkeit"   |
| lineColor | Linienfarbe des Diagramms                  | "rgba(0,0,200,1)"   |
| fillColor | Füllfarbe des Bereichs unter der Linie     | "rgba(0,0,170,0.4)" |

### Beispiel
```
"charts": [{
    "id": "avgVel",
    "title": "Geschwindigkeit",
    "lineColor": "rgba(0,0,200,1)",
    "fillColor": "rgba(0,0,170,0.4)"
}]
```

## Atome [atoms]
Atome könne einzeln oder als Gitter platziert werden und haben verschiedene Atomtypen (Farben).<br>
Ein Atom oder eine Atom-Struktur (Gitter) besteht aus folgenden Informationen:

| Name                 | Erklärung                                                                  | Beispiel |
| -------------------- | -------------------------------------------------------------------------- | -------- |
| type                 | Beschreibung ob Gitter ("grid") oder Einzelatom ("single")                 | "grid"   |
| x, y, z              | Raumkoordinate zur Positionierung im Raum                                  | -60      |
| width, height, depth | Anzahl Atome im Gitter, in der jeweiligen Richtung<br>_Nur bei type:grid_. | 5        |
| atomType             | Kürzel, zur Bestimmung des Atom-Typs (ne, ar, kr)                          | "ne"     |


### Beispiel
```
"atoms": [{
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
}]
```

## Wände [walls]
Wände können in Form von Boxen erstellt werden.<br>
Eine Box besteht aus folgenden Informationen:

| Name                 | Erklärung                                                                                                                           | Beispiel       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| x, y, z              | Raumkoordinate zur Positionierung im Raum                                                                                           | -300           |
| width, height, depth | Grösse in Pixeln in der jeweiligen Richtung                                                                                         | 600            |
| type                 | Art der Wand.(<br>"rebound": abprallen<br>"force-inside": abstossende Kraft innen<br>"force-both": abstossende Kraft beidseitig<br> | "force-inside" |


### Beispiel
```
"walls": [{
    "x": -300,
    "y": -300,
    "z": -300,
    "width": 600,
    "height": 600,
    "depth": 600,
    "type": "force-inside"
}]
```

## Kontrollelemente [controls]
Kontrollelemente lassen sich mithilfe von IDs auswählen.<br>
Ein Kontrollelement besteht aus folgenden Informationen:

| Name | Erklärung                                          | Beispiel        |
| ---- | -------------------------------------------------- | --------------- |
| id   | Kürzel, das die Art des Kontrollelements bestimmt. | "temp"          |
| name | Bezeichnung, die über dem Element angezeigt wird.  | "Kühlen/Heizen" |


### Beispiel
```
"controls": [{
    "id": "temp",
    "name": "Kühlen/Heizen"
}]
```

# Häufige Fragen {#FAQ}

## Wieso verschwinden manche Atome bei Kollisionen?
Wenn sich ein Atom zu schnell in ein anderes Atom oder eine Wand bewegt kommt es vor, dass die exponentiell wirkende Kraft eine extreme Beschleunigung zufolge hat. So wird das Atom aus dem Sichtfeld geschleudert und scheint zu verschwinden. Dies kann teilweise auf eine Überlastung des Geräts zurückgeführt werden, welches nicht genügend Berechnungen pro Sekunde durchlaufen kann.

## Ich habe einen Fehler gefunden, was soll ich tun?
Das Projekt AtomAni wird auf [GitHub](https://github.com/AlexRomberg/AtomAni) verwaltet. Dort lässt sich unter dem Tab "issues" ein Fehler melden. Andernfalls bin ich auch persönlich erreichbar.

# Bibliotheken {#Licenses}
Dieses Programm verwendet:
- **[three.js](https://threejs.org/)** unter der **MIT** Lizenz
- **[parsedown](https://parsedown.org/)** unter der **MIT** Lizenz
- **[jquery](https://jquery.com/)** unter der **MIT** Lizenz

**[MIT Lizenz](https://opensource.org/licenses/MIT)**

# Mitwirkende {#Credits}

### Entwicklung
Alexander Romberg

### Betreuung
Sven Nüesch

### Im Auftrag von
Dr. Jörg Engweiler

### Unterstützer
Dario Romandini<br>
Hans-Ueli Ehrensperger<br>
Dr. Johannes Keller<br>
Dr. Markus Romberg<br>
Philipp Reinhard