import tesseract from 'node-tesseract-ocr';

const config = {
    lang: "kor+eng",
    oem: 1, // OCR engine modes: 1&3 한글 인식
    psm: 6, // page segmentation modes: 3 자동 페이지 분할, 4&6 한글 인식
}

const useOcr = async (url) => {
    await tesseract
        .recognize(url, config)
        .then((text) => {
            console.log("Result:", text)
        })
        .catch((error) => {
            console.log(error.message)
        })
}
useOcr("https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf")
// export default useOcr;
