import * as Experiment from '../js/experiment.js';
let SimulationScript = {
    "charts": [],
    "atoms": [],
    "walls": [],
    "controls": []
};


function handleStaticInputs() {
    $('#fps').on('change', handleControlSelection);
    $('#avgVel').on('change', handleControlSelection);
    $('#pres').on('change', handleControlSelection);
    $('#temp').on('change', handleControlSelection);
    $('#control').on('change', handleControlSelection);
    $('.controlPane input').on('input', handleControlPaneInputs);

    $('.add').on('click', (e) => {
        let sender = e.target;
        while (sender.tagName != "BUTTON") {
            sender = sender.parentElement;
        }
        createNewObject(sender);
    });
}

function handleDynamicInputs() {
    // prevent eventlistener stacking
    $('.list input').off("input");
    $('.list select').off("change");

    $('.list input').on("input", (e) => {
        if (e.target.id.includes("atom")) {
            updateAtom(getItemId(e.target));
            Experiment.redraw(SimulationScript);
        } else if (e.target.id.includes("wall")) {
            updateWall(getItemId(e.target));
            Experiment.redraw(SimulationScript);
        }
    });
    $('.list select').on("change", (e) => {
        const id = getItemId(e.target);
        if (e.target.id == "aType" + id) {
            updateAtomBox(id, e.target.value);
            updateAtom(id);
            handleDynamicInputs();
        } else if (e.target.id == "atomType" + id) {
            updateAtom(id);
        } else if (e.target.id == "wallType" + id) {
            updateWall(id);
        }
        Experiment.redraw(SimulationScript);
    });
}

function handleControlPaneInputs(event) {
    console.log(event);
    let controlInfo = getControlId(event.target);
    console.log(controlInfo);
    if (event.target.id != controlInfo.id) {
        if (controlInfo.type == "chart") {
            updateChart(controlInfo.id);
        } else {
            updateControl(controlInfo.id);
        }
    }
}

function handleControlSelection(event) {
    const target = event.target;
    if (target.id == "fps" || target.id == "avgVel" || target.id == "pres") {
        if (target.checked) {
            addChart(target.id);
        } else {
            removeChart(target.id);
        }
    } else {
        if (target.checked) {
            addControl(target.id);
        } else {
            removeControl(target.id);
        }
    }
}

function getItemId(sender) {
    while (!sender.classList.contains('selectionBox')) {
        sender = sender.parentElement;
    }
    return sender.id;
}

function getControlId(sender) {
    while (!sender.classList.contains('chart') && !sender.classList.contains('control')) {
        sender = sender.parentElement;
    }
    return { id: sender.children[0].id, type: sender.classList.contains('chart') ? "chart" : "control" };
}

function getColor(hex) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return { fill: "rgba(" + r + ", " + g + ", " + b + ", 0.4)", line: "rgba(" + r + ", " + g + ", " + b + ", 1)" };
}



// DOM manipulation
function createNewObject(sender) {
    if (sender.id == "addAtom") {
        const id = addAtom();
        createAtomBox(id, sender);
    } else {
        const id = addWall();
        createWallBox(id, sender);
    }
    Experiment.redraw(SimulationScript);
    handleDynamicInputs();
}

function createAtomBox(id, sender) {
    let object = document.createElement("div");
    object.classList.add("selectionBox");
    object.id = id;
    object.classList.add("small-grid");
    object.innerHTML = getAtomBoxSmall(id, 0, 0, 0);
    sender.before(object);
}

function createWallBox(id, sender) {
    let object = document.createElement("div");
    object.classList.add("selectionBox");
    object.id = id;
    object.classList.add("large-grid");
    object.innerHTML = getWallBox(id);
    sender.before(object);
}

function updateAtomBox(id, type) {
    const atom = SimulationScript.atoms[id];
    if (type == "grid") {
        $('#atomList #' + id).html(getAtomBoxLarge(id, atom.x, atom.y, atom.z, atom.width, atom.height, atom.depth));
        $('#atomList #' + id).removeClass("small-grid").addClass("large-grid");
    } else {
        const selectedAtomType = $('#aType' + id).val();
        $('#atomList #' + id).html(getAtomBoxSmall(id, atom.x, atom.y, atom.z));
        $('#aType' + id).val(selectedAtomType);
        $('#atomList #' + id).addClass("small-grid").removeClass("large-grid");
    }
}

