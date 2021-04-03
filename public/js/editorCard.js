"use strict";
let menuOpen = false;
const editorImgage = $('#editor-card-img')[0];
const editorText = $('#editor-card .Text')[0];
const editorCard = $('#editor-card');
const optionNewExperiment = $('#option-new-experiment');
const optionNewFolder = $('#option-new-folder');
const optionCancel = $('#option-cancel');
editorCard.on('click', () => {
    if (!menuOpen) {
        editorImgage.style.height = '0px';
        editorText.style.marginTop = '-20px';
        editorCard.removeClass('selectable');
        menuOpen = true;
    }
});
optionCancel.on('click', () => {
    if (menuOpen) {
        editorImgage.style.height = '150px';
        editorText.style.marginTop = '0px';
        editorCard.addClass('selectable');
        menuOpen = false;
        return false;
    }
});
optionNewExperiment.on('click', () => {
    window.location.href = '/new/experiment';
});
optionNewFolder.on('click', () => {
    window.location.href = '/new/folder';
});
