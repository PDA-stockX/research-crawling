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

async function readPdf(start) {
    const dateStr = date2str(start);
    const dataPath = `../data/${dateStr}`

    const reportList = await getData(dataPath);
    const urls = await getUrls(dataPath);
    const dirPath = `../output/${dateStr}`;

    const nameEmail = [];
    const problemUrls = [];

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    const saveFile = () => {
        fs.writeFileSync(`${dirPath}/nameEmail.json`, JSON.stringify(nameEmail));
        fs.writeFileSync(`${dirPath}/problemUrls.json`, JSON.stringify(problemUrls));
    };

    const getAnalystInfo = async (url, firm) => {
        if (ocrFirms.includes(firm)) {
            console.log("ocr version");
            // ocr 코드 추가
            return ({ name: null, email: null });
        }
        else {
            await pdfjs(url)
                .then((reportString) => {
                    if (noEmailFirms.includes(firm)) {
                        console.log("no email version");
                        return extractName(reportString);
                    }
                    else {
                        console.log("standard version");
                        return extractNameEmail(reportString)
                    }
                });
        }
    };

    const interval = 500; // 다운로드 간격 (밀리초) 

    const readBatch = async (url, i) => {
        const firm = reportList[i].firm;

        await getAnalystInfo(url, firm)
            .then((result) => {
                const analystInfo = { pdfUrl: url, ...result };
                nameEmail.push(analystInfo);
                if (!(result.name && result.email)) {
                    problemUrls.push({ i, url });
                }
            })
            .catch(err => {
                problemUrls.push({ i, url });
                nameEmail.push({ pdfUrl: url, name: null, email: null });
            });
    };

    const readBatches = async () => {
        const catchProblems = [];
        const n = urls.length;
        let i = -1;

        for (const url of urls) {
            await readBatch(url, ++i)
                .then(() => {
                    saveFile();
                })
                .catch((err) => {
                    console.log("readBatch err: ", err);
                    catchProblems.push({ pdfUrl: url, index: i });
                    problemUrls.push({ i, url });
                    nameEmail.push({ pdfUrl: url, name: null, email: null });
                    fs.writeFileSync(`${dirPath}/stop.json`, catchProblems);
                })
            await new Promise(resolve => setTimeout(resolve, interval)).catch(err => console.error(err));
        }
    };

    await readBatches()
        .catch(error => console.error('Error in readBatches:', error))
        .finally(() => {
            saveFile();
        });
}

export default readPdf;