//  server.ts
// ----------------------------------
//  Nodejs server for AtomAni
//
//  © Alexander Romberg @ KFTG (IMS)
// ----------------------------------

// Config
const VERSION = 'v2.0 [Beta] <i>(Nodejs-Version)</i>';
const PORT = 80;
console.clear();

// Imports
import express from 'express';
import cm from './modules/consoleModule';
import help from './modules/helpMarkdown';
import experiments from './modules/experiments';

cm.log("green", `Starting Server...`);
cm.log("cyan", `Version: ${VERSION}`);
cm.log("green", `\nModules loaded`);


// Server
const app = express();
app.listen(PORT);
app.set('view engine', 'ejs');
app.use(express.static('public'));
cm.log("green", "Server started");
cm.log("blue", `running at: http://localhost:${PORT}`);

app.get('/', (req, res) => {
    res.render('index', {
        version: VERSION
    });
});

app.get('/help', (req, res) => {
    let html;
    try {
        html = help.getHTML();
    } catch {
        html = 'Hilfe konnte nicht geladen werden.';
    }
    res.render('help', {
        version: VERSION,
        html
    });
});

app.use((req, res) => {
    if (req.path == '/favicon.ico') {
        res.redirect('/res/favicon/favicon.ico');
    } else {
        cm.log("red", "unknown request: " + req.path);
        res.redirect('/');
        cm.log("yellow", "redirected to /");
    }
});
