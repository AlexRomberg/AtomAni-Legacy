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
import storage from './storage';
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
    let path = storage.cleanPath(origPath);


    if (origPath === path || origPath === '') {
        try {
            const experimentList = storage.getExperiments(path, 'ARO-Studios');
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

function sendExperiment(req: express.Request, res: express.Response) {
    if ('id' in req.query) {
        const query = req.query.id?.toString()!;
        const cleanQuery = query.match(/^[0-9a-f]{16}$/);
        if (cleanQuery !== null) {
            res.send(`Hello World;<br>`);
        } else {
            sendExperimentNotFound(req, res);
        }
    } else {
        sendExperimentNotFound(req, res);
    }
}

function sendExperimentNotFound(req: express.Request, res: express.Response) {
    res.send("Experiment nicht gefunden!");
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

export default { init, sendIndex, sendSelection, sendExperiment, sendHelp, handle404 };