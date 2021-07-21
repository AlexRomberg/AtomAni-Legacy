import CM from './modules/consoleModule'
import { CConfig } from './CConfig';
import { CDatabase } from './CDatabase';

const Config = new CConfig();
const DB = new CDatabase(Config.db);

CM.log("blue", `--- starting Test [${Config.version}] --------------------------------`);

DB.checkDBExists().then(result => {
    console.log("DB.notAvailable:           ", ((!result) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
});
DB.setup(runTest).then(() => {
    console.log("DB.connected:               \x1b[32m✔\x1b[0m");
}).catch(() => {
    console.log("DB.connected:               \x1b[31m❌\x1b[0m");
});

async function runTest(stdTimeout: number = 100) {
    console.log("DB.noOrganisation:         ", ((await DB.getOrganisation("ARO").then((res) => { return res === null; }).catch((err) => { CM.log("red", err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.addOrganisation [I]:    ", ((await DB.addOrganisation("ARO", "ARO-Studios").then((res) => { return true; }).catch((err) => { console.log(err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.getOrganisation:        ", ((await DB.getOrganisation("ARO").then((res) => { return JSON.stringify(res) === JSON.stringify({ OrgId: 'ARO', OrgName: 'ARO-Studios' }) }).catch((err) => { console.log(err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.addOrganisation [II]:   ", ((await DB.addOrganisation("KF", "Kantonsschule Frauenfeld").then((res) => { return true; }).catch((err) => { console.log(err); return false })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    await wait();
    console.log("DB.countOrganisations:     ", ((await DB.countOrganisations().catch((err) => { console.log(err); return false }).then((res) => { if (res !== 2) { console.log(res); } return res; }) === 2) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.searchOrganisation:     ", ((JSON.stringify((await DB.searchOrganisations("AR"))[0]) === JSON.stringify({ OrgId: 'ARO', OrgName: 'ARO-Studios' })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.noMembers:              ", ((JSON.stringify(await DB.getMembers("ARO")) === JSON.stringify([])) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.addUser [3x][1f]:       ", ((await DB.addUser('123', 'Example', '2f90jf23riojq239fjeihq23j2/$', true, false, 'ARO').then((res) => { return true; }).catch((err) => { console.log(err); return false; })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"), await wait(), ((await DB.addUser('123', 'Example', '2f90jf23riojq239fjeihq23j2/$', true, false, 'ARO').then((res) => { console.log(res); return false; }).catch((err) => { return true; })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"), await wait(), ((await DB.addUser('WE$"§$%DF', 'Test', 'DFGSERT"§$§$T§4t34t3$T3DGSeres/$', false, false, 'KF').then((res) => { return true; }).catch((err) => { console.log(err); return false; })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    await wait();
    console.log("DB.getMembers:             ", ((JSON.stringify(await DB.getMembers("KF")) === '[{"UserId":2,"UserIdentification":"WEDF","UserName":"Test","UserPW":"","UserImage":null,"UserCanEdit":0,"UserIsAdmin":0,"OrgId":"KF"}]') ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.countMembers:           ", ((await DB.countMembers("ARO") === 1) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.getUser:                ", ((JSON.stringify(await DB.getUserById('1'), null, 0) === '{"UserId":1,"UserIdentification":"123","UserName":"Example","UserPW":"","UserImage":null,"UserCanEdit":1,"UserIsAdmin":0,"OrgId":"ARO"}') ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.userExists:             ", ((await DB.userExists("123", "ARO")) === true) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m");
    console.log("DB.updateUser:             ", ((await DB.updateUser("1", "1045636", "Alex", "128", "12af34d2e2aebc324e", false, false, "ARO").catch((err) => { console.log(err); return false }).then((res) => { return true; })) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    console.log("DB.oldUserDoesNotExist:    ", ((await DB.userExists("123", "ARO")) === false) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m");
    console.log("DB.newUserDoesExist:       ", ((await DB.userExists("1045636", "ARO")) === true) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m");




    // console.log("delete User: ", DB.removeUser)
    await wait();

    await DB.drop(true);
    await wait(50);
    console.log("DB.drop:                   ", ((!await DB.checkDBExists()) ? "\x1b[32m✔\x1b[0m" : "\x1b[31m❌\x1b[0m"));
    process.exit(0);
}

async function wait(ms: number = 10) {
    await new Promise(resolve => setTimeout(resolve, ms));
    return "";
}