import CM from './modules/consoleModule';
import help from './modules/helpMarkdown';
import express from 'express';

export class CPages {
    private Version: string;

    constructor(version: string) {
        this.Version = version;
    }

    public async sendIndex(req: express.Request, res: express.Response) {
        const user: any = req.user;
        let maxAge = 30; // Days of cookie to live
        maxAge *= 24 * 60 * 60 * 1000;
        if (req.cookies.orgname === undefined) {
            const orgname = user.OrgId;
            res.cookie('orgname', orgname, { maxAge, httpOnly: true });
        }
        if (req.cookies.username === undefined) {
            res.cookie('username', user.loginName, { maxAge, httpOnly: true });
        }

        res.render('index', {
            Version: this.Version,
            user
        });
    }

    public async sendWelcome(req: express.Request, res: express.Response) {
        res.render('welcome');
    }

    public async sendSelection(req: express.Request, res: express.Response) {
        const origPath = req.path.slice(10);
        // let path = storage.cleanPath(origPath);
        // const user: any = req.user;
        // if (origPath === path || origPath === '') {
        //     try {
        //         const experimentList = storage.getExperiments(path, user.organisation);
        //         const cards = selection.addRedirects(experimentList);
        //         res.render('selection', {
        //             Version: this.Version,
        //             path,
        //             cards,
        //             user: req.user
        //         });
        //     } catch {
        //         res.redirect(`/selection`);
        //     }
        // } else {
        //     res.redirect(`/selection${path}`);
        // }
    }

    public async sendExperiment(req: express.Request, res: express.Response) {
        // const query = req.params.id?.toString()!;
        // if (query.match(/^[0-9a-f]{16}$/) !== null) {
        //     try {
        //         const scriptParams = experiments.loadExperimentParams(query);
        //         res.render('experiment', {
        //             Version: this.Version,
        //             scriptParams
        //         });
        //     } catch {
        //         send404(req, res, "Experiment not found!", "experiment file not found.");
        //     }
        // } else {
        //     send404(req, res, "Experiment not found!", "ID does not match format. (16 hexadecimal digits)");
        // }
    }

    public async sendNewExperiment(req: express.Request, res: express.Response) {
        // const user: any = req.user;
        // if (user.canEdit) {
        //     if ('id' in req.query) {
        //         let id = req.query.id?.toString()!;
        //         id = cleanID(id);
        //         res.render('newExperiment', {
        //             Version: this.Version,
        //             origId: id
        //         });
        //     } else {
        //         send404(req, res, "Path problem!", "ID parameter not set");
        //     }
        // } else {
        //     res.redirect('/');
        // }
    }

    public async handleNewExperiment(req: express.Request, res: express.Response) {
        // const user: any = req.user;
        // if (user.canEdit) {
        //     if ('import' in req.body) {
        //         handleImport(req, res);
        //     } else if ('editor' in req.body) {
        //         handleEditor(req, res);
        //     } else if ('save' in req.body) {
        //         handleSave(req, res);
        //     } else {
        //         send404(req, res, 'Action not found!', JSON.stringify(req.body));
        //     }
        // } else {
        //     res.redirect('/');
        // }
    }

    public async sendNewFolder(req: express.Request, res: express.Response) {
        // const user: any = req.user;
        // if (user.canEdit) {
        //     if ('id' in req.query) {
        //         let id = req.query.id?.toString()!;
        //         id = cleanID(id);
        //         if (storage.checkFolderExists(id, user.organisation)) {
        //             res.render('newFolder', {
        //                 Version: this.Version,
        //                 origId: id
        //             });
        //         } else {
        //             send404(req, res, "Path problem!", "Folder not found");
        //         }
        //     } else {
        //         send404(req, res, "Path problem!", "ID parameter not set");
        //     }
        // } else {
        //     res.redirect('/');
        // }
    }

    public async handleNewFolder(req: express.Request, res: express.Response) {
        // const user: any = req.user;
        // if (user.canEdit) {
        //     if ('id' in req.body && 'name' in req.body) {
        //         const id = cleanID(req.body.id);
        //         const name = escape(req.body.name);
        //         if (storage.checkFolderExists(id, user.organisation)) {
        //             storage.createFolder(name, 'exampleGroup.svg', id, user.organisation);
        //             res.redirect(`/selection${id}`);
        //         } else {
        //             send404(req, res, "Path problem!", "Folder not found");
        //         }
        //     } else {
        //         send404(req, res, "Path problem!", "ID parameter not set");
        //     }
        // } else {
        //     res.redirect('/');
        // }
    }

