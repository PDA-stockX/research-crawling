import fs from 'fs';
import pdfjs from '../src/pdfjs.js'
import extractName from './extractName.js'
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

    let problemFirms = [];
    let problemFirmSet = new Set();

    for (const nullUrl of nullUrls) {
        const { i, pdfUrl } = nullUrl;
        const { name, firm, email, photoUrl } = Analyst[i];

        console.log(i);
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
            // await ocr(pdfUrl)
            //     .then((reportString) => extractNameEmail(reportString))
            //     .then((result) => {
            //         console.log(result);
            //         Analyst[i].name = result.name;
            //         Report[i].name = result.name;
            //     });
        }
        else {
            problemFirms.push({ i, firm, pdfUrl });
            problemFirmSet.add(firm);
            console.log("non covered")
        }

        fs.writeFileSync(`${resultPath}/Analyst.json`, JSON.stringify(Analyst));
        fs.writeFileSync(`${resultPath}/Report.json`, JSON.stringify(Report));

        fs.writeFileSync("./problemFirms.json", JSON.stringify(problemFirms));
        fs.writeFileSync("./problemFirmSet.json", JSON.stringify([...problemFirmSet]));
    }

    console.log("nullUrls: ", nullUrls.length);
    console.log(problemFirmSet);
};

export default repair;