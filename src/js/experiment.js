import * as Atoms from './atoms.js';
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
// let AtomList = Atoms.generateGrid(2, 1, 1);
let AtomList = [
    Atoms.create("ar", 25, 0, 0),
    Atoms.create("ne", -25, 0, 0) /* blau */
]
Simulation.addAtoms(AtomList, renderInfo.scene);
Simulation.startRendering(renderInfo);

setInterval(() => { Simulation.start(); }, 1000);