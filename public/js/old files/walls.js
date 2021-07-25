import * as THREE from '/res/lib/three.module.js';

export function createBox(id, style, x = 0, y = 0, z = 0, width = 10, height = 10, depth = 10, type = "force-LJ") {
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
        id,
        style,
        type
    };
    return box;
}

function createWall(id, style, direction = "x", position = 10, type = "rebound") {
    const wall = {
        id,
        direction,
        position,
        style,
        type
    };
    return wall;
}

export function createVisualBox(id, style, x = 0, y = 0, z = 0, width = 10, height = 10, depth = 10) {
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
        id,
        style,
        type: "visual"
    };
    return box;
}

export function loadFromScript(wallOptions) {
    let wallList = new Array();
    wallOptions.forEach(wallOption => {
        switch (wallOption.style) {
            case "visual":
                wallList.push(createVisualBox(wallList.length, wallOption.style, wallOption.x, wallOption.y, wallOption.z, wallOption.width, wallOption.height, wallOption.depth));
                break;
            case "wall":
                wallList.push(createWall(wallOption.id, wallOption.style, wallOption.direction, wallOption.position, wallOption.type));
                break;
            default:
                wallList.push(this.createBox(wallList.length, wallOption.style, wallOption.x, wallOption.y, wallOption.z, wallOption.width, wallOption.height, wallOption.depth, wallOption.type));
                break;
        }
    });
    return wallList;
}