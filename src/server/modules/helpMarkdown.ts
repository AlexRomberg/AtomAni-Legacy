// helpMarkdown.ts
//--------------------------------------------------------
// custom Node.js module to convert Markdown help to HTML
//
// © Alexander Romberg @ KFTG (IMS)
//--------------------------------------------------------

// imports
import fs from 'fs';
import showdown from 'showdown';
const mdconv = new showdown.Converter({ tables: true, noHeaderId: false });


function getHTML(): string {
    const markdown = fs.readFileSync(`${__dirname}/../data/help.md`, { encoding: "utf-8", flag: "r" }).toString();
    const editedMD = replaceMD(markdown);
    return mdconv.makeHtml(editedMD);
}

function replaceMD(markdown: string): string {
    let markdownList = markdown.split('\n')
    for (let line = 0; line < markdownList.length; line++) {
        if (line == 0) {
            markdownList[0] = '<img id="AtomAni" class="center" src="./" alt="AtomAni-Logo"></img><br>'
        } else if (markdownList[line].startsWith('# ')) {
            const id = markdownList[line].match(/#([^ }]+)/)![1];
            const title = markdownList[line].match(/# ([^ }]+)/)![1];
            markdownList[line] = `<h1 id="${id}">${title}</h1>`;
        }
    }
    return markdownList.join('\n');
}

export default { getHTML };