import * as THREE from '../res/lib/three.module.js';
let Radius = 10
let SegmentWidth = 30;
let SegmentHeight = 30;
let Geometry = new THREE.SphereGeometry(Radius, SegmentWidth, SegmentHeight);

const atomColors = {
    "he": 0x009aff,
}

export function updateGeometry(radius, segmentWidth, segmentHeight) {
    Radius = radius;
    SegmentWidth = segmentWidth;
    SegmentHeight = segmentHeight;
    Geometry = new THREE.SphereGeometry(Radius, SegmentWidth, SegmentHeight);
}

export function create(type, x, y, z) {
    const material = new THREE.MeshPhongMaterial({
        color: atomColors[type]
    });

    const atom = {
        object: new THREE.Mesh(Geometry, material),
        type
    };

    // set atom position
    atom.object.position.x = x;
    atom.object.position.y = y;
    atom.object.position.z = z;

    return atom;
}


// patterns
export function generateGrid(X, Y, Z) {
    let atomList = new Array();
    for (let x = 0; x < X; x++) {
        for (let y = 0; y < Y; y++) {
            for (let z = 0; z < Z; z++) {
                let atom = this.create("he", 30 * (x - (X / 2)), 30 * (y - (Y / 2)), 30 * (z - (Z / 2)));
                atomList.push(atom);
            }
        }
    }
    return atomList;
}