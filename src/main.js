import readPdf from "./readPdf.js";

const main = async (start) => {
    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜
    await readPdf(start);
}

export default main;