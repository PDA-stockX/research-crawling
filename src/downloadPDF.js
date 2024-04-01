import axios from 'axios';
import fs from 'fs';

async function downloadPDF(url, filePath) {
    const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve(filePath);
        });
        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

export default downloadPDF;