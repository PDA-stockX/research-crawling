import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'

async function getContent(url) {
    const doc = await pdfjs.getDocument(url).promise // note the use of the property promise
    const page = await doc.getPage(1)
    const data = (await page.getTextContent()).items.map(elem => {
        if (elem.str) {
            return elem.str
        }
        return ''
    }).join(' ')

    return data
}
//https://ssl.pstatic.net/imgstock/upload/research/company/1710113405251.pdf
// const filePath = '../resources/1710113405251.pdf';
// getContent(filePath);

// module.exports = getContent;
export default getContent;