function getAtomBoxLarge(id, posX, posY, posZ, sizeX = 5, sizeY = 5, sizeZ = 5) {
    return "<img src=\"../res/img/atomGrid.svg\" alt=\"Atom\">" +
        "<label for=\"aType" + id + "\">Typ:</label>" +
        "<select id=\"aType" + id + "\">" +
        "  <option value=\"singleAr\">Einzel (ar)</option>" +
        "  <option value=\"singleKr\">Einzel (kr)</option>" +
        "  <option value=\"singleNe\">Einzel (ne)</option>" +
        "  <option selected=\"selected\" value=\"grid\">Gitter</option>" +
        "</select>" +
        "<label for=\"atomType" + id + "\">Atomtyp:</label>" +
        "<select id=\"atomType" + id + "\">" +
        "  <option value=\"ne\">Neon</option>" +
        "  <option value=\"ar\">Argon</option>" +
        "  <option value=\"kr\">Krypton</option>" +
        "</select>" +
        "<label for=\"atomPosX" + id + "\">X:</label>" +
        "<input type=\"range\" id=\"atomPosX" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"" + posX + "\">" +
        "<label for=\"atomGridSizeWidth" + id + "\">Breite:</label>" +
        "<input type=\"range\" id=\"atomGridSizeWidth" + id + "\" min=\"1\" max=\"9\" value=\"" + sizeX + "\">" +
        "<label for=\"atomPosY" + id + "\">Y:</label>" +
        "<input type=\"range\" id=\"atomPosY" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"" + posY + "\">" +
        "<label for=\"atomGridSizeHeight" + id + "\">Höhe:</label>" +
        "<input type=\"range\" id=\"atomGridSizeHeight" + id + "\" min=\"1\" max=\"9\" value=\"" + sizeY + "\">" +
        "<label for=\"atomPosZ" + id + "\">Z:</label>" +
        "<input type=\"range\" id=\"atomPosZ" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"" + posZ + "\">" +
        "<label for=\"atomGridSizeDepth" + id + "\">Tiefe:</label>" +
        "<input type=\"range\" id=\"atomGridSizeDepth" + id + "\" min=\"1\" max=\"9\" value=\"" + sizeZ + "\">";
}

function getAtomBoxSmall(id, posX, posY, posZ) {
    return "<img src=\"../res/img/atom.svg\" alt=\"Atom\">" +
        "<label for=\"aType" + id + "\">Typ:</label>" +
        "<select id=\"aType" + id + "\">" +
        "  <option value=\"singleNe\">Einzel (ne)</option>" +
        "  <option value=\"singleAr\">Einzel (ar)</option>" +
        "  <option value=\"singleKr\">Einzel (kr)</option>" +
        "  <option value=\"grid\">Gitter</option>" +
        "</select>" +
        "<label for=\"atomPosX" + id + "\">X:</label>" +
        "<input type=\"range\" id=\"atomPosX" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"" + posX + "\">" +
        "<label for=\"atomPosY" + id + "\">Y:</label>" +
        "<input type=\"range\" id=\"atomPosY" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"" + posY + "\">" +
        "<label for=\"atomPosZ" + id + "\">Z:</label>" +
        "<input type=\"range\" id=\"atomPosZ" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"" + posZ + "\">";
}

function getWallBox(id) {
    return "<img src=\"../res/img/box.svg\" alt=\"Atom\">" +
        "<label for=\"wType" + id + "\">Typ:</label>" +
        "<select id=\"wType" + id + "\">" +
        "  <option value=\"singleNe\">Würfel</option>" +
        "</select>" +
        "<label for=\"wallType" + id + "\">Wandtyp:</label>" +
        "<select id=\"wallType" + id + "\">" +
        "  <option value=\"force-LJ\">Kraft</option>" +
        // "  <option value=\"rebound\">Abprallen</option>" +
        "</select>" +
        "<label for=\"wallPosX" + id + "\">X:</label>" +
        "<input type=\"range\" id=\"wallPosX" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"0\">" +
        "<label for=\"wallSizeWidth" + id + "\">Breite:</label>" +
        "<input type=\"range\" id=\"wallSizeWidth" + id + "\" min=\"1\" max=\"200\" step=\"5\" value=\"100\">" +
        "<label for=\"wallPosY" + id + "\">Y:</label>" +
        "<input type=\"range\" id=\"wallPosY" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"0\">" +
        "<label for=\"wallSizeHeight" + id + "\">Höhe:</label>" +
        "<input type=\"range\" id=\"wallSizeHeight" + id + "\" min=\"1\" max=\"200\" step=\"5\" value=\"100\">" +
        "<label for=\"wallPosZ" + id + "\">Z:</label>" +
        "<input type=\"range\" id=\"wallPosZ" + id + "\" min=\"-100\" max=\"100\" step=\"5\" value=\"0\">" +
        "<label for=\"wallSizeDepth" + id + "\">Tiefe:</label>" +
        "<input type=\"range\" id=\"wallSizeDepth" + id + "\" min=\"1\" max=\"200\" step=\"5\" value=\"100\">";
}



