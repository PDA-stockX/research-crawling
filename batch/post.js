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

const post = async (start) => {
    const dateStr = date2str(start);
    const resultPath = `../result/${dateStr}`
    const { Analyst, Report, ReportSector } = await getData(resultPath);
    const url = "http://15.165.71.109:80/api/reports";
    const n = Analyst.length;

    for (let i = 0; i < n; i++) {
        const payload = { report: Report[i], analyst: Analyst[i], reportSector: ReportSector[i] };
        await fetchRESEARCH(url, payload);
    }
}

export default post;