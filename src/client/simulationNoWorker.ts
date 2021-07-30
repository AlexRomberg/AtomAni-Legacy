// @ts-ignore
import * as THREE from '../res/lib/three.module.js';
// @ts-ignore
import { OrbitControls } from '../res/lib/OrbitControls.js';

// import THREE from "three";


// #region types
type Atomtype = 'ne' | 'ar' | 'kr';
type ConfigScript = {
    charts: [
        {
            id: "fps" | "avgVel" | "pres";
            title: string;
            fillColor: string;
            lineColor: string;
        }?
    ];
    atoms: [
        {
            type: "single";
            x: number;
            y: number;
            z: number;
            atomType: Atomtype;
        }?,
        {
            type: "grid" | "fcc" | "fcc-aba" | "fcc-abca";
            x: number;
            y: number;
            z: number;
            width: number;
            height: number;
            depth: number;
            atomType: Atomtype;
        }?
    ];
    walls: [
        {
            type: "box"
            style: "visual" | "force-LJ";
            x: number;
            y: number;
            z: number;
            width: number;
            height: number;
            depth: number;
        }?,
        {
            type: "wall";
            style: "rebound" | "force-LJ";
            position: number;
            direction: "x" | "y" | "z";
        }?
    ];
    controls: [
        {
            id: "temp";
            name: string;
        }?
    ];
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
//#endregion

class CAtomConfig {
    static CONST_k = 1.380658e-23;
    static ATOM_COLORS: { "ne": THREE.ColorRepresentation, "ar": THREE.ColorRepresentation, "kr": THREE.ColorRepresentation } = {
        "ne": 0x009aff,
        "ar": 0x04AD00,
        "kr": 0xE8E200
    };

    public AtomMass = 0.336e-25;
    public Epsilon: number;
    public Sigma = 2.79;
    public Sigma2: number;
    public AtomList: [CAtom?]

    private Radius = 1;
    private SegmentWidth = 30;
    private SegmentHeight = 30;
    private Geometry: THREE.SphereGeometry;

    constructor() {
        this.Geometry = new THREE.SphereGeometry(this.Radius, this.SegmentWidth, this.SegmentHeight);
        this.AtomList = [];
        this.Sigma2 = Math.pow(this.Sigma, 2);
        this.Epsilon = 36.83 * CAtomConfig.CONST_k;
    }

    public async updateGeometry(radius: number, segmentWidth: number, segmentHeight: number) {
        this.Radius = radius;
        this.SegmentWidth = segmentWidth;
        this.SegmentHeight = segmentHeight;
        this.Geometry = new THREE.SphereGeometry(this.Radius, this.SegmentWidth, this.SegmentHeight);
    }

    public async createAtom(type: Atomtype, x: number, y: number, z: number) {
        const atom: CAtom = new CAtom(type, x, y, z, this.Geometry);
        this.AtomList.push(atom);
    }

    // patterns
    public async generateGrid(type: Atomtype, X: number, Y: number, Z: number, width: number, height: number, depth: number) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                for (let z = 0; z < depth; z++) {
                    let atom = new CAtom(type, 5 * x + X - width / 2, 5 * y + Y - height / 2, 5 * z + Z - depth / 2, this.Geometry);
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
                    let atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize, cubeSize * y + Y - height / 2 * cubeSize, cubeSize * z + Z - depth / 2 * cubeSize, this.Geometry);
                    this.AtomList.push(atom);

                    // add centered atoms
                    if (x < width && y < height) {
                        atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize + cubeSize / 2, cubeSize * y + Y - height / 2 * cubeSize + cubeSize / 2, cubeSize * z + Z - depth / 2 * cubeSize, this.Geometry);
                        this.AtomList.push(atom);
                    }
                    if (x < width && z < depth) {
                        atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize + cubeSize / 2, cubeSize * y + Y - height / 2 * cubeSize, cubeSize * z + Z - depth / 2 * cubeSize + cubeSize / 2, this.Geometry);
                        this.AtomList.push(atom);
                    }
                    if (y < height && z < depth) {
                        atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize, cubeSize * y + Y - height / 2 * cubeSize + cubeSize / 2, cubeSize * z + Z - depth / 2 * cubeSize + cubeSize / 2, this.Geometry);
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


                    let atom = new CAtom(type, xpos, ypos, zpos, this.Geometry);
                    this.AtomList.push(atom);
                }
            }
        }
    }

    public loadFromScript(script: ConfigScript) {
        this.AtomList = [];
        const atomOptions = script.atoms;
        atomOptions.forEach(atomOption => {
            if (atomOption !== undefined) {
                switch (atomOption.type) {
                    case 'single':
                        this.AtomList.push(new CAtom(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z, this.Geometry));
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
            }
        });
    }
}

