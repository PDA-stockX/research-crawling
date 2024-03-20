import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { str2date, date2str } from '../main/date.js';

const fetchStockApi = async (date, ticker, maxRetries = 5) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
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
        } catch (err) {
            console.error("An error occurred:", err);
            retries++;
            date.setDate(date.getDate() - 1);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    return -1;
}

const getData = async () => {
    const reportList = JSON.parse(fs.readFileSync('../data/reportList.json'));
    const reportDetail = JSON.parse(fs.readFileSync('../data/reportDetail.json'));
    const stockDetail = JSON.parse(fs.readFileSync('../data/stockDetail.json'));
    const photoUrls = JSON.parse(fs.readFileSync('../data/photoUrls.json'));

    const nameEmail = JSON.parse(fs.readFileSync('../output/nameEmail.json'));
    return ({ reportList, reportDetail, stockDetail, nameEmail, photoUrls });
}

const join = async (start = 0, apiCount = 10) => {
    const lostUrls = [];
    const nullUrls = [];
    const noApis = [];
    const { reportList, reportDetail, stockDetail, nameEmail, photoUrls } = await getData();
    let Analyst = [], Firm = new Set(), Report = [], ReportSector = [];

    const dirPath = `./${start}`
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    console.log(reportList.length, reportDetail.length, stockDetail.length, nameEmail.length)

    let j = start;
    let count = 0;
    for (let i = start; i < reportList.length; i++) {
        if (count >= apiCount) break;
        let name, email;

        const temp = reportList[i].firm;
        // const firm = temp !== "대우증권" ? temp : "미래에셋증권";
        const firm = temp;
        const postedAt = str2date(reportList[i].date);
        const { pdfUrl, targetPrice, investmentOpinion } = reportDetail[i];
        const { ticker, sectors } = stockDetail[i];

        const obj = photoUrls.filter(item => item.title === firm);
        const photoUrl = obj.length > 0 ? obj[0].photoUrl : null;

        if (reportDetail[i].pdfUrl === nameEmail[j].pdfUrl) {
            ({ name, email } = nameEmail[j]);
            j++;
            if (targetPrice === null || targetPrice === null || investmentOpinion === "없음"
                || name === null || name.length >= 5 || email === null || photoUrl === null) {
                nullUrls.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
                fs.writeFileSync(`${dirPath}/nullUrls_${start}_${apiCount}.json`, JSON.stringify(nullUrls))
                continue;
            }
            count++;
        }
        else {
            lostUrls.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/lostUrls_${start}_${apiCount}.json`, JSON.stringify(lostUrls))
            continue;
            name = null;
            email = null;
        }

        const refPrice = await fetchStockApi(postedAt, ticker);
        if (refPrice === -1) {
            noApis.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/noApis_${start}_${apiCount}.json`, JSON.stringify(noApis));
            continue;
        }

        Analyst.push({ name, firm, email, photoUrl });
        Firm.add(firm);
        Report.push({ pdfUrl, name, email, investmentOpinion, ticker, postedAt, refPrice, targetPrice });
        sectors.map((sector) => ReportSector.push({ pdfUrl, sectorName: sector }));

        console.log(i + 1, " / ", reportList.length, "\t", count, " / ", apiCount);

        fs.writeFileSync(`${dirPath}/Analyst_${start}_${apiCount}.json`, JSON.stringify(Analyst));
        fs.writeFileSync(`${dirPath}/Firm_${start}_${apiCount}.json`, JSON.stringify([...Firm]));
        fs.writeFileSync(`${dirPath}/Report_${start}_${apiCount}.json`, JSON.stringify(Report));
        fs.writeFileSync(`${dirPath}/ReportSector_${start}_${apiCount}.json`, JSON.stringify(ReportSector));
    }
}
export default join;
// join();

// const postedAt = str2date("23.12.29");
// const ticker = '000660'
// const refPrice = await fetchStockApi(postedAt, ticker);
// console.log("postedAt: ", postedAt);
// console.log("ticker: ", ticker);
// console.log("refPrice: ", refPrice);