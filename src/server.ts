//  server.ts
// ----------------------------------
//  Nodejs server for AtomAni
//
//  © Alexander Romberg @ KFTG (IMS)
// ----------------------------------

// Config
const VERSION = 'v2.0 [Beta] <i>(Nodejs-Version)</i>';
let PORT = 80;
console.clear();

// handle process arguments
if (process.argv.length > 2) {
    PORT = (Number)(process.argv[2]);
}

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
