// #region types
type Atomtype = 'ne' | 'ar' | 'kr';
type ConfigScript = {
    charts:
    ({
        id: "fps" | "avgVel" | "pres";
        title: string;
        fillColor: string;
        lineColor: string;
    })[];
    atoms:
    ({
        type: "single";
        x: number;
        y: number;
        z: number;
        atomType: Atomtype;
    } | {
        type: "grid" | "fcc" | "fcc-aba" | "fcc-abca";
        x: number;
        y: number;
        z: number;
        width: number;
        height: number;
        depth: number;
        atomType: Atomtype;
    })[];
    walls:
    ({
        type: "box"
        style: "visual" | "force-LJ";
        x: number;
        y: number;
        z: number;
        width: number;
        height: number;
        depth: number;
    } | {
        type: "wall";
        style: "rebound" | "force-LJ";
        position: number;
        direction: "x" | "y" | "z";
    })[];
    controls:
    ({
        id: "temp";
        name: string;
    })[];
    settings: {
        initialMomentum: number;
    }
}

type Atom = {
    type: "single";
    x: number;
    y: number;
    z: number;
    atomType: Atomtype;
} | {
    type: "grid" | "fcc";
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
    atomType: Atomtype;
}

type Wall = {
    type: "box"
    style: "visual" | "force-LJ";
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
} | {
    type: "wall";
    style: "rebound" | "force-LJ";
    position: number;
    direction: "x" | "y" | "z";
}

type Vector = {
    x: number;
    y: number;
    z: number;
}

type Size = {
    width: number;
    height: number;
    depth: number;
}
//#endregion







class CAtomConfig {
    static CONST_k = 1.380658e-23;

    public AtomMass = 0.336e-25;
    public Epsilon: number;
    public Sigma = 2.79;
    public Sigma2: number;
    public AtomList: CAtom[]

    constructor() {
        this.AtomList = [];
        this.Sigma2 = Math.pow(this.Sigma, 2);
        this.Epsilon = 36.83 * CAtomConfig.CONST_k;
    }

    public async createAtom(type: Atomtype, x: number, y: number, z: number) {
        const atom: CAtom = new CAtom(type, x, y, z);
        this.AtomList.push(atom);
    }

