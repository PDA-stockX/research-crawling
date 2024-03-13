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

    const downloadInterval = 1000; // 다운로드 간격 (밀리초) 
    const batchSize = 10; // 배치 크기

    // for (let i = 0; i < urls.length; i += batchSize) {
    for (let i = 0; i < 50; i += batchSize) {
        const batchUrls = urls.slice(i, i + batchSize);

        await Promise.all(batchUrls.map(async (url) => {
            const fileName = url.substring(url.lastIndexOf("/") + 1);
            const filePath = path.join(dirPath, fileName);

            return downloadPDF(url, filePath)
                .then(async (res) => {
                    return new Promise((resolve, reject) => {
                        res.on('end', async () => {
                            const reportString = await getContent(filePath);
                            console.log("fileName: ", fileName);
                            console.log(reportString);
                            const result = extractNameEmail(reportString);
                            const temp = { pdfUrl: url, ...result };
                            console.log(temp);
                            nameEmail.push({ pdfUrl: url, ...result });
                            if (result.name === null) {
                                problemUrls.push(url);
                            }
                            fs.unlinkSync(filePath);
                            resolve(result);
                        });
                        res.on('error', reject);
                    });
                })
                .catch(err => console.log(fileName, ': ', err))
        }))

        await new Promise(resolve => setTimeout(resolve, downloadInterval));
    }

    console.log("problemUrls: ", problemUrls);
    fs.writeFileSync("../output/nameEmail.json", JSON.stringify(nameEmail));
    fs.writeFileSync("../output/problemUrls.json", JSON.stringify(problemUrls));
}

main();