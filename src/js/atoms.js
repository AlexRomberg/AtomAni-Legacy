import * as THREE from '../res/lib/three.module.js';

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
        velocity: new THREE.Vector3(0, 0, 0)
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
                let atom = this.create(type, 50 * x + X, 30 * y + Y, 30 * z + Z);
                atomList.push(atom);
            }
        }
    }
    return atomList;
}

export function loadFromScript(atomOptions) {
    let atomList = new Array();
    atomOptions.forEach(atomOption => {
        switch (atomOption.type) {
            case 'single':
                atomList.push(this.create(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z));
                break;
            case 'grid':
                let atomGrid = this.generateGrid(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z, atomOption.width, atomOption.height, atomOption.depth);
                atomGrid.forEach(atom => {
                    atomList.push(atom);
                });
                break;
            default:
                atomList.push(this.create(atomOption.atomType, atomOption.x, atomOption.y, atomOption.z));
                break;
        }
    });
    return atomList;
}