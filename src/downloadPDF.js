import axios from 'axios';
import fs from 'fs';
fs.WriteStream

async function downloadPDF(url, filePath) {
    const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        });
        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

export default downloadPDF; 