    // patterns
    public async generateGrid(type: Atomtype, X: number, Y: number, Z: number, width: number, height: number, depth: number) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                for (let z = 0; z < depth; z++) {
                    let atom = new CAtom(type, 5 * x + X - width / 2, 5 * y + Y - height / 2, 5 * z + Z - depth / 2);
                    this.AtomList.push(atom);
                }
            }
        }
    }

    public async generateFCCGridABCA(type: Atomtype, X: number, Y: number, Z: number, width: number, height: number, depth: number) {
        // 1.122462048309 = 6th root of 2
        const forceEquilibrium = this.Sigma * 1.122462048309;
        const cubeSize = Math.sqrt((forceEquilibrium * forceEquilibrium * 4) / 2);

        for (let x = 0; x <= width; x++) {
            for (let y = 0; y <= height; y++) {
                for (let z = 0; z <= depth; z++) {
                    let atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize, cubeSize * y + Y - height / 2 * cubeSize, cubeSize * z + Z - depth / 2 * cubeSize);
                    this.AtomList.push(atom);

                    // add centered atoms
                    if (x < width && y < height) {
                        atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize + cubeSize / 2, cubeSize * y + Y - height / 2 * cubeSize + cubeSize / 2, cubeSize * z + Z - depth / 2 * cubeSize);
                        this.AtomList.push(atom);
                    }
                    if (x < width && z < depth) {
                        atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize + cubeSize / 2, cubeSize * y + Y - height / 2 * cubeSize, cubeSize * z + Z - depth / 2 * cubeSize + cubeSize / 2);
                        this.AtomList.push(atom);
                    }
                    if (y < height && z < depth) {
                        atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize, cubeSize * y + Y - height / 2 * cubeSize + cubeSize / 2, cubeSize * z + Z - depth / 2 * cubeSize + cubeSize / 2);
                        this.AtomList.push(atom);
                    }
                }
            }
        }
    }

    public async generateFCCGridABA(type: Atomtype, X: number, Y: number, Z: number, width: number, height: number, depth: number) {
        // 1.122462048309 = 6th root of 2
        // const forceEquilibrium = this.Sigma * 1.122462048309;
        const forceEquilibrium = this.Sigma * 1.059463094359;
        const distanceNextRow = Math.sqrt(forceEquilibrium * forceEquilibrium - (forceEquilibrium / 2) * (forceEquilibrium / 2));
        const zshiftNextLayer = distanceNextRow / 3;
        const heightDistanceNextLayer = Math.sqrt(distanceNextRow * distanceNextRow - zshiftNextLayer * zshiftNextLayer);

        for (let x = 0; x <= width; x++) {
            for (let y = 0; y <= height; y++) {
                for (let z = 0; z <= depth; z++) {
                    let xpos = 0, ypos = 0, zpos = 0;
                    xpos = x * forceEquilibrium;
                    ypos = y * heightDistanceNextLayer;
                    zpos = z * distanceNextRow;

                    if (y % 2 === 0) {
                        if (z % 2 === 1) {
                            xpos += forceEquilibrium / 2;
                        }
                    } else {
                        zpos -= zshiftNextLayer;
                        if (z % 2 === 0) {
                            xpos += forceEquilibrium / 2;
                        }
                    }

                    // center grid
                    xpos += X - width * forceEquilibrium / 2;
                    ypos += Y - height * heightDistanceNextLayer / 2;
                    zpos += Z - depth * distanceNextRow / 2 + zshiftNextLayer / 2; // second layer gets moved forward by zshift -> move all 1/2 zshift back


                    let atom = new CAtom(type, xpos, ypos, zpos);
                    this.AtomList.push(atom);
                }
            }
        }
    }

    public loadFromScript(script: ConfigScript) {
        this.AtomList = [];
        const atomOptions = script.atoms;
        atomOptions.forEach(atomOption => {
            switch (atomOption.type) {
                case 'single':
                    this.AtomList.push(new CAtom(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z));
                    break;
                case 'grid':
                    this.generateGrid(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z, atomOption.width, atomOption.height, atomOption.depth);
                    break;
                case 'fcc':
                case 'fcc-aba':
                    this.generateFCCGridABA(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z, atomOption.width, atomOption.height, atomOption.depth);
                    break;
                case 'fcc-abca':
                    this.generateFCCGridABCA(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z, atomOption.width, atomOption.height, atomOption.depth);
                    break;
                default:
                    console.log("unknown atom definition!");
                    break;
            }
        });
    }
}

class CAtom {
    public Type: Atomtype;
    public Velocity: Vector;
    public Position: Vector;

    constructor(type: Atomtype, x: number, y: number, z: number) {
        this.Type = type;
        this.Velocity = { x: 0, y: 0, z: 0 };
        this.Position = { x, y, z };
    }

    public applyInitialMomentum(max: number) {
        this.Velocity = { x: this.getRandomMax(max), y: this.getRandomMax(max), z: this.getRandomMax(max) };
    }

    private getRandomMax(max: number): number {
        return Math.random() * 2 * max - max;
    }
}

class CWallConfig {
    public WallList: (CWall | CBox)[];

    constructor() {
        this.WallList = [];
    }

    public loadFromScript(script: ConfigScript) {
        this.WallList = [];
        const wallOptions = script.walls;
        wallOptions.forEach(wallOption => {
            switch (wallOption.type) {
                case "box":
                    this.WallList.push(new CBox(this.WallList.length, wallOption.style, wallOption.x, wallOption.y, wallOption.z, wallOption.width, wallOption.height, wallOption.depth));
                    break;
                case "wall":
                    this.WallList.push(new CWall(this.WallList.length, wallOption.style, wallOption.direction, wallOption.position));
                    break;
                default:
                    console.log("unknown wall definition!");
                    break;
            }
        });
    }
}

