// imports
import CM from './modules/consoleModule'
import { CConfig } from './CConfig';
import { CDatabase } from './CDatabase';
import { CWebserver } from './CWebserver';

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
    // DB.addFolder("root", "ARO", "-1");

    CM.log('green', 'Server started!\n----------------------------------------------------');
    CM.log('cyan', `Version: ${Config.version}`);
    CM.log('blue', `running at: http://localhost:${Config.server.port}`);

    const Webserver = new CWebserver(DB, Config);
    Webserver.initPagelisteners();
}
