import { Vector } from '../res/lib/vector.js';

const MaxDistance = 160000;
const CONST_k = 1.380658e-23;

/*
--- official values ---
let atomMass = 0.336e-25;
let epsilon = 36.83 * CONST_k;
let sigma = 2.79;

--- my values ---*/
let atomMass = 336000;
let epsilon = 0.005;
let sigma = 31;
let sigma2 = Math.pow(sigma, 2);

export function updatePositions(atomList, timeStep) {
    let forces = getForce(atomList);
    setNewPositions(atomList, forces, timeStep);
}

function getForce(atomList) {
    let forces = new Array(atomList.length);
    forces.fill(new Vector(0, 0, 0));

    for (let atom = 0; atom < atomList.length; atom++) {
        for (let target = atom + 1; target < atomList.length; target++) {
            let atomPos = new Vector(dropIsVector(atomList[atom].object.position));
            let targetPos = new Vector(dropIsVector(atomList[target].object.position));

            let distanceV = Vector.sub(targetPos, atomPos);
            let length2 = distanceV.x * distanceV.x + distanceV.y * distanceV.y + distanceV.z * distanceV.z;

            if (length2 < MaxDistance) {
                let forcePart = (sigma2 / length2) * (sigma2 / length2) * (sigma2 / length2);
                let force = 24 * epsilon * (forcePart - 2 * forcePart * forcePart);
                distanceV = Vector.mul(distanceV, force)

                forces[atom] = Vector.add(forces[atom], distanceV);
                forces[target] = Vector.sub(forces[target], distanceV);
            }
        }
    }
    return forces;
}

function setNewPositions(atomList, forces, timeStep) {
    let invAtomMass = 1 / atomMass;

    let oldPos = new Vector(dropIsVector(atomList[0].object.position));
    for (let atom = 0; atom < atomList.length; atom++) {
        // acceleration
        let acceleration = Vector.mul(forces[atom], invAtomMass);
        // velocity
        atomList[atom].velocity = Vector.add(atomList[atom].velocity, Vector.mul(acceleration, timeStep));

        // temperature
        atomList[atom].velocity = Vector.mul(atomList[atom].velocity, $('#temp').val());

        // positions
        let pos = Vector.mul(atomList[atom].velocity, timeStep);
        atomList[atom].object.position.x += pos.x;
        atomList[atom].object.position.y += pos.y;
        atomList[atom].object.position.z += pos.z;
    }
}

export function moveRandom(atomList) {
    atomList.forEach(atom => {
        atom.object.position.x += (Math.random() * 2) - 1;
        atom.object.position.y += (Math.random() * 2) - 1;
        atom.object.position.z += (Math.random() * 2) - 1;
    });
}

// removes isVector attribute to fit into Vector class
function dropIsVector(obj) {
    return {
        x: obj.x,
        y: obj.y,
        z: obj.z
    };
}