class CWall {
    public Id: number;
    public Direction: 'x' | 'y' | 'z';
    public Position: number;
    public Style: "force-LJ" | "rebound";
    public Type: "wall"

    constructor(id: number, style: "force-LJ" | "rebound", direction: 'x' | 'y' | 'z', position: number) {
        this.Id = id;
        this.Direction = direction
        this.Position = position;
        this.Style = style;
        this.Type = "wall";
    }
}

class CBox {
    public Position: Vector;
    public Scale: Size;
    public Id: number;
    public Style: "force-LJ" | "visual";
    public Type: "box";

    constructor(id: number, style: "force-LJ" | "visual", x: number, y: number, z: number, width: number, height: number, depth: number) {
        this.Position = { x, y, z };
        this.Scale = { width, height, depth };
        this.Id = id;
        this.Style = style;
        this.Type = "box";
    }
}

class CSimulation {
    private AtomList: CAtom[] = [];
    private WallList: (CWall | CBox)[] = [];
    private AnimationRunning;
    private PrevTime;
    private Frame;
    private Calculation: CCalcultion;

    constructor(atomConfig: CAtomConfig) {
        this.Calculation = new CCalcultion(atomConfig, 1, 1);
        this.AnimationRunning = false;
        this.PrevTime = 0;
        this.Frame = 0;
    }

    public async addAtoms(atoms: CAtom[]) {
        atoms.forEach(atom => {
            this.AtomList.push(atom);
        });
    }

    public async addWalls(walls: (CWall | CBox)[]) {
        walls.forEach(wall => {
            this.WallList.push(wall);
        });
    }

    public async runCalculation() {
        this.Frame++;

        const timeStep = this.getTimeStep();

        // calculation
        this.Calculation.run(this.AtomList, this.WallList, timeStep);

        // chartdata
        let chartdata: { avgVel: number, pres: number, fps?: number } = this.Calculation.getChartdata();
        chartdata['fps'] = 1000 / timeStep;

        if (this.AnimationRunning) {
            this.runCalculation();
        }

        postMessage({ contentType: 'data', data: { pos: this.getAtomPositions(this.AtomList), chart: chartdata } }, TargetOrigin)
    }

    private getTimeStep(): number {
        if (this.PrevTime === 0) {
            this.PrevTime = Date.now();
        }

        let timeStep = Date.now() - this.PrevTime;
        this.PrevTime = Date.now();
        return timeStep;
    }

    public async stop() {
        this.AnimationRunning = false;
    }

    public async start() {
        this.AnimationRunning = true;
    }

    public async reset() {
        this.AnimationRunning = false;
        this.AtomList = [];
        this.WallList = [];
        this.Frame = 0;
    }

    public getAtomPositions(atomList: CAtom[]) {
        let positions: Vector[] = []
        atomList.forEach(atom => {
            positions.push(atom.Position);
        });
        return positions;
    }
}

class CCalcultion {
    private MaxDistance = 160000;
    private MaxTimestep = 25; //ms
    private Timefactor = 7e-6;
    private OldPositions: Vector[] = [];

    private AtomConfig: CAtomConfig;
    private Speed: number;
    private Temp: number;

    static AverageIDs: ['avgVel', 'pres'] = ['avgVel', 'pres'];
    private chartTmp = {
        avgVel: { x: 0, y: 0, z: 0, count: 0 },
        pres: { x: 0, y: 0, z: 0, count: 0 }
    };
    private Chartdata = {
        avgVel: 0,
        pres: 0
    };


    constructor(atomConfig: CAtomConfig, speed: number, temp: number) {
        this.AtomConfig = atomConfig;
        this.Speed = speed;
        this.Temp = temp;
    }