class CAtom {
    private Color: THREE.ColorRepresentation;
    private Material: THREE.MeshPhongMaterial;
    public Object: THREE.Mesh;
    public Type: Atomtype;
    public Velocity: THREE.Vector3;

    constructor(type: Atomtype, x: number, y: number, z: number, geometry: THREE.SphereGeometry) {
        this.Color = CAtomConfig.ATOM_COLORS[type];
        this.Material = new THREE.MeshPhongMaterial({ color: this.Color });
        this.Object = new THREE.Mesh(geometry, this.Material);
        this.Type = type;
        this.Velocity = new THREE.Vector3(0, 0, 0);
        this.Object.position.set(x, y, z);
    }

    public applyInitialMomentum(max: number) {
        this.Velocity = new THREE.Vector3(this.getRandomMax(max), this.getRandomMax(max), this.getRandomMax(max));
    }

    private getRandomMax(max: number): number {
        return Math.random() * 2 * max - max;
    }
}

class CWallConfig {
    static WALL_COLOR: THREE.ColorRepresentation = 0xffffff;
    static LINE_WIDTH: number = 2;

    public WallList: [CWall?, CBox?];

    constructor() {
        this.WallList = [];
    }

    public loadFromScript(script: ConfigScript) {
        this.WallList = [];
        const wallOptions = script.walls;
        wallOptions.forEach(wallOption => {
            if (wallOption !== undefined) {
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
    public Object: THREE.LineSegments;
    public Position: THREE.Vector3;
    public Scale: THREE.Vector3;
    public Id: number;
    public Style: "force-LJ" | "visual";
    public Type: "box";

    constructor(id: number, style: "force-LJ" | "visual", x: number, y: number, z: number, width: number, height: number, depth: number) {
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const geo = new THREE.EdgesGeometry(boxGeo);
        const mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const lineSeg = new THREE.LineSegments(geo, mat);

        lineSeg.position.x = x + width / 2;
        lineSeg.position.y = y + height / 2;
        lineSeg.position.z = z + depth / 2;

        this.Object = lineSeg;
        this.Position = new THREE.Vector3(x, y, z);
        this.Scale = new THREE.Vector3(width, height, depth);
        this.Id = id;
        this.Style = style;
        this.Type = "box";
    }
}

class CChart {
    static MAX_POINTS = 50;
    public Chart: any;
    public Id: string;

    private Type: string;
    private Data: { datasets: [{ data: [number?], borderColor: string, backgroundColor: string }], labels: [string?] };
    private Options: any;
    private Defaults: any;

    constructor(canvasId: string, chartTitle: string, borderColor: string, backgroundColor: string) {
        this.Id = canvasId;

        this.Type = 'line';
        this.Data = {
            datasets: [{
                data: [],
                borderColor,
                backgroundColor
            }],
            labels: []
        };
        this.Options = {
            aspectRatio: 3,
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: "#000"
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "#000"
                    }
                }]
            },
            legend: {
                display: false
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            tooltips: {
                enabled: false
            }
        };
        this.Defaults = {
            global: {
                animation: { duration: 0 }
            }
        };

        this.createChartBox(chartTitle, canvasId);

        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        var ctx = canvas.getContext('2d');
        // @ts-ignore
        this.Chart = new Chart(ctx, {
            type: this.Type,
            data: this.Data,
            options: this.Options,
            defaults: this.Defaults
        });
    }

    public async addPoint(point: number, label: string) {
        let labels = this.Chart.data.labels;
        let data = this.Chart.data.datasets[0].data;
        labels.push(label);
        data.push(point);

        if (data.length > CChart.MAX_POINTS) {
            labels.shift();
            data.shift();
        }

        this.Chart.update(250);
    }

    private createChartBox(chartTitle: string, canvasId: string) {
        $('.charts').append('<div class="chart"><h4>' + chartTitle + '</h4 ><div class="chart-container" style="position: relative; width:100%; height: 150px;"><canvas id="' + canvasId + '"></canvas></div></div >');
    }
}

class CControls {
    private Simulation: CSimulation;
    private AtomConfig: CAtomConfig;
    private WallConfig: CWallConfig;
    private Settings: CSettings;

