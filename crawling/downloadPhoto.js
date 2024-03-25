import axios from 'axios';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

const downloadPhoto = async () => {
    const urls = JSON.parse(fs.readFileSync('../data/photoUrls.json'));
    const dirPath = '../data/photo';

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    for (const url of urls) {
        let response;
        if (url.photoUrl.endsWith('.svg')) {
            response = await axios.get('https:' + url.photoUrl, { responseType: 'text' });
        } else {
            response = await axios.get('https:' + url.photoUrl, { responseType: 'arraybuffer' });
        }

        if (url.photoUrl.endsWith('.svg')) {
            const { width, height } = getSvgSize(response.data);
            console.log(url.title, "\twidth: ", width, "\theight: ", height)
            await convertSvgToPng(response.data, `${dirPath}/${url.title}.png`, { width, height });
        } else {
            fs.writeFileSync(`${dirPath}/${url.title}.png`, Buffer.from(response.data, 'binary'));
        }
    }
}

const getSvgSize = (svgContent) => {
    const { window } = new JSDOM(svgContent);
    const { document } = window;

    const svgElement = document.querySelector('svg');
    let width = svgElement.getAttribute('width');
    let height = svgElement.getAttribute('height');

    // SVG의 너비와 높이 정보가 없는 경우 viewBox 속성을 이용하여 실제 크기 추출
    if (!width || !height) {
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
            const viewBoxParts = viewBox.split(' ');
            if (viewBoxParts.length === 4) {
                width = viewBoxParts[2];
                height = viewBoxParts[3];
            } else {
                // viewBox가 올바르지 않은 경우 기본값 설정
                width = '1000px'; // 기본 너비
                height = '300px'; // 기본 높이
            }
        } else {
            // viewBox가 없는 경우 기본값 설정
            width = '1000px'; // 기본 너비
            height = '300px'; // 기본 높이
        }
    }

    return { width, height };
};

const convertSvgToPng = async (svgContent, pngFilePath, { width, height }) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: parseInt(width), height: parseInt(height) });
    await page.setContent(svgContent);
    await page.screenshot({ path: pngFilePath });

    await browser.close();
};

downloadPhoto();
