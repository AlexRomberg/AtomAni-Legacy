import CM from './modules/consoleModule'
import { CConfig } from './CConfig';
import { CDatabase } from './CDatabase';

const Config = new CConfig();
const DB = new CDatabase(Config.db);

CM.log("blue", `--- starting Test [${Config.version}] --------------------------------`);

DB.checkDBExists().then(result => {
    console.log("DB not available:          ", ((!result) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
});
DB.setup(runTest);

async function runTest() {
    console.log("no Organisation:           ", ((await DB.getOrganisation("ARO").then((res) => { return res === null; }).catch((err) => { CM.log("red", err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("creating Organisation:     ", ((await DB.addOrganisation("ARO", "ARO-Studios").then((res) => { return true; }).catch((err) => { console.log(err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("Organisation:              ", ((await DB.getOrganisation("ARO").then((res) => { return JSON.stringify(res) === JSON.stringify({ OrgId: 'ARO', OrgName: 'ARO-Studios' }) }).catch((err) => { console.log(err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("creating 2nd Organisation: ", ((await DB.addOrganisation("KF", "Kantonsschule Frauenfeld").then((res) => { return true; }).catch((err) => { console.log(err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("validating OrgCount:       ", ((await DB.countOrganisations() === 2) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("Search working:            ", ((JSON.stringify((await DB.searchOrganisations("AR"))[0]) === JSON.stringify({ OrgId: 'ARO', OrgName: 'ARO-Studios' })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("No Members:                ", ((JSON.stringify(await DB.getMembers("ARO")) === JSON.stringify([])) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("Adding Users:              ", ((await DB.addUser('123', 'Example', '2f90jf23riojq239fjeihq23j2/$', true, false, 'ARO').then((res) => { return true; }).catch((err) => { console.log(err); return false; })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"), ((await DB.addUser('123', 'Example', '2f90jf23riojq239fjeihq23j2/$', true, false, 'ARO').then((res) => { return false; }).catch((err) => { return true; })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"), ((await DB.addUser('WE$"§$%DF', 'Test', 'DFGSERT"§$§$T§4t34t3$T3DGSeres/$', false, false, 'KF').then((res) => { return true; }).catch((err) => { console.log(err); return false; })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("User Validation:           ", ((JSON.stringify(await DB.getMembers("KF")) === '[{"UserId":2,"UserIdentification":"WEDF","UserName":"Test","UserPW":"","UserImage":null,"UserCanEdit":0,"UserIsAdmin":0,"OrgId":"KF"}]') ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("User Validation count:     ", ((await DB.countMembers("ARO") === 1) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("User info validation:      ", ((JSON.stringify(await DB.getUser('1'), null, 0) === '{"UserId":1,"UserIdentification":"123","UserName":"Example","UserPW":"","UserImage":null,"UserCanEdit":1,"UserIsAdmin":0,"OrgId":"ARO"}') ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    // console.log("delete User: ", DB.removeUser)
    setTimeout(async () => {
        await DB.drop();
        setTimeout(async () => {
            console.log("DB deleted:                ", ((!await DB.checkDBExists()) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
            process.exit(0);
        }, 11000);
    }, 1000);
}
