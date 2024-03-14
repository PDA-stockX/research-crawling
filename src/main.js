import fs from 'fs';
import path from 'path';

import extractNameEmail from './extractNameEmail.js';
import downloadPDF from './downloadPDF.js';
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

    const downloadInterval = 50000; // 다운로드 간격 (밀리초) 
    const batchSize = 5; // 배치 크기

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
        for (let i = 0; i < urls.length; i += batchSize) { // 20->urls.length
            const batchUrls = urls.slice(i, i + batchSize);
            await downloadBatch(batchUrls);
            await new Promise(resolve => setTimeout(resolve, downloadInterval)).catch(err => console.error(err));
        }
    };

    downloadBatches()
        .then(() => {
            console.log("problemUrls: ", problemUrls);
            fs.writeFileSync("../output/nameEmail.json", JSON.stringify(nameEmail));
            fs.writeFileSync("../output/problemUrls.json", JSON.stringify(problemUrls));
        })
        .catch(error => console.error('Error in main process:', error));
}

main();