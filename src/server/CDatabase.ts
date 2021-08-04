import MariaDB from 'mariadb';
import CM from './modules/consoleModule';
import { CValidation } from './CValidation';


// --------------------------------------------------------------------------------------
// Database Class
// --------------------------------------------------------------------------------------
export class CDatabase {
    private DBPool: MariaDB.Pool;
    private DBName: string;
    private DBUser: string;
    private Validation: CValidation;

    constructor(DBConfig: { host: string; user: string; password: string; database: string; }) {
        this.DBPool = MariaDB.createPool({
            host: DBConfig.host,
            user: DBConfig.user,
            password: DBConfig.password
        });
        this.DBName = DBConfig.database;
        this.DBUser = DBConfig.user;
        this.Validation = new CValidation();
    }

    public async setup(onConnectioRunning: Function) {
        CM.info(`Connecting to DB...`);
        const accessable = await this.checkConnection();

        if (accessable) {
            CM.info(`DB accessable`);
            let exists = await this.checkDBExists();

            if (exists) {
                CM.info(`found AtomAni DB`);
                onConnectioRunning();
            } else {
                CM.warn(`AtomAni DB does not exist`);
                await this.create();
                exists = await this.checkDBExists();

                if (exists) {
                    CM.info(`found AtomAni DB`);
                    onConnectioRunning();
                } else {
                    throw new Error(`AtomAni DB still not accessable. Please validate the needed permissions for the ${this.DBUser} Database user.`);
                }
            }
        } else {
            throw new Error(`Can't connect to DB. Please make sure the DB is accessable and the credentials match those of the DB-Server.`);
        }
    }

    public async checkConnection(): Promise<boolean> {
        let connection;
        try {
            connection = await this.DBPool.getConnection();
            connection.end();
            return true;
        } catch {
            if (connection) {
                connection.end();
            }
            return false;
        }
    }

    public async checkDBExists(): Promise<boolean> {
        let databases, foundDB = false;
        databases = await this.runSQLQuerry('SHOW DATABASES;');
        databases.forEach((database: { Database: string; }) => {
            if (database.Database === this.DBName) {
                foundDB = true;
            }
        });
        return foundDB;
    }

    public async create(): Promise<void> {
        await this.runSQL(`CREATE SCHEMA IF NOT EXISTS ${this.DBName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await this.runSQL(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TOrganisations ( OrgId VARCHAR(50) NOT NULL, OrgName VARCHAR(100) NOT NULL, PRIMARY KEY (OrgId) ) ENGINE = InnoDB;`);
        await this.runSQL(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TFolders ( FoldId INT UNSIGNED NOT NULL AUTO_INCREMENT, FoldIcon CHAR(32) NULL, FoldName VARCHAR(100) NOT NULL, ParentFoldId INT NOT NULL, OrgId VARCHAR(50) NOT NULL, PRIMARY KEY (FoldId) ) ENGINE = InnoDB;`);
        await this.runSQL(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TExperiments ( ExpId INT UNSIGNED NOT NULL AUTO_INCREMENT, ExpName VARCHAR(100) NOT NULL, ExpHash CHAR(32) NOT NULL, ExpIcon CHAR(32) NULL, ExpDeletable TINYINT NOT NULL, FoldId INT UNSIGNED NOT NULL, PRIMARY KEY (ExpId) ) ENGINE = InnoDB;`);
        await this.runSQL(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TUsers ( UserId INT UNSIGNED NOT NULL AUTO_INCREMENT, UserIdentification VARCHAR(50) NOT NULL, UserName VARCHAR(100) NOT NULL, UserPW CHAR(60) NOT NULL, UserImage CHAR(32) NULL, UserCanEdit TINYINT NOT NULL, UserIsAdmin TINYINT NOT NULL, OrgId VARCHAR(50) NOT NULL, PRIMARY KEY (UserId)) ENGINE = InnoDB;`);

        CM.info(`Created database: ${this.DBName}`);
    }

    public async drop(force: boolean = false): Promise<void> {
        if (force) {
            this.runSQL(`DROP SCHEMA IF EXISTS ${this.DBName};`);
        } else {
            setTimeout(() => {
                this.runSQL(`DROP SCHEMA IF EXISTS ${this.DBName};`);
                CM.error('droped Database');
            }, 10000);

            CM.log('red', 'Database will be droped in 10 Seconds. Press [ctrl]+c to prevent this action.');
        }
    }

    private async runSQL(SQL: string) {
        let connection;
        try {
            connection = await this.DBPool.getConnection();
            await connection.query(SQL);
            connection.end();
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    private async runSQLQuerryWithMeta(SQL: string) {
        let connection;
        try {
            connection = await this.DBPool.getConnection();
            const data = await connection.query(SQL);
            connection.end();
            return data;
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    private async runSQLQuerry(SQL: string) {
        let connection;
        try {
            connection = await this.DBPool.getConnection();
            let data = await connection.query(SQL);
            delete data['meta'];
            connection.end();
            return data;
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    // ---------------------------------------------------------------------------------
    // Organisations
    // ---------------------------------------------------------------------------------
    //#region

    public async addOrganisation(id: string, name: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.organisation.id);
        name = this.Validation.cleanInput(name, this.Validation.Regex.organisation.name);

        if (await this.getOrganisation(id) === null) {
            this.runSQL(`INSERT INTO ${this.DBName}.TOrganisations (OrgId, OrgName) VALUES ('${id}','${name}');`);

            CM.info(`added organisation:\n ╭ id:   ${id}\n ╰ name: ${name}`);
        } else {
            throw new Error(`Organisation with ID '${id}' already exist!`);
        }
    }

    public async getOrganisation(id: string): Promise<{ OrgId: string; OrgName: string; } | null> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.organisation.id);

        const organisation = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TOrganisations WHERE OrgId = '${id}';`);
        return organisation[0] === undefined ? null : organisation[0];
    }

