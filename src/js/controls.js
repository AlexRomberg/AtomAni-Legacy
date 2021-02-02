import * as Atoms from './atoms.js';
import * as Walls from './walls.js';

export function handle(simulation, renderInfo, simulationScript) {
    startBtn(simulation);
    resetBtn(simulation, renderInfo, simulationScript);
    animationSpeedBtn();
}

function animationSpeedBtn() {
    $('#btnSpeed').click(() => {
        switch ($('#btnSpeed').attr('value')) {
            case '2':
                $('#btnSpeed').attr('value', 1);
                $('#btnSpeed').text('1×');
                break;
            case '1':
                $('#btnSpeed').attr('value', 0.5);
                $('#btnSpeed').text('0.5×');
                break;
            case '0.5':
                $('#btnSpeed').attr('value', 0.25);
                $('#btnSpeed').text('0.25×');
                break;
            case '0.25':
                $('#btnSpeed').attr('value', 2);
                $('#btnSpeed').text('2×');
                break;
            default:
                console.log($('#btnSpeed').val());
                break;
        }
    });
}

function resetBtn(simulation, renderInfo, simulationScript) {
    $('#btnReset').click(() => {
        simulation.reset(renderInfo.scene);
        let atomList = Atoms.loadFromScript(simulationScript.atoms);
        let WallList = Walls.loadFromScript(simulationScript.walls);

        simulation.addAtoms(atomList, renderInfo.scene);
        simulation.addWalls(WallList, renderInfo.scene);
        simulation.initCharts(simulationScript.charts);
        if ($('#btnStart img').attr('alt') != 'Start') {
            setTimeout(() => {
                simulation.start();
            }, 1000);
        }
    });
}

function startBtn(simulation) {
    $('#btnStart').click(() => {
        if ($('#btnStart img').attr('alt') == 'Start') {
            simulation.start();
            $('#btnStart img').attr('alt', 'Stop');
            $('#btnStart img').attr('src', '/src/res/img/btnPause.png');
        } else {
            simulation.stop();
            $('#btnStart img').attr('alt', 'Start');
            $('#btnStart img').attr('src', '/src/res/img/btnPlay.png');
        }
    });
}

export function loadFromScript(controlOptions) {
    controlOptions.forEach(controlOption => {
        $('#' + controlOption.id).css('display', 'block');
        $('#' + controlOption.id + ' h4').text(controlOption.name);
    });
}