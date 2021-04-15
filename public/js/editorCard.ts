let menuOpen = false;
let editMode = false;
const editorImgage = $('#editor-card-img')[0];
const editorText = $('#editor-card .Text')[0];
const editorCard = $('#editor-card');
const pen = $('#pen');
const cards = $('.card-container');

const optionNewExperiment = $('#option-new-experiment');
const optionNewFolder = $('#option-new-folder');
const optionCancel = $('#option-cancel');

pen.on('click', toggleCardMenu);



editorCard.on('click', openMenu);
optionCancel.on('click', closeMenu);

optionNewExperiment.on('click', () => {
    window.location.href = `/new/experiment?id=${getId()}`;
});

optionNewFolder.on('click', () => {
    window.location.href = `/new/folder?id=${getId()}`;
});

function getId(): string {
    const url = window.location.href;
    let idFragments = url.split('/');
    idFragments.shift(); // http | https
    idFragments.shift(); // empty string between //
    idFragments.shift(); // domain
    idFragments.shift(); // selection

    let id = idFragments.join('/');
    id = id.replace(/[^0-9\/]/g, '');

    return id;
}

function openMenu() {
    if (!menuOpen) {
        editorImgage.style.height = '0px';
        editorText.style.marginTop = '-20px';
        editorCard.removeClass('selectable-no-border');

        menuOpen = true;
    }
}

function closeMenu() {
    if (menuOpen) {
        editorImgage.style.height = '150px';
        editorText.style.marginTop = '0px';
        editorCard.addClass('selectable-no-border');
        menuOpen = false;
        return false; // prevent other events from being fired
    }
}

function toggleCardMenu() {
    if (editMode) {
        cards.addClass('selectable-no-border');
        cards.css('max-height', '200px');
        editorCard.hide();
    } else {
        cards.removeClass('selectable-no-border');
        cards.css('max-height', '250px');
        editorCard.show();
    }
    editMode = !editMode
}