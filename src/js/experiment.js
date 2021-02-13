import * as Atoms from './atoms.js';
import * as Walls from './walls.js';
import * as Simulation from './simulation.js';
import * as Controls from './controls.js';

let SimulationScript, RenderInfo;
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
export function initSimulation(simulationScript, isEditor = false) {
    SimulationScript = simulationScript;

    RenderInfo = Simulation.init();
    let atomList = Atoms.loadFromScript(SimulationScript.atoms);
    let WallList = Walls.loadFromScript(SimulationScript.walls);
    if (!isEditor) {
        Controls.loadFromScript(SimulationScript.controls);
    }

    Simulation.addAtoms(atomList, RenderInfo.scene);
    Simulation.addWalls(WallList, RenderInfo.scene);

    if (!isEditor) {
        Simulation.initCharts(SimulationScript.charts);
    }
    Simulation.startRendering(RenderInfo);

    if (!isEditor) {
        Controls.handle(Simulation, RenderInfo, SimulationScript);
        setTimeout(() => {
            Simulation.start();
        }, 1000);
    }
}

export function redraw(simulationScript) {
    Simulation.reset(RenderInfo.scene, true);
    let atomList = Atoms.loadFromScript(simulationScript.atoms);
    let WallList = Walls.loadFromScript(simulationScript.walls);
    Simulation.addAtoms(atomList, RenderInfo.scene);
    Simulation.addWalls(WallList, RenderInfo.scene);
}