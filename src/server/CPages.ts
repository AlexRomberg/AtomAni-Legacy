import CM from './modules/consoleModule';
import help from './modules/helpMarkdown';
import { CValidation } from './CValidation';
import express from 'express';
import { CDatabase } from './CDatabase';
import { CStorage } from './CStorage';

export class CPages {
    private Version: string;
    private Validation: CValidation;
    private Database: CDatabase;
    private Storage: CStorage;

    constructor(version: string, database: CDatabase) {
        this.Version = version;
        this.Validation = new CValidation();
        this.Database = database;
        this.Storage = new CStorage(`${__dirname}/data`); // make dynamic
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
        let query = req.params.id?.toString()!;

        if (query.match(/^[0-9a-f]{32}$/) !== null) {
            try {
                const scriptParams = this.Storage.loadExperimentParams(query);
                res.render('experiment', {
                    Version: this.Version,
                    scriptParams
                });
            } catch {
                this.send404(req, res, "Experiment not found!", "experiment file not found.");
            }
        } else {
            this.send404(req, res, "Experiment not found!", "ID does not match format. (32 hexadecimal digits)");
        }
    }

    public async sendEditor(req: express.Request, res: express.Response) {
        if ('id' in req.params) {
            let id = req.params.id;
            this.Validation.cleanInput(id, this.Validation.Regex.folder.id);
            if (this.Database.getFolder(id) !== null) {
                res.render('editor', {
                    Version: this.Version,
                    origId: id
                });
            } else {
                this.send404(req, res, "Path problem!", "Folder not found");
            }
        } else {
            this.send404(req, res, "Path problem!", "ID parameter not set");
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

    public async handleLogout(req: express.Request, res: express.Response) {
        req.logOut();
        res.redirect('/welcome');
    }

    public async sendLogin(req: express.Request, res: express.Response) {
        res.render('login', {
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

    public async handle404(req: express.Request, res: express.Response) {
        if (req.path == '/favicon.ico') {
            res.redirect('/res/favicon/favicon.ico');
        } else {
            CM.log("red", "unknown request: " + req.path);
            this.send404(req, res, 'Page not found!', 'Check your link or try opening the page through the selection menu.');
        }
    }

    // help functions
    private prepareContentArray(input: { folders: { FoldId: number; FoldIcon: string; FoldName: string; ParentFoldId: number; OrgId: string }[]; experiments: { ExpId: number; ExpName: string; ExpHash: string; ExpIcon: string; ExpDeletable: boolean; FoldId: number }[] }): { name: string; imagename: string; redirect: string }[] {
        let cards: { name: string; imagename: string; redirect: string }[] = [];
        input.folders.forEach(folder => {
            console.log(folder.FoldIcon);

            cards.push({ name: folder.FoldName, imagename: folder.FoldIcon === null ? "exampleGroup.svg" : folder.FoldIcon, redirect: `/selection/${folder.FoldId}` });
        });
        input.experiments.forEach(experiment => {
            cards.push({ name: experiment.ExpName, imagename: experiment.ExpIcon === null ? "exampleExperiment.svg" : experiment.ExpIcon, redirect: `/experiment/${experiment.ExpHash}` });
        });
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

export class CAPI {
    private Pages: CPages;
    private Database: CDatabase;
    private Validation: CValidation;

    constructor(pages: CPages, database: CDatabase) {
        this.Pages = pages;
        this.Database = database;
        this.Validation = new CValidation();
    }

    public async createFolder(req: express.Request, res: express.Response) {
        // @ts-ignore
        const OrgId = this.Validation.cleanInput(req.user.OrgId, this.Validation.Regex.organisation.id);
        const ParentFolderId = this.Validation.cleanInput(req.query.folder!.toString(), this.Validation.Regex.folder.id);
        const FolderName = this.Validation.cleanInput(req.query.name!.toString(), this.Validation.Regex.folder.name);

        try {
            const Folder = await this.Database.getFolder(ParentFolderId);
            if (Folder !== null && Folder.OrgId === OrgId) {
                this.Database.addFolder(FolderName, OrgId, ParentFolderId);
            } else {
                this.Pages.send404(req, res, "Folder not found!", "Couldn't create Folder, because parentfolder does not exit!")
            }
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        } catch {
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        }
    }

    public async renameFolder(req: express.Request, res: express.Response) {
        // @ts-ignore
        const OrgId = this.Validation.cleanInput(req.user.OrgId, this.Validation.Regex.organisation.id);
        const FolderId = this.Validation.cleanInput(req.params.folder!.toString(), this.Validation.Regex.folder.id);
        const FolderName = this.Validation.cleanInput(req.query.name!.toString(), this.Validation.Regex.folder.name);

        try {
            const Folder = await this.Database.getFolder(FolderId);
            if (Folder !== null && Folder.OrgId === OrgId) {
                this.Database.updateFolder(FolderId, FolderName, Folder.FoldIcon, Folder.ParentFoldId.toString(), OrgId);
            } else {
                this.Pages.send404(req, res, "Folder not found!", "Couldn't create Folder, because parentfolder does not exit!")
            }
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        } catch {
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        }
    }

    public async deleteFolder(req: express.Request, res: express.Response) {
        // @ts-ignore
        const OrgId = this.Validation.cleanInput(req.user.OrgId, this.Validation.Regex.organisation.id);
        const FolderId = this.Validation.cleanInput(req.params.folder!.toString(), this.Validation.Regex.folder.id);

        try {
            const Folder = await this.Database.getFolder(FolderId);
            if (Folder !== null && Folder.OrgId === OrgId) {
                const items = await this.Database.getFolderItems(FolderId);
                if (items.experiments.length === 0 && items.folders.length === 0) {
                    this.Database.removeFolder(FolderId);
                } else {
                    this.Pages.send404(req, res, "Folder not empty!", "You must delete all subitems to delete a folder.")
                }
            } else {
                this.Pages.send404(req, res, "Folder not found!", "Couldn't create Folder, because parentfolder does not exit!")
            }
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        } catch {
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        }
    }
}