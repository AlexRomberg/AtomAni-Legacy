import * as THREE from '../res/lib/three.module.js';

let AtomList = new Array();
let AnimationRunning = false;

export function init() {
    const canvas = document.querySelector('#sim');
    const renderer = new THREE.WebGLRenderer({
        canvas
    });

    // camera
    const fov = 40;
    const aspect = 1.5; // the canvas default
    const near = 1;
    const far = 100000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 1000;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404040);

    // lighting
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    return { renderer, camera, scene };
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
    function render(time) {
        time *= 0.001; // convert time to seconds

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

export function stopAnimation() {
    AnimationRunning = false;
}