import * as crawling from "../crawling/main.js";
import * as pdf from "../src/main.js"
import * as api from "../join/main.js"

const init = async () => {
    const start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜 (default: 오늘 23시 59분) - 포함
    const end = new Date("2020-06-30T00:00:00"); // 끝 날짜 (default: 어제 0시 0분) - 제외

    console.log("crawling...");
    // await crawling(start, end);

    console.log("read pdf...");
    await pdf(start);

    const startIndex = 0;
    const apiCount = 1000;

    console.log("use api...");
    // await api(start, startIndex, apiCount);
}

init();