const MaxDistance = 10000;
const epsilon = 10; /* <- lookup */
const sigma = 10; /* <- lookup */
const sigma6 = sigma * sigma * sigma * sigma * sigma * sigma;
const sigma12 = sigma6 * sigma6;

export function updatePositions(atomList) {
    let forces = getForce(atomList);

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