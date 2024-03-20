import photoUrl from "./photoUrl.js";
import reportList from "./reportList.js";
import reportDetail from "./reportDetail.js";
import stockDetail from "./stockDetail.js";

const main = async (
    start = new Date(new Date().setHours(23, 59, 0, 0)),
    end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0))
) => {
    // photoUrl();

    start = new Date(new Date().setHours(23, 59, 0, 0));// 시작 날짜 (default: 오늘 23시 59분) - 포함
    end = new Date("2020-06-30T00:00:00");// 끝 날짜 (default: 어제 0시 0분) - 제외
    // await reportList(start, end);

    // reportDetail(start);
    // stockDetail(start);
}

main();