    public async run(atomList: CAtom[], wallList: (CWall | CBox)[], timeStep: number) {
        timeStep *= this.Speed; // change simulation speed

        if (timeStep > this.MaxTimestep) { timeStep = this.MaxTimestep; } // prevent too long timessteps
        timeStep *= this.Timefactor; // slow down simulation

        let forces = await this.getForceVectors(atomList);
        // addGravitation(forces);
        this.calculateForceWalls(wallList, atomList, forces);
        CCalcultion.AverageIDs.forEach(id => {
            this.calculateAverage(id);
        });
        this.setNewPositions(atomList, forces, timeStep);
        this.calculateReboundWalls(wallList, atomList);
    }


    private async getForceVectors(atomList: CAtom[]) {
        let forces: Vector[] = new Array(atomList.length);
        forces.fill({ x: 0, y: 0, z: 0 });

        for (let atom = 0; atom < atomList.length; atom++) {
            this.calcForceVectorsOfAtom(atomList, atom, forces);
        }

        return forces;
    }

    private calcForceVectorsOfAtom(atomList: CAtom[], atom: number, forces: Vector[]) {
        let atomPos = atomList[atom].Position;
        this.OldPositions[atom] = atomPos;

        for (let target = atom + 1; target < atomList.length; target++) {
            let targetPos = atomList[target].Position;

            let length2 = CVector.distanceSq(targetPos, atomPos);
            let distanceV = CVector.sub(targetPos, atomPos);

            if (length2 < this.MaxDistance) {
                let force = this.calcLJ(length2);
                distanceV = CVector.mul(distanceV, force);


                forces[atom] = CVector.add(forces[atom], distanceV);
                forces[target] = CVector.sub(forces[target], distanceV);
            }
        }
    }

    private calcLJ(length2: number) {
        let forcePart = this.AtomConfig.Sigma2 / length2;
        let forcePart6 = forcePart * forcePart * forcePart;
        let force = 24 * this.AtomConfig.Epsilon * (forcePart6 - 2 * forcePart6 * forcePart6);
        return force;
    }

    // Atom functions --------------------------------------
    public moveRandom(atomList: CAtom[]) {
        atomList.forEach(atom => {
            atom.Position.x += (Math.random() * 2) - 1;
            atom.Position.y += (Math.random() * 2) - 1;
            atom.Position.z += (Math.random() * 2) - 1;
        });
    }

    private setNewPositions(atomList: CAtom[], forces: Vector[], timeStep: number) {
        const tempControlValue = Number(this.Temp);
        let invAtomMass = 1 / this.AtomConfig.AtomMass;

        for (let atom = 0; atom < atomList.length; atom++) {
            // acceleration
            let acceleration = CVector.mul(forces[atom], invAtomMass);
            acceleration = CVector.mul(acceleration, timeStep);
            // velocity
            atomList[atom].Velocity = CVector.add(atomList[atom].Velocity, acceleration);

            // temperature
            let vel = CVector.copy(CVector.mul(atomList[atom].Velocity, tempControlValue));
            this.logAverage(atomList[atom].Velocity, 'avgVel');

            // positions
            vel = CVector.mul(vel, timeStep);
            atomList[atom].Position = CVector.add(atomList[atom].Position, vel);
        }
    }

