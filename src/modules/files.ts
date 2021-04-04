import fs from 'fs';

function createExperiment(json: string, id: string) {
    fs.writeFileSync(`${__dirname}/../data/experiments/${id}.json`, JSON.stringify(JSON.parse(json), null, 2), { encoding: "utf-8" });
}

export default { createExperiment };