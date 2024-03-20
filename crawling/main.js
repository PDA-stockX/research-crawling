import photoUrl from "./photoUrl.js";
import reportList from "./reportList.js";
import reportDetail from "./reportDetail.js";
import stockDetail from "./stockDetail.js";

const main = async (
    start = new Date(new Date().setHours(23, 59, 0, 0)),
    end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0))
) => {
    // photoUrl();

    await reportList(start, end);

    reportDetail(start);
    stockDetail(start);
}

export default main;