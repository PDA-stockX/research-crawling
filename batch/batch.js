import cron from 'node-cron';
import crawling from "../crawling/main.js";
import pdf from "../src/main.js"
import api from "../join/main.js"

import axios from "axios";
import fs from 'fs';
import { str2date, date2str } from '../batch/date.js';

const getData = async (resultPath) => {
    const Analyst = JSON.parse(fs.readFileSync(`${resultPath}/Analyst.json`));
    const Report = JSON.parse(fs.readFileSync(`${resultPath}/Report.json`));
    const ReportSector = JSON.parse(fs.readFileSync(`${resultPath}/ReportSector.json`));

    return ({ Analyst, Report, ReportSector });
}

async function fetchRESEARCH(url, payload) {
    try {
        const response = await axios.post(url, payload);
        return response.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// 아침 10시에 평일에 실행되는 스케줄링 (월요일부터 금요일까지)
const job = cron.schedule('10 10 * * 1-5', async (
    start = new Date(new Date().setHours(23, 59, 0, 0)),
    end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0)),
    startIndex = 0,
    apiCount = 10000
) => {
    console.log('평일 아침 10시에 실행됩니다.');

    console.log("crawling...");
    await crawling(start, end);
    // start: 시작 날짜 (default: 오늘 23시 59분) - 포함
    // end: 끝 날짜 (default: 어제 0시 0분) - 제외

    console.log("read pdf...");
    await pdf(start);

    console.log("use api...");
    await api(start, startIndex, apiCount);
    // startIndex: i index (defalut: 0)
    // apiCount: api로 가져오려는 데이터 갯수 (default: 10000)

    console.log("repair...");
    await repair(start);

    const dateStr = date2str(start);
    const resultPath = `../result/${dateStr}`
    const { Analyst, Report, ReportSector } = await getData(resultPath);
    const url = "http://localhost:3000/reports";
    const n = Analyst.length;

    for (let i = 0; i < n; i++) {
        const payload = { report: Report[i], analyst: Analyst[i], reportSector: ReportSector[i] };
        await fetchRESEARCH(url, payload);
    }
}, {
    timezone: "Asia/Seoul" // 시간대 설정 (예: 서울 시간대)
});

job.start()