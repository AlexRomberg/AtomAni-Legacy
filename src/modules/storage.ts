// experiments.ts
//--------------------------------------------------------
// custom Node.js module to handle experimentlibrary
//
// © Alexander Romberg @ KFTG (IMS)
//--------------------------------------------------------

import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

const DB = new JsonDB(new Config("src/data/AtomAniData", true, true, '/'));

function getExperiments(path: string, organisation: string): object[] {
    let failedRequests = 0;
    let experimentlistOrganisation: object[] = [];

    path = cleanPath(path);
    organisation = cleanOrganisationname(organisation);

    experimentlistOrganisation = convertToObjectList(DB.getData(`/experiments/${organisation}${path}`), path);

    if (failedRequests > 1) {
        throw new Error("No experiments found!");
    }

    return experimentlistOrganisation;
}

function createOrganisation(name: string): void {
    name = cleanOrganisationname(name);

    DB.push(`/experiments/${name}/`, { lastID: 0 });
}

function createExperiment(name: string, imagename: string, path: string, organisation: string): string {
    path = cleanPath(path);
    organisation = cleanOrganisationname(organisation);

    if (DB.exists(`/experiments/${organisation}${path}lastID`)) {
        const id: number = (Number)(DB.getData(`/experiments/${organisation}${path}lastID`));
        DB.push(`/experiments/${organisation}${path}lastID`, id + 1)

        const experimentId = getUniqueID();
        DB.push(`/experiments/${organisation}${path}${id}`, { name, imagename, type: "experiment", experimentId });

        return experimentId;
    } else {
        throw new Error("Can't create experiment. Path not found!");
    }
}

function createFolder(name: string, imagename: string, path: string, organisation: string): void {
    path = cleanPath(path);
    organisation = cleanOrganisationname(organisation);

    if (DB.exists(`/experiments/${organisation}${path}lastID`)) {
        const id: number = (Number)(DB.getData(`/experiments/${organisation}${path}lastID`));
        DB.push(`/experiments/${organisation}${path}lastID`, id + 1)

        DB.push(`/experiments/${organisation}${path}${id}`, { lastID: 0, name, imagename, type: "folder" });
    } else {
        throw new Error("Can't create folder. Path not found!");
    }
}

function cleanPath(path: string): string {
    if (!path.startsWith('/')) { path = '/' + path; }
    if (!path.endsWith('/')) { path = path + '/'; }

    path = path.replace(/[^0-9\/\\]/g, '');
    path = path.replace(/\\/g, '/');
    path = path.replace(/\/\//g, '/');

    return path;
}

function cleanOrganisationname(name: string): string {
    name.replace(/[^a-zA-Z-_]/gm, ''); // clean organisation string
    return name;
}

function convertToObjectList(folderContent: any, path: string): object[] {
    const length = folderContent.lastID;
    let objectList = [];

    for (let item = 0; item < length; item++) {
        if (item.toString() in folderContent) {
            objectList.push({
                name: folderContent[`${item}`].name,
                imagename: folderContent[`${item}`].imagename,
                type: folderContent[`${item}`].type,
                path: `selection${path}${item}/`,
                experimentId: folderContent[`${item}`].experimentId
            });
        } else {
            objectList.push({ type: "none" });
        }
    }

    return objectList;
}

function getUniqueID() {
    let id = '';
    for (let digit = 0; digit < 16; digit++) {
        id += (Math.random() * 16 | 0).toString(16);
    }
    return id;
}

function checkFolderExists(path: string, organisation: string): boolean {
    path = cleanPath(path);
    organisation = cleanOrganisationname(organisation);

    return DB.exists(`/experiments/${organisation}${path}lastID`);
}

function clear() {
    DB.delete('/');
    createOrganisation('general');
}

export default { getExperiments, createOrganisation, createExperiment, createFolder, cleanPath, checkFolderExists };