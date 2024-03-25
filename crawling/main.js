import fs from 'fs';
import photoUrl from "./photoUrl.js";
import reportList from "./reportList.js";
import reportDetail from "./reportDetail.js";
import stockDetail from "./stockDetail.js";

const main = async (start, end) => {
    if (!fs.existsSync("../data")) {
        fs.mkdirSync("../data");
    }

    // await photoUrl();

    await reportList(start, end);

    await Promise.all([reportDetail(start), stockDetail(start)])
}

export default main;