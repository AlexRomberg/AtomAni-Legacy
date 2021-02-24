import * as THREE from '../res/lib/three.module.js';

const MaxDistance = 160000;
const CONST_k = 1.380658e-23;

let atomMass = 0.336e-25;
let epsilon = 36.83 * CONST_k;
let sigma = 2.79;
let sigma2 = Math.pow(sigma, 2);

const AverageIDs = ['avgVel', 'pres'];
let chartTmp = {
    avgVel: { x: 0, y: 0, z: 0, count: 0 },
    pres: { x: 0, y: 0, z: 0, count: 0 }
};
let ChartValues = {
    avgVel: 0,
    pres: 0
};

let OldPositions = [];

export function updatePositions(atomList, wallList, timeStep) {
    timeStep *= Number($('#btnSpeed').attr('value')); // change simulation speed

    if (timeStep > 100) { timeStep = 100; } // prevent too long timessteps
    timeStep *= 7e-6;

    let forces = getForce(atomList, wallList);
    // addGravitation(forces);
    calculateForceWalls(wallList, atomList, forces);
    AverageIDs.forEach(id => {
        calculateAverage(id);
    });
    setNewPositions(atomList, forces, timeStep);
    calculateReboundWalls(wallList, atomList);
}

function getForce(atomList) {
    let forces = new Array(atomList.length);
    forces.fill(new THREE.Vector3());

    for (let atom = 0; atom < atomList.length; atom++) {
        let atomPos = new THREE.Vector3().copy(atomList[atom].object.position);
        OldPositions[atom] = atomPos;

        for (let target = atom + 1; target < atomList.length; target++) {
            let targetPos = new THREE.Vector3().copy(atomList[target].object.position);

            let length2 = targetPos.distanceToSquared(atomPos);
            let distanceV = targetPos.sub(atomPos);

            if (length2 < MaxDistance) {
                let force = calcLJ(length2);
                distanceV.multiplyScalar(force);


                forces[atom] = new THREE.Vector3().addVectors(forces[atom], distanceV);
                forces[target] = new THREE.Vector3().subVectors(forces[target], distanceV);
            }
        }
    }
    return forces;
}

function calcLJ(length2) {
    let forcePart = sigma2 / length2;
    let forcePart6 = forcePart * forcePart * forcePart;
    let force = 24 * epsilon * (forcePart6 - 2 * forcePart6 * forcePart6);
    return force;
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

    for (let atom = 0; atom < atomList.length; atom++) {
        // acceleration
        let acceleration = (forces[atom]).multiplyScalar(invAtomMass);
        // velocity
        atomList[atom].velocity.add(acceleration.multiplyScalar(timeStep));

        // temperature
        let vel = new THREE.Vector3().copy(atomList[atom].velocity.multiplyScalar($('#inpTemp').val()));

        if (atomList[atom].velocity.lengthSq() < 100000) {
            logAverage(atomList[atom].velocity, 'avgVel');
        }

        // positions
        vel.multiplyScalar(timeStep);
        atomList[atom].object.position.add(vel);
    }
}

// Wall functions --------------------------------------
function calculateForceWalls(wallList, atomList, forces) {
    for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
        wallList.forEach(wall => {
            if (wall.type == "force-LJ") {
                handleLJWall(atomList, atomIndex, wall, forces);
            }
        });
    }
}

function calculateReboundWalls(wallList, atomList) {
    for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
        wallList.forEach(wall => {
            if (wall.type == "rebound") {
                handleReboundWall(atomList, atomIndex, wall);
            }
        });
    }
}


function handleLJWall(atomList, atomIndex, wall, forces) {
    let wallDistances = getDistances(atomList[atomIndex], wall);
    if (wallDistances) {
        let force = calculateWallForcesLJ(wallDistances);
        forces[atomIndex] = new THREE.Vector3().addVectors(forces[atomIndex], force);
        logAverage(force, 'pres');
    }
}

