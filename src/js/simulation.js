import * as Three from '../res/lib/three.module.js';
import { OrbitControls } from '../res/lib/OrbitControls.js';
import * as Chart from './experimentChart.js';
import * as Calc from './calc.js';

let AtomList = new Array();
let WallList = new Array();
let AnimationRunning = false;
let Charts = [];
let controls;

export function init() {
    const canvas = document.querySelector('#sim');
    const renderer = new Three.WebGLRenderer({
        canvas
    });

    // camera
    const fov = 40;
    const aspect = 1.5; // the canvas default
    const near = 1;
    const far = 100000;
    const camera = new Three.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 1500;

    // scene
    const scene = new Three.Scene();
    scene.background = new Three.Color(0x404040);
    // scene.background = new Three.Color(getBackgroundColor());

    // lighting
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new Three.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // OrbitControl
    controls = new OrbitControls(camera, renderer.domElement);

    return { renderer, camera, scene };
}

export function initCharts(chartList) {
    chartList.forEach(chartObject => {
        Charts.push({
            id: chartObject.id,
            object: Chart.generateChart(chartObject.id, chartObject.title, chartObject.lineColor, chartObject.fillColor),
        });
    });
}

export function addAtoms(atoms, scene) {
    atoms.forEach(atom => {
        scene.add(atom.object);
        AtomList.push(atom);
    });
}

export function addWalls(walls, scene) {
    walls.forEach(wall => {
        scene.add(wall.object);
        WallList.push(wall);
    });
}

export function clearCanvas(scene) {
    scene.children.length = 1;
    AtomList = new Array();
    WallList = new Array();
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

export function startRendering(renderInfo) {
    let renderer = renderInfo.renderer;
    let scene = renderInfo.scene;
    let camera = renderInfo.camera;

    // render
    let prevTime = 0;
    let frame = 0;

    function render(time) {
        frame++;

        // time
        let timeStep = time - prevTime; // get time since last frame
        prevTime = time;

        // responsiveness
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        controls.update(); // updates OrbitControls

        if (AnimationRunning) {
            // calculation
            Calc.updatePositions(AtomList, WallList, timeStep);

            if (frame % 10 == 0) {
                let chartInfo = Calc.getChartInfo();
                chartInfo['fps'] = 1000 / timeStep;
                updateCharts(chartInfo, time);
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

export function stop() {
    AnimationRunning = false;
}

export function start() {
    AnimationRunning = true;
}

export function reset(scene, isEditor = false) {
    AnimationRunning = false;
    clearCanvas(scene);
    if (!isEditor) {
        Chart.remove();
    }
}

// ChartInfo
function updateCharts(chartInfo, time) {
    Charts.forEach(chart => {
        Chart.addPoint(chart.object, chartInfo[chart.id], Math.round(time / 100) / 10);
    });
}

function getBackgroundColor() {
    const color = $(".simulationWindow").css('backgroundColor');
    return new Three.Color(color);
}