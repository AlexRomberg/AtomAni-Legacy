import * as THREE from '../res/lib/three.module.js';
import { Vector } from '../res/lib/vector.js';

let Radius = 10
let SegmentWidth = 30;
let SegmentHeight = 30;
let Geometry = new THREE.SphereGeometry(Radius, SegmentWidth, SegmentHeight);

const atomColors = {
    "ne": 0x009aff,
    "ar": 0x04AD00,
    "kr": 0xE8E200
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
        type,
        velocity: new Vector(0, 0, 0)
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
                let atom = this.create("ne", 30 * (x - (X / 2)), 30 * (y - (Y / 2)), 30 * (z - (Z / 2)));
                atomList.push(atom);
            }
        }
    }
    return atomList;
}