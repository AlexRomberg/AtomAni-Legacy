import fs from "fs";

function loadExperimentParams(id: string) {
    const filePath = `${__dirname}/../data/experiments/${id}.json`;
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, { encoding: "utf8" })
        return JSON.parse(content);
    } else {
        throw new Error("ID not found!");
    }
}

export default { loadExperimentParams };