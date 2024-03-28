import axios from 'axios';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

const downloadPhoto = async () => {
    const urls = JSON.parse(fs.readFileSync('../data/photoUrls.json'));
    const dirPath = '../data/logos';

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    for (const url of urls) {
        if (url.photoUrl.endsWith('.svg')) {
            const response = await axios.get('https:' + url.photoUrl, { responseType: 'text' });
            fs.writeFileSync(`${dirPath}/${url.title}.svg`, response.data);

        } else {
            const response = await axios.get('https:' + url.photoUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(`${dirPath}/${url.title}.webp`, Buffer.from(response.data, 'binary'));
        }
    }
}

downloadPhoto();
