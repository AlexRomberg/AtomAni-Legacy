import * as THREE from '../res/lib/three.module.js';

const MaxDistance = 160000;
const WALL_WIDTH = 30;
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

const AverageIDs = ['avgVel', 'pres'];
let chartTmp = {
    avgVel: { x: 0, y: 0, z: 0, count: 0 },
    pres: { x: 0, y: 0, z: 0, count: 0 }
};
let ChartValues = {
    avgVel: 0,
    pres: 0
};

export function updatePositions(atomList, wallList, timeStep) {
    timeStep *= Number($('#btnSpeed').attr('value')); // change simulation speed

    if (timeStep > 100) { timeStep = 100; } // prevent too long timessteps

    let forces = getForce(atomList, wallList);
    calculateWalls(wallList, atomList, forces);
    AverageIDs.forEach(id => {
        calculateAverage(id);
    });
    setNewPositions(atomList, forces, timeStep);
}

function getForce(atomList) {
    let forces = new Array(atomList.length);
    forces.fill(new THREE.Vector3());

    for (let atom = 0; atom < atomList.length; atom++) {
        for (let target = atom + 1; target < atomList.length; target++) {
            let atomPos = new THREE.Vector3().copy(atomList[atom].object.position);
            let targetPos = new THREE.Vector3().copy(atomList[target].object.position);

            let length2 = targetPos.distanceToSquared(atomPos);
            let distanceV = targetPos.sub(atomPos);

            if (length2 < MaxDistance) {

                let forcePart = (sigma2 / length2) * (sigma2 / length2) * (sigma2 / length2);
                let force = 24 * epsilon * (forcePart - 2 * forcePart * forcePart);
                distanceV.multiplyScalar(force);


                forces[atom] = new THREE.Vector3().addVectors(forces[atom], distanceV);
                forces[target] = new THREE.Vector3().subVectors(forces[target], distanceV);
            }
        }
    }
    return forces;
}

function calculateWalls(wallList, atomList, forces) {
    for (let atomIndex = 0; atomIndex < atomList.length; atomIndex++) {
        // let switchableDirections = { x: false, y: false, z: false };
        // wallList.forEach(wall => {
        //     switchableDirections.x = switchableDirections.x || isInWall(atom.object.position.x, wall.position.x, wall.scale.x, atom.velocity.x);
        //     switchableDirections.y = switchableDirections.y || isInWall(atom.object.position.y, wall.position.y, wall.scale.y, atom.velocity.y);
        //     switchableDirections.z = switchableDirections.z || isInWall(atom.object.position.z, wall.position.z, wall.scale.z, atom.velocity.z);
        // });
        // switchDirections(switchableDirections, atom);
        wallList.forEach(wall => {
            let wallDistances = getDistances(atomList[atomIndex], wall);
            if (wallDistances) {
                let force = calculateWallForces(wallDistances);
                forces[atomIndex] = new THREE.Vector3().addVectors(forces[atomIndex], force);
                logAverage(force, 'pres');
            }
        });
    }
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
function getDistances(atom, wall) {
    let wallDistances = [
        0, // x1
        0, // x2
        0, // y1
        0, // y2
        0, // z1
        0 // z2
    ];
    if ((wallDistances[0] = wall.position.x - atom.object.position.x) >= 0) { return false; };
    if ((wallDistances[1] = wall.position.x + wall.scale.x - atom.object.position.x) <= 0) { return false; };
    if ((wallDistances[2] = wall.position.y - atom.object.position.y) >= 0) { return false; };
    if ((wallDistances[3] = wall.position.y + wall.scale.y - atom.object.position.y) <= 0) { return false; };
    if ((wallDistances[4] = wall.position.z - atom.object.position.z) >= 0) { return false; };
    if ((wallDistances[5] = wall.position.z + wall.scale.z - atom.object.position.z) <= 0) { return false; };
    return wallDistances;
}

function calculateWallForces(wallDistances) {
    let force = [0, 0, 0];
    for (let i = 0; i < force.length; i++) {
        for (let direction = 0; direction < 2; direction++) {
            let distance = wallDistances[2 * i + direction] / 20; // resize distance to get force-margin on boxes
            let distance3 = distance * distance * distance;
            force[i] -= 50 / distance3;
        }
    }
    return new THREE.Vector3(force[0], force[1], force[2]);
}

function switchDirections(sides, atom) {
    if (sides.x) { atom.velocity.x *= -1; }
    if (sides.y) { atom.velocity.y *= -1; }
    if (sides.z) { atom.velocity.z *= -1; }
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