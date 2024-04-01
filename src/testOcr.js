import fs from 'fs';

import extractName from './extractName.js'
import extractNameEmail from './extractNameEmail.js';
import pdfjs from './pdfjs.js';

import { str2date, date2str } from '../batch/date.js';

async function getUrls(dataPath) {
    const json = JSON.parse(fs.readFileSync(`${dataPath}/reportDetail.json`));
    return Object.values(json).map(item => item.pdfUrl);
}

const getData = async (dataPath) => {
    const reportList = JSON.parse(fs.readFileSync(`${dataPath}/reportList.json`));
    return (reportList);
}

const noEmailFirms = ["한국기술신용평가(주)", "나이스디앤비"];
const ocrFirms = ["미래에셋증권", "유안타증권"];

async function readPdf(url) {
    const pdfPath = './searchable.pdf';

    await pdfjs(pdfPath)
        .then(res => console.log(res));
}

readPdf("https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf");