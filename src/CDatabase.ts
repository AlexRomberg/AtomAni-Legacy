import MariaDB from 'mariadb';
import CM from './modules/consoleModule';

// --------------------------------------------------------------------------------------
// Database Class
// --------------------------------------------------------------------------------------
export class CDatabase {
    private DBPool: MariaDB.Pool;
    private ValidationRegex = {
        organisation: {
            id: /[^a-zA-Z0-9]/g,
            name: /[^a-z0-9\u00E0-\u00FC_\-\ ]/ig
        },
        user: {
            id: /[^0-9]/g,
            identification: /[^a-zA-Z0-9]/g,
            name: /[^a-z0-9\u00E0-\u00FC_\-\ ]/ig,
            pw: /[^$0-9a-zA-Z/\.]|^.{0,59}$|^.{61,}$/g,
            imagename: /[^0-9a-f]/ig
        },
        folder: {
            id: /[^\-0-9]/g,
            name: /[^a-z0-9\u00E0-\u00FC_\-\ ]/ig,
            icon: /[^0-9a-f]/ig
        }
    };
    private DBName: string;
    private DBUser: string;

    constructor(DBConfig: { host: string; user: string; password: string; database: string; }) {
        this.DBPool = MariaDB.createPool({
            host: DBConfig.host,
            user: DBConfig.user,
            password: DBConfig.password
        });
        this.DBName = DBConfig.database;
        this.DBUser = DBConfig.user;
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
        let connection, foundDB = false;
        try {
            connection = await this.DBPool.getConnection();
            const databases = await connection.query('SHOW DATABASES;');
            databases.forEach((database: { Database: string; }) => {
                if (database.Database === this.DBName) {
                    foundDB = true;
                }
            });
            connection.end();
            return foundDB;
        } catch {
            if (connection) {
                connection.end();
            }
            return false;
        }
    }

