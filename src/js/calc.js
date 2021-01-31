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

let chartTmp = {
    avgVel: { x: 0, y: 0, z: 0, count: 0 }
}
let ChartValues = {
    avgVel: 0
}

export function updatePositions(atomList, wallList, timeStep) {
    timeStep *= Number($('#btnSpeed').attr('value')); // change simulation speed

    if (timeStep > 100) { timeStep = 100; } // prevent too long timessteps

    let forces = getForce(atomList, wallList);
    calculateWalls(wallList, atomList);
    calculateAverage('avgVel')
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

        logAverageVelocity(atomList[atom].velocity);

        // positions
        vel.multiplyScalar(timeStep);
        atomList[atom].object.position.add(vel);
    }
}

// Wall functions --------------------------------------
function isInWall(position, wallBeginning, boxScale, velocity) {
    if (velocity > 0) {
        return (position >= wallBeginning + boxScale); // right, top, front
    } else {
        return (position <= wallBeginning); // left, bottom, back
    }
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

function logAverageVelocity(velocity) {
    chartTmp.avgVel.x += Math.abs(velocity.x);
    chartTmp.avgVel.y += Math.abs(velocity.y);
    chartTmp.avgVel.z += Math.abs(velocity.z);
    chartTmp.avgVel.count++;
}

function calculateAverage(type) {
    ChartValues[type] = Math.sqrt(chartTmp[type].x * chartTmp[type].x + chartTmp[type].y * chartTmp[type].y + chartTmp[type].z * chartTmp[type].z);
    chartTmp[type] = { x: 0, y: 0, z: 0, count: 0 };
}