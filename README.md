# AtomAni
Eine Semesterarbeit der Kantonsschule Frauenfeld Abt. IMS
Von Alexander Romberg

## Beschreibung
In diesem Projekt wird dem alten Atomarium ein neuer Anstrich verpasst.

## Installation
**Anforderungen**
- `node.js`
- `npm`
- `nginx`
- node.js benötigt schreibrechte im Projekverzeichniss (`src/data/`)

**Installieren von AtomAni**
- In Speicherort wechseln: `cd /path/to/directory/`
- Repository herunterladen: `git clone https://github.com/AlexRomberg/AtomAni.git`
- In Projektverzeichniss wechseln: `cd AtomAni`
- Abhängigkeiten installieren: `npm install`
- starten `npm start [port]`

**Starten mit Nodemon**
- `tsc`
- `npm test [port]`

**Starten mit PM2**
- `tsc`
- `pm2 add ./src/server.js --name AtomAni -- [port]`

**Port Probleme**
- Node.js hat unter Linux nicht immer die Berechtigung Port 80 oder 443 zu verwenden. Hier kann anderer Port als Parameter angegeben werden.
- Für Port 80 oder 443 nginx mit reverse proxy einrichten
- https://gist.github.com/bradtraversy/cd90d1ed3c462fe3bddd11bf8953a896

## Fehler und Verbesserungen
Wenn Fehler auftreten würde ich mich über ein issue freuen.

## Bemerkungen
- Schulnamen: [a-zA-Z-_]
- Loginnamen: [a-zA-Z@_-.,]