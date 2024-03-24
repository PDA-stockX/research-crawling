import fs from 'fs';
import readPdf from "./readPdf.js";

const main = async (start) => {
    if (!fs.existsSync("../output")) {
        fs.mkdirSync("../output");
    }

    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜
    await readPdf(start);
}

export default main;