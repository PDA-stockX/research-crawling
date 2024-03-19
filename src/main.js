import fs from 'fs';
import path from 'path';

import extractNameEmail from './extractNameEmail.js';
import getContent from './pdfjs.js';

async function getUrls() {
    const json = JSON.parse(fs.readFileSync('../data/reportDetail.json'));
    return Object.values(json).map(item => item.pdfUrl);
}

async function main() {
    const urls = await getUrls();
    const dirPath = path.join(process.cwd(), "../resources");

    const nameEmail = [];
    const problemUrls = [];

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    const saveFile = () => {
        fs.writeFileSync("../output/nameEmail.json", JSON.stringify(nameEmail));
        fs.writeFileSync("../output/problemUrls.json", JSON.stringify(problemUrls));
    };

    const downloadInterval = 2000; // 다운로드 간격 (밀리초) 

    const readBatch = async (url) => {
        await getContent(url)
            .then((reportString) => extractNameEmail(reportString))
            .then((result) => {
                const analystInfo = { pdfUrl: url, ...result };
                nameEmail.push(analystInfo);
                console.log(analystInfo);
                if (!(result.name && result.email)) {
                    problemUrls.push(url);
                }
            })
            .catch(err => problemUrls.push(url)); // nameEmail에도 problemUrls 버전으로 넣어야했음
    };

    const readBatches = async () => {
        const catchProblems = [];
        const n = urls.length;
        let i = 1;

        for (const url of urls) {
            await readBatch(url)
                .then(() => {
                    console.log("read: ", i++, "/", n);
                    saveFile();
                })
                .catch((err) => {
                    console.log("readBatch err: ", err);
                    catchProblems.push({ pdfUrl: url, index: i++ });
                    fs.writeFileSync("../output/stop.json", catchProblems);
                })
            await new Promise(resolve => setTimeout(resolve, downloadInterval)).catch(err => console.error(err));
        }
    };

    readBatches()
        .catch(error => console.error('Error in readBatches:', error))
        .finally(() => {
            console.log("problemUrls: ", problemUrls);
            saveFile();
        });
}

main();