    constructor(simulation: CSimulation, atomConfig: CAtomConfig, wallConfig: CWallConfig, settings: CSettings) {
        this.Simulation = simulation;
        this.AtomConfig = atomConfig;
        this.WallConfig = wallConfig;
        this.Settings = settings;
    }

    public handle(simulationScript: ConfigScript) {
        this.startBtn();
        this.resetBtn(simulationScript);
        this.animationSpeedBtn();
    }

    private animationSpeedBtn() {
        $('#btnSpeed').on("click", () => {
            switch ($('#btnSpeed').attr('value')) {
                case '2':
                    $('#btnSpeed').attr('value', 1);
                    $('#btnSpeed').text('1×');
                    break;
                case '1':
                    $('#btnSpeed').attr('value', 0.5);
                    $('#btnSpeed').text('0.5×');
                    break;
                case '0.5':
                    $('#btnSpeed').attr('value', 0.25);
                    $('#btnSpeed').text('0.25×');
                    break;
                case '0.25':
                    $('#btnSpeed').attr('value', 2);
                    $('#btnSpeed').text('2×');
                    break;
                default:
                    console.log($('#btnSpeed').val());
                    break;
            }
        });
    }

    private resetBtn(simulationScript: ConfigScript) {
        $('#btnReset').on('click', () => {
            this.Simulation.reset(true);
            this.AtomConfig.loadFromScript(simulationScript);
            this.WallConfig.loadFromScript(simulationScript);
            this.Settings.applyInitialMomentum(this.AtomConfig.AtomList);

            this.Simulation.addAtoms(this.AtomConfig.AtomList);
            this.Simulation.addWalls(this.WallConfig.WallList);
            this.Simulation.initCharts(simulationScript);
            if ($('#btnStart img').attr('alt') != 'Start') {
                setTimeout(() => {
                    this.Simulation.start();
                }, 100);
            }
        });
    }

    private startBtn() {
        $('#btnStart').on("click", () => {
            if ($('#btnStart img').attr('alt') == 'Start') {
                this.Simulation.start();
                $('#btnStart img').attr('alt', 'Stop');
                $('#btnStart img').toggleClass('btnPause');
            } else {
                this.Simulation.stop();
                $('#btnStart img').attr('alt', 'Start');
                $('#btnStart img').toggleClass('btnPause');
            }
        });
    }

    public loadFromScript(script: ConfigScript) {
        const controlOptions = script.controls;
        // @ts-ignore
        if (controlOptions.length === 0) {
            $('#controlsBox').remove();
            return false;
        } else {
            controlOptions.forEach(controlOption => {
                if (controlOption !== undefined) {
                    $('#' + controlOption.id).css('display', 'flex');
                    $('#' + controlOption.id + ' h4').text(controlOption.name);
                }
            });
            return true;
        }
    }
}

class CSimulation {
    private AtomList: [CAtom?] = [];
    private WallList: [CWall?, CBox?] = [];
    private AnimationRunning = false;
    private Charts: [CChart?] = [];
    private Controls;
    private PrevTime = 0;
    private Frame = 0;

