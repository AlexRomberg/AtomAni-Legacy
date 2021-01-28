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
    atom.object.position.set(x, y, z);

    return atom;
}


// patterns
export function generateGrid(type, X, Y, Z, width, height, depth) {
    let atomList = new Array();
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            for (let z = 0; z < depth; z++) {
                let atom = this.create(type, 30 * x + X, 30 * y + Y, 30 * z + Z);
                atomList.push(atom);
            }
        }
    }
    return atomList;
}