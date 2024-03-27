import fs from 'fs';
import readPdf from "./readPdf.js";

const main = async (start) => {
    if (!fs.existsSync("../output")) {
        fs.mkdirSync("../output");
    }

    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜
    await readPdf(start);
}
main(new Date("2024-03-20T23:59:59"));
// export default main;