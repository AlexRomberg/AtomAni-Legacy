import express from 'express';
import { CDatabase } from './CDatabase';
import { CPages } from './CPages';
import { CStorage } from './CStorage';
import { CValidation } from './CValidation';


export class CAPI {
    private Pages: CPages;
    private Database: CDatabase;
    private Validation: CValidation;
    private Storage: CStorage;

    constructor(pages: CPages, database: CDatabase, storage: CStorage) {
        this.Pages = pages;
        this.Database = database;
        this.Storage = storage;
        this.Validation = new CValidation();
    }

    public async createFolder(req: express.Request, res: express.Response) {
        // @ts-ignore
        const orgId = this.Validation.cleanInput(req.user.OrgId, this.Validation.Regex.organisation.id);
        const parentFolderId = this.Validation.cleanInput(req.query.folder!.toString(), this.Validation.Regex.folder.id);
        const folderName = this.Validation.cleanInput(req.query.name!.toString(), this.Validation.Regex.folder.name);

        try {
            const folder = await this.Database.getFolder(parentFolderId);
            if (folder !== null && folder.OrgId === orgId) {
                this.Database.addFolder(folderName, orgId, parentFolderId);
            } else {
                this.Pages.send404(req, res, "Folder not found!", "Couldn't create Folder, because parentfolder does not exit!");
            }
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        } catch {
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        }
    }

    public async renameFolder(req: express.Request, res: express.Response) {
        // @ts-ignore
        const orgId = this.Validation.cleanInput(req.user.OrgId, this.Validation.Regex.organisation.id);
        const folderId = this.Validation.cleanInput(req.params.folder!.toString(), this.Validation.Regex.folder.id);
        const folderName = this.Validation.cleanInput(req.query.name!.toString(), this.Validation.Regex.folder.name);

        try {
            const Folder = await this.Database.getFolder(folderId);
            if (Folder !== null && Folder.OrgId === orgId) {
                this.Database.updateFolder(folderId, folderName, Folder.FoldIcon, Folder.ParentFoldId.toString(), orgId);
            } else {
                this.Pages.send404(req, res, "Folder not found!", "Couldn't create folder, because parentfolder does not exit!");
            }
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        } catch {
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        }
    }

    public async deleteFolder(req: express.Request, res: express.Response) {
        // @ts-ignore
        const orgId = this.Validation.cleanInput(req.user.OrgId, this.Validation.Regex.organisation.id);
        const folderId = this.Validation.cleanInput(req.params.folder!.toString(), this.Validation.Regex.folder.id);

        try {
            const folder = await this.Database.getFolder(folderId);
            if (folder !== null && folder.OrgId === orgId) {
                const items = await this.Database.getFolderItems(folderId);
                if (items.experiments.length === 0 && items.folders.length === 0) {
                    this.Database.removeFolder(folderId);
                } else {
                    this.Pages.send404(req, res, "Folder not empty!", "You must delete all subitems to delete a folder.");
                }
            } else {
                this.Pages.send404(req, res, "Folder not found!", "Couldn't create folder, because parentfolder does not exit!");
            }
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        } catch {
            res.redirect(req.headers.referer ? req.headers.referer : "/");
        }
    }

    public async createExperiment(req: express.Request, res: express.Response) {
        // @ts-ignore
        const orgId = this.Validation.cleanInput(req.user.OrgId, this.Validation.Regex.organisation.id);
        const parentFolderId = this.Validation.cleanInput(req.body.id, this.Validation.Regex.folder.id);
        const experimentName = this.Validation.cleanInput(req.body.name, this.Validation.Regex.experiment.name);
        const data = JSON.parse(req.body.data);

        try {
            const folder = await this.Database.getFolder(parentFolderId);
            if (folder !== null && folder.OrgId === orgId) {
                const id = this.Storage.writeExperimentfile(data)
                this.Database.addExperiment(experimentName, id, true, parentFolderId);
                res.redirect(parentFolderId ? `/selection/${parentFolderId}` : req.headers.referer!);
            } else {
                this.Pages.send404(req, res, "Folder not found!", "Couldn't create experiment, because parentfolder does not exit!");
            }
        } catch {
            this.Pages.send404(req, res, 'Can\'t create file!', "There was a Problem while saving your experiment.");
        }
    }
}
