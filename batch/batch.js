import cron from 'node-cron';
import crawling from "../crawling/main.js";
import pdf from "../src/main.js"
import api from "../join/main.js"

// 아침 10시에 평일에 실행되는 스케줄링 (월요일부터 금요일까지)
cron.schedule('0 10 * * 1-5', async (
    start = new Date(new Date().setHours(23, 59, 0, 0)),
    end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0)),
    startIndex = 0,
    apiCount = 100
) => {
    console.log('평일 아침 10시에 실행됩니다.');

    const start = new Date(new Date().setHours(23, 59, 0, 0));
    console.log("crawling...");
    await crawling(start, end);
    // start: 시작 날짜 (default: 오늘 23시 59분) - 포함
    // end: 끝 날짜 (default: 어제 0시 0분) - 제외

    console.log("read pdf...");
    await pdf(start);

    console.log("use api...");
    await api(start, startIndex, apiCount);
    // startIndex: i index (defalut: 0)
    // apiCount: api로 가져오려는 데이터 갯수 (default: 100)

    console.log("repair...");
    await repair(start);
}, {
    timezone: "Asia/Seoul" // 시간대 설정 (예: 서울 시간대)
});
