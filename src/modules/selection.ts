interface cardObject {
    lastID?: number;
    name: string;
    imagename: string;
    path: string;
    type: "experiment" | "folder" | "none";
    experimentId?: string;
};

interface currentFolderItem {
    general: cardObject[];
    school: cardObject[];
};

function getCard(card: cardObject, id: number) {
    let redirect;
    if (card.type === "folder") {
        redirect = id;
        if (card.path.split('/').length < 4) {
            redirect = `/selection/${id}`;
        }
    } else if (card.type === "experiment") {
        redirect = `/experiment/${card.experimentId}`
    } else {
        return '';
    }
    const cardString = `<a class="card selectable" href="${redirect}">` +
        `<img src="/res/img/menuIcons/${card.imagename}" alt="Missing Folder Icon">` +
        `<div class="Text">` +
        `<h2>${card.name}</h2>` +
        `</div>` +
        `</a>`;
    return cardString;
}

function getEditorCard() {
    return `<div id="editor-card" class="card selectable"><img id="editor-card-img" src="/res/img/menuIcons/add.svg" alt="Missing Folder Icon"><div class="Text"><h2>Editor</h2></div><div class="options"><button id="option-new-experiment">Neues Experiment</button><button id="option-new-folder">Neuer Ordner</button><button id="option-cancel">Abbrechen</button></div></div>`;
}

function getCardsOfLayer(cards: currentFolderItem | any, user: any) {
    let cardString = '';
    for (let index = 0; index < cards.length; index++) {
        cardString += getCard(cards[index], index);
    }

    if (user.canEdit) {
        cardString += getEditorCard();
    }
    return cardString;
}

export default { getCardsOfLayer }