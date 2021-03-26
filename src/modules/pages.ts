//  server.ts
// ----------------------------------
//  Nodejs server for AtomAni
//
//  © Alexander Romberg @ KFTG (IMS)
// ----------------------------------

let Version = "[Version]";

// Imports
import express from 'express';
import cm from './consoleModule';
import help from './helpMarkdown';
import experiments from './experiments';
import selection from './selection';

function init(version: string) {
    Version = version;
}

function sendIndex(req: express.Request, res: express.Response) {
    res.render('index', {
        version: Version
    });
}

function sendSelection(req: express.Request, res: express.Response) {
    const origPath = req.path.slice(10);
    let path = experiments.cleanPath(origPath);


    if (origPath === path || origPath === '') {
        try {
            const experimentList = experiments.getExperiments(path, 'ARO-Studios');
            const cardString = selection.getCardsOfLayer(experimentList);
            res.render('selection', {
                version: Version,
                path,
                cardString
            });
        } catch {
            res.redirect(`/selection`);
        }

    } else {
        res.redirect(`/selection${path}`);
    }

}

function sendHelp(req: express.Request, res: express.Response) {
    let html;
    try {
        html = help.getHTML();
    } catch {
        html = 'Hilfe konnte nicht geladen werden.';
    }
    res.render('help', {
        version: Version,
        html
    });
}

function handle404(req: express.Request, res: express.Response) {
    if (req.path == '/favicon.ico') {
        res.redirect('/res/favicon/favicon.ico');
    } else {
        cm.log("red", "unknown request: " + req.path);
        res.redirect('/');
        cm.log("yellow", "redirected to /");
    }
}

// experiments.createFolder("example", "exampleGroup.svg", "/", "general");
// experiments.createFolder("example2", "exampleGroup.svg", "/", "general");
// experiments.createExperiment("Beispiel0.1", "exampleExperiment.svg", "/0", "general");
// experiments.createExperiment("Beispiel0.2", "exampleExperiment.svg", "/0", "general");
// experiments.createExperiment("Beispiel0.3", "exampleExperiment.svg", "/0", "general");
// experiments.createExperiment("Beispiel1.1", "exampleExperiment.svg", "/1", "general");
// experiments.createExperiment("Beispiel1.2", "exampleExperiment.svg", "/1", "general");
// experiments.createExperiment("Beispiel1.3", "exampleExperiment.svg", "/1", "general");

export default { init, sendIndex, sendSelection, sendHelp, handle404 };