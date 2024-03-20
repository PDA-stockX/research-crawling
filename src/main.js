import readPdf from "./readPdf.js";

const main = (start) => {
    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜
    readPdf(start);
}

export default main;