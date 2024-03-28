import fs from 'fs';
import convert from './pdf-img-convert.js';
import { recognize } from 'node-tesseract-ocr';
const config = {
    lang: "kor+eng",
    oem: 1, // OCR engine modes: 1&3 한글 인식
    psm: 6, // page segmentation modes: 3 자동 페이지 분할, 4&6 한글 인식
}

function useOcr(url) {
    const imgPath = './temp.png'

    convert(url)
        .then(function (pdfArray) {
            console.log("Saving");
            fs.writeFile(imgPath, pdfArray[0], function (error) {
                if (error) { console.error("Error: " + error); }
            });
        })
        .then(async () => {
            await recognize(imgPath, config)
                .then((text) => {
                    console.log("Result:", text)
                })
                .catch((error) => {
                    console.log(error.message)
                })
        })
        // .then(() => fs.unlink(imgPath, (err) => {
        //     if (err) {
        //         console.error('Error deleting png file:', err);
        //     } else {
        //         console.log('png file deleted successfully');
        //     }
        // }))
        .catch(error => {
            console.error(error);
        });
}

useOcr('https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf');
