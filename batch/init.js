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

const init = async (
    start = new Date(new Date().setHours(23, 59, 0, 0)),
    end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0)),
    startIndex = 0,
    apiCount = 10000
) => {
    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜 (default: 오늘 23시 59분) - 포함
    // end = new Date("2020-06-30T00:00:00"); // 끝 날짜 (default: 어제 0시 0분) - 제외

    // start = new Date("2024-03-22T23:59:59"); // 시작 날짜 (default: 오늘 23시 59분) - 포함
    // end = new Date("2024-03-21T00:00:00"); // 끝 날짜 (default: 어제 0시 0분) - 제외

    // start = new Date("2024-03-20T23:59:59");
    // start = new Date(new Date().setHours(23, 59, 0, 0))
    // end = new Date("2024-03-21T00:00:00");

    start = new Date("2024-03-29T23:59:59");
    end = new Date("2020-06-30T00:00:00");

    console.log("crawling...");
    await crawling(start, end);

    console.log("read pdf...");
    await pdf(start);

    console.log("use api...");
    await api(start, startIndex, apiCount);

    console.log("fetch research api...");
    const dateStr = date2str(start);
    const resultPath = `../result/${dateStr}`
    const { Analyst, Report, ReportSector } = await getData(resultPath);
    const url = "http://localhost:3000/reports";
    const n = Analyst.length;

    for (let i = 0; i < n; i++) {
        const payload = { report: Report[i], analyst: Analyst[i], reportSector: ReportSector[i] };
        await fetchRESEARCH(url, payload);
    }
    console.log("Done!");
}

init();