    private Calculation: CCalcultion;

    public Renderer: THREE.WebGLRenderer;
    public Camera: THREE.PerspectiveCamera;
    public Scene: THREE.Scene;

    constructor(atomConfig: CAtomConfig) {
        this.Calculation = new CCalcultion(atomConfig);

        const canvas = document.querySelector('#sim') as HTMLCanvasElement;
        this.Renderer = new THREE.WebGLRenderer({
            canvas
        });

        // camera
        const fov = 40;
        const aspect = 1.5; // the canvas default
        const near = 1;
        const far = 100000;
        this.Camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.Camera.position.z = 150;

        // scene
        this.Scene = new THREE.Scene();
        this.Scene.background = new THREE.Color(0x404040);
        // scene.background = new THREE.Color(getBackgroundColor()); // adaptive color

        // lighting
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this.Scene.add(light);

        // OrbitControl
        this.Controls = new OrbitControls(this.Camera, this.Renderer.domElement);
    }

    public initCharts(script: ConfigScript) {
        const chartList = script.charts;
        // @ts-ignore
        if (chartList.length === 0) {
            $('#chartsBox').remove();
            return false;
        } else {
            chartList.forEach(chartObject => {
                if (chartObject !== undefined) {
                    this.Charts.push(new CChart(chartObject.id, chartObject.title, chartObject.lineColor, chartObject.fillColor));
                }
            });
            return true;
        }
    }

    public async addAtoms(atoms: [CAtom?]) {
        atoms.forEach(atom => {
            if (atom !== undefined) {
                this.Scene.add(atom.Object);
                this.AtomList.push(atom);
            }
        });
    }

    public async addWalls(walls: [CWall?, CBox?]) {
        walls.forEach(wall => {
            if (wall !== undefined) {
                if (wall.Type === "box") {
                    this.Scene.add(wall.Object);
                }
                this.WallList.push(wall);
            }
        });
    }

    public async clearCanvas() {
        this.Scene.children.length = 1;
        this.AtomList = [];
        this.WallList = [];
    }

    private async neededResize() {
        const canvas = this.Renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            this.Renderer.setSize(width, height, false);
        }
        return needResize;
    }

    public async startRendering() {
        requestAnimationFrame(this.render.bind(this));
    }

    private async render(time: number) {
        this.Frame++;

        // time
        let timeStep = time - this.PrevTime; // get time since last frame
        this.PrevTime = time;

        // responsiveness
        if (this.neededResize()) {
            const canvas = this.Renderer.domElement;
            this.Camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.Camera.updateProjectionMatrix();
        }

        this.Controls.update(); // updates OrbitControls

        if (this.AnimationRunning) {

            // calculation
            this.Calculation.run(this.AtomList, this.WallList, timeStep);

            if (this.Frame % 10 == 0) {
                let chartInfo: { avgVel: number, pres: number, fps?: number } = this.Calculation.getChartInfo();
                chartInfo['fps'] = 1000 / timeStep;
                this.updateCharts(chartInfo, time);
            }
        }

        this.Renderer.render(this.Scene, this.Camera);
        requestAnimationFrame(this.render.bind(this));
    }

    public async stop() {
        this.AnimationRunning = false;
    }

    public async start() {
        this.AnimationRunning = true;
    }

    public async reset(hasControlelements = false) {
        this.AnimationRunning = false;
        this.clearCanvas();
        if (hasControlelements) {
            $('.charts').text('');
        }
    }

    // ChartInfo
    private async updateCharts(chartInfo: { avgVel: number, pres: number, fps?: number }, time: number) {
        this.Charts.forEach(chart => {
            if (chart !== undefined) {
                // @ts-ignore
                chart.addPoint(chartInfo[chart.Id], (Math.round(time / 100) / 10).toString());
            }
        });
    }