    // Wall functions --------------------------------------
    private calculateForceWalls(wallList: (CWall | CBox)[], atomList: CAtom[], forces: Vector[]) {
        for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
            wallList.forEach(wall => {
                if (wall.Type === "box") {
                    if (wall.Style === 'force-LJ') {
                        this.handleLJWall(atomList, atomIndex, wall, forces);
                    }
                }
            });
        }
    }

    private calculateReboundWalls(wallList: (CWall | CBox)[], atomList: CAtom[]) {
        for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
            wallList.forEach(wall => {
                if (wall.Style == "rebound") {
                    this.handleReboundWall(atomList, atomIndex, wall);
                }
            });
        }
    }


    private handleLJWall(atomList: CAtom[], atomIndex: number, wall: CBox, forces: Vector[]) {
        let wallDistances = this.getDistances(atomList[atomIndex], wall);
        if (wallDistances) {
            let force = this.calculateWallForcesLJ(wallDistances);
            forces[atomIndex] = CVector.add(forces[atomIndex], force);
            this.logAverage(force, 'pres');
        }
    }

    private handleReboundWall(atomList: CAtom[], atomIndex: number, wall: CWall) {
        let atomDirectionalPosition = this.getAtomDirectionalPositions(atomList, atomIndex, wall);
        if (atomDirectionalPosition !== null) {
            if ((atomDirectionalPosition.old <= wall.Position && atomDirectionalPosition.new >= wall.Position) ||
                (atomDirectionalPosition.old >= wall.Position && atomDirectionalPosition.new <= wall.Position)) {
                this.setAtomReboundPositions(atomList, atomIndex, wall);
                this.changeDirection(atomList[atomIndex], wall);
            }
        }
    }

    private getAtomDirectionalPositions(atomList: CAtom[], atomIndex: number, wall: CWall) {
        switch (wall.Direction) {
            case "x":
                return { old: this.OldPositions[atomIndex].x, new: atomList[atomIndex].Position.x }
            case "y":
                return { old: this.OldPositions[atomIndex].y, new: atomList[atomIndex].Position.y }
            case "z":
                return { old: this.OldPositions[atomIndex].z, new: atomList[atomIndex].Position.z }
            default:
                return null;
        }
    }

    private setAtomReboundPositions(atomList: CAtom[], atomIndex: number, wall: CWall) {
        switch (wall.Direction) {
            case "x":
                atomList[atomIndex].Position.x = wall.Position - (atomList[atomIndex].Position.x - wall.Position);
                break;
            case "y":
                atomList[atomIndex].Position.y = wall.Position - (atomList[atomIndex].Position.y - wall.Position);
                break;
            case "z":
                atomList[atomIndex].Position.z = wall.Position - (atomList[atomIndex].Position.z - wall.Position);
                break;
        }
    }

    private changeDirection(atom: CAtom, wall: CWall) {
        switch (wall.Direction) {
            case "x":
                atom.Velocity = { x: -1 * atom.Velocity.x, y: atom.Velocity.y, z: atom.Velocity.z };
                break;
            case "y":
                atom.Velocity = { x: atom.Velocity.x, y: -1 * atom.Velocity.y, z: atom.Velocity.z };
                break;
            case "z":
                atom.Velocity = { x: atom.Velocity.x, y: atom.Velocity.y, z: -1 * atom.Velocity.z };
                break;
        }
    }

    private getDistances(atom: CAtom, wall: CBox) {
        let wallDistances = [0, 0, 0, 0, 0, 0]; // x,x,y,y,z,z  <- each direction
        wallDistances[0] = wall.Position.x - atom.Position.x;
        wallDistances[2] = wall.Position.y - atom.Position.y;
        wallDistances[4] = wall.Position.z - atom.Position.z;
        wallDistances[1] = wall.Position.x + wall.Scale.width - atom.Position.x;
        wallDistances[3] = wall.Position.y + wall.Scale.height - atom.Position.y;
        wallDistances[5] = wall.Position.z + wall.Scale.depth - atom.Position.z;
        return wallDistances;
    }

    private calculateWallForcesLJ(wallDistances: number[]) {
        let force = [0, 0, 0];
        for (let i = 0; i < force.length; i++) {
            force[i] -= this.calcLJ(wallDistances[i * 2] * wallDistances[i * 2]);
            force[i] += this.calcLJ(wallDistances[i * 2 + 1] * wallDistances[i * 2 + 1]);
        }
        return { x: force[0], y: force[1], z: force[2] };
    }

    // Chart functions --------------------------------------
    public getChartdata() {
        return this.Chartdata;
    }

    private logAverage(value: Vector, name: 'avgVel' | 'pres') {
        this.chartTmp[name].x += Math.abs(value.x);
        this.chartTmp[name].y += Math.abs(value.y);
        this.chartTmp[name].z += Math.abs(value.z);
        this.chartTmp[name].count++;
    }

    private calculateAverage(type: 'avgVel' | 'pres') {
        this.Chartdata[type] = Math.sqrt(this.chartTmp[type].x * this.chartTmp[type].x + this.chartTmp[type].y * this.chartTmp[type].y + this.chartTmp[type].z * this.chartTmp[type].z);
        this.chartTmp[type] = { x: 0, y: 0, z: 0, count: 0 };
    }
}

