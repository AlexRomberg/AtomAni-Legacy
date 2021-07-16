// imports
import MariaDB from 'mariadb';
import ConfigFile from 'config';
import CM from './modules/consoleModule'
import { trim } from 'jquery';

// Console output
console.clear();
CM.log('green', `Starting Server...`);
CM.log('green', `Modules loaded`);


// --------------------------------------------------------------------------------------
// Database Class
// --------------------------------------------------------------------------------------
class CDatabase {
    private DBPool;

    constructor(DBConfig: { host: string, user: string, password: string, database: string }) {
        this.DBPool = MariaDB.createPool({
            host: DBConfig.host,
            user: DBConfig.user,
            password: DBConfig.password
        });
    }

    // check DatabaseExists
    //

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

    public async checkDBExists(name: string): Promise<boolean> {
        let connection, foundDB = false;
        try {
            connection = await this.DBPool.getConnection();
            const databases = await connection.query('SHOW DATABASES;');
            databases.forEach((database: { Database: string }) => {
                if (database.Database === name) {
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

    public async create(name: string) {
        let connection;
        try {
            connection = await this.DBPool.getConnection();
            await connection.query(`CREATE SCHEMA IF NOT EXISTS ${name} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${name}.TOrganisation (OrgId VARCHAR(50) NOT NULL, OrgName VARCHAR(100) NOT NULL, PRIMARY KEY (OrgId)) ENGINE = InnoDB;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${name}.TFolders (FoldId INT UNSIGNED NOT NULL AUTO_INCREMENT, FoldIcon VARCHAR(15) NULL, FoldName VARCHAR(100) NOT NULL, ParentFoldId INT UNSIGNED NOT NULL, OrgId VARCHAR(50) NOT NULL, PRIMARY KEY (FoldId)) ENGINE = InnoDB;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${name}.TExperiments (ExpId INT UNSIGNED NOT NULL AUTO_INCREMENT, ExpName VARCHAR(100) NOT NULL, ExpDeletable TINYINT NOT NULL, FoldId INT UNSIGNED NOT NULL, PRIMARY KEY (ExpId)) ENGINE = InnoDB;`);
            await connection.query(`CREATE TABLE IF NOT EXISTS ${name}.TUser (UserId INT UNSIGNED NOT NULL AUTO_INCREMENT, UserIdentification VARCHAR(50) NOT NULL, UserName VARCHAR(100) NOT NULL, UserImage VARCHAR(50) NULL, UserCanEdit TINYINT NOT NULL, UserIsAdmin TINYINT NOT NULL, OrgId VARCHAR(50) NOT NULL, PRIMARY KEY (UserId)) ENGINE = InnoDB;`);

            CM.log('green', 'Created Database');
        } catch (err) {
            if (connection) {
                connection.end();
            }

            CM.log("red", "Can't connect to or create DB. Please make sure the DB is accessable and the credentials match those of the SQL-Server.");
            process.exit(10);
        }
    }

    public async drop() {
        let connection: MariaDB.PoolConnection;
        try {
            connection = await this.DBPool.getConnection();
            setTimeout(() => {
                connection.query('DROP SCHEMA IF EXISTS atomani;');
                CM.log('red', 'droped Database');
            }, 10000);
            CM.log('red', 'Database will be droped in 10 Seconds. Press [ctrl]+c to prevent this action.');
        } catch (err) {
            throw err;
        }
    }
}

// --------------------------------------------------------------------------------------
// Config File Class
// --------------------------------------------------------------------------------------
class CConfig {
    public version: string;
    public db: { host: string, user: string, password: string, database: string };
    public server: { port: number };

    constructor() {
        this.version = this.getVersion();
        this.db = this.getDBConfig();
        this.server = this.getServer();
    }

    private getVersion(): string | 'Version unknown' {
        if (ConfigFile.has('version')) {
            return ConfigFile.get('version');
        } else {
            CM.log('red', 'No versionnumber defined in config!');
            return 'Version unknown';
        }
    }

    private getDBConfig(): { host: string, user: string, password: string, database: string } {
        if (ConfigFile.has('db')) {
            return ConfigFile.get('db');
        } else {
            CM.log('red', 'No database access defined in config!');
            return { host: '127.0.0.1', user: 'root', password: '', database: 'atomani', };
        }
    }

    private getServer(): { port: number } {
        if (ConfigFile.has('server')) {
            return ConfigFile.get('server');
        } else {
            CM.log('red', 'No server settings defined in config!');
            return { port: 80 };
        }
    }
}


// --------------------------------------------------------------------------------------
// init classes
// --------------------------------------------------------------------------------------
const Config = new CConfig();
const DB = new CDatabase(Config.db);

// --------------------------------------------------------------------------------------
// Main Programm
// --------------------------------------------------------------------------------------
DB.checkConnection().then(accessable => CM.log('yellow',`DB accessable: ${accessable}`));
DB.checkDBExists(Config.db.database).then(exists => {
    CM.log('yellow',`atomani DB exists: ${exists}`);
    if (!exists) {
        DB.create(Config.db.database).then(() => {
            DB.checkDBExists(Config.db.database).then(exists => {
                CM.log('yellow',`atomani DB exists: ${exists}`);
                run();
            });
        });
    } else {
        run();
    }
});

function run() {
    // DB.drop();

    CM.log('green', 'Server started!\n----------------------------------------------------');
    CM.log('cyan', `Version: ${Config.version}`);
    CM.log('blue', `running at: http://localhost:${Config.server.port}`);
}
