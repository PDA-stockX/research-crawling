const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ocr = require('./ocr.js');
const extractNameEmail = require('./extractNameEmail.js');

async function getUrls() {
    const json = JSON.parse(fs.readFileSync('../data/reportDetail.json'));
    return Object.values(json).map(item => item.pdfUrl);
}

async function processPDF(url, filePath, fileName) {
    const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            ocr(fileName.slice(0, -4))
                .then(data => {
                    fs.unlinkSync(filePath);
                    resolve(data);
                })
                .catch(reject);
        });
        response.data.on('error', reject);
    });
}

async function main() {
    const urls = await getUrls();
    const dirPath = path.join(__dirname, "../resources");
    const nameEmail = [];
    const problemUrls = [];

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    const downloadInterval = 1000; // 다운로드 간격 (밀리초) 1000
    const batchSize = 100; // 배치 크기 100

    // for (let i = 0; i < 4; i += batchSize) {
    for (let i = 0; i < urls.length; i += batchSize) {
        const batchUrls = urls.slice(i, i + batchSize);

        await Promise.all(batchUrls.map(url => {
            const fileName = url.substring(url.lastIndexOf("/") + 1);
            const filePath = path.join(dirPath, fileName);

            return processPDF(url, filePath, fileName)
                .then((data) => {
                    console.log("fileName: ", fileName);
                    console.log(data);
                    const result = extractNameEmail(data);
                    nameEmail.push(data);
                    console.log(result)
                    if (result === 'None') {
                        problemUrls.push(url);
                    }
                })
                .catch(err => console.log(fileName, ': ', err));
        }));

        console.log(problemUrls);
        await new Promise(resolve => setTimeout(resolve, downloadInterval));
    }

    fs.writeFileSync("../output/problemUrls.json", JSON.stringify(problemUrls));
    fs.writeFileSync("../output/nameEmail.json", JSON.stringify(nameEmail));
}

main();