    public async handleImport(req: express.Request, res: express.Response) {
        // const user: any = req.user;
        // if (user.canEdit) {
        //     if ('id' in req.body) {
        //         let id = req.body.id;
        //         id = cleanID(id);
        //         if (storage.checkFolderExists(id, user.organisation)) {
        //             res.render('import', {
        //                 Version: this.Version,
        //                 origId: id
        //             });
        //         } else {
        //             send404(req, res, "Path problem!", "Folder not found");
        //         }
        //     } else {
        //         send404(req, res, "Path problem!", "ID parameter not set");
        //     }
        // } else {
        //     res.redirect('/');
        // }
    }

    public async handleSave(req: express.Request, res: express.Response) {
        // const user: any = req.user;
        // if (user.canEdit) {
        //     if ('id' in req.body && 'name' in req.body && 'data' in req.body) {
        //         const id = cleanID(req.body.id);
        //         const name = escape(req.body.name);
        //         const data = req.body.data;
        //         // const errors = files.checkFile(data)
        //         // if (errors === null || errors === undefined) {
        //         const experimentId = storage.createExperiment(name, 'exampleExperiment.svg', id, user.organisation);
        //         files.createExperiment(data, experimentId);
        //         res.redirect(`/selection${id}`);
        //         // } else {
        //         //     let err = '';
        //         //     errors.forEach(error => { err += `${error.dataPath}: ${error.message}<br>`; });
        //         //     send404(req, res, "Script has errors!", err);
        //         // }
        //     }
        // } else {
        //     res.redirect('/');
        // }
    }

    public async handleEditor(req: express.Request, res: express.Response) {
        // const user: any = req.user;
        // if (user.canEdit) {
        //     if ('id' in req.body) {
        //         let id = req.body.id;
        //         id = cleanID(id);
        //         if (storage.checkFolderExists(id, user.organisation)) {
        //             res.render('editor', {
        //                 Version: this.Version,
        //                 origId: id
        //             });
        //         } else {
        //             send404(req, res, "Path problem!", "Folder not found");
        //         }
        //     } else {
        //         send404(req, res, "Path problem!", "ID parameter not set");
        //     }
        // } else {
        //     res.redirect('/');
        // }
    }

    public async handelDelete(req: express.Request, res: express.Response) {
        const user: any = req.user;
        if (user.canEdit) {
            console.log("Delete command", req.params.id?.toString()!);

            // storage.delete(req.params.id?.toString()!)
        }
    }

    public async sendHelp(req: express.Request, res: express.Response) {
        let html;
        try {
            html = help.getHTML();
        } catch {
            html = 'Hilfe konnte nicht geladen werden.';
        }
        res.render('help', {
            Version: this.Version,
            html
        });
    }

    public async handle404(req: express.Request, res: express.Response) {
        if (req.path == '/favicon.ico') {
            res.redirect('/res/favicon/favicon.ico');
        } else {
            CM.log("red", "unknown request: " + req.path);
            this.send404(req, res, 'Page not found!', 'Check your link or try opening the Page through the selection menu.');
        }
    }

    public async handleLogout(req: express.Request, res: express.Response) {
        req.logOut();
        res.redirect('/login');
    }

    public async sendRegister(req: express.Request, res: express.Response) {
        const user: any = req.user;
        if (user.isAdmin) {
            res.render('register', {
                Version: this.Version
            });
        } else {
            res.redirect('/');
        }
    }

    public async handleRegister(req: express.Request, res: express.Response, addUser: Function) {
        try {
            addUser(
                req.body.loginName,
                req.body.name,
                req.body.password,
                (req.body.canEdit === "on"),
                (req.body.isAdmin === "on"),
                req.body.organisation
            );
            res.redirect('/register');
        } catch (e) {
            req.flash('error', e.message);
            res.redirect('/register');
        }
    }

    public async sendLogin(req: express.Request, res: express.Response) {
        res.render('login.ejs', {
            Version: this.Version,
            cookies: req.cookies
        });
    }

    public async send404(req: express.Request, res: express.Response, error: string, reason: string) {
        res.render('404', {
            Version: this.Version,
            error,
            reason
        });
    }

    public async cleanID(id: string): Promise<string> {
        id = id.replace(/[^0-9\/]/g, '');
        if (!id.startsWith('/')) {
            id = `/${id}`;
        }
        if (!id.endsWith('/')) {
            id = `${id}/`;
        }
        return id;
    }

    public async checkCanEdit(req: express.Request, res: express.Response, handle: Function) {
        const user: any = req.user;
        if (user.canEdit) {
            handle(req, res);
        } else {
            res.redirect('/');
        }
    }
}
