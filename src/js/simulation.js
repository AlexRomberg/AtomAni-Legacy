import * as THREE from '../res/three.module.js';

function main() {
    const canvas = document.querySelector('#sim');
    const renderer = new THREE.WebGLRenderer({
        canvas
    });

    // camera
    const fov = 40;
    const aspect = 2; // the canvas default
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

    // objects
    const radius = 10;
    const segmentWidth = 30;
    const segmentHeight = 30;
    const geometry = new THREE.SphereGeometry(radius, segmentWidth, segmentHeight);

    function makeInstance(geometry, color, x, y, z) {
        const material = new THREE.MeshPhongMaterial({
            color
        });

        const sphere = {
            object: new THREE.Mesh(geometry, material),
            typ: "H",

        };

        scene.add(sphere.object);

        sphere.object.position.x = x;
        sphere.object.position.y = y;
        sphere.object.position.z = z;

        return sphere;
    }

    const spheres = new Array();

    for (let x = 0; x < 10; x++) {
        const plane = new Array();
        for (let y = 0; y < 10; y++) {
            const row = new Array();
            for (let z = 0; z < 10; z++) {
                const atom = makeInstance(geometry, 0x993399, 30 * (x - 5), 30 * (y - 5), 30 * (z - 5));
                row.push(atom);
            }
            plane.push(row);
        }
        spheres.push(plane);
    }

    console.log(spheres);

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

    // render
    function render(time) {
        time *= 0.001; // convert time to seconds
        // controls.update();

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        spheres.forEach(plane => {
            plane.forEach(row => {
                row.forEach(atom => {
                    atom.object.position.x += (Math.random() * 2) - 1;
                    atom.object.position.y += (Math.random() * 2) - 1;
                    atom.object.position.z += (Math.random() * 2) - 1;
                });
            });
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();