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
import pages from './modules/pages';

cm.log("green", `Starting Server...`);
cm.log("cyan", `Version: ${VERSION}`);
cm.log("green", `\nModules loaded`);


// Server
const app = express();
app.listen(PORT);
app.set('view engine', 'ejs');
app.use(express.static('public'));
pages.init(VERSION);
cm.log("green", "Server started");
cm.log("blue", `running at: http://localhost:${PORT}`);

// Request handles
app.get('/', pages.sendIndex);

app.get('/selection', pages.sendSelection);
app.get('/selection/*', pages.sendSelection);

app.get('/experiment', pages.sendExperiment);

app.get('/help', pages.sendHelp);

app.use(pages.handle404);

// experiments.clear();
// experiments.createSchool("ARO-Studios");
