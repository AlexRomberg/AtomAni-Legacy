import * as Atoms from './atoms.js';
import * as Walls from './walls.js';
import * as Simulation from './simulation.js';


// simulationWindow resizing
window.addEventListener("resize", handleResize);

function handleResize() {
    let windowWidth = $(".simulationWindow").width();
    if (windowWidth > 850) {
        windowWidth = windowWidth / 3 * 2
        $("#sim").css("height", "500px");
    } else {
        $("#sim").css("height", "400px");
    }
    $("#sim").css("width", windowWidth + "px");
}
handleResize();

// simulation
let renderInfo = Simulation.init();
let AtomList = Atoms.generateGrid(5, 5, 5);
let WallList = new Array();
WallList.push(Walls.initBox(-300, -300, -300, 600, 600, 600));
Simulation.addAtoms(AtomList, renderInfo.scene);
Simulation.addWalls(WallList, renderInfo.scene);
Simulation.startRendering(renderInfo);

setInterval(() => { Simulation.start(); }, 1000);