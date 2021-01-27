import * as THREE from '../res/lib/three.module.js';
import { Vector } from '../res/lib/vector.js';

export function initBox(x, y, z, width, height, depth) {
    let boxGeo = new THREE.BoxGeometry(width, height, depth);
    let geo = new THREE.EdgesGeometry(boxGeo);
    let mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    let lineSeg = new THREE.LineSegments(geo, mat);

    lineSeg.position.x = x + width / 2;
    lineSeg.position.y = y + height / 2;
    lineSeg.position.z = z + depth / 2;

    const box = {
        object: lineSeg,
        position: new Vector(x, y, z),
        scale: new Vector(width, height, depth)
    };
    return box;
}