    private async getBackgroundColor() {
        const color = $(".simulationWindow").css('backgroundColor');
        return new THREE.Color(color);
    }
}

class CCalcultion {
    private MaxDistance = 160000;
    private MaxTimestep = 25; //ms
    private Timefactor = 7e-6;
    private OldPositions: [THREE.Vector3?] = [];

    private AtomConfig: CAtomConfig;
    private speedControl: JQuery<HTMLElement>;
    private tempControl: JQuery<HTMLElement>;

    static AverageIDs: ['avgVel', 'pres'] = ['avgVel', 'pres'];
    private chartTmp = {
        avgVel: { x: 0, y: 0, z: 0, count: 0 },
        pres: { x: 0, y: 0, z: 0, count: 0 }
    };
    private ChartValues = {
        avgVel: 0,
        pres: 0
    };


    constructor(atomConfig: CAtomConfig) {
        this.AtomConfig = atomConfig;
        this.speedControl = $('#btnSpeed');
        this.tempControl = $('#inpTemp');
    }

    public async run(atomList: [CAtom?], wallList: [CWall?, CBox?], timeStep: number) {
        timeStep *= Number(this.speedControl.attr('value')); // change simulation speed

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


    private async getForceVectors(atomList: [CAtom?]) {
        let calcJobs: [Promise<void>?] = [];
        // @ts-ignore
        let forces: [THREE.Vector3] = new Array(atomList.length);
        forces.fill(new THREE.Vector3());


        for (let atom = 0; atom < atomList.length; atom++) {
            await this.calcTargetForces(atom, atomList, forces);
            // calcJobs.push(this.calcTargetForces(atom, atomList, forces));
        }

        // Promise.all(calcJobs);
        return forces;

    }

    private async calcTargetForces(atom: number, atomList: [CAtom?], forces: any[]) {
        let atomPos = new THREE.Vector3().copy(atomList[atom]!.Object.position);
        this.OldPositions[atom] = atomPos;

        for (let target = atom + 1; target < atomList.length; target++) {
            let targetPos = new THREE.Vector3().copy(atomList[target]!.Object.position);

            let length2 = targetPos.distanceToSquared(atomPos);
            let distanceV = targetPos.sub(atomPos);

            if (length2 < this.MaxDistance) {
                let force = await this.calcLJ(length2);
                distanceV.multiplyScalar(force);


                forces[atom] = new THREE.Vector3().addVectors(forces[atom], distanceV);
                forces[target] = new THREE.Vector3().subVectors(forces[target], distanceV);
            }
        }
    }

    private async calcLJ(length2: number) {
        let forcePart = this.AtomConfig.Sigma2 / length2;
        let forcePart6 = forcePart * forcePart * forcePart;
        let force = 24 * this.AtomConfig.Epsilon * (forcePart6 - 2 * forcePart6 * forcePart6);
        return force;
    }

    // Atom functions --------------------------------------
    public moveRandom(atomList: CAtom[]) {
        atomList.forEach(atom => {
            atom.Object.position.x += (Math.random() * 2) - 1;
            atom.Object.position.y += (Math.random() * 2) - 1;
            atom.Object.position.z += (Math.random() * 2) - 1;
        });
    }

    private setNewPositions(atomList: [CAtom?], forces: [THREE.Vector3], timeStep: number) {
        const tempControlValue = Number(this.tempControl.val());
        let invAtomMass = 1 / this.AtomConfig.AtomMass;

        for (let atom = 0; atom < atomList.length; atom++) {
            // acceleration
            let acceleration = (forces[atom]).multiplyScalar(invAtomMass);
            // velocity
            atomList[atom]!.Velocity.add(acceleration.multiplyScalar(timeStep));

            // temperature
            let vel = new THREE.Vector3().copy(atomList[atom]!.Velocity.multiplyScalar(tempControlValue));
            this.logAverage(atomList[atom]!.Velocity, 'avgVel');

            // positions
            vel.multiplyScalar(timeStep);
            atomList[atom]!.Object.position.add(vel);
        }
    }

    // Wall functions --------------------------------------
    private calculateForceWalls(wallList: [CWall?, CBox?], atomList: [CAtom?], forces: [THREE.Vector3?]) {
        for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
            wallList.forEach(wall => {
                if (wall !== undefined) {
                    if (wall.Type === "box") {
                        if (wall.Style === 'force-LJ') {
                            this.handleLJWall(atomList, atomIndex, wall, forces);
                        }
                    }
                }
            });
        }
    }

