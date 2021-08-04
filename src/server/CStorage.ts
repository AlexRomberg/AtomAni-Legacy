import fs from 'fs';
import CM from './modules/consoleModule';

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

    public writeExperimentfile(data: object): string {
        try {
            const id = this.getId();
            const filePath = `${this.DataPath}/experiments/${id}.json`;
            const dataString = JSON.stringify(data);
            fs.writeFileSync(filePath, dataString, { encoding: "utf8" });
            return id;
        } catch (error) {
            CM.error(error);
            throw new Error("Can't create File!");
        }
    }

    private getId() {
        let id = "";
        for (let i = 0; i < 32; i++) {
            id += Math.floor(Math.random() * 16).toString(16);
        }
        return id;
    }
}
