import crawling from "../crawling/main.js";
import pdf from "../src/main.js"
import api from "../join/main.js"

const init = async (
    start = new Date(new Date().setHours(23, 59, 0, 0)),
    end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0)),
    startIndex = 0,
    apiCount = 100
) => {
    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜 (default: 오늘 23시 59분) - 포함
    // end = new Date("2020-06-30T00:00:00"); // 끝 날짜 (default: 어제 0시 0분) - 제외

    start = new Date("2024-03-22T23:59:59"); // 시작 날짜 (default: 오늘 23시 59분) - 포함
    end = new Date("2024-03-21T00:00:00"); // 끝 날짜 (default: 어제 0시 0분) - 제외

    console.log("crawling...");
    await crawling(start, end);

    console.log("read pdf...");
    await pdf(start);

    console.log("use api...");
    await api(start, startIndex, apiCount);
}

init();