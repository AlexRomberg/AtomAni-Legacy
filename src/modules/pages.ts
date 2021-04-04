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
import files from './files';
import storage from './storage';
import selection from './selection';
import experiments from './experiments';

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
    const query = req.params.id?.toString()!;
    if (query.match(/^[0-9a-f]{16}$/) !== null) {
        try {
            const scriptParams = experiments.loadExperimentParams(query);
            res.render('experiment', {
                version: Version,
                scriptParams
            });
        } catch {
            send404(req, res, "Experiment not found!", "experiment file not found.");
        }
    } else {
        send404(req, res, "Experiment not found!", "ID does not match format. (16 hexadecimal digits)");
    }
}

function sendNewExperiment(req: express.Request, res: express.Response) {
    if ('id' in req.query) {
        let id = req.query.id?.toString()!;
        id = cleanID(id);
        res.render('newExperiment', {
            version: Version,
            origId: id
        });
    } else {
        send404(req, res, "Path problem!", "ID parameter not set");
    }
}

function handleNewExperiment(req: express.Request, res: express.Response) {
    if ('import' in req.body) {
        let id = req.body.id;
        id = cleanID(id);
        if (storage.checkFolderExists(id, 'ARO-Studios')) {
            res.render('import', {
                version: Version,
                origId: id
            });
        } else {
            send404(req, res, "Path problem!", "Folder not found");
        }
    } else if ('editor' in req.body) {
        let id = req.body.id;
        id = cleanID(id);
        if (storage.checkFolderExists(id, 'ARO-Studios')) {
            res.render('editor', {
                version: Version,
                origId: id
            });
        } else {
            send404(req, res, "Path problem!", "Folder not found");
        }
    } else if ('importExperiment' in req.body) {
        const id = cleanID(req.body.id);
        const experimentId = storage.createExperiment(req.body.experimentName, 'cristal2DExperiment.svg', id, 'ARO-Studios');
        files.createExperiment(req.body.experimentCode, experimentId);
        res.redirect(`/selection${id}`);
    } else if ('save' in req.body) {
        const id = cleanID(req.body.id);
        const experimentId = storage.createExperiment(req.body.experimentName, 'cristal2DExperiment.svg', id, 'ARO-Studios');
        files.createExperiment(req.body.data, experimentId);
        res.redirect(`/selection${id}`);
    } else {
        send404(req, res, 'Action not found!', JSON.stringify(req.body));
    }
}

function sendNewFolder(req: express.Request, res: express.Response) {
    if ('id' in req.query) {
        let id = req.query.id?.toString()!;
        id = cleanID(id);
        if (storage.checkFolderExists(id, 'ARO-Studios')) {
            res.render('newFolder', {
                version: Version,
                origId: id
            });
        } else {
            send404(req, res, "Path problem!", "Folder not found");
        }
    } else {
        send404(req, res, "Path problem!", "ID parameter not set");
    }
}

function handleNewFolder(req: express.Request, res: express.Response) {
    const id = cleanID(req.body.id);
    storage.createFolder(req.body.folderName, 'exampleGroup.svg', id, 'ARO-Studios');
    res.redirect(`/selection${id}`);
}

function sendImport(req: express.Request, res: express.Response) {
    send404(req, res, 'get Import', JSON.stringify(req.body));
}

function handleImport(req: express.Request, res: express.Response) {
    send404(req, res, 'post Import', JSON.stringify(req.body));
}

function sendEditor(req: express.Request, res: express.Response) { }

function handleEditor(req: express.Request, res: express.Response) { }

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

function send404(req: express.Request, res: express.Response, error: string, reason: string) {
    res.render('404', {
        version: Version,
        error,
        reason
    });
}

function cleanID(id: string): string {
    id = id.replace(/[^0-9\/]/g, '');
    if (!id.startsWith('/')) {
        id = `/${id}`;
    }
    if (!id.endsWith('/')) {
        id = `${id}/`;
    }
    return id;
}

// experiments.createFolder("example", "exampleGroup.svg", "/", "general");
// experiments.createFolder("example2", "exampleGroup.svg", "/", "general");
// experiments.createExperiment("Beispiel0.1", "exampleExperiment.svg", "/0", "general");
// experiments.createExperiment("Beispiel0.2", "exampleExperiment.svg", "/0", "general");
// experiments.createExperiment("Beispiel0.3", "exampleExperiment.svg", "/0", "general");
// experiments.createExperiment("Beispiel1.1", "exampleExperiment.svg", "/1", "general");
// experiments.createExperiment("Beispiel1.2", "exampleExperiment.svg", "/1", "general");
// experiments.createExperiment("Beispiel1.3", "exampleExperiment.svg", "/1", "general");

export default { init, sendIndex, sendSelection, sendExperiment, sendHelp, handle404, sendNewFolder, sendNewExperiment, handleNewExperiment, handleNewFolder, sendImport, handleImport, sendEditor, handleEditor };