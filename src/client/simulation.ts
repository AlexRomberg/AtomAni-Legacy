// @ts-ignore
import * as THREE from '../res/lib/three.module.js';
// @ts-ignore
import { OrbitControls } from '../res/lib/OrbitControls.js';

// import * as THREE from "three";


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
//#endregion

class CAtomConfig {
    static ATOM_COLORS: { "ne": THREE.ColorRepresentation, "ar": THREE.ColorRepresentation, "kr": THREE.ColorRepresentation } = {
        "ne": 0x009aff,
        "ar": 0x04AD00,
        "kr": 0xE8E200
    };

    public AtomList: CAtom[]

    private Radius = 1;
    private SegmentWidth = 30;
    private SegmentHeight = 30;
    private Geometry: THREE.SphereGeometry;

    constructor() {
        this.Geometry = new THREE.SphereGeometry(this.Radius, this.SegmentWidth, this.SegmentHeight);
        this.AtomList = [];
    }

    public async updateGeometry(radius: number, segmentWidth: number, segmentHeight: number) {
        this.Radius = radius;
        this.SegmentWidth = segmentWidth;
        this.SegmentHeight = segmentHeight;
        this.Geometry = new THREE.SphereGeometry(this.Radius, this.SegmentWidth, this.SegmentHeight);
    }

    public async createAtom(type: Atomtype) {
        const atom = new CAtom(type, 0, 0, 0, this.Geometry);
        this.AtomList.push(atom);
    }

    // patterns
    public async createAtoms(type: Atomtype, amount: number) {
        for (let atom = 0; atom < amount; atom++) {
            this.AtomList.push(new CAtom(type, 0, 0, 0, this.Geometry));
        }
    }

    public loadFromScript(script: ConfigScript) {
        this.AtomList = [];
        const atomOptions = script.atoms;
        atomOptions.forEach(atomOption => {
            switch (atomOption.type) {
                case 'single':
                    this.createAtom(atomOption.atomType)
                    break;
                case 'fcc':
                case 'fcc-aba':
                case 'grid':
                    var amount = atomOption.width * atomOption.height * atomOption.depth;
                    this.createAtoms(atomOption.atomType, amount);
                    break;
                case 'fcc-abca':
                    var amount = (atomOption.width + 1) * (atomOption.height + 1) * (atomOption.depth + 1);
                    amount += atomOption.width * atomOption.height * (atomOption.depth + 1);
                    amount += atomOption.width * (atomOption.height + 1) * atomOption.depth;
                    amount += (atomOption.width + 1) * atomOption.height * atomOption.depth;
                    this.createAtoms(atomOption.atomType, amount)
                    break;
                default:
                    console.log("unknown atom definition!");
                    break;
            }
        });
    }
}

class CAtom {
    private Color: THREE.ColorRepresentation;
    private Material: THREE.MeshPhongMaterial;
    public Object: THREE.Mesh;
    public Type: Atomtype;

    constructor(type: Atomtype, x: number, y: number, z: number, geometry: THREE.SphereGeometry) {
        this.Color = CAtomConfig.ATOM_COLORS[type];
        this.Material = new THREE.MeshPhongMaterial({ color: this.Color });
        this.Object = new THREE.Mesh(geometry, this.Material);
        this.Type = type;
        this.Object.position.set(x, y, z);
    }
}

class CWallConfig {
    static WALL_COLOR: THREE.ColorRepresentation = 0xffffff;
    static LINE_WIDTH: number = 2;

    public WallList: CBox[];

    constructor() {
        this.WallList = [];
    }

    public loadFromScript(script: ConfigScript) {
        this.WallList = [];
        const wallOptions = script.walls;
        wallOptions.forEach(wallOption => {
            switch (wallOption.type) {
                case "box":
                    this.WallList.push(new CBox(this.WallList.length, wallOption.x, wallOption.y, wallOption.z, wallOption.width, wallOption.height, wallOption.depth));
                    break;
            }
        });
    }
}

class CBox {
    public Object: THREE.LineSegments;
    public Id: number;

    constructor(id: number, x: number, y: number, z: number, width: number, height: number, depth: number) {
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const geo = new THREE.EdgesGeometry(boxGeo);
        const mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const lineSeg = new THREE.LineSegments(geo, mat);

        lineSeg.position.x = x + width / 2;
        lineSeg.position.y = y + height / 2;
        lineSeg.position.z = z + depth / 2;

        this.Object = lineSeg;
        this.Id = id;
    }
}

class CChart {
    static MAX_POINTS = 50;
    public Chart: any;
    public Id: string;

    private Type: string;
    private Data: { datasets: [{ data: number[], borderColor: string, backgroundColor: string }], labels: string[] };
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

    constructor(simulation: CSimulation, atomConfig: CAtomConfig, wallConfig: CWallConfig) {
        this.Simulation = simulation;
        this.AtomConfig = atomConfig;
        this.WallConfig = wallConfig;
    }

    public handle(simulationScript: ConfigScript) {
        this.startBtn();
        this.resetBtn(simulationScript);
        this.animationSpeedBtn();
    }

