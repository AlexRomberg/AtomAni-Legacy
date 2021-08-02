// @ts-ignore
// import CExperiment from './simulation';
import CExperiment from '/js/simulation.js';
// @ts-ignore
import Cookies from '/res/lib/js.cookie.min.mjs';

//#region types
type Atomtype = 'ne' | 'ar' | 'kr';
type Chart = {
    id: "fps" | "avgVel" | "pres";
    title: string;
    fillColor: string;
    lineColor: string;
}
type Atom = {
    type: "single";
    x: number;
    y: number;
    z: number;
    atomType: Atomtype;
} | {
    type: "grid" | "fcc" | "fcc-aba" | "fcc-abca";
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
    atomType: Atomtype;
}
type Wall = {
    type: "box"
    style: "visual" | "force-LJ";
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
} | {
    type: "wall";
    style: "rebound" | "force-LJ";
    position: number;
    direction: "x" | "y" | "z";
}
type Control = {
    id: "temp";
    name: string;
}
type Setting = {
    initialMomentum: number;
}
type ConfigScript = {
    charts: Chart[];
    atoms: Atom[];
    walls: Wall[];
    controls: Control[];
    settings: Setting[]
}
//#endregion


class CEditorUI {
    private SimulationScript: CSimulationScript;
    private Experiment: CExperiment;

    constructor() {
        this.SimulationScript = new CSimulationScript();
        // @ts-ignore
        this.Experiment = new CExperiment(this.SimulationScript.SimulationScript, false);
        this.handleStaticInputs();

        if (Cookies.get('EditorData') !== undefined) {
            this.renderFromScript();
        }
    }

    private handleStaticInputs() {
        $('#fps').on('change', this.handleControlSelection.bind(this));
        $('#avgVel').on('change', this.handleControlSelection.bind(this));
        $('#pres').on('change', this.handleControlSelection.bind(this));
        $('#temp').on('change', this.handleControlSelection.bind(this));
        $('.controlPane input').on('input', this.handleControlPaneInputs.bind(this));

        $('.add').on('click', (e) => {
            let sender = e.target;
            while (sender.tagName !== "BUTTON") {
                sender = sender.parentElement!;
            }
            this.createNewObject(sender);
        });

        $('#diagrammTab').on('click', (e) => {
            this.hideTabs();
            this.updateSelectedTab(e.target);
            $('#diagrammPanel').removeClass('hidden');
        });
        $('#controlsTab').on('click', (e) => {
            this.hideTabs();
            this.updateSelectedTab(e.target);
            $('#controlsPanel').removeClass('hidden');
        });
        $('#atomsTab').on('click', (e) => {
            this.hideTabs();
            this.updateSelectedTab(e.target);
            $('#atomsPanel').removeClass('hidden');
        });
        $('#wallsTab').on('click', (e) => {
            this.hideTabs();
            this.updateSelectedTab(e.target);
            $('#wallsPanel').removeClass('hidden');
        });
        $('#settingsTab').on('click', (e) => {
            this.hideTabs();
            this.updateSelectedTab(e.target);
            $('#settingsPanel').removeClass('hidden');
        });
    }

    private handleDynamicInputs() {
        // prevent eventlistener stacking
        $('.list input').off("input");
        $('.list select').off("change");

        $('.list input').on("input", (e) => {
            if (e.target.id.includes("atom")) {
                this.SimulationScript.updateAtom(this.getItemId(e.target));
                // @ts-ignore
                this.Experiment.redraw(this.SimulationScript.SimulationScript);
            } else if (e.target.id.includes("wall")) {
                this.SimulationScript.updateWall(this.getItemId(e.target));
                // @ts-ignore
                this.Experiment.redraw(this.SimulationScript.SimulationScript);
            }
        });
        $('.list select').on("change", (e) => {
            const id = this.getItemId(e.target);
            if (e.target.id == "aType" + id) {
                // @ts-ignore
                this.updateAtomBox(id, e.target.value);
                this.SimulationScript.updateAtom(id);
                this.handleDynamicInputs();
            } else if (e.target.id == "atomType" + id) {
                this.SimulationScript.updateAtom(id);
            } else if (e.target.id == "wallType" + id) {
                this.SimulationScript.updateWall(id);
            }
            // @ts-ignore
            this.Experiment.redraw(this.SimulationScript.SimulationScript);
        });
    }

