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

function init(version: string) {
    Version = version;
}

function sendIndex(req: express.Request, res: express.Response) {
    res.render('index', {
        Version,
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
                Version,
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
                Version,
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
    const user: any = req.user;
    if (user.canEdit) {
        if ('id' in req.query) {
            let id = req.query.id?.toString()!;
            id = cleanID(id);
            res.render('newExperiment', {
                Version,
                origId: id
            });
        } else {
            send404(req, res, "Path problem!", "ID parameter not set");
        }
    } else {
        res.redirect('/');
    }
}

function handleNewExperiment(req: express.Request, res: express.Response) {
    const user: any = req.user;
    if (user.canEdit) {
        if ('import' in req.body) {
            handleImport(req, res);
        } else if ('editor' in req.body) {
            handleEditor(req, res);
        } else if ('save' in req.body) {
            handleSave(req, res);
        } else {
            send404(req, res, 'Action not found!', JSON.stringify(req.body));
        }
    } else {
        res.redirect('/');
    }
}

function sendNewFolder(req: express.Request, res: express.Response) {
    const user: any = req.user;
    if (user.canEdit) {
        if ('id' in req.query) {
            let id = req.query.id?.toString()!;
            id = cleanID(id);
            if (storage.checkFolderExists(id, 'ARO-Studios')) {
                res.render('newFolder', {
                    Version,
                    origId: id
                });
            } else {
                send404(req, res, "Path problem!", "Folder not found");
            }
        } else {
            send404(req, res, "Path problem!", "ID parameter not set");
        }
    } else {
        res.redirect('/');
    }
}

function handleNewFolder(req: express.Request, res: express.Response) {
    const user: any = req.user;
    if (user.canEdit) {
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
    } else {
        res.redirect('/');
    }
}

function handleImport(req: express.Request, res: express.Response) {
    const user: any = req.user;
    if (user.canEdit) {
        if ('id' in req.body) {
            let id = req.body.id;
            id = cleanID(id);
            if (storage.checkFolderExists(id, 'ARO-Studios')) {
                res.render('import', {
                    Version,
                    origId: id
                });
            } else {
                send404(req, res, "Path problem!", "Folder not found");
            }
        } else {
            send404(req, res, "Path problem!", "ID parameter not set");
        }
    } else {
        res.redirect('/');
    }
}

function handleSave(req: express.Request, res: express.Response) {
    const user: any = req.user;
    if (user.canEdit) {
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
    } else {
        res.redirect('/');
    }
}

function handleEditor(req: express.Request, res: express.Response) {
    const user: any = req.user;
    if (user.canEdit) {
        if ('id' in req.body) {
            let id = req.body.id;
            id = cleanID(id);
            if (storage.checkFolderExists(id, 'ARO-Studios')) {
                res.render('editor', {
                    Version,
                    origId: id
                });
            } else {
                send404(req, res, "Path problem!", "Folder not found");
            }
        } else {
            send404(req, res, "Path problem!", "ID parameter not set");
        }
    } else {
        res.redirect('/');
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
        Version,
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
            Version
        });
    } else {
        res.redirect('/')
    }
}

function sendLogin(req: express.Request, res: express.Response) {
    res.render('login.ejs', {
        Version
    });
}

function send404(req: express.Request, res: express.Response, error: string, reason: string) {
    res.render('404', {
        Version,
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

function checkCanEdit(req: express.Request, res: express.Response, handle: Function) {
    const user: any = req.user;
    if (user.canEdit) {
        handle(req, res);
    } else {
        res.redirect('/');
    }
}

export default { init, sendIndex, sendSelection, sendExperiment, sendHelp, handle404, sendNewFolder, sendNewExperiment, handleNewExperiment, handleNewFolder, handleImport, handleEditor, handleLogout, sendRegister, sendLogin };