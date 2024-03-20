import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { str2date, date2str } from '../batch/date.js';

const fetchStockApi = async (date, ticker, maxRetries = 30) => {
    let retries = 0;
    let twice = 0;

    const doApi = async () => {
        const BASE_URL = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
        const params = {
            serviceKey: process.env.STOCK_API_KEY,
            basDt: date2str(date),
            likeSrtnCd: ticker,
            resultType: 'json'
        };

        const url = `${BASE_URL}?${new URLSearchParams(params).toString()}`;
        console.log(url);

        const response = await axios.get(url);
        return parseInt(response.data.response.body.items.item[0].clpr);
    }

    while (retries < maxRetries) {
        while (twice < 2) {
            try {
                return await doApi();
            } catch (err) {
                console.error("An error occurred:", err);
                twice++;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        twice = 0;
        date.setDate(date.getDate() - 1);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    return -1;
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
    const lostUrls = [];
    const nullUrls = [];
    const noApis = [];

    const dateStr = date2str(start);
    const dataPath = `../data/${dateStr}`
    const outputPath = `../output/${dateStr}`
    const dirPath = `../result/${dateStr}`

    const { reportList, reportDetail, stockDetail, nameEmail, photoUrls } = await getData(dataPath, outputPath);
    console.log(reportList.length, reportDetail.length, stockDetail.length, nameEmail.length)

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    let Analyst = [], Firm = new Set(), Report = [], ReportSector = [];

    let j = startIndex;
    let count = 0;
    for (let i = startIndex; i < reportList.length; i++) {
        if (count >= apiCount) break;
        let name, email;

        // const temp = reportList[i].firm;
        // const firm = temp !== "대우증권" ? temp : "미래에셋증권";
        let { firm, date, stock } = reportList[i];
        date = new Date(date);
        date.setDate(date.getDate() - 1);
        const { pdfUrl, targetPrice, investmentOpinion, title, summary } = reportDetail[i];
        const { ticker, sectors } = stockDetail[i];

        const obj = photoUrls.filter(item => item.title === firm);
        const photoUrl = obj.length > 0 ? obj[0].photoUrl : null;
        if (reportDetail[i].pdfUrl === nameEmail[j].pdfUrl) {
            ({ name, email } = nameEmail[j]);
            j++;
            if (targetPrice === null || targetPrice === null || investmentOpinion === "없음"
                || name === null || name.length >= 5 || email === null || photoUrl === null) {
                nullUrls.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
                fs.writeFileSync(`${dirPath}/nullUrls.json`, JSON.stringify(nullUrls))
            }
            count++;
        }
        else {
            lostUrls.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/lostUrls.json`, JSON.stringify(lostUrls))
            name = null;
            email = null;
        }

        const refPrice = await fetchStockApi(date, ticker);
        if (refPrice === -1) {
            noApis.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/noApis.json`, JSON.stringify(noApis));
        }

        Analyst.push({ name, firm, email, photoUrl });
        Firm.add(firm);
        Report.push({ pdfUrl, name, email, investmentOpinion, ticker, stock, postedAt: date, refPrice, targetPrice, title, summary });
        sectors.map((sector) => ReportSector.push({ pdfUrl, sectorName: sector }));

        console.log(i + 1, " / ", reportList.length, "\t", count, " / ", apiCount);

        console.log("saved date: ", date);
        fs.writeFileSync(`${dirPath}/Analyst.json`, JSON.stringify(Analyst));
        fs.writeFileSync(`${dirPath}/Firm.json`, JSON.stringify([...Firm]));
        fs.writeFileSync(`${dirPath}/Report.json`, JSON.stringify(Report));
        fs.writeFileSync(`${dirPath}/ReportSector.json`, JSON.stringify(ReportSector));
    }
}
export default openApi;
// openApi();

// const postedAt = str2date("23.12.29");
// const ticker = '000660'
// const refPrice = await fetchStockApi(postedAt, ticker);
// console.log("postedAt: ", postedAt);
// console.log("ticker: ", ticker);
// console.log("refPrice: ", refPrice);