// SimulationScript manipulation
function updateDataField() {
    $('#data').val(JSON.stringify(SimulationScript));

    console.log(SimulationScript);
}

function addChart(id) {
    SimulationScript.charts.push({ id, title: id, fillColor: 'rgba(0,102,255,0.4)', lineColor: 'rgba(0,102,255,1)' });
    updateDataField();
}

function removeChart(id) {
    var index = SimulationScript.charts.map(i => {
        return i.id;
    }).indexOf(id);
    SimulationScript.charts.splice(index, 1);
    updateDataField();
}

function updateChart(id) {
    if ($('#' + id).is(':checked')) {
        var index = SimulationScript.charts.map(i => {
            return i.id;
        }).indexOf(id);
        const color = getColor($('#' + id + 'Color').val());
        SimulationScript.charts[index].fillColor = color.fill;
        SimulationScript.charts[index].lineColor = color.line;
        SimulationScript.charts[index].title = $('#' + id + 'Name').val();
        updateDataField();
    }
}

function addControl(id) {
    SimulationScript.controls.push({ id, name: id });
    updateDataField();
}

function removeControl(id) {
    var index = SimulationScript.controls.map(i => {
        return i.id;
    }).indexOf(id);
    SimulationScript.controls.splice(index, 1);
    updateDataField();
}

function updateControl(id) {
    if ($('#' + id).is(':checked')) {
        var index = SimulationScript.controls.map(i => {
            return i.id;
        }).indexOf(id);
        SimulationScript.controls[index].name = $('#' + id + 'Name').val();
        updateDataField();
    }
}

function addAtom() {
    const id = SimulationScript.atoms.length;
    SimulationScript.atoms.push({
        type: "single",
        x: 0,
        y: 0,
        z: 0,
        atomType: "ne"
    });
    updateDataField();
    return id;
}

function updateAtom(id) {
    let atom = SimulationScript.atoms[id];
    atom.x = Number($('#atomPosX' + id).val());
    atom.y = Number($('#atomPosY' + id).val());
    atom.z = Number($('#atomPosZ' + id).val());
    switch ($('#aType' + id).val()) {
        case "grid":
            convertAtomToGrid(atom);
            atom.atomType = $('#atomType' + id).val();
            atom.width = Number($('#atomGridSizeWidth' + id).val());
            atom.height = Number($('#atomGridSizeHeight' + id).val());
            atom.depth = Number($('#atomGridSizeDepth' + id).val());

            atom.x -= ((atom.width - 1) / 2) * 5
            atom.y -= ((atom.height - 1) / 2) * 5
            atom.z -= ((atom.depth - 1) / 2) * 5
            break;
        case "singleNe":
            convertAtomToSingle(atom);
            atom.atomType = "ne";
            break;
        case "singleAr":
            convertAtomToSingle(atom);
            atom.atomType = "ar";
            break;
        case "singleKr":
            convertAtomToSingle(atom);
            atom.atomType = "kr";
            break;
        default:
            convertAtomToSingle(atom);
            atom.atomType = "ne";
            break;
    }
    updateDataField();
}

function convertAtomToSingle(atom) {
    atom.type = "single";
    delete atom.width;
    delete atom.height;
    delete atom.depth;
    updateDataField();
}

function convertAtomToGrid(atom) {
    atom.type = "grid";
    updateDataField();
}

function removeAtom(id) {
    SimulationScript.atoms[id] = null;
    updateDataField();
}

function addWall() {
    const id = SimulationScript.walls.length;
    SimulationScript.walls.push({
        type: "force-LJ",
        x: -50,
        y: -50,
        z: -50,
        width: 100,
        height: 100,
        depth: 100
    });
    updateDataField();
    return id;
}

function updateWall(id) {
    const wall = SimulationScript.walls[id];
    wall.type = $('#wallType' + id).val();
    wall.width = Number($('#wallSizeWidth' + id).val());
    wall.height = Number($('#wallSizeHeight' + id).val());
    wall.depth = Number($('#wallSizeDepth' + id).val());
    wall.x = Number($('#wallPosX' + id).val()) - wall.width / 2;
    wall.y = Number($('#wallPosY' + id).val()) - wall.height / 2;
    wall.z = Number($('#wallPosZ' + id).val()) - wall.depth / 2;
    updateDataField();
}


// start
Experiment.initSimulation(SimulationScript, true);
handleStaticInputs();