class CVector {
    constructor() { }

    static add(vector1: Vector, vector2: Vector) {
        return {
            x: vector1.x + vector2.x,
            y: vector1.y + vector2.y,
            z: vector1.z + vector2.z
        }
    }

    static sub(vector1: Vector, vector2: Vector) {
        return {
            x: vector2.x - vector1.x,
            y: vector2.y - vector1.y,
            z: vector2.z - vector1.z
        }
    }

    static mul(vector1: Vector, multiplyer: number) {
        return {
            x: vector1.x * multiplyer,
            y: vector1.y * multiplyer,
            z: vector1.z * multiplyer
        }
    }

    static distanceSq(vector1: Vector, vector2: Vector) {
        return (vector2.x - vector1.x) * (vector2.x - vector1.x) + (vector2.y - vector1.y) * (vector2.y - vector1.y) + (vector2.z - vector1.z) * (vector2.z - vector1.z);
    }

    static copy(vector1: Vector) {
        return {
            x: vector1.x,
            y: vector1.y,
            z: vector1.z
        }
    }
}

class CSettings {
    private initialMomentum: number = 0;
    constructor(script: ConfigScript) {
        if ('settings' in script) {
            if ('initialMomentum' in script.settings) {
                this.initialMomentum = script.settings.initialMomentum;
            }
        }
    }

    public applyInitialMomentum(atomList: CAtom[]) {
        atomList.forEach(atom => {
            atom.applyInitialMomentum(this.initialMomentum);
        });
    }
}

class CExperiment {
    private Settings: CSettings;
    private AtomConfig: CAtomConfig;
    private WallConfig: CWallConfig;
    private Simulation: CSimulation;

    constructor(script: ConfigScript) {
        this.Settings = new CSettings(script);
        this.AtomConfig = new CAtomConfig();
        this.WallConfig = new CWallConfig();
        this.Simulation = new CSimulation(this.AtomConfig);

        this.AtomConfig.loadFromScript(script);
        this.WallConfig.loadFromScript(script);
        this.Settings.applyInitialMomentum(this.AtomConfig.AtomList);

        this.Simulation.addAtoms(this.AtomConfig.AtomList);
        this.Simulation.addWalls(this.WallConfig.WallList);
    }

    public startAnimation() {
        this.Simulation.start();
    }

    public stopAnimation() {
        this.Simulation.stop();
    }

    public redraw(script: ConfigScript) {
        this.Simulation.reset();
        this.AtomConfig.loadFromScript(script);
        this.WallConfig.loadFromScript(script);
        this.Simulation.addAtoms(this.AtomConfig.AtomList);
        this.Simulation.addWalls(this.WallConfig.WallList);
    }
}

let Experiment: CExperiment;
let TargetOrigin: any;

onmessage = (e) => {
    // @ts-ignore
    TargetOrigin = e.originalTarget;
    const message: { contentType: 'cs', data: ConfigScript } | { contentType: 'cmd', data: 'start' | 'stop' } | { contentType: 'data', data: { type: 'speed' | 'temp', value: number } } = e.data;

    switch (message.contentType) {
        case "cs":
            Experiment = new CExperiment(message.data)
            break;
        case "cmd":
            if (message.data === "start") {
                Experiment.startAnimation();
            } else if (message.data === "stop") {
                Experiment.stopAnimation();
            }
            break;
        case "data":
            break;
    }
}