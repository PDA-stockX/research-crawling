import reportList from "./reportList";

const main = () => {
    const start = new Date(new Date().setHours(23, 59, 0, 0));// 시작 날짜 (default: 오늘 23시 59분) - 포함
    const end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0));// 끝 날짜 (default: 어제 0시 0분) - 제외

    reportList(start, end);
}

// main();