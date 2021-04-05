import fs from 'fs';
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });

function createExperiment(json: string, id: string) {
    fs.writeFileSync(`${__dirname}/../data/experiments/${id}.json`, JSON.stringify(JSON.parse(json), null, 2), { encoding: "utf-8" });
}

function checkFile(json: string): null | any[] | undefined {
    const schema = fs.readFileSync(`${__dirname}/../../public/res/experimentSchema.json`).toString()
    const schemaObject = JSON.parse(schema);
    ajv.validate(schemaObject, JSON.parse(json));
    return ajv.errors;
}

export default { createExperiment, checkFile };