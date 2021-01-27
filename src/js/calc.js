import { Vector } from '../res/lib/vector.js';

const MaxDistance = 160000;
const WALL_WIDTH = 30;
const CONST_k = 1.380658e-23;

let atomMass = 336000;
let epsilon = 0.005;
let sigma = 31;
let sigma2 = Math.pow(sigma, 2);

export function updatePositions(atomList, wallList, timeStep) {
    let forces = getForce(atomList, wallList);
    calculateWalls(wallList, atomList);
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
                let force = 24 * epsilon * (Math.pow((sigma2 / length2), 3) - 2 * Math.pow((sigma2 / length2), 6));
                distanceV = Vector.mul(distanceV, force)

                forces[atom] = Vector.add(forces[atom], distanceV);
                forces[target] = Vector.sub(forces[target], distanceV);
            }
        }
    }
    return forces;
}

function calculateWalls(wallList, atomList) {
    atomList.forEach(atom => {
        let switchableDirections = { x: false, y: false, z: false };
        wallList.forEach(wall => {
            switchableDirections.x = switchableDirections.x || isInWall(atom.object.position.x, wall.position.x, wall.scale.x, atom.velocity.x);
            switchableDirections.y = switchableDirections.y || isInWall(atom.object.position.y, wall.position.y, wall.scale.y, atom.velocity.y);
            switchableDirections.z = switchableDirections.z || isInWall(atom.object.position.z, wall.position.z, wall.scale.z, atom.velocity.z);
        });
        switchDirections(switchableDirections, atom);
    });
}

function dropIsVector(obj) {
    return {
        x: obj.x,
        y: obj.y,
        z: obj.z
    };
}

// Atom functions --------------------------------------
export function moveRandom(atomList) {
    atomList.forEach(atom => {
        atom.object.position.x += (Math.random() * 2) - 1;
        atom.object.position.y += (Math.random() * 2) - 1;
        atom.object.position.z += (Math.random() * 2) - 1;
    });
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

// Wall functions --------------------------------------
function isInWall(position, wallBeginning, boxScale, velocity) {
    // let inWall = (position >= wallBeginning + boxScale && position <= wallBeginning + boxScale + WALL_WIDTH); // right, top, front
    // inWall = inWall || (position <= wallBeginning && position >= wallBeginning - WALL_WIDTH); // left, bottom, back
    if (velocity > 0) {
        return (position >= wallBeginning + boxScale); // right, top, front
    } else {
        return (position <= wallBeginning); // left, bottom, back
    }
}

function switchDirections(sides, atom) {
    if (sides.x) { atom.velocity[0] *= -1; }
    if (sides.y) { atom.velocity[1] *= -1; }
    if (sides.z) { atom.velocity[2] *= -1; }
}