    public async countOrganisations(): Promise<number> {
        const organisations = await this.runSQLQuerry(`SELECT count(*) AS count FROM ${this.DBName}.TOrganisations;`);
        return organisations[0].count;
    }

    public async searchOrganisations(searchterm: string): Promise<[{ OrgId: string; OrgName: string; }]> {
        searchterm = this.Validation.cleanInput(searchterm, this.Validation.Regex.organisation.name);

        let organisations = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TOrganisations WHERE (OrgId LIKE '%${searchterm}%') OR (OrgName LIKE '%${searchterm}%') OR (OrgId SOUNDS LIKE '%${searchterm}%') OR (OrgName SOUNDS LIKE '%${searchterm}%');`);
        return organisations;
    }

    public async updateOrganisation(id: string, name: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.organisation.id);
        name = this.Validation.cleanInput(name, this.Validation.Regex.organisation.name);

        if (await this.getOrganisation(id) !== null) {
            this.runSQL(`UPDATE ${this.DBName}.TOrganisations SET OrgName = '${name}' WHERE OrgId = '${id}';`);
        } else {
            throw new Error(`Organisation with ID '${id}' does not exist!`);
        }
    }

    public async removeOrganisation(id: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.organisation.id);

        if (await this.countMembers(id) <= 1) {
            this.runSQL(`DELETE FROM ${this.DBName}.TOrganisations WHERE OrgId = ${id};`)
        } else {
            throw new Error("organisation has users");
        }
    }

    public async getMembers(id: string): Promise<[{ UserId: number; UserIdentification: string; UserName: string; UserImagename: string; UserCanEdit: boolean; UserIsAdmin: boolean; OrgId: string; }]> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.organisation.id);

        let users = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TUsers WHERE OrgId = '${id}';`);
        return users;
    }

    public async countMembers(id: string): Promise<number> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.organisation.id);

        let users = await this.runSQLQuerry(`SELECT count(*) as count FROM ${this.DBName}.TUsers WHERE OrgId = '${id}';`);
        return users[0].count;
    }
    //#endregion

    // ---------------------------------------------------------------------------------
    // Users
    // ---------------------------------------------------------------------------------
    //#region
    public async addUser(identification: string, name: string, pw: string, canEdit: boolean, isAdmin: boolean, orgId: string): Promise<void> {
        identification = this.Validation.cleanInput(identification, this.Validation.Regex.user.identification);
        name = this.Validation.cleanInput(name, this.Validation.Regex.user.name);
        pw = this.Validation.cleanInput(pw, this.Validation.Regex.user.pw);
        orgId = this.Validation.cleanInput(orgId, this.Validation.Regex.organisation.id);
        canEdit = canEdit === true;
        isAdmin = isAdmin === true;

        if (await this.getOrganisation(orgId) !== null) {
            if (!await this.userExists(identification, orgId)) {
                this.runSQL(`INSERT INTO ${this.DBName}.TUsers (UserIdentification, UserName, UserPW, UserCanEdit, UserIsAdmin, OrgId) VALUES ('${identification}','${name}', '${pw}', ${canEdit}, ${isAdmin}, '${orgId}');`)
            } else {
                throw new Error(`User with ID '${identification}' does already exist in this organisation`);
            }
        } else {
            throw new Error(`Organisation with ID '${orgId}' does not exist!`);
        }
    }

    public async getUserById(id: string): Promise<{ UserId: number; UserIdentification: string; UserName: string; UserPW: string; UserImage: string; UserCanEdit: boolean; UserIsAdmin: boolean; OrgId: string }> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.user.id);

        const user = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TUsers WHERE UserId = '${id}';`);
        return user[0];
    }

    public async getUserByName(identification: string, orgId: string): Promise<{ UserId: number; UserIdentification: string; UserName: string; UserPW: string; UserImage: string; UserCanEdit: boolean; UserIsAdmin: boolean; OrgId: string }> {
        identification = this.Validation.cleanInput(identification, this.Validation.Regex.user.identification);
        orgId = this.Validation.cleanInput(orgId, this.Validation.Regex.organisation.id);

        const user = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TUsers WHERE UserIdentification = '${identification}' AND OrgId = '${orgId}';`);
        return user[0];
    }

    public async userExists(identification: string, orgId: string): Promise<boolean> {
        identification = this.Validation.cleanInput(identification, this.Validation.Regex.user.identification);
        orgId = this.Validation.cleanInput(orgId, this.Validation.Regex.organisation.id);

        const usercount = await this.runSQLQuerry(`SELECT count(*) as count FROM ${this.DBName}.TUsers WHERE UserIdentification = '${identification}' AND OrgId = '${orgId}';`);
        return usercount[0].count > 0;
    }

    public async updateUser(id: string, identification: string, name: string, pw: string, imageName: string, canEdit: boolean, isAdmin: boolean, orgId: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.user.id);
        identification = this.Validation.cleanInput(identification, this.Validation.Regex.user.identification);
        name = this.Validation.cleanInput(name, this.Validation.Regex.user.name);
        pw = this.Validation.cleanInput(pw, this.Validation.Regex.user.pw);
        imageName = this.Validation.cleanInput(imageName, this.Validation.Regex.user.imagename);
        orgId = this.Validation.cleanInput(orgId, this.Validation.Regex.organisation.id);
        canEdit = canEdit === true;
        isAdmin = isAdmin === true;

        if (await this.getOrganisation(orgId) !== null) {
            if (await this.getUserById(id) !== null) {
                this.runSQL(`UPDATE ${this.DBName}.TUsers SET UserIdentification = '${identification}', UserName = '${name}', UserPW = '${pw}', UserImage = '${imageName}', UserCanEdit = ${canEdit}, UserIsAdmin = ${isAdmin}, OrgId = '${orgId}' WHERE UserId = ${id};`)
            } else {
                throw new Error(`User with ID '${id}' does not exist in this organisation`);
            }
        } else {
            throw new Error(`Organisation with ID '${orgId}' does not exist!`);
        }
    }

    public async updateUserImage(id: string, imageName: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.user.id);
        imageName = this.Validation.cleanInput(imageName, this.Validation.Regex.user.imagename);

        if (await this.getUserById(id) !== null) {
            this.runSQL(`UPDATE ${this.DBName}.TUsers SET UserImage = '${imageName}' WHERE UserId = ${id};`)
        } else {
            throw new Error(`User with ID '${id}' does not exist in this organisation`);
        }
    }

    public async removeUser(id: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.user.id);

        this.runSQL(`DELETE FROM ${this.DBName}.TUsers WHERE UserId = '${id}';`)
    }
    //#endregion

    // ---------------------------------------------------------------------------------
    // Folders
    // ---------------------------------------------------------------------------------
    //#region
    public async addFolder(name: string, orgId: string, parentFolder: string): Promise<void> {
        name = this.Validation.cleanInput(name, this.Validation.Regex.folder.name);
        orgId = this.Validation.cleanInput(orgId, this.Validation.Regex.organisation.id);
        parentFolder = this.Validation.cleanInput(parentFolder, this.Validation.Regex.folder.id);

        if (await this.getOrganisation(orgId) !== null) {
            if (parentFolder === '-1' || await this.getFolder(parentFolder) !== null) {
                this.runSQL(`INSERT INTO ${this.DBName}.TFolders (FoldIcon, FoldName, ParentFoldId, OrgId) VALUES ('exampleGroup.svg','${name}', '${parentFolder}', '${orgId}');`);
            } else {
                throw new Error(`Parentfold with ID '${parentFolder}' does not exist in this organisation!`);
            }
        } else {
            throw new Error(`Organisation with ID '${orgId}' does not exist!`);
        }
    }

    public async getFolder(id: string): Promise<{ FoldId: number; FoldIcon: string; FoldName: string; ParentFoldId: number; OrgId: string }> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.folder.id);

        const folder = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TFolders WHERE FoldId = '${id}';`);
        return folder[0];
    }

    public async getRootFolder(OrgId: string): Promise<{ FoldId: number; FoldIcon: string; FoldName: string; ParentFoldId: number; OrgId: string }> {
        OrgId = this.Validation.cleanInput(OrgId, this.Validation.Regex.organisation.id);

        const folder = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TFolders WHERE ParentFoldId = -1 AND OrgId = '${OrgId}';`);
        return folder[0];
    }

    public async updateFolder(id: string, name: string, icon: string, parentFolder: string, orgId: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.folder.id);
        name = this.Validation.cleanInput(name, this.Validation.Regex.folder.name);
        icon = this.Validation.cleanInput(icon, this.Validation.Regex.folder.icon);
        parentFolder = this.Validation.cleanInput(parentFolder, this.Validation.Regex.folder.id);
        orgId = this.Validation.cleanInput(orgId, this.Validation.Regex.organisation.id);

        if (await this.getOrganisation(orgId) !== null) {
            if (await this.getFolder(id) !== null) {
                if (await this.getFolder(parentFolder) !== null) {
                    console.log(`UPDATE ${this.DBName}.TFolders SET FoldName = '${name}', FoldIcon = '${icon}', ParentFoldId = '${parentFolder}', OrgId = '${orgId}' WHERE FoldId = ${id};`);

                    this.runSQL(`UPDATE ${this.DBName}.TFolders SET FoldName = '${name}', FoldIcon = '${icon}', ParentFoldId = '${parentFolder}', OrgId = '${orgId}' WHERE FoldId = ${id};`);
                } else {
                    throw new Error(`ParentFolder with ID '${parentFolder}' does not exist in this organisation`);
                }
            } else {
                throw new Error(`Folder with ID '${id}' does not exist in this organisation`);
            }
        } else {
            throw new Error(`Organisation with ID '${orgId}' does not exist!`);
        }
    }

    public async updateFolderImage(id: string, icon: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.folder.icon);
        icon = this.Validation.cleanInput(icon, this.Validation.Regex.folder.icon);

        if (await this.getFolder(id) !== null) {
            this.runSQL(`UPDATE ${this.DBName}.TFolders SET FoldIcon = '${icon}' WHERE FoldId = ${id};`);
        } else {
            throw new Error(`Folder with ID '${id}' does not exist in this organisation`);
        }
    }

    public async getFolderItems(id: string): Promise<{ folders: { FoldId: number; FoldIcon: string; FoldName: string; ParentFoldId: number; OrgId: string }[]; experiments: { ExpId: number; ExpName: string; ExpHash: string; ExpIcon: string; ExpDeletable: boolean; FoldId: number }[] }> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.folder.id);

        const folders = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TFolders WHERE ParentFoldId = '${id}';`);
        const experiments = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TExperiments WHERE FoldId = '${id}';`);
        return { folders, experiments };
    }

    public async removeFolder(id: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.folder.id);
        const folderItems = await this.getFolderItems(id);
        if (folderItems.folders.length === 0 && folderItems.experiments.length === 0) {
            this.runSQL(`DELETE FROM ${this.DBName}.TFolders WHERE FoldId = ${id};`);
        } else {
            throw new Error("Folder is not empty!");
        }
    }
    //#endregion

    // ---------------------------------------------------------------------------------
    // Experiments
    // ---------------------------------------------------------------------------------
    //#region
    public async addExperiment(name: string, hash: string, deletable: boolean, folder: string): Promise<void> {
        name = this.Validation.cleanInput(name, this.Validation.Regex.experiment.name);
        hash = this.Validation.cleanInput(hash, this.Validation.Regex.experiment.icon);
        folder = this.Validation.cleanInput(folder, this.Validation.Regex.folder.id);
        deletable = deletable === true;

        if (folder === '-1' || await this.getFolder(folder) !== null) {
            this.runSQL(`INSERT INTO ${this.DBName}.TExperiments (ExpName, ExpHash, ExpIcon, ExpDeletable, FoldId) VALUES ('${name}', '${hash}', 'exampleExperiment.svg', '${deletable}', '${folder}');`);
        } else {
            throw new Error(`Parentfolder with ID '${folder}' does not exist in this organisation!`);
        }
    }

    public async getExperiment(id: string): Promise<{ ExpId: number; ExpName: string; ExpHash: string; ExpIcon: string; ExpDeletable: boolean; FoldId: number }> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.experiment.id);

        const experiment = await this.runSQLQuerry(`SELECT * FROM ${this.DBName}.TExperiments WHERE ExpId = '${id}';`);
        return experiment[0];
    }

    public async updateExperiment(id: string, name: string, hash: string, icon: string, deletable: boolean, FoldId: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.experiment.id);
        name = this.Validation.cleanInput(name, this.Validation.Regex.experiment.name);
        hash = this.Validation.cleanInput(hash, this.Validation.Regex.experiment.icon);
        icon = this.Validation.cleanInput(icon, this.Validation.Regex.experiment.icon);
        FoldId = this.Validation.cleanInput(FoldId, this.Validation.Regex.folder.id);
        deletable = deletable === true;

        if (await this.getFolder(FoldId) !== null) {
            if (await this.getExperiment(id) !== null) {
                this.runSQL(`UPDATE ${this.DBName}.TExperiments SET ExpName = '${name}', ExpHash = '${hash}', ExpIcon = '${icon}', ExpDeletable = '${deletable}', FoldId = '${FoldId}' WHERE ExpId = ${id};`);
            } else {
                throw new Error(`Experiment with ID '${id}' does not exist.`);
            }
        } else {
            throw new Error(`Folder with ID '${FoldId}' does not exist in this organisation.`);
        }
    }

    public async updateExperimentImage(id: string, icon: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.experiment.id);
        icon = this.Validation.cleanInput(icon, this.Validation.Regex.experiment.icon);

        if (await this.getExperiment(id) !== null) {
            this.runSQL(`UPDATE ${this.DBName}.TExperiments SET ExpIcon = '${icon}' WHERE ExpId = ${id};`);
        } else {
            throw new Error(`Experiment with ID '${id}' does not exist.`);
        }
    }

    public async getExperimentOrganisation(id: string): Promise<{ OrgId: string }> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.experiment.id);

        const organisation = await this.runSQLQuerry(`SELECT OrgId FROM ${this.DBName}.TExperiments, ${this.DBName}.TFolders WHERE ${this.DBName}.TExperiments.ExpId = '${id}' AND ${this.DBName}.TExperiments.FoldId = ${this.DBName}.TFolders.FoldId;`);

        return organisation[0];
    }

    public async removeExperiment(id: string): Promise<void> {
        id = this.Validation.cleanInput(id, this.Validation.Regex.experiment.id);

        this.runSQL(`DELETE FROM ${this.DBName}.TExperiments WHERE ExpId = '${id}';`);
    }
    //#endregion

}