    private calculateReboundWalls(wallList: [CWall?, CBox?], atomList: [CAtom?]) {
        for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
            wallList.forEach(wall => {
                if (wall?.Style == "rebound") {
                    this.handleReboundWall(atomList, atomIndex, wall);
                }
            });
        }
    }


    private async handleLJWall(atomList: [CAtom?], atomIndex: number, wall: CBox, forces: [THREE.Vector3?]) {
        let wallDistances = this.getDistances(atomList[atomIndex]!, wall);
        if (wallDistances) {
            let force = await this.calculateWallForcesLJ(wallDistances);
            forces[atomIndex] = new THREE.Vector3().addVectors(forces[atomIndex]!, force);
            this.logAverage(force, 'pres');
        }
    }

    private handleReboundWall(atomList: [CAtom?], atomIndex: number, wall: CWall) {
        let atomDirectionPosition = this.getAtomDirectionPositions(atomList, atomIndex, wall);
        if (atomDirectionPosition != null) {
            if ((atomDirectionPosition.old <= wall.Position && atomDirectionPosition.new >= wall.Position) ||
                (atomDirectionPosition.old >= wall.Position && atomDirectionPosition.new <= wall.Position)) {
                this.setAtomReboundPositions(atomList, atomIndex, wall);
                this.changeDirection(atomList[atomIndex]!, wall);
            }
        }
    }

    private getAtomDirectionPositions(atomList: [CAtom?], atomIndex: number, wall: CWall) {
        switch (wall.Direction) {
            case "x":
                return { old: this.OldPositions[atomIndex]!.x, new: atomList[atomIndex]!.Object.position.x }
            case "y":
                return { old: this.OldPositions[atomIndex]!.y, new: atomList[atomIndex]!.Object.position.y }
            case "z":
                return { old: this.OldPositions[atomIndex]!.z, new: atomList[atomIndex]!.Object.position.z }
            default:
                return null;
        }
    }

    private setAtomReboundPositions(atomList: [CAtom?], atomIndex: number, wall: CWall) {
        switch (wall.Direction) {
            case "x":
                atomList[atomIndex]!.Object.position.x = wall.Position - (atomList[atomIndex]!.Object.position.x - wall.Position);
                break;
            case "y":
                atomList[atomIndex]!.Object.position.y = wall.Position - (atomList[atomIndex]!.Object.position.y - wall.Position);
                break;
            case "z":
                atomList[atomIndex]!.Object.position.z = wall.Position - (atomList[atomIndex]!.Object.position.z - wall.Position);
                break;
        }
    }

    private changeDirection(atom: CAtom, wall: CWall) {
        switch (wall.Direction) {
            case "x":
                atom.Velocity = new THREE.Vector3(-1 * atom.Velocity.x, atom.Velocity.y, atom.Velocity.z);
                break;
            case "y":
                atom.Velocity = new THREE.Vector3(atom.Velocity.x, -1 * atom.Velocity.y, atom.Velocity.z);
                break;
            case "z":
                atom.Velocity = new THREE.Vector3(atom.Velocity.x, atom.Velocity.y, -1 * atom.Velocity.z);
                break;
        }
    }

    private getDistances(atom: CAtom, wall: CBox) {
        let wallDistances = [0, 0, 0, 0, 0, 0]; // x,x,y,y,z,z  <- each direction
        wallDistances[0] = wall.Position.x - atom.Object.position.x;
        wallDistances[2] = wall.Position.y - atom.Object.position.y;
        wallDistances[4] = wall.Position.z - atom.Object.position.z;
        wallDistances[1] = wall.Position.x + wall.Scale.x - atom.Object.position.x;
        wallDistances[3] = wall.Position.y + wall.Scale.y - atom.Object.position.y;
        wallDistances[5] = wall.Position.z + wall.Scale.z - atom.Object.position.z;
        return wallDistances;
    }

    private async calculateWallForcesLJ(wallDistances: number[]) {
        let force = [0, 0, 0];
        for (let i = 0; i < force.length; i++) {
            force[i] -= await this.calcLJ(wallDistances[i * 2] * wallDistances[i * 2]);
            force[i] += await this.calcLJ(wallDistances[i * 2 + 1] * wallDistances[i * 2 + 1]);
        }
        return new THREE.Vector3(force[0], force[1], force[2]);
    }

    // Chart functions --------------------------------------
    public getChartInfo() {
        return this.ChartValues;
    }

    private logAverage(value: THREE.Vector3, name: 'avgVel' | 'pres') {
        this.chartTmp[name].x += Math.abs(value.x);
        this.chartTmp[name].y += Math.abs(value.y);
        this.chartTmp[name].z += Math.abs(value.z);
        this.chartTmp[name].count++;
    }

    private calculateAverage(type: 'avgVel' | 'pres') {
        this.ChartValues[type] = Math.sqrt(this.chartTmp[type].x * this.chartTmp[type].x + this.chartTmp[type].y * this.chartTmp[type].y + this.chartTmp[type].z * this.chartTmp[type].z);
        this.chartTmp[type] = { x: 0, y: 0, z: 0, count: 0 };
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

    public applyInitialMomentum(atomList: [CAtom?]) {
        atomList.forEach(atom => {
            atom!.applyInitialMomentum(this.initialMomentum);
        });
    }
}

