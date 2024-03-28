import fs from 'fs';
import readPdf from "./readPdf.js";

const main = async (start) => {
    if (!fs.existsSync("../output")) {
        fs.mkdirSync("../output");
    }

    await readPdf(start);
}

export default main;