    public async create(): Promise<void> {
        let connection;
        try {
            connection = await this.DBPool.getConnection();
            await connection.query(`CREATE SCHEMA IF NOT EXISTS ${this.DBName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TOrganisations ( OrgId VARCHAR(50) NOT NULL, OrgName VARCHAR(100) NOT NULL, PRIMARY KEY (OrgId) ) ENGINE = InnoDB;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TFolders ( FoldId INT UNSIGNED NOT NULL AUTO_INCREMENT, FoldIcon CHAR(32) NULL, FoldName VARCHAR(100) NOT NULL, ParentFoldId INT UNSIGNED NOT NULL, OrgId VARCHAR(50) NOT NULL, PRIMARY KEY (FoldId) ) ENGINE = InnoDB;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TExperiments ( ExpId INT UNSIGNED NOT NULL AUTO_INCREMENT, ExpName VARCHAR(100) NOT NULL, ExpIcon CHAR(32) NULL, ExpDeletable TINYINT NOT NULL, FoldId INT UNSIGNED NOT NULL, PRIMARY KEY (ExpId) ) ENGINE = InnoDB;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${this.DBName}.TUsers ( UserId INT UNSIGNED NOT NULL AUTO_INCREMENT, UserIdentification VARCHAR(50) NOT NULL, UserName VARCHAR(100) NOT NULL, UserPW CHAR(60) NOT NULL, UserImage CHAR(32) NULL, UserCanEdit TINYINT NOT NULL, UserIsAdmin TINYINT NOT NULL, OrgId VARCHAR(50) NOT NULL, PRIMARY KEY (UserId)) ENGINE = InnoDB;`);

            CM.info(`Created database: ${this.DBName}`);
            connection.end();
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async drop(): Promise<void> {
        let connection: MariaDB.PoolConnection;
        try {
            connection = await this.DBPool.getConnection();

            setTimeout(() => {
                connection.query(`DROP SCHEMA IF EXISTS ${this.DBName};`);
                connection.end();
                CM.error('droped Database');
            }, 10000);

            CM.log('red', 'Database will be droped in 10 Seconds. Press [ctrl]+c to prevent this action.');
        } catch (err) {
            // @ts-ignore
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    private cleanInput(input: string, regex: RegExp) {
        return input.replace(regex, '');
    }

    // ---------------------------------------------------------------------------------
    // Organisations
    // ---------------------------------------------------------------------------------
    //#region

    public async addOrganisation(id: string, name: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.organisation.id);
        name = this.cleanInput(name, this.ValidationRegex.organisation.name);

        if (await this.getOrganisation(id) === null) {
            try {
                connection = await this.DBPool.getConnection();
                await connection.query(`INSERT INTO ${this.DBName}.TOrganisations (OrgId, OrgName) VALUES ('${id}','${name}');`);

                CM.info(`added organisation:\n ╭ id:   ${id}\n ╰ name: ${name}`);
                connection.end();
            } catch (err) {
                if (connection) {
                    connection.end();
                }
                throw err;
            }
        } else {
            throw new Error(`Organisation with ID '${id}' already exist!`);
        }
    }

    public async getOrganisation(id: string): Promise<{ OrgId: string; OrgName: string; } | null> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.organisation.id);

        try {
            connection = await this.DBPool.getConnection();
            const organisation = await connection.query(`SELECT * FROM ${this.DBName}.TOrganisations WHERE OrgId = '${id}'`);
            connection.end();
            return organisation[0] === undefined ? null : organisation[0];
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async countOrganisations(): Promise<number> {
        let connection;

        try {
            connection = await this.DBPool.getConnection();
            const organisations = await connection.query(`SELECT count(*) AS count FROM ${this.DBName}.TOrganisations`);
            connection.end();
            return organisations[0].count;
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async searchOrganisations(searchterm: string): Promise<[{ OrgId: string; OrgName: string; }]> {
        let connection;
        searchterm = this.cleanInput(searchterm, this.ValidationRegex.organisation.name);

        try {
            connection = await this.DBPool.getConnection();
            let organisations = await connection.query(`SELECT * FROM ${this.DBName}.TOrganisations WHERE (OrgId LIKE '%${searchterm}%') OR (OrgName LIKE '%${searchterm}%') OR (OrgId SOUNDS LIKE '%${searchterm}%') OR (OrgName SOUNDS LIKE '%${searchterm}%')`);
            connection.end();
            delete organisations['meta'];
            return organisations;
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async updateOrganisation(id: string, name: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.organisation.id);
        name = this.cleanInput(name, this.ValidationRegex.organisation.name);

        if (await this.getOrganisation(id) !== null) {
            try {
                connection = await this.DBPool.getConnection();
                await connection.query(`UPDATE ${this.DBName}.TOrganisations SET OrgName = '${name}' WHERE OrgId = '${id}';`);
                connection.end();
            } catch (err) {
                if (connection) {
                    connection.end();
                }
                throw err;
            }
        } else {
            throw new Error(`Organisation with ID '${id}' does not exist!`);
        }
    }

    public async removeOrganisation(id: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.organisation.id);
        if (await this.countMembers(id) <= 1) {
            try {
                connection = await this.DBPool.getConnection();
                await connection.query(`REMOVE FROM ${this.DBName}.TOrganisations WHERE OrgId = ${id};`);
                connection.end();
            } catch (err) {
                if (connection) {
                    connection.end();
                }
                throw err;
            }
        } else {
            throw new Error("organisation has users");
        }
    }

    public async getMembers(id: string): Promise<[{ UserId: number; UserIdentification: string; UserName: string; UserImagename: string; UserCanEdit: boolean; UserIsAdmin: boolean; OrgId: string; }]> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.organisation.id);

        try {
            connection = await this.DBPool.getConnection();
            let users = await connection.query(`SELECT * FROM ${this.DBName}.TUsers WHERE OrgId = '${id}';`);
            delete users['meta'];
            connection.end();
            return users;
        } catch (err) {
            if (connection) {
                connection.end();

            }
            throw err;
        }
    }

    public async countMembers(id: string): Promise<number> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.organisation.id);

        try {
            connection = await this.DBPool.getConnection();
            let users = await connection.query(`SELECT count(*) as count FROM ${this.DBName}.TUsers WHERE OrgId = '${id}';`);
            connection.end();
            return users[0].count;
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }
    //#endregion

    // ---------------------------------------------------------------------------------
    // Users
    // ---------------------------------------------------------------------------------
    //#region
    public async addUser(identification: string, name: string, pw: string, canEdit: boolean, isAdmin: boolean, orgId: string): Promise<void> {
        let connection;
        identification = this.cleanInput(identification, this.ValidationRegex.user.identification);
        name = this.cleanInput(name, this.ValidationRegex.user.name);
        pw = this.cleanInput(pw, this.ValidationRegex.user.pw);
        orgId = this.cleanInput(orgId, this.ValidationRegex.organisation.id);
        canEdit = canEdit === true;
        isAdmin = isAdmin === true;

        if (await this.getOrganisation(orgId) !== null) {
            if (!await this.userExists(identification, orgId)) {
                try {
                    connection = await this.DBPool.getConnection();
                    await connection.query(`INSERT INTO ${this.DBName}.TUsers (UserIdentification, UserName, UserPW, UserCanEdit, UserIsAdmin, OrgId) VALUES ('${identification}','${name}', '${pw}', ${canEdit}, ${isAdmin}, '${orgId}');`);
                    connection.end();
                } catch (err) {
                    if (connection) {
                        connection.end();
                    }
                    throw err;
                }
            } else {
                throw new Error(`User with ID '${identification}' does already exist in this organisation`);
            }
        } else {
            throw new Error(`Organisation with ID '${orgId}' does not exist!`);
        }
    }

    public async getUser(id: string): Promise<{ UserId: number; UserIdentification: string; UserName: string; UserPW: string; UserImage: string; UserCanEdit: boolean; UserIsAdmin: boolean; OrgId: string }> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.user.id);

        try {
            connection = await this.DBPool.getConnection();
            const user = await connection.query(`SELECT * FROM ${this.DBName}.TUsers WHERE UserId = '${id}'`);
            connection.end();
            return user[0];
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async userExists(identification: string, orgId: string): Promise<boolean> {
        let connection;
        identification = this.cleanInput(identification, this.ValidationRegex.user.identification);
        orgId = this.cleanInput(orgId, this.ValidationRegex.organisation.id);

        try {
            connection = await this.DBPool.getConnection();
            const usercount = await connection.query(`SELECT count(*) as count FROM ${this.DBName}.TUsers WHERE UserIdentification = '${identification}' AND OrgId = '${orgId}'`);
            connection.end();
            return usercount[0].count > 0;
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async updateUser(id: string, identification: string, name: string, pw: string, imageName: string, canEdit: boolean, isAdmin: boolean, orgId: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.user.id);
        identification = this.cleanInput(identification, this.ValidationRegex.user.identification);
        name = this.cleanInput(name, this.ValidationRegex.user.name);
        pw = this.cleanInput(pw, this.ValidationRegex.user.pw);
        imageName = this.cleanInput(imageName, this.ValidationRegex.user.imagename);
        orgId = this.cleanInput(orgId, this.ValidationRegex.organisation.id);
        canEdit = canEdit === true;
        isAdmin = isAdmin === true;

        if (await this.getOrganisation(orgId) !== null) {
            if (await this.getUser(id) !== null) {
                try {
                    connection = await this.DBPool.getConnection();
                    await connection.query(`UPDATE ${this.DBName}.TUsers SET UserIdentification = '${identification}', UserName = '${name}', UserPW = '${pw}', UserImage = '${imageName}', UserCanEdit = ${canEdit}, UserIsAdmin = ${isAdmin}, OrgId = '${orgId}' WHERE UserId = ${id}`);
                    connection.end();
                } catch (err) {
                    if (connection) {
                        connection.end();
                    }
                    throw err;
                }
            } else {
                throw new Error(`User with ID '${id}' does not exist in this organisation`);
            }
        } else {
            throw new Error(`Organisation with ID '${orgId}' does not exist!`);
        }
    }

    public async updateUserImage(id: string, imageName: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.user.id);
        imageName = this.cleanInput(imageName, this.ValidationRegex.user.imagename);

        if (await this.getUser(id) !== null) {
            try {
                connection = await this.DBPool.getConnection();
                await connection.query(`UPDATE ${this.DBName}.TUsers SET UserImage = '${imageName}' WHERE UserId = ${id}`);
                connection.end();
            } catch (err) {
                if (connection) {
                    connection.end();
                }
                throw err;
            }
        } else {
            throw new Error(`User with ID '${id}' does not exist in this organisation`);
        }
    }

    public async removeUser(id: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.user.id);

        try {
            connection = await this.DBPool.getConnection();
            await connection.query(`REMOVE FROM ${this.DBName}.TUsers WHERE UserId = '${id}'`);
            connection.end();
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }
    //#endregion

    // ---------------------------------------------------------------------------------
    // Folders
    // ---------------------------------------------------------------------------------
    //#region
    public async addFolder(name: string, orgId: string, parentFolder: string): Promise<void> {
        let connection;
        name = this.cleanInput(name, this.ValidationRegex.folder.name);
        orgId = this.cleanInput(orgId, this.ValidationRegex.organisation.id);
        parentFolder = this.cleanInput(parentFolder, this.ValidationRegex.folder.id);

        if (await this.getOrganisation(orgId) !== null) {
            if (parentFolder === '-1' || await this.getFolder(parentFolder) !== null) {
                try {
                    connection = await this.DBPool.getConnection();
                    await connection.query(`INSERT INTO ${this.DBName}.TFolders (FoldName, ParentFoldId, OrgId) VALUES ('${name}', '${parentFolder}', '${orgId}');`);
                    connection.end();
                } catch (err) {
                    if (connection) {
                        connection.end();
                    }
                    throw err;
                }
            } else {
                throw new Error(`Parentfold with ID '${parentFolder}' does not exist in this organisation!`);
            }
        } else {
            throw new Error(`Organisation with ID '${orgId}' does not exist!`);
        }
    }

    public async getFolder(id: string): Promise<{ FoldId: number; FoldIcon: string; FoldName: string; ParentFoldId: number; OrgId: string }> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.user.id);

        try {
            connection = await this.DBPool.getConnection();
            const folder = await connection.query(`SELECT * FROM ${this.DBName}.TFolders WHERE FoldId = '${id}'`);
            return folder[0];
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async updateFolder(id: string, name: string, icon: string, parentFolder: string, orgId: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.folder.id);
        name = this.cleanInput(name, this.ValidationRegex.folder.name);
        icon = this.cleanInput(icon, this.ValidationRegex.folder.icon);
        parentFolder = this.cleanInput(parentFolder, this.ValidationRegex.folder.id);
        orgId = this.cleanInput(orgId, this.ValidationRegex.organisation.id);

        if (await this.getOrganisation(orgId) !== null) {
            if (await this.getFolder(id) !== null) {
                if (await this.getFolder(parentFolder) !== null) {
                    try {
                        connection = await this.DBPool.getConnection();
                        await connection.query(`UPDATE ${this.DBName}.TFolders SET FoldName = '${name}', FoldIcon = '${icon}', ParentFoldId = '${parentFolder}', OrgId = '${orgId}' WHERE FoldId = ${id}`);
                        connection.end();
                    } catch (err) {
                        if (connection) {
                            connection.end();
                        }
                        throw err;
                    }
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
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.folder.icon);
        icon = this.cleanInput(icon, this.ValidationRegex.folder.icon);

        if (await this.getUser(id) !== null) {
            try {
                connection = await this.DBPool.getConnection();
                await connection.query(`UPDATE ${this.DBName}.TFolders SET FoldIcon = '${icon}' WHERE FoldId = ${id}`);
                connection.end();
            } catch (err) {
                if (connection) {
                    connection.end();
                }
                throw err;
            }
        } else {
            throw new Error(`Folder with ID '${id}' does not exist in this organisation`);
        }
    }

    public async getFolderItems(id: string): Promise<{ folders: [{ FoldId: number; FoldIcon: string; FoldName: string; ParentFoldId: number; OrgId: string }?], experiments: [{ ExpId: number, ExpName: string, ExpIcon: string, ExpDeletable: boolean, FoldId: number }?] }> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.user.id);

        try {
            connection = await this.DBPool.getConnection();
            const folders = await connection.query(`SELECT * FROM ${this.DBName}.TFolders WHERE ParentFoldId = '${id}'`);
            const experiments = await connection.query(`SELECT * FROM ${this.DBName}.TExperiments WHERE FoldId = '${id}'`);
            delete folders['meta'];
            delete experiments['meta'];

            return { folders, experiments };
        } catch (err) {
            if (connection) {
                connection.end();
            }
            throw err;
        }
    }

    public async removeFolder(id: string): Promise<void> {
        let connection;
        id = this.cleanInput(id, this.ValidationRegex.user.id);
        const folderItems = await this.getFolderItems(id);
        if (folderItems.folders.length === 0 && folderItems.experiments.length === 0) {
            try {
                connection = await this.DBPool.getConnection();
                await connection.query(`REMOVE FROM ${this.DBName}.TFolders WHERE FoldId = '${id}'`);
                connection.end();
            } catch (err) {
                if (connection) {
                    connection.end();
                }
                throw err;
            }
        } else {
            throw new Error("Folder is not empty!");
        }
    }
    //#endregion

    // ---------------------------------------------------------------------------------
    // Experiments
    // ---------------------------------------------------------------------------------


}
