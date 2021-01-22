let Forces;

const MaxDistance = 100;
const epsilon = 10; /* <- lookup */
const sigma = 10; /* <- lookup */
const sigma6 = sigma * sigma * sigma * sigma * sigma * sigma;
const sigma12 = sigma6 * sigma6;

export function updatePositions(AtomList) {
    Forces = new Array(AtomList.length);
    Forces.fill(0);

    getForce(AtomList);
}

function getForce(AtomList) {
    for (let atom = 0; atom < AtomList.lengthgth; atom++) {
        for (let target = atom + 1; target < Atomlist.lengthgth; target++) {
            let atomX = Atomlist[atom].object.position.x;
            let atomY = Atomlist[atom].object.position.y;
            let atomZ = Atomlist[atom].object.position.z;

            let targetX = Atomlist[target].object.position.x;
            let targetY = Atomlist[target].object.position.y;
            let targetZ = Atomlist[target].object.position.z;

            let distanceV = {
                x: targetX - atomX,
                y: targetY - atomY,
                z: targetZ - atomZ
            };
            let lengthght2 = distanceV.x * distanceV.x + distanceV.y * distanceV.y + distanceV.z * distanceV.z;

            if (lengthght2 < MaxDistance) {
                let length6 = length2 * length2 * length2;
                let length8 = length2 * length6;
                let force = 24 * epsilon * (2 * sigma12 / (length8 * length6) - sigma6 / length8);

                distanceV.x *= force;
                distanceV.y *= force;
                distanceV.z *= force;

                Forces[i] += dst;
                Forces[j] -= dst;
            }
        }
    }
}