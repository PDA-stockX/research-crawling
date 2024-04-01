import crawling from "../crawling/main.js";
import pdf from "../src/main.js"
import api from "../join/main.js"
import post from "./post.js";

import axios from "axios";
import fs from 'fs';
import { str2date, date2str } from '../batch/date.js';

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

    start = new Date("2024-04-01T23:59:59");
    end = new Date("2020-03-31T00:00:00");

    console.log("crawling...");
    // await crawling(start, end);

    console.log("read pdf...");
    // await pdf(start);

    console.log("use api...");
    // await api(start, startIndex, apiCount);
    await api(start, startIndex, 19000);

    console.log("fetch research api...");
    await post(start);

    console.log("Done!");
}

init();