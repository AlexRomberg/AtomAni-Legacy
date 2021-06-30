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

function getRedirect(card: cardObject, id: number) {
    let redirect = '';
    if (card.type === "folder") {
        redirect = id.toString();
        if (card.path.split('/').length < 4) {
            redirect = `/selection/${id}`;
        }
    } else if (card.type === "experiment") {
        redirect = `/experiment/${card.experimentId}`
    }
    return redirect;
}

function addRedirects(cards: currentFolderItem | any) {
    for (let index = 0; index < cards.length; index++) {
        cards[index].redirect = getRedirect(cards[index], index);
        cards[index].editID = getRedirect(cards[index], index);
    }
    return cards;
}

export default { addRedirects }