    private handleControlPaneInputs(event: JQuery.TriggeredEvent) {
        // @ts-ignore
        let controlInfo = this.getControlId(event.target);
        // @ts-ignore
        if (event.target.id != controlInfo.id) {
            if (controlInfo.type == "chart") {
                this.SimulationScript.updateChart(controlInfo.id, this.getColor($(`#${controlInfo.id}Color`).val()!.toString()));
            } else {
                this.SimulationScript.updateControl(controlInfo.id);
            }
        }
    }

    private handleControlSelection(event: JQuery.ChangeEvent) {
        const target = event.target;
        if (target.id == "fps" || target.id == "avgVel" || target.id == "pres") {
            if (target.checked) {
                this.SimulationScript.addChart(target.id);
            } else {
                this.SimulationScript.removeChart(target.id);
            }
        } else {
            if (target.checked) {
                this.SimulationScript.addControl(target.id);
            } else {
                this.SimulationScript.removeControl(target.id);
            }
        }
    }

    private getItemId(sender: HTMLElement) {
        while (!sender.classList.contains('selectionBox')) {
            sender = sender.parentElement!;
        }
        return Number(sender.id);
    }

    private getControlId(sender: HTMLElement): { id: "fps" | "avgVel" | "pres", type: "chart" } | { id: "temp", type: "control" } {
        while (!sender.classList.contains('chart') && !sender.classList.contains('control')) {
            sender = sender.parentElement!;
        }
        // @ts-ignore
        return { id: sender.children[0].id as "fps" | "avgVel" | "pres" | "temp", type: sender.classList.contains('chart') ? "chart" : "control" };
    }

    private getColor(hex: string) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        return { fill: `rgba(${r}, ${g}, ${b}, 0)`, line: `rgba(${r}, ${g}, ${b}, 1)` };
    }

    private renderFromScript() {
        const atoms = this.SimulationScript.SimulationScript.atoms;
        for (let atom = 0; atom < atoms.length; atom++) {
            this.createAtomBox(atom, $('#addAtom')[0]);
            this.updateAtomBox(atom, atoms[atom].type);
        }
        const walls = this.SimulationScript.SimulationScript.walls;
        for (let wall = 0; wall < atoms.length; wall++) {
            this.createWallBox(wall, $('#addWall')[0]);
        }
    }

    // DOM manipulation
    private createNewObject(sender: HTMLElement) {
        if (sender.id == "addAtom") {
            const id = this.SimulationScript.addAtom();
            this.createAtomBox(id, sender);
        } else {
            const id = this.SimulationScript.addWall();
            this.createWallBox(id, sender);
        }
        // @ts-ignore
        this.Experiment.redraw(this.SimulationScript.SimulationScript);
        this.handleDynamicInputs();
    }

    private createAtomBox(id: number, sender: HTMLElement) {
        let object = document.createElement("div");
        object.classList.add("selectionBox");
        object.id = id.toString();
        object.classList.add("small-grid");
        object.innerHTML = UIElements.getAtomBoxSmall(id, 0, 0, 0, 'singleNe');
        sender.before(object);
    }

    private createWallBox(id: number, sender: HTMLElement) {
        let object = document.createElement("div");
        object.classList.add("selectionBox");
        object.id = id.toString();
        object.classList.add("large-grid");
        object.innerHTML = UIElements.getWallBox(id);
        sender.before(object);
    }

    private updateAtomBox(id: number, type: string) {
        const atom = this.SimulationScript.SimulationScript.atoms[id];
        if (type === "grid" || type === "fcc-aba" || type === "fcc-abca") {
            // @ts-ignore
            $('#atomList #' + id).html(UIElements.getAtomBoxLarge(id, atom.x, atom.y, atom.z, atom.width, atom.height, atom.depth, type as "grid" | "fcc-aba" | "fcc-abca"));
            $('#atomList #' + id).removeClass("small-grid").addClass("large-grid");
        } else {
            const selectedAtomType = $('#aType' + id).val();
            $('#atomList #' + id).html(UIElements.getAtomBoxSmall(id, atom.x, atom.y, atom.z, type as "singleNe" | "singleAr" | "singleKr"));
            $('#aType' + id).val(selectedAtomType!);
            $('#atomList #' + id).addClass("small-grid").removeClass("large-grid");
        }
    }

    // tabs
    private hideTabs() {
        $('.tab-panel').addClass('hidden');
    }

    private updateSelectedTab(active: HTMLElement) {
        $('.confignav p').removeClass('selected-tab');
        $(active).addClass('selected-tab');
    }
}

