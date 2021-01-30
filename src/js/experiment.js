import * as Atoms from './atoms.js';
import * as Walls from './walls.js';
import * as Simulation from './simulation.js';
import * as Controls from './controls.js';

let SimulationScript;
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
export function initSimulation(simulationScript) {
    SimulationScript = simulationScript;

    let renderInfo = Simulation.init();
    let atomList = Atoms.loadFromScript(SimulationScript.atoms);
    let WallList = Walls.loadFromScript(SimulationScript.walls);
    Controls.loadFromScript(SimulationScript.controls);

    Simulation.addAtoms(atomList, renderInfo.scene);
    Simulation.addWalls(WallList, renderInfo.scene);
    Simulation.initCharts(SimulationScript.charts);

    Simulation.startRendering(renderInfo);

    Controls.handle(Simulation, renderInfo, SimulationScript);

    setTimeout(() => {
        Simulation.start();
    }, 1000);
}