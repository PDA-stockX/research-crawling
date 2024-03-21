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

    if (doc.numPages >= 2) {
        const page2 = await doc.getPage(2)
        const data2 = (await page2.getTextContent()).items.map(elem => {
            if (elem.str) {
                return elem.str
            }
            return ''
        }).join(' ')

        return data + ' ' + data2
    }

    return data;
}

export default getContent;
