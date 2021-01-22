import * as Three from '../res/lib/Three.module.js';
import * as Chart from './experimentChart.js';

let AtomList = new Array();
let AnimationRunning = false;
let Charts = {};

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
    camera.position.z = 1000;

    // scene
    const scene = new Three.Scene();
    scene.background = new Three.Color(0x404040);

    // lighting
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new Three.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // add Charts
    initCharts();

    return { renderer, camera, scene };
}

function initCharts() {
    Charts.temp = Chart.generateChart('fpsChart', 'rgba(200,0,0,1)', 'rgba(170,0,0,0.4)');
}

export function addAtoms(atoms, scene) {
    atoms.forEach(atom => {
        scene.add(atom.object);
        AtomList.push(atom);
    });
    console.log(AtomList);
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

export function startAnimation(renderInfo) {
    AnimationRunning = true;
    let renderer = renderInfo.renderer;
    let scene = renderInfo.scene;
    let camera = renderInfo.camera;

    // render
    let prevTime = 0;
    let frame = 0;

    function render(time) {
        frame++;
        // time
        let passedTime = time - prevTime; // get time since last frame
        prevTime = time;

        logFPS(passedTime, frame);

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }


        // calculation goes here
        AtomList.forEach(atom => {
            atom.object.position.x += (Math.random() * 2) - 1;
            atom.object.position.y += (Math.random() * 2) - 1;
            atom.object.position.z += (Math.random() * 2) - 1;
        });

        renderer.render(scene, camera);
        if (AnimationRunning) {
            requestAnimationFrame(render);
        }
    }

    requestAnimationFrame(render);
}

function logFPS(passedTime, frame) {
    if (frame % 10 == 0) {
        Chart.addPoint(Charts.temp, 1000 / passedTime, frame);
    }
}

export function stopAnimation() {
    AnimationRunning = false;
}