    private animationSpeedBtn() {
        $('#btnSpeed').on("click", () => {
            let value: number;
            switch ($('#btnSpeed').attr('value')) {
                case '2':
                    $('#btnSpeed').attr('value', 1);
                    $('#btnSpeed').text('1×');
                    value = 1;
                    break;
                case '1':
                    $('#btnSpeed').attr('value', 0.5);
                    $('#btnSpeed').text('0.5×');
                    value = 0.5;
                    break;
                case '0.5':
                    $('#btnSpeed').attr('value', 0.25);
                    $('#btnSpeed').text('0.25×');
                    value = 0.25;
                    break;
                case '0.25':
                    $('#btnSpeed').attr('value', 2);
                    $('#btnSpeed').text('2×');
                    value = 2;
                    break;
                default:
                    console.log($('#btnSpeed').val());
                    value = 1;
                    break;
            }
            CalcWorker.postMessage({ contentType: 'data', data: { type: 'speed', value } })
        });
    }

    private resetBtn(simulationScript: ConfigScript) {
        $('#btnReset').on('click', () => {
            this.Simulation.reset(true);
            this.AtomConfig.loadFromScript(simulationScript);
            this.WallConfig.loadFromScript(simulationScript);

            this.Simulation.addAtoms(this.AtomConfig.AtomList);
            this.Simulation.addWalls(this.WallConfig.WallList);
            this.Simulation.initCharts(simulationScript);
            if ($('#btnStart img').attr('alt') != 'Start') {
                this.Simulation.start();
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
        if (controlOptions.length === 0) {
            $('#controlsBox').remove();
            return false;
        } else {
            controlOptions.forEach(controlOption => {
                $('#' + controlOption.id).css('display', 'flex');
                $('#' + controlOption.id + ' h4').text(controlOption.name);
            });
            return true;
        }
    }
}

class CSimulation {
    private AtomList: CAtom[] = [];
    private WallList: (CWall | CBox)[] = [];
    private Charts: CChart[] = [];
    private Controls: OrbitControls;

    public Renderer: THREE.WebGLRenderer;
    public Camera: THREE.PerspectiveCamera;
    public Scene: THREE.Scene;

    constructor() {
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
        if (chartList.length === 0) {
            $('#chartsBox').remove();
            return false;
        } else {
            chartList.forEach(chartObject => {
                this.Charts.push(new CChart(chartObject.id, chartObject.title, chartObject.lineColor, chartObject.fillColor));
            });
            return true;
        }
    }

    public async addAtoms(atoms: CAtom[]) {
        atoms.forEach(atom => {
            this.Scene.add(atom.Object);
            this.AtomList.push(atom);
        });
    }

    public async addWalls(walls: CBox[]) {
        walls.forEach(wall => {
            this.Scene.add(wall.Object);
            this.WallList.push(wall);
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
        // responsiveness
        if (this.neededResize()) {
            const canvas = this.Renderer.domElement;
            this.Camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.Camera.updateProjectionMatrix();
        }

        this.Controls.update(); // updates OrbitControls

        if (DataBuffer.length > 0) {
            const frameData = DataBuffer.splice(0)[0];
            this.updateAtomPositions(frameData.data.pos)
            this.updateCharts(frameData.data.chart, time);
        }

        this.Renderer.render(this.Scene, this.Camera);
        requestAnimationFrame(this.render.bind(this));
    }

    public async stop() {
        CalcWorker.postMessage({ contentType: 'cmd', data: 'stop' });
    }

    public async start() {
        CalcWorker.postMessage({ contentType: 'cmd', data: 'start' });
    }

    public async reset(hasControlelements = false) {
        CalcWorker.postMessage({ contentType: 'cmd', data: 'reset' });
        this.clearCanvas();
        if (hasControlelements) {
            $('.charts').text('');
        }
    }

    // ChartInfo
    private async updateCharts(chartInfo: { avgVel: number, pres: number, fps?: number }, time: number) {
        this.Charts.forEach(chart => {
            // @ts-ignore
            chart.addPoint(chartInfo[chart.Id], (Math.round(time / 100) / 10).toString());
        });
    }

    // atoms
    private updateAtomPositions(atomPos: { x: number; y: number; z: number; }[]) {
        for (let atom = 0; atom < atomPos.length; atom++) {
            this.AtomList[atom].Object.position.x = atomPos[atom].x;
            this.AtomList[atom].Object.position.y = atomPos[atom].y;
            this.AtomList[atom].Object.position.z = atomPos[atom].z;
        }
    }
}

class CExperiment {
    private AtomConfig: CAtomConfig;
    private WallConfig: CWallConfig;
    private Controls: CControls;
    private Simulation: CSimulation;

    constructor(script: ConfigScript, hasControlelements: boolean) {
        this.handleResize();
        CalcWorker.postMessage({ contentType: 'cs', data: script })

        this.AtomConfig = new CAtomConfig();
        this.WallConfig = new CWallConfig();
        this.Simulation = new CSimulation();
        this.Controls = new CControls(this.Simulation, this.AtomConfig, this.WallConfig);

        this.AtomConfig.loadFromScript(script);
        this.WallConfig.loadFromScript(script);

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

// --------------------------------------
// Worker
// --------------------------------------
const CalcWorker = new Worker('/js/calculationWorker.js');
let DataBuffer: ({ contentType: 'data', data: { pos: { x: number, y: number, z: number }[], chart: { avgVel: number, pres: number, fps: number } } })[] = [];
CalcWorker.onmessage = (e) => {
    const message: { contentType: 'data', data: { pos: { x: number, y: number, z: number }[], chart: { avgVel: number, pres: number, fps: number } } } = e.data;
    if (message.contentType === 'data') {
        DataBuffer.push(message);
    }
}



export default CExperiment;