class UIElements {
    static getAtomBoxLarge(id: number, posX: number, posY: number, posZ: number, sizeX = 5, sizeY = 5, sizeZ = 5, selectedType: "grid" | "fcc-aba" | "fcc-abca") {
        return `<img src="/res/img/atomGrid.svg" alt="Atom">` +
            `<label for="aType${id}">Typ:</label>` +
            `<select id="aType${id}">` +
            `  <option value="singleNe">Einzel (ne)</option>` +
            `  <option value="singleAr">Einzel (ar)</option>` +
            `  <option value="singleKr">Einzel (kr)</option>` +
            `  <option ${selectedType === "grid" ? "selected " : ""}value="grid">Gitter</option>` +
            `  <option ${selectedType === "fcc-aba" ? "selected " : ""}value="fcc-aba">FCC (ABA)</option>` +
            `  <option ${selectedType === "fcc-abca" ? "selected " : ""}value="fcc-abca">FCC (ABCA)</option>` +
            `</select>` +
            `<label for="atomType${id}">Atomtyp:</label>` +
            `<select id="atomType${id}">` +
            `  <option value="ne">Neon</option>` +
            `  <option value="ar">Argon</option>` +
            `  <option value="kr">Krypton</option>` +
            `</select>` +
            `<label for="atomPosX${id}">X:</label>` +
            `<input type="range" id="atomPosX${id}" min="-100" max="100" step="5" value="${posX}">` +
            `<label for="atomGridSizeWidth${id}">Breite:</label>` +
            `<input type="range" id="atomGridSizeWidth${id}" min="1" max="9" value="${sizeX}">` +
            `<label for="atomPosY${id}">Y:</label>` +
            `<input type="range" id="atomPosY${id}" min="-100" max="100" step="5" value="${posY}">` +
            `<label for="atomGridSizeHeight${id}">Höhe:</label>` +
            `<input type="range" id="atomGridSizeHeight${id}" min="1" max="9" value="${sizeY}">` +
            `<label for="atomPosZ${id}">Z:</label>` +
            `<input type="range" id="atomPosZ${id}" min="-100" max="100" step="5" value="${posZ}">` +
            `<label for="atomGridSizeDepth${id}">Tiefe:</label>` +
            `<input type="range" id="atomGridSizeDepth${id}" min="1" max="9" value="${sizeZ}">`;
    }

    static getAtomBoxSmall(id: number, posX: number, posY: number, posZ: number, selectedType: "singleAr" | "singleKr" | "singleNe") {
        return `<img src="/res/img/atom.svg" alt="Atom">` +
            `<label for="aType${id}">Typ:</label>` +
            `<select id="aType${id}">` +
            `  <option ${selectedType === "singleNe" ? "selected " : ""}value="singleNe">Einzel (ne)</option>` +
            `  <option ${selectedType === "singleAr" ? "selected " : ""}value="singleAr">Einzel (ar)</option>` +
            `  <option ${selectedType === "singleKr" ? "selected " : ""}value="singleKr">Einzel (kr)</option>` +
            `  <option value="grid">Gitter</option>` +
            `  <option value="fcc-aba">FCC (ABA)</option>` +
            `  <option value="fcc-abca">FCC (ABCA)</option>` +
            `</select>` +
            `<label for="atomPosX${id}">X:</label>` +
            `<input type="range" id="atomPosX${id}" min="-100" max="100" step="5" value="${posX}">` +
            `<label for="atomPosY${id}">Y:</label>` +
            `<input type="range" id="atomPosY${id}" min="-100" max="100" step="5" value="${posY}">` +
            `<label for="atomPosZ${id}">Z:</label>` +
            `<input type="range" id="atomPosZ${id}" min="-100" max="100" step="5" value="${posZ}">`;
    }

