// imports
import CM from './modules/consoleModule'
import { CConfig } from './CConfig';
import { CDatabase } from './CDatabase';

// Console output
console.clear();
CM.log('green', `Starting Server...`);
CM.log('green', `Modules loaded`);

// init classes
const Config = new CConfig();
const DB = new CDatabase(Config.db);
DB.setup(runServer);

// Main Programm
function runServer() {
    CM.log('green', 'Server started!\n----------------------------------------------------');
    CM.log('cyan', `Version: ${Config.version}`);
    CM.log('blue', `running at: http://localhost:${Config.server.port}`);

    // DB.drop();
    // DB.addOrganisation("ARO", "ARO-Studios").catch(err => { console.log(err) });
    // DB.addOrganisation("KF", "Kantonsschule Frauenfeld").catch(err => { console.log(err) });
    // DB.getOrganisation("ARO").then(Org => { console.log(Org) });
    // DB.countOrganisations().then((count) => { console.log(count); });
    // DB.searchOrganisations("AR").then((result) => { console.log(`AR: \n`, result) });
    // DB.getMembers("ARO").then((result) => { console.log(`ARO: \n`, result) });
    // DB.getMembers("KF").then((result) => { console.log(`KF: \n`, result) });
    // DB.countMembers("ARO").then((result) => { console.log(result) });
    // DB.getUser('1').then((result) => { console.log(result) });

}
