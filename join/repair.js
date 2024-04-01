import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { str2date, date2str } from '../batch/date.js';

const getWeekday = (refDate) => {
    const getFriday = (term) => {
        const friday = new Date(refDate);
        friday.setDate(refDate.getDate() - term);
        return friday;
    }

    const day = refDate.getDay();
    return day !== 0 && day !== 6 ? refDate
        : day === 0 ? getFriday(2)
            : day === 6 ? getFriday(1)
                : refDate
};

const fetchStockApi = async (date, ticker, maxRetries = 10) => {
    let retries = 0;
    let refDate = getWeekday(date);

    const doApi = async () => {
        const BASE_URL = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
        const params = {
            serviceKey: process.env.STOCK_API_KEY,
            basDt: date2str(refDate),
            likeSrtnCd: ticker,
            resultType: 'json'
        };

        const url = `${BASE_URL}?${new URLSearchParams(params).toString()}`;
        console.log(url);

        const response = await axios.get(url);
        return parseInt(response.data.response.body.items.item[0].clpr);
    }

    while (retries < maxRetries) {
        try {
            retries++;
            return await doApi(refDate);
        } catch (err) {
            console.error("An error occurred:", err);
            refDate.setDate(refDate.getDate() - 1);
            refDate = getWeekday(refDate);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // throw new Error("Max retries exceeded"); // 프로그램 종료를 위해 예외 발생
    return -1;
}

const getData = async (dataPath, outputPath) => {
    const reportList = JSON.parse(fs.readFileSync(`${dataPath}/reportList.json`));
    const reportDetail = JSON.parse(fs.readFileSync(`${dataPath}/reportDetail.json`));
    const stockDetail = JSON.parse(fs.readFileSync(`${dataPath}/stockDetail.json`));

    const nameEmail = JSON.parse(fs.readFileSync(`${outputPath}/nameEmail.json`));
    return ({ reportList, reportDetail, stockDetail, nameEmail });
}

const getResultData = async (resultPath) => {
    const Analyst = JSON.parse(fs.readFileSync(`${resultPath}/Analyst.json`));
    const Report = JSON.parse(fs.readFileSync(`${resultPath}/Report.json`));
    const Firm = JSON.parse(fs.readFileSync(`${resultPath}/Firm.json`));
    const ReportSector = JSON.parse(fs.readFileSync(`${resultPath}/ReportSector.json`));

    return { Analyst, Report, Firm, ReportSector };
}

const merge = async (r1, r2, r3) => {
    const bAnalyst = [...r1.Analyst, ...r2.Analyst, ...r3.Analyst];
    const bReport = [...r1.Report, ...r2.Report, ...r3.Report];
    const bFirm = [...r1.Firm, ...r2.Firm, ...r3.Firm];
    const bReportSector = [...r1.ReportSector, ...r2.ReportSector, ...r3.ReportSector];

    return { bAnalyst, bReport, bFirm, bReportSector };
}

const passFirms = ['DS투자증권', '미래에셋증권', '유안타증권'];

const openApi = async (start, startIndex, apiCount) => {
    const result1 = "../result/before/20240329";
    const result2 = "../result/before/20240328";
    const result3 = "../result/before/20240320";

    const { bAnalyst, bReport, bFirm, bReportSector } = await merge(
        await getResultData(result1),
        await getResultData(result2),
        await getResultData(result3)
    );

    const nullUrls = [];
    const noApis = [];

    const dateStr = date2str(start);
    const dataPath = `../data/${dateStr}`
    const outputPath = `../output/${dateStr}`
    const dirPath = `../result/${dateStr}`

    const { reportList, reportDetail, stockDetail, nameEmail } = await getData(dataPath, outputPath);
    console.log(reportList.length, reportDetail.length, stockDetail.length, nameEmail.length)
    console.log(bAnalyst.length, bReport.length, bFirm.length, bReportSector.length);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    let Analyst = [], Firm = new Set(), Report = [], ReportSector = [];

    let j = -1;
    let count = 0;
    for (let i = startIndex; i < reportList.length; i++) {
        if (count >= apiCount) break;
        if (!('pdfUrl' in reportDetail[i])) continue;
        j++;
        if (j === bReport.length) break;

        let name, email;
        const { firm, date, stock } = reportList[i];
        if (passFirms.includes(firm)) {
            continue
        };
        // let refDate = new Date(date);
        const { pdfUrl, targetPrice, investmentOpinion, title, summary } = reportDetail[i];
        if (pdfUrl !== bReport[j].pdfUrl) {
            j--;
            continue;
        }
        const { ticker, sectors } = stockDetail[i];

        const photoUrl = null;

        ({ name, email } = nameEmail[i]);
        if (name === null || email === null) {
            nullUrls.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/nullUrls.json`, JSON.stringify(nullUrls));
        }
        count++;

        // const refPrice = await fetchStockApi(refDate, ticker);
        const refPrice = bReport[j].refPrice;
        if (refPrice === -1) noApis.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });

        Analyst.push({ name, firm, email, photoUrl });
        Firm.add(firm);
        Report.push({ pdfUrl, name, email, investmentOpinion, ticker, stock, postedAt: date, refPrice, targetPrice, title, summary });
        ReportSector.push({ pdfUrl, sectorName: sectors })

        console.log(i + 1, " / ", reportList.length, "\tj: ", j + 1, " / ", bReport.length);

        fs.writeFileSync(`${dirPath}/Analyst.json`, JSON.stringify(Analyst));
        fs.writeFileSync(`${dirPath}/Firm.json`, JSON.stringify([...Firm]));
        fs.writeFileSync(`${dirPath}/Report.json`, JSON.stringify(Report));
        fs.writeFileSync(`${dirPath}/ReportSector.json`, JSON.stringify(ReportSector));
    }
}

export default openApi;