    static getWallBox(id: number) {
        return `<img src="/res/img/box.svg" alt="Atom">` +
            `<label for="wType${id}">Typ:</label>` +
            `<select id="wType${id}">` +
            `  <option value="box">Würfel</option>` +
            `</select>` +
            `<label for="wallType${id}">Wandtyp:</label>` +
            `<select id="wallType${id}">` +
            `  <option value="force-LJ">Kraft</option>` +
            `  <option value="rebound">Abprallen</option>` +
            `</select>` +
            `<label for="wallPosX${id}">X:</label>` +
            `<input type="range" id="wallPosX${id}" min="-100" max="100" step="5" value="0">` +
            `<label for="wallSizeWidth${id}">Breite:</label>` +
            `<input type="range" id="wallSizeWidth${id}" min="1" max="200" step="5" value="100">` +
            `<label for="wallPosY${id}">Y:</label>` +
            `<input type="range" id="wallPosY${id}" min="-100" max="100" step="5" value="0">` +
            `<label for="wallSizeHeight${id}">Höhe:</label>` +
            `<input type="range" id="wallSizeHeight${id}" min="1" max="200" step="5" value="100">` +
            `<label for="wallPosZ${id}">Z:</label>` +
            `<input type="range" id="wallPosZ${id}" min="-100" max="100" step="5" value="0">` +
            `<label for="wallSizeDepth${id}">Tiefe:</label>` +
            `<input type="range" id="wallSizeDepth${id}" min="1" max="200" step="5" value="100">`;
    }
}

// SimulationScript manipulation
class CSimulationScript {
    public SimulationScript: ConfigScript;
    constructor() {
        if (Cookies.get('EditorData') === undefined) {
            // @ts-ignore
            this.SimulationScript = {
                charts: [],
                atoms: [],
                walls: [],
                controls: []
            }
        } else {
            try {
                this.SimulationScript = JSON.parse(Cookies.get('EditorData'));
            } catch {
                // @ts-ignore
                this.SimulationScript = {
                    charts: [],
                    atoms: [],
                    walls: [],
                    controls: []
                }
            }
        }
    }

    public updateDataField() {
        $('#data').val(JSON.stringify(this.SimulationScript));
        Cookies.set('EditorData', JSON.stringify(this.SimulationScript), { expires: 7, path: '' });
        console.clear();
        console.log(this.SimulationScript)
    }

    public addChart(id: "fps" | "avgVel" | "pres") {
        this.SimulationScript.charts.push({ id, title: id, fillColor: 'rgba(0,102,255,0)', lineColor: 'rgba(0,102,255,1)' });
        this.updateDataField();
    }

    public removeChart(id: "fps" | "avgVel" | "pres") {
        var index = this.SimulationScript.charts.map(i => {
            return i.id;
        }).indexOf(id);
        this.SimulationScript.charts.splice(index, 1);
        this.updateDataField();
    }

    public updateChart(id: "fps" | "avgVel" | "pres", color: { fill: string; line: string; }) {
        if ($('#' + id).is(':checked')) {
            var index = this.SimulationScript.charts.map(i => { return i.id; }).indexOf(id);

            this.SimulationScript.charts[index].fillColor = color.fill;
            this.SimulationScript.charts[index].lineColor = color.line;
            this.SimulationScript.charts[index].title = $(`#${id}Name`).val()!.toString();
            this.updateDataField();
        }
    }

    public addControl(id: 'temp') {
        this.SimulationScript.controls.push({ id, name: id });
        this.updateDataField();
    }

    public removeControl(id: 'temp') {
        var index = this.SimulationScript.controls.map(i => {
            return i.id;
        }).indexOf(id);
        this.SimulationScript.controls.splice(index, 1);
        this.updateDataField();
    }

