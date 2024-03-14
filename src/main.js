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
    const batchSize = 1; // 배치 크기

    const downloadBatch = async (batchUrls) => {
        await Promise.all(batchUrls.map(async (url) => {
            const reportString = await getContent(url);
            const result = extractNameEmail(reportString);
            const analystInfo = { pdfUrl: url, ...result };
            nameEmail.push(analystInfo);
            // console.log(reportString);
            console.log(analystInfo);
            if (!(result.name && result.email)) {
                problemUrls.push(url);
            }
            return result
        }))
    };

    const downloadBatches = async () => {
        const catchIndexes = [];
        const n = urls.length;

        for (let i = 0; i < n; i += batchSize) {
            const batchUrls = urls.slice(i, i + batchSize);
            await downloadBatch(batchUrls)
                .then(() => { console.log("downloaded: ", i + batchSize, "/", n); saveFile(); })
                .catch((err) => { catchIndexes.push(i); fs.writeFileSync("../output/stop.json", catchIndexes); })
            await new Promise(resolve => setTimeout(resolve, downloadInterval)).catch(err => console.error(err));
        }
    };

    downloadBatches()
        .catch(error => console.error('Error in main process:', error))
        .finally(() => {
            console.log("problemUrls: ", problemUrls);
            saveFile();
        });
}

main();