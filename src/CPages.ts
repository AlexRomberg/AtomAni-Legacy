import CM from './modules/consoleModule';
import help from './modules/helpMarkdown';
import { CValidation } from './CValidation';
import express from 'express';
import { CDatabase } from './CDatabase';

export class CPages {
    private Version: string;
    private Validation: CValidation;
    private Database: CDatabase;

    constructor(version: string, database: CDatabase) {
        this.Version = version;
        this.Validation = new CValidation();
        this.Database = database;
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
        let folderItems, cards, folder, folderID, parentFolder;

        try {
            try {
                folderID = await this.getFolderId(req);

                if (this.Validation.checkNumericBounderies(folderID, this.Validation.NumericBounderies.folder.id)) {
                    try {
                        // @ts-ignore
                        folderItems = await this.Database.getFolderItems(folderID, req.user.organisation);
                        cards = this.prepareContentArray(folderItems);
                        folder = await this.Database.getFolder(folderID);
                        parentFolder = folder.ParentFoldId;

                        res.render('selection', {
                            Version: this.Version,
                            path: folderID,
                            cards,
                            parentFolder,
                            user: req.user
                        });
                    } catch {
                        this.send404(req, res, "Folder not found!", "The folder with this ID does not exist.");
                    }
                } else {
                    this.send404(req, res, "Folder not found!", "The folder ID is outside the permittet bounderies.");
                }
            } catch (error) {
                this.send404(req, res, "Folder not found!", "This Organisation does not have a root folder.");
                return;
            }
        } catch (err) {
            CM.error(err);
            this.send404(req, res, "Folder not found!", ":( there was an internal Error");
        }
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

    // help functions
    private prepareContentArray(input: { folders: [{ FoldId: number; FoldIcon: string; FoldName: string; ParentFoldId: number; OrgId: string }?]; experiments: [{ ExpId: number; ExpName: string; ExpIcon: string; ExpDeletable: boolean; FoldId: number }?] }): [{ name: string; imagename: string; redirect: string }?] {
        let cards: [{ name: string; imagename: string; redirect: string }?] = [];
        if (input.folders !== undefined) {
            input.folders.forEach(folder => {
                cards.push({ name: folder!.FoldName, imagename: folder!.FoldIcon, redirect: `selection/${folder!.FoldId}` });
            });
        }
        if (input.experiments !== undefined) {
            input.experiments.forEach(experiment => {
                cards.push({ name: experiment!.ExpName, imagename: experiment!.ExpIcon, redirect: `experimen/${experiment!.ExpId}` });
            });
        }
        return cards;
    }

    private async getFolderId(req: express.Request): Promise<string> {
        let folderID: string;

        if ('id' in req.params) {
            folderID = req.params.id?.toString()!;
            folderID = this.Validation.cleanInput(folderID, this.Validation.Regex.folder.id);
        } else {
            // @ts-ignore
            let OrgId = req.user.OrgId;
            this.Validation.cleanInput(OrgId, this.Validation.Regex.organisation.id);
            const folder = await this.Database.getRootFolder(OrgId);

            if (folder === null) {
                throw new Error("This Organisation does not have a root folder.");
            } else {
                folderID = folder.FoldId.toString();
            }
        }

        return folderID;
    }
}
