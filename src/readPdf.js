import fs from 'fs';
import path from 'path';

import extractNameEmail from './extractNameEmail.js';
import getContent from './pdfjs.js';

import { str2date, date2str } from '../batch/date.js';

async function getUrls(dataPath) {
    const json = JSON.parse(fs.readFileSync(`${dataPath}/reportDetail.json`));
    return Object.values(json).map(item => item.pdfUrl);
}

async function readPdf(start) {
    const dateStr = date2str(start);
    const dataPath = `../data/${dateStr}`

    const urls = await getUrls(dataPath);
    const dirPath = path.join(process.cwd(), `../output/${dateStr}`);

    const nameEmail = [];
    const problemUrls = [];

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    const saveFile = () => {
        fs.writeFileSync(`${dirPath}/nameEmail.json`, JSON.stringify(nameEmail));
        fs.writeFileSync(`${dirPath}/problemUrls.json`, JSON.stringify(problemUrls));
    };

    const interval = 1000; // 다운로드 간격 (밀리초) 

    const readBatch = async (url, i) => {
        await getContent(url)
            .then((reportString) => extractNameEmail(reportString))
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
            }); // nameEmail에도 problemUrls 버전으로 넣어야했음
    };

    const readBatches = async () => {
        const catchProblems = [];
        const n = urls.length;
        let i = 0;

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

    readBatches()
        .catch(error => console.error('Error in readBatches:', error))
        .finally(() => {
            saveFile();
        });
}

export default readPdf;