    public updateControl(id: 'temp') {
        if ($('#' + id).is(':checked')) {
            var index = this.SimulationScript.controls.map(i => { return i.id; }).indexOf(id);
            this.SimulationScript.controls[index].name = $(`#${id}Name`).val()!.toString();
            this.updateDataField();
        }
    }

    public addAtom() {
        const id = this.SimulationScript.atoms.length;
        this.SimulationScript.atoms.push({
            type: "single",
            x: 0,
            y: 0,
            z: 0,
            atomType: "ne"
        });
        this.updateDataField();
        return id;
    }

    public updateAtom(id: number) {
        const atype = $(`#aType${id}`).val() as "singleNe" | "singleAr" | "singleKr" | "grid" | "fcc-aba" | "fcc-abca";
        const atom = this.SimulationScript.atoms[id];
        atom.x = Number($('#atomPosX' + id).val());
        atom.y = Number($('#atomPosY' + id).val());
        atom.z = Number($('#atomPosZ' + id).val());


        switch (atype) {
            case "grid":
            case "fcc-aba":
            case "fcc-abca":
                this.convertAtomToComplexType(atom, atype);
                atom.atomType = $('#atomType' + id).val()!.toString() as Atomtype;
                // @ts-ignore
                atom.width = Number($('#atomGridSizeWidth' + id).val());
                // @ts-ignore
                atom.height = Number($('#atomGridSizeHeight' + id).val());
                // @ts-ignore
                atom.depth = Number($('#atomGridSizeDepth' + id).val());

                // @ts-ignore
                atom.x -= ((atom.width - 1) / 2) * 5
                // @ts-ignore
                atom.y -= ((atom.height - 1) / 2) * 5
                // @ts-ignore
                atom.z -= ((atom.depth - 1) / 2) * 5
                break;
            case "singleNe":
                this.convertAtomToSingle(atom);
                atom.atomType = "ne";
                break;
            case "singleAr":
                this.convertAtomToSingle(atom);
                atom.atomType = "ar";
                break;
            case "singleKr":
                this.convertAtomToSingle(atom);
                atom.atomType = "kr";
                break;
            default:
                this.convertAtomToSingle(atom);
                atom.atomType = "ne";
                break;
        }
        this.updateDataField();
    }

    private convertAtomToSingle(atom: Atom) {
        atom.type = "single";
        // @ts-ignore
        delete atom.width;
        // @ts-ignore
        delete atom.height;
        // @ts-ignore
        delete atom.depth;
        this.updateDataField();
    }

    private convertAtomToComplexType(atom: Atom, type: "grid" | "fcc-aba" | "fcc-abca") {
        atom.type = type;
        this.updateDataField();
    }

    public removeAtom(id: number) {
        // @ts-ignore
        this.SimulationScript.atoms[id] = null;
        this.updateDataField();
    }

    public addWall() {
        const id = this.SimulationScript.walls.length;
        this.SimulationScript.walls.push({
            type: "box",
            style: "force-LJ",
            x: -50,
            y: -50,
            z: -50,
            width: 100,
            height: 100,
            depth: 100
        });
        this.updateDataField();
        return id;
    }

    public updateWall(id: number) {
        const wall = this.SimulationScript.walls[id]!;
        wall.type = $(`#wType${id}`).val()!.toString() as "box" | "wall";
        wall.style = $(`#wallType${id}`).val()!.toString() as "visual" | "force-LJ" | "rebound";
        // @ts-ignore
        wall.width = Number($('#wallSizeWidth' + id).val());
        // @ts-ignore
        wall.height = Number($('#wallSizeHeight' + id).val());
        // @ts-ignore
        wall.depth = Number($('#wallSizeDepth' + id).val());
        // @ts-ignore
        wall.x = Number($('#wallPosX' + id).val()) - wall.width / 2;
        // @ts-ignore
        wall.y = Number($('#wallPosY' + id).val()) - wall.height / 2;
        // @ts-ignore
        wall.z = Number($('#wallPosZ' + id).val()) - wall.depth / 2;
        this.updateDataField();
    }
}

const EditorUI = new CEditorUI;