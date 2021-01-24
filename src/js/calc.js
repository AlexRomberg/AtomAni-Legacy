import { Vector } from '../res/lib/vector.js';

const MaxDistance = 1000000;
const CONST_k = 1.380658e-23;
const atomMass = 0.336e-25;
const epsilon = 36.83 * CONST_k;
const sigma = 2.79;
const sigma6 = sigma * sigma * sigma * sigma * sigma * sigma;
const sigma12 = sigma6 * sigma6;

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
                let length6 = length2 * length2 * length2;
                let length8 = length2 * length6;
                let force = 24 * epsilon * (2 * sigma12 / (length8 * length6) - sigma6 / length8);

                distanceV = Vector.mul(distanceV, force)

                forces[atom] = Vector.add(forces[atom], distanceV);
                forces[target] = Vector.sub(forces[target], distanceV);
                // console.log("Kraft: ", forces[atom], "Distanz: ", distanceV.x);
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

        // positions
        let pos = Vector.mul(atomList[atom].velocity, timeStep);
        atomList[atom].object.position.x += pos.x;
        atomList[atom].object.position.y += pos.y;
        atomList[atom].object.position.z += pos.z;
    }
    console.log('delta pos', {
        x: atomList[0].object.position.x - oldPos.x,
        y: atomList[0].object.position.y - oldPos.y,
        z: atomList[0].object.position.z - oldPos.z
    });
}

export function moveRandom(atomList) {
    atomList.forEach(atom => {
        atom.object.position.x += (Math.random() * 2) - 1;
        atom.object.position.y += (Math.random() * 2) - 1;
        atom.object.position.z += (Math.random() * 2) - 1;
    });
}

function dropIsVector(obj) {
    return {
        x: obj.x,
        y: obj.y,
        z: obj.z
    };
}