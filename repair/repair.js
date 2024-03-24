import fs from 'fs';
import pdfjs from '../src/pdfjs.js'
import extractName from './extractName.js'
import ocr from './useOcr.js'
import extractNameEmail from '../src/extractNameEmail.js'

import { str2date, date2str } from '../batch/date.js';

const getData = async (resultPath) => {
    const Analyst = JSON.parse(fs.readFileSync(`${resultPath}/Analyst.json`));
    const Report = JSON.parse(fs.readFileSync(`${resultPath}/Report.json`));
    const nullUrls = JSON.parse(fs.readFileSync(`${resultPath}/nullUrls.json`));

    return ({ Analyst, Report, nullUrls });
}

const pdfjsFirms = ["한국기술신용평가(주)", "나이스디앤비"];
const ocrFirms = ["미래에셋증권", "유안타증권"];

const repair = async (start) => {
    const dateStr = date2str(start);
    const resultPath = `../result/${dateStr}`

    const { Analyst, Report, nullUrls } = await getData(resultPath);

    const dirPath = './temp';

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    for (const nullUrl of nullUrls) {
        const { i, pdfUrl } = nullUrl;
        const { name, firm, email, photoUrl } = Analyst[i];

        // console.log(i, pdfUrl, name, firm, email, photoUrl);

        if (pdfjsFirms.includes(firm)) {
            console.log("pdfjs version");
            await pdfjs(pdfUrl)
                .then((reportString) => extractName(reportString))
                .then((result) => {
                    console.log(result);
                    Analyst[i].name = result.name;
                    Report[i].name = result.name;
                });
        }
        else if (ocrFirms.includes(firm)) {
            console.log("ocr version");
            await ocr(pdfUrl)
                .then((reportString) => extractNameEmail(reportString))
                .then((result) => {
                    console.log(result);
                    Analyst[i].name = result.name;
                    Report[i].name = result.name;
                });
        }
        else {
            console.log("non covered")
        }

        console.log(Analyst[i]);
    }
};

repair(new Date("2024-03-22T23:59:59"));