function handleReboundWall(atomList, atomIndex, wall) {
    let atomDirectionPosition = getAtomDirectionPositions(atomList, atomIndex, wall);
    if ((atomDirectionPosition.old <= wall.position && atomDirectionPosition.new >= wall.position) ||
        (atomDirectionPosition.old >= wall.position && atomDirectionPosition.new <= wall.position)) {
        setAtomReboundPositions(atomList, atomIndex, wall);
        changeDirection(atomList[atomIndex], wall);
    }
}

function getAtomDirectionPositions(atomList, atomIndex, wall) {
    switch (wall.direction) {
        case "x":
            return { old: OldPositions[atomIndex].x, new: atomList[atomIndex].object.position.x }
        case "y":
            return { old: OldPositions[atomIndex].y, new: atomList[atomIndex].object.position.y }
        case "z":
            return { old: OldPositions[atomIndex].z, new: atomList[atomIndex].object.position.z }
        default:
            return null;
    }
}

function setAtomReboundPositions(atomList, atomIndex, wall) {
    switch (wall.direction) {
        case "x":
            atomList[atomIndex].object.position.x = wall.position - (atomList[atomIndex].object.position.x - wall.position);
            break;
        case "y":
            atomList[atomIndex].object.position.y = wall.position - (atomList[atomIndex].object.position.y - wall.position);
            break;
        case "z":
            atomList[atomIndex].object.position.z = wall.position - (atomList[atomIndex].object.position.z - wall.position);
            break;
    }
}

function changeDirection(atom, wall) {
    switch (wall.direction) {
        case "x":
            atom.velocity = new THREE.Vector3(-1 * atom.velocity.x, atom.velocity.y, atom.velocity.z);
            break;
        case "y":
            atom.velocity = new THREE.Vector3(atom.velocity.x, -1 * atom.velocity.y, atom.velocity.z);
            break;
        case "z":
            atom.velocity = new THREE.Vector3(atom.velocity.x, atom.velocity.y, -1 * atom.velocity.z);
            break;
    }
}

function getDistances(atom, wall) {
    let wallDistances = [0, 0, 0, 0, 0, 0]; // x,x,y,y,z,z  <- each direction
    wallDistances[0] = wall.position.x - atom.object.position.x;
    wallDistances[2] = wall.position.y - atom.object.position.y;
    wallDistances[4] = wall.position.z - atom.object.position.z;
    wallDistances[1] = wall.position.x + wall.scale.x - atom.object.position.x;
    wallDistances[3] = wall.position.y + wall.scale.y - atom.object.position.y;
    wallDistances[5] = wall.position.z + wall.scale.z - atom.object.position.z;
    return wallDistances;
}

function calculateWallForcesLJ(wallDistances) {
    let force = [0, 0, 0];
    for (let i = 0; i < force.length; i++) {
        force[i] -= calcLJ(wallDistances[i * 2] * wallDistances[i * 2]);
        force[i] += calcLJ(wallDistances[i * 2 + 1] * wallDistances[i * 2 + 1]);
    }
    return new THREE.Vector3(force[0], force[1], force[2]);
}

// Chart functions --------------------------------------
export function getChartInfo() {
    return ChartValues;
}

function logAverage(value, name) {
    chartTmp[name].x += Math.abs(value.x);
    chartTmp[name].y += Math.abs(value.y);
    chartTmp[name].z += Math.abs(value.z);
    chartTmp[name].count++;
}

function calculateAverage(type) {
    ChartValues[type] = Math.sqrt(chartTmp[type].x * chartTmp[type].x + chartTmp[type].y * chartTmp[type].y + chartTmp[type].z * chartTmp[type].z);
    chartTmp[type] = { x: 0, y: 0, z: 0, count: 0 };
}

// gravitation
// function addGravitation(forcesList) {
//     const gravityFactor = new THREE.Vector3(0, -9.81 / 2, 0);
//     forcesList.forEach(force => {
//        force.add(gravityFactor);
//     });
// }