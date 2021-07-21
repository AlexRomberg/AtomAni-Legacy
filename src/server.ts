// imports
import CM from './modules/consoleModule'
import { CConfig } from './CConfig';
import { CDatabase } from './CDatabase';
import { CServer } from './CServer';

// Console output
console.clear();
CM.log('green', `Starting Server...`);
CM.log('green', `Modules loaded`);

// init classes
const Config = new CConfig();
const DB = new CDatabase(Config.db);
DB.setup(runServer).catch((err: Error) => { CM.error(err.message); process.exit(10) });

// Main Programm
function runServer() {
    CM.log('green', 'Server started!\n----------------------------------------------------');
    CM.log('cyan', `Version: ${Config.version}`);
    CM.log('blue', `running at: http://localhost:${Config.server.port}`);

    const Server = new CServer(DB, Config);
    Server.initPagelisteners();
}
