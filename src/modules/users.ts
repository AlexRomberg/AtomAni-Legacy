// experiments.ts
//--------------------------------------------------------
// custom Node.js module to handle users
//
// © Alexander Romberg @ KFTG (IMS)
//--------------------------------------------------------

import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import bcrypt from 'bcrypt';
import express from 'express';

interface user {
    id: string;
    name: string;
    username: string;
    password: string;
    canEdit: boolean;
    isAdmin: boolean;
    organisation: string;
}

const DB = new JsonDB(new Config("src/data/AtomAniUsers", true, true, '/'));

function createOrganisation(name: string): void {
    name = cleanOrganisationname(name);
    if (!organisationExists(name)) {
        DB.push(`/${name}/`, []);
    } else {
        throw new Error("Organisationname already exists!");
    }
}

function deleteOrganisation(name: string): void {
    name = cleanOrganisationname(name);
    if (organisationExists(name)) {
        DB.delete(`/${name}`);
    } else {
        throw new Error("Organisationname does not exist!");
    }
}

function createUser(name: string, username: string, password: string, canEdit: boolean, isAdmin: boolean, organisation: string): void {
    organisation = cleanOrganisationname(organisation);
    if (organisationExists(organisation)) {
        if (!userExists(username, organisation)) {
            bcrypt.hash(password, 10).then((pwHash) => { DB.push(`/${organisation}[]`, { id: `${organisation}|${username}`, name, username, password: pwHash, isAdmin, canEdit }) });
        } else {
            throw new Error("User does already exist!");
        }
    } else {
        throw new Error("Organisationname does not exist!");
    }
}

function deleteUser(username: string, organisation: string): void {
    organisation = cleanOrganisationname(organisation);
    if (organisationExists(organisation)) {
        if (userExists(username, organisation)) {
            const id = DB.getIndex(`/${organisation}`, username);
            DB.delete(`/${organisation}[${id}]`);
        } else {
            throw new Error("User does not exist!");
        }
    } else {
        throw new Error("Organisationname does not exist!");
    }
}

function getUserByName(username: string, organisation: string): user | null {
    if (organisationExists(organisation)) {
        const userId = DB.getIndex(`/${organisation}`, `${organisation}|${username}`);
        let user: any = DB.getObject(`/${organisation}[${userId}]`);
        user.organisation = organisation;
        return user;
    } else {
        return null;
    }
}

function getUserById(id: string): user | null {
    const idParams = id.split('|');
    const organisation = idParams.shift();

    if (organisationExists(organisation!)) {
        const userId = DB.getIndex(`/${organisation}`, id);
        let user: any = DB.getObject(`/${organisation}[${userId}]`);
        user.organisation = organisation;
        return user;
    } else {
        return null;
    }
}

function cleanOrganisationname(name: string): string {
    name.replace(/[^a-zA-Z-_]/gm, '');
    return name;
}

function organisationExists(name: string): boolean {
    return DB.exists(`/${name}`);
}

function userExists(username: string, organisation: string): boolean {
    const id = DB.getIndex(`/${organisation}`, `${organisation}|${username}`);
    return id > -1;
}

function checkAuthenticated(req: express.Request, res: express.Response, next: Function) {
    if (req.isAuthenticated()) {
        next();
    } else {
        if (req.baseUrl === "") {
            res.render('welcome');
        } else {
            res.redirect('/welcome');
        }
    }
}

function checkNotAuthenticated(req: express.Request, res: express.Response, next: Function) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        next();
    }
}

function clear(): void {
    DB.delete('/');
}

export default { createOrganisation, deleteOrganisation, createUser, deleteUser, getUserByName, getUserById, organisationExists, checkAuthenticated, checkNotAuthenticated, clear };