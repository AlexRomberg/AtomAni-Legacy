interface cardObject {
    lastID?: number;
    name: string;
    imagename: string;
    path: string;
    type: "experiment" | "folder" | "none";
};

interface currentFolderItem {
    general: cardObject[];
    school: cardObject[];
};

function getCard(card: cardObject, id: number) {
    let redirect;
    if (card.type === "folder") {
        redirect = card.path;
    } else if (card.type === "experiment") {
        redirect = `/experiment?id=${id}`
    } else {
        return '';
    }
    const cardString = `<a class="card" href="${redirect}">` +
        `<img src="/res/img/menuIcons/${card.imagename}" alt="Missing Folder Icon">` +
        `<div class="Text">` +
        `<h2>${card.name}</h2>` +
        `</div>` +
        `</a>`;
    return cardString;
}

function getCardsOfLayer(cards: currentFolderItem | any) {
    let cardString = '';
    for (let index = 0; index < cards.length; index++) {
        cardString += getCard(cards[index], index);
    }
    return cardString;
}

export default { getCardsOfLayer }