import ConfigFile from 'config';
import CM from './modules/consoleModule';

// --------------------------------------------------------------------------------------
// Config File Class
// --------------------------------------------------------------------------------------
export class CConfig {
    public version: string;
    public db: { host: string; user: string; password: string; database: string; };
    public server: { port: number; sessionSecret: string };

    constructor() {
        this.version = this.getVersion();
        this.db = this.getDBConfig();
        this.server = this.getServer();
    }

    private getVersion(): string | 'Version unknown' {
        if (ConfigFile.has('version')) {
            return ConfigFile.get('version');
        } else {
            CM.error('No versionnumber defined in config!');
            return 'Version unknown';
        }
    }

    private getDBConfig(): { host: string; user: string; password: string; database: string; } {
        if (ConfigFile.has('db')) {
            return ConfigFile.get('db');
        } else {
            CM.error('No database access defined in config!');
            return { host: '127.0.0.1', user: 'root', password: '', database: 'atomani', };
        }
    }

    private getServer(): { port: number; sessionSecret: string } {
        if (ConfigFile.has('server')) {
            return ConfigFile.get('server');
        } else {
            CM.error('No server settings defined in config!');
            return { port: 80, sessionSecret: "secret" };
        }
    }
}
