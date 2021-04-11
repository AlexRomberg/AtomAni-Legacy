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
import escape from 'escape-html';
import users from './users';

function init(version: string) {
    Version = version;
}

function sendIndex(req: express.Request, res: express.Response) {
    res.render('index', {
        version: Version,
        user: req.user
    });
}

function sendSelection(req: express.Request, res: express.Response) {
    const origPath = req.path.slice(10);
    let path = storage.cleanPath(origPath);


    if (origPath === path || origPath === '') {
        try {
            const experimentList = storage.getExperiments(path, 'ARO-Studios');
            const cardString = selection.getCardsOfLayer(experimentList, req.user);
            res.render('selection', {
                version: Version,
                path,
                cardString,
                user: req.user
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
        handleImport(req, res);
    } else if ('editor' in req.body) {
        handleEditor(req, res);
    } else if ('save' in req.body) {
        handleSave(req, res);
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
    if ('id' in req.body && 'name' in req.body) {
        const id = cleanID(req.body.id);
        const name = escape(req.body.name);
        if (storage.checkFolderExists(id, 'ARO-Studios')) {
            storage.createFolder(name, 'exampleGroup.svg', id, 'ARO-Studios');
            res.redirect(`/selection${id}`);
        } else {
            send404(req, res, "Path problem!", "Folder not found");
        }
    } else {
        send404(req, res, "Path problem!", "ID parameter not set");
    }
}

function handleImport(req: express.Request, res: express.Response) {
    if ('id' in req.body) {
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
    } else {
        send404(req, res, "Path problem!", "ID parameter not set");
    }
}

function handleSave(req: express.Request, res: express.Response) {
    if ('id' in req.body && 'name' in req.body && 'data' in req.body) {
        const id = cleanID(req.body.id);
        const name = escape(req.body.name);
        const data = req.body.data;
        // const errors = files.checkFile(data)
        // if (errors === null || errors === undefined) {
        const experimentId = storage.createExperiment(name, 'cristal2DExperiment.svg', id, 'ARO-Studios');
        files.createExperiment(data, experimentId);
        res.redirect(`/selection${id}`);
        // } else {
        //     let err = '';
        //     errors.forEach(error => { err += `${error.dataPath}: ${error.message}<br>`; });
        //     send404(req, res, "Script has errors!", err);
        // }
    }
}

function handleEditor(req: express.Request, res: express.Response) {
    if ('id' in req.body) {
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
    } else {
        send404(req, res, "Path problem!", "ID parameter not set");
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

function handleLogout(req: express.Request, res: express.Response) {
    req.logOut();
    res.redirect('/login');
}

function sendRegister(req: express.Request, res: express.Response) {
    const user: any = req.user;
    if (user.isAdmin) {
        res.render('register.ejs', {
            version: Version
        });
    } else {
        res.redirect('/')
    }
}

function sendLogin(req: express.Request, res: express.Response) {
    res.render('login.ejs', {
        version: Version
    });
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

export default { init, sendIndex, sendSelection, sendExperiment, sendHelp, handle404, sendNewFolder, sendNewExperiment, handleNewExperiment, handleNewFolder, handleImport, handleEditor, handleLogout, sendRegister, sendLogin };