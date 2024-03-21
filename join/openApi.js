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

    throw new Error("Max retries exceeded"); // 프로그램 종료를 위해 예외 발생
}

const getData = async (dataPath, outputPath) => {
    const reportList = JSON.parse(fs.readFileSync(`${dataPath}/reportList.json`));
    const reportDetail = JSON.parse(fs.readFileSync(`${dataPath}/reportDetail.json`));
    const stockDetail = JSON.parse(fs.readFileSync(`${dataPath}/stockDetail.json`));
    const photoUrls = JSON.parse(fs.readFileSync('../data/photoUrls.json'));

    const nameEmail = JSON.parse(fs.readFileSync(`${outputPath}/nameEmail.json`));
    return ({ reportList, reportDetail, stockDetail, nameEmail, photoUrls });
}

const openApi = async (start, startIndex, apiCount) => {
    const nullUrls = [];
    const noApis = [];

    const dateStr = date2str(start);
    const dataPath = `../data/${dateStr}`
    const outputPath = `../output/${dateStr}`
    const dirPath = `../result/${dateStr}_${startIndex}`

    const { reportList, reportDetail, stockDetail, nameEmail, photoUrls } = await getData(dataPath, outputPath);
    console.log(reportList.length, reportDetail.length, stockDetail.length, nameEmail.length)

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    let Analyst = [], Firm = new Set(), Report = [], ReportSector = [];

    let count = 0;
    for (let i = startIndex; i < reportList.length; i++) {
        if (count >= apiCount) break;
        let name, email;
        const { firm, date, stock } = reportList[i];
        let refDate = new Date(date);
        const { pdfUrl, targetPrice, investmentOpinion, title, summary } = reportDetail[i];
        const { ticker, sectors } = stockDetail[i];

        const obj = photoUrls.filter(item => item.title === firm);
        const photoUrl = obj.length > 0 ? obj[0].photoUrl : null;

        ({ name, email } = nameEmail[i]);
        if (targetPrice === null || targetPrice === null || investmentOpinion === "없음"
            || name === null || name.length >= 5 || email === null || photoUrl === null) {
            nullUrls.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/nullUrls.json`, JSON.stringify(nullUrls))
        }
        count++;

        const refPrice = await fetchStockApi(refDate, ticker);
        if (refPrice === -1) {
            noApis.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/noApis.json`, JSON.stringify(noApis));
        }

        Analyst.push({ name, firm, email, photoUrl });
        Firm.add(firm);
        Report.push({ pdfUrl, name, email, investmentOpinion, ticker, stock, postedAt: date, refPrice, targetPrice, title, summary });
        sectors.map((sector) => ReportSector.push({ pdfUrl, sectorName: sector }));

        console.log(i + 1, " / ", reportList.length, "\t", count, " / ", apiCount);

        fs.writeFileSync(`${dirPath}/Analyst.json`, JSON.stringify(Analyst));
        fs.writeFileSync(`${dirPath}/Firm.json`, JSON.stringify([...Firm]));
        fs.writeFileSync(`${dirPath}/Report.json`, JSON.stringify(Report));
        fs.writeFileSync(`${dirPath}/ReportSector.json`, JSON.stringify(ReportSector));
    }
}

export default openApi;