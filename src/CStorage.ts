import fs from 'fs';

export class CStorage {
    private DataPath: string;
    constructor(dataPath: string) {
        this.DataPath = dataPath;
    }

    public loadExperimentParams(id: string) {
        const filePath = `${this.DataPath}/experiments/${id}.json`;
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, { encoding: "utf8" });
            return JSON.parse(content);
        } else {
            throw new Error("ID not found!");
        }
    }
}
