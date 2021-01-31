import * as THREE from '../res/lib/three.module.js';

export function createBox(id, x, y, z, width, height, depth) {
    let boxGeo = new THREE.BoxGeometry(width, height, depth);
    let geo = new THREE.EdgesGeometry(boxGeo);
    let mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    let lineSeg = new THREE.LineSegments(geo, mat);

    lineSeg.position.x = x + width / 2;
    lineSeg.position.y = y + height / 2;
    lineSeg.position.z = z + depth / 2;

    const box = {
        object: lineSeg,
        position: new THREE.Vector3(x, y, z),
        scale: new THREE.Vector3(width, height, depth),
        id
    };
    return box;
}

export function loadFromScript(wallOptions) {
    let wallList = new Array();
    wallOptions.forEach(wallOption => {
        wallList.push(this.createBox(wallList.length, wallOption.x, wallOption.y, wallOption.z, wallOption.width, wallOption.height, wallOption.depth));
    });
    return wallList;
}