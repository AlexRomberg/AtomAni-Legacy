import * as THREE from '../res/lib/three.module.js';
import { OrbitControls } from '../res/lib/OrbitControls.js';
class CAtomConfig {
    constructor() {
        this.AtomMass = 0.336e-25;
        this.Sigma = 2.79;
        this.Radius = 1;
        this.SegmentWidth = 30;
        this.SegmentHeight = 30;
        this.Geometry = new THREE.SphereGeometry(this.Radius, this.SegmentWidth, this.SegmentHeight);
        this.AtomList = [];
        this.Sigma2 = Math.pow(this.Sigma, 2);
        this.Epsilon = 36.83 * CAtomConfig.CONST_k;
    }
    async updateGeometry(radius, segmentWidth, segmentHeight) {
        this.Radius = radius;
        this.SegmentWidth = segmentWidth;
        this.SegmentHeight = segmentHeight;
        this.Geometry = new THREE.SphereGeometry(this.Radius, this.SegmentWidth, this.SegmentHeight);
    }
    async createAtom(type, x, y, z) {
        const atom = new CAtom(type, x, y, z, this.Geometry);
        this.AtomList.push(atom);
    }
    async generateGrid(type, X, Y, Z, width, height, depth) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                for (let z = 0; z < depth; z++) {
                    let atom = new CAtom(type, 5 * x + X - width / 2, 5 * y + Y - height / 2, 5 * z + Z - depth / 2, this.Geometry);
                    this.AtomList.push(atom);
                }
            }
        }
    }
    async generateFCCGrid(type, X, Y, Z, width, height, depth) {
        const forceEquilibrium = this.Sigma * 1.122462048309;
        const cubeSize = Math.pow(((forceEquilibrium * forceEquilibrium * 4) / 2), 1 / 2);
        console.table({ forceEquilibrium, cubeSize });
        for (let x = 0; x <= width; x++) {
            for (let y = 0; y <= height; y++) {
                for (let z = 0; z <= depth; z++) {
                    let atom = new CAtom(type, cubeSize * x + X - width / 2 * cubeSize, cubeSize * y + Y - height / 2 * cubeSize, cubeSize * z + Z - depth / 2 * cubeSize, this.Geometry);
                    this.AtomList.push(atom);
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
    loadFromScript(script) {
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
                        this.generateFCCGrid(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z, atomOption.width, atomOption.height, atomOption.depth);
                        break;
                    default:
                        console.log("unknown atom definition!");
                        break;
                }
            }
        });
    }
}
CAtomConfig.CONST_k = 1.380658e-23;
CAtomConfig.ATOM_COLORS = {
    "ne": 0x009aff,
    "ar": 0x04AD00,
    "kr": 0xE8E200
};
class CAtom {
    constructor(type, x, y, z, geometry) {
        this.Color = CAtomConfig.ATOM_COLORS[type];
        this.Material = new THREE.MeshPhongMaterial({ color: this.Color });
        this.Object = new THREE.Mesh(geometry, this.Material);
        this.Type = type;
        this.Velocity = new THREE.Vector3(0, 0, 0);
        this.Object.position.set(x, y, z);
    }
}
class CWallConfig {
    constructor() {
        this.WallList = [];
    }
    loadFromScript(script) {
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
CWallConfig.WALL_COLOR = 0xffffff;
CWallConfig.LINE_WIDTH = 2;
class CWall {
    constructor(id, style, direction, position) {
        this.Id = id;
        this.Direction = direction;
        this.Position = position;
        this.Style = style;
        this.Type = "wall";
    }
}
class CBox {
    constructor(id, style, x, y, z, width, height, depth) {
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
    constructor(canvasId, chartTitle, borderColor, backgroundColor) {
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
        const canvas = document.getElementById(canvasId);
        var ctx = canvas.getContext('2d');
        this.Chart = new Chart(ctx, {
            type: this.Type,
            data: this.Data,
            options: this.Options,
            defaults: this.Defaults
        });
    }
    async addPoint(point, label) {
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
    createChartBox(chartTitle, canvasId) {
        $('.charts').append('<div class="chart"><h4>' + chartTitle + '</h4 ><div class="chart-container" style="position: relative; width:100%; height: 150px;"><canvas id="' + canvasId + '"></canvas></div></div >');
    }
}
CChart.MAX_POINTS = 50;
class CSimulation {
    constructor(atomConfig) {
        this.AtomList = [];
        this.WallList = [];
        this.AnimationRunning = false;
        this.Charts = [];
        this.PrevTime = 0;
        this.Frame = 0;
        this.Calculation = new CCalcultion(atomConfig);
        const canvas = document.querySelector('#sim');
        this.Renderer = new THREE.WebGLRenderer({
            canvas
        });
        const fov = 40;
        const aspect = 1.5;
        const near = 1;
        const far = 100000;
        this.Camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.Camera.position.z = 150;
        this.Scene = new THREE.Scene();
        this.Scene.background = new THREE.Color(0x404040);
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this.Scene.add(light);
        this.Controls = new OrbitControls(this.Camera, this.Renderer.domElement);
    }
    initCharts(script) {
        const chartList = script.charts;
        chartList.forEach(chartObject => {
            if (chartObject !== undefined) {
                this.Charts.push(new CChart(chartObject.id, chartObject.title, chartObject.lineColor, chartObject.fillColor));
            }
        });
    }
    async addAtoms(atoms) {
        atoms.forEach(atom => {
            if (atom !== undefined) {
                this.Scene.add(atom.Object);
                this.AtomList.push(atom);
            }
        });
    }
    async addWalls(walls) {
        walls.forEach(wall => {
            if (wall !== undefined) {
                if (wall.Type === "box") {
                    this.Scene.add(wall.Object);
                }
                this.WallList.push(wall);
            }
        });
    }
    async clearCanvas() {
        this.Scene.children.length = 1;
        this.AtomList = [];
        this.WallList = [];
    }
    async neededResize() {
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
    async startRendering() {
        requestAnimationFrame(this.render.bind(this));
    }
    async render(time) {
        this.Frame++;
        let timeStep = time - this.PrevTime;
        this.PrevTime = time;
        if (this.neededResize()) {
            const canvas = this.Renderer.domElement;
            this.Camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.Camera.updateProjectionMatrix();
        }
        this.Controls.update();
        if (this.AnimationRunning) {
            this.Calculation.run(this.AtomList, this.WallList, timeStep);
            if (this.Frame % 10 == 0) {
                let chartInfo = this.Calculation.getChartInfo();
                chartInfo['fps'] = 1000 / timeStep;
                this.updateCharts(chartInfo, time);
            }
        }
        this.Renderer.render(this.Scene, this.Camera);
        requestAnimationFrame(this.render.bind(this));
    }
    async stop() {
        this.AnimationRunning = false;
    }
    async start() {
        this.AnimationRunning = true;
    }
    async reset(hasControlelements = false) {
        this.AnimationRunning = false;
        this.clearCanvas();
        if (!hasControlelements) {
            $('.charts').text('');
        }
    }
    async updateCharts(chartInfo, time) {
        this.Charts.forEach(chart => {
            if (chart !== undefined) {
                chart.addPoint(chartInfo[chart.Id], (Math.round(time / 100) / 10).toString());
            }
        });
    }
    async getBackgroundColor() {
        const color = $(".simulationWindow").css('backgroundColor');
        return new THREE.Color(color);
    }
}
class CCalcultion {
    constructor(atomConfig) {
        this.MaxDistance = 160000;
        this.MaxTimestep = 25;
        this.Timefactor = 7e-6;
        this.OldPositions = [];
        this.chartTmp = {
            avgVel: { x: 0, y: 0, z: 0, count: 0 },
            pres: { x: 0, y: 0, z: 0, count: 0 }
        };
        this.ChartValues = {
            avgVel: 0,
            pres: 0
        };
        this.AtomConfig = atomConfig;
        this.speedControl = $('#btnSpeed');
        this.tempControl = $('#inpTemp');
    }
    async run(atomList, wallList, timeStep) {
        timeStep *= Number(this.speedControl.attr('value'));
        if (timeStep > this.MaxTimestep) {
            timeStep = this.MaxTimestep;
        }
        timeStep *= this.Timefactor;
        let forces = await this.getForceVectors(atomList);
        this.calculateForceWalls(wallList, atomList, forces);
        CCalcultion.AverageIDs.forEach(id => {
            this.calculateAverage(id);
        });
        this.setNewPositions(atomList, forces, timeStep);
        this.calculateReboundWalls(wallList, atomList);
    }
    async getForceVectors(atomList) {
        let calcJobs = [];
        let forces = new Array(atomList.length);
        forces.fill(new THREE.Vector3());
        for (let atom = 0; atom < atomList.length; atom++) {
            await this.calcTargetForces(atom, atomList, forces);
        }
        return forces;
    }
    async calcTargetForces(atom, atomList, forces) {
        let atomPos = new THREE.Vector3().copy(atomList[atom].Object.position);
        this.OldPositions[atom] = atomPos;
        for (let target = atom + 1; target < atomList.length; target++) {
            let targetPos = new THREE.Vector3().copy(atomList[target].Object.position);
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
    async calcLJ(length2) {
        let forcePart = this.AtomConfig.Sigma2 / length2;
        let forcePart6 = forcePart * forcePart * forcePart;
        let force = 24 * this.AtomConfig.Epsilon * (forcePart6 - 2 * forcePart6 * forcePart6);
        return force;
    }
    moveRandom(atomList) {
        atomList.forEach(atom => {
            atom.Object.position.x += (Math.random() * 2) - 1;
            atom.Object.position.y += (Math.random() * 2) - 1;
            atom.Object.position.z += (Math.random() * 2) - 1;
        });
    }
    setNewPositions(atomList, forces, timeStep) {
        const tempControlValue = Number(this.tempControl.val());
        let invAtomMass = 1 / this.AtomConfig.AtomMass;
        for (let atom = 0; atom < atomList.length; atom++) {
            let acceleration = (forces[atom]).multiplyScalar(invAtomMass);
            atomList[atom].Velocity.add(acceleration.multiplyScalar(timeStep));
            let vel = new THREE.Vector3().copy(atomList[atom].Velocity.multiplyScalar(tempControlValue));
            this.logAverage(atomList[atom].Velocity, 'avgVel');
            vel.multiplyScalar(timeStep);
            atomList[atom].Object.position.add(vel);
        }
    }
    calculateForceWalls(wallList, atomList, forces) {
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
    calculateReboundWalls(wallList, atomList) {
        for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
            wallList.forEach(wall => {
                if (wall?.Style == "rebound") {
                    this.handleReboundWall(atomList, atomIndex, wall);
                }
            });
        }
    }
    async handleLJWall(atomList, atomIndex, wall, forces) {
        let wallDistances = this.getDistances(atomList[atomIndex], wall);
        if (wallDistances) {
            let force = await this.calculateWallForcesLJ(wallDistances);
            forces[atomIndex] = new THREE.Vector3().addVectors(forces[atomIndex], force);
            this.logAverage(force, 'pres');
        }
    }
    handleReboundWall(atomList, atomIndex, wall) {
        let atomDirectionPosition = this.getAtomDirectionPositions(atomList, atomIndex, wall);
        if (atomDirectionPosition != null) {
            if ((atomDirectionPosition.old <= wall.Position && atomDirectionPosition.new >= wall.Position) ||
                (atomDirectionPosition.old >= wall.Position && atomDirectionPosition.new <= wall.Position)) {
                this.setAtomReboundPositions(atomList, atomIndex, wall);
                this.changeDirection(atomList[atomIndex], wall);
            }
        }
    }
    getAtomDirectionPositions(atomList, atomIndex, wall) {
        switch (wall.Direction) {
            case "x":
                return { old: this.OldPositions[atomIndex].x, new: atomList[atomIndex].Object.position.x };
            case "y":
                return { old: this.OldPositions[atomIndex].y, new: atomList[atomIndex].Object.position.y };
            case "z":
                return { old: this.OldPositions[atomIndex].z, new: atomList[atomIndex].Object.position.z };
            default:
                return null;
        }
    }
    setAtomReboundPositions(atomList, atomIndex, wall) {
        switch (wall.Direction) {
            case "x":
                atomList[atomIndex].Object.position.x = wall.Position - (atomList[atomIndex].Object.position.x - wall.Position);
                break;
            case "y":
                atomList[atomIndex].Object.position.y = wall.Position - (atomList[atomIndex].Object.position.y - wall.Position);
                break;
            case "z":
                atomList[atomIndex].Object.position.z = wall.Position - (atomList[atomIndex].Object.position.z - wall.Position);
                break;
        }
    }
    changeDirection(atom, wall) {
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
    getDistances(atom, wall) {
        let wallDistances = [0, 0, 0, 0, 0, 0];
        wallDistances[0] = wall.Position.x - atom.Object.position.x;
        wallDistances[2] = wall.Position.y - atom.Object.position.y;
        wallDistances[4] = wall.Position.z - atom.Object.position.z;
        wallDistances[1] = wall.Position.x + wall.Scale.x - atom.Object.position.x;
        wallDistances[3] = wall.Position.y + wall.Scale.y - atom.Object.position.y;
        wallDistances[5] = wall.Position.z + wall.Scale.z - atom.Object.position.z;
        return wallDistances;
    }
    async calculateWallForcesLJ(wallDistances) {
        let force = [0, 0, 0];
        for (let i = 0; i < force.length; i++) {
            force[i] -= await this.calcLJ(wallDistances[i * 2] * wallDistances[i * 2]);
            force[i] += await this.calcLJ(wallDistances[i * 2 + 1] * wallDistances[i * 2 + 1]);
        }
        return new THREE.Vector3(force[0], force[1], force[2]);
    }
    getChartInfo() {
        return this.ChartValues;
    }
    logAverage(value, name) {
        this.chartTmp[name].x += Math.abs(value.x);
        this.chartTmp[name].y += Math.abs(value.y);
        this.chartTmp[name].z += Math.abs(value.z);
        this.chartTmp[name].count++;
    }
    calculateAverage(type) {
        this.ChartValues[type] = Math.sqrt(this.chartTmp[type].x * this.chartTmp[type].x + this.chartTmp[type].y * this.chartTmp[type].y + this.chartTmp[type].z * this.chartTmp[type].z);
        this.chartTmp[type] = { x: 0, y: 0, z: 0, count: 0 };
    }
}
CCalcultion.AverageIDs = ['avgVel', 'pres'];
class CExperiment {
    constructor(script, hasControlelements) {
        this.handleResize();
        this.AtomConfig = new CAtomConfig();
        this.WallConfig = new CWallConfig();
        this.Simulation = new CSimulation(this.AtomConfig);
        this.AtomConfig.loadFromScript(script);
        this.WallConfig.loadFromScript(script);
        this.Simulation.addAtoms(this.AtomConfig.AtomList);
        this.Simulation.addWalls(this.WallConfig.WallList);
        if (hasControlelements) {
            this.Simulation.initCharts(script);
        }
        this.Simulation.startRendering();
        if (hasControlelements) {
            setTimeout(() => {
                this.Simulation.start();
            }, 1000);
        }
        window.addEventListener("resize", this.handleResize.bind(this));
    }
    handleResize() {
        let windowWidth = $(".simulationWindow").width();
        if (windowWidth !== undefined) {
            if (windowWidth > 850) {
                windowWidth = windowWidth / 3 * 2;
                $("#sim").css("height", "500px");
            }
            else {
                $("#sim").css("height", "400px");
            }
            $("#sim").css("width", windowWidth + "px");
        }
    }
    redraw(script) {
        this.Simulation.reset(false);
        this.AtomConfig.loadFromScript(script);
        this.WallConfig.loadFromScript(script);
        this.Simulation.addAtoms(this.AtomConfig.AtomList);
        this.Simulation.addWalls(this.WallConfig.WallList);
    }
}
export default CExperiment;