class CExperiment {
    private Settings: CSettings;
    private AtomConfig: CAtomConfig;
    private WallConfig: CWallConfig;
    private Controls: CControls;
    private Simulation: CSimulation;

    constructor(script: ConfigScript, hasControlelements: boolean) {
        this.handleResize();

        this.Settings = new CSettings(script);
        this.AtomConfig = new CAtomConfig();
        this.WallConfig = new CWallConfig();
        this.Simulation = new CSimulation(this.AtomConfig);
        this.Controls = new CControls(this.Simulation, this.AtomConfig, this.WallConfig, this.Settings);

        this.AtomConfig.loadFromScript(script);
        this.WallConfig.loadFromScript(script);
        this.Settings.applyInitialMomentum(this.AtomConfig.AtomList);

        this.Simulation.addAtoms(this.AtomConfig.AtomList);
        this.Simulation.addWalls(this.WallConfig.WallList);

        if (hasControlelements) {
            const hasCharts = this.Simulation.initCharts(script);
            const hasControls = this.Controls.loadFromScript(script)
            this.Controls.handle(script);

            if (!(hasCharts || hasControls)) {
                $('.simulationWindow').addClass('no-sidebar');
            }
        }

        this.Simulation.startRendering();

        if (hasControlelements) {
            setTimeout(() => {
                this.Simulation.start();
            }, 100);
        }

        window.addEventListener("resize", this.handleResize.bind(this))
    }

    public handleResize() {
        let windowWidth = $(".simulationWindow").width();
        if (windowWidth !== undefined) {
            if (windowWidth > 850) {
                windowWidth = windowWidth / 3 * 2
                $("#sim").css("height", "500px");
            } else {
                $("#sim").css("height", "400px");
            }
            $("#sim").css("width", windowWidth + "px");
        }
    }

    public redraw(script: ConfigScript) {
        this.Simulation.reset(false);
        this.AtomConfig.loadFromScript(script);
        this.WallConfig.loadFromScript(script);
        this.Simulation.addAtoms(this.AtomConfig.AtomList);
        this.Simulation.addWalls(this.WallConfig.WallList);
    }
}

export default CExperiment;