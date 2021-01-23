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
    forces.fill({ x: 0.0, y: 0.0, z: 0.0 });

    for (let atom = 0; atom < atomList.length; atom++) {
        for (let target = atom + 1; target < atomList.length; target++) {
            let atomX = atomList[atom].object.position.x;
            let atomY = atomList[atom].object.position.y;
            let atomZ = atomList[atom].object.position.z;

            let targetX = atomList[target].object.position.x;
            let targetY = atomList[target].object.position.y;
            let targetZ = atomList[target].object.position.z;

            let distanceV = {
                x: targetX - atomX,
                y: targetY - atomY,
                z: targetZ - atomZ
            };
            let length2 = distanceV.x * distanceV.x + distanceV.y * distanceV.y + distanceV.z * distanceV.z;

            if (length2 < MaxDistance) {
                let length6 = length2 * length2 * length2;
                let length8 = length2 * length6;
                let force = 24 * epsilon * (2 * sigma12 / (length8 * length6) - sigma6 / length8);

                distanceV.x *= force;
                distanceV.y *= force;
                distanceV.z *= force;

                forces[atom] = {
                    x: (forces[atom].x + distanceV.x),
                    y: (forces[atom].y + distanceV.y),
                    z: (forces[atom].z + distanceV.z)
                };

                forces[target] = {
                    x: (forces[target].x - distanceV.x),
                    y: (forces[target].y - distanceV.y),
                    z: (forces[target].z - distanceV.z)
                };
            }
        }
    }
    return forces;
}

function setNewPositions(atomList, forces, timeStep) {
    let invAtomMass = 1 / atomMass;

    let oldPos = {
        x: atomList[0].object.position.x,
        y: atomList[0].object.position.y,
        z: atomList[0].object.position.z
    };
    for (let atom = 0; atom < atomList.length; atom++) {
        // acceleration
        let acceleration = {
            x: forces[atom].x * invAtomMass,
            y: forces[atom].y * invAtomMass,
            z: forces[atom].z * invAtomMass
        };

        // velocity
        atomList[atom].velocity.x += acceleration.x * timeStep;
        atomList[atom].velocity.y += acceleration.y * timeStep;
        atomList[atom].velocity.z += acceleration.z * timeStep;


        // positions
        atomList[atom].object.position.x += atomList[atom].velocity.x * timeStep;
        atomList[atom].object.position.y += atomList[atom].velocity.y * timeStep;
        atomList[atom].object.position.z += atomList[atom].velocity.z * timeStep;
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