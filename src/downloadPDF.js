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

    return response.data;
}

// module.exports = downloadPDF;
export default downloadPDF; 