import fs from 'fs';
import { str2date, date2str } from '../batch/date.js';

const getData = async (dataPath, outputPath) => {
    const reportList = JSON.parse(fs.readFileSync(`${dataPath}/reportList.json`));
    const reportDetail = JSON.parse(fs.readFileSync(`${dataPath}/reportDetail.json`));
    const stockDetail = JSON.parse(fs.readFileSync(`${dataPath}/stockDetail.json`));
    const photoUrls = JSON.parse(fs.readFileSync('../data/photoUrls.json'));

    const nameEmail = JSON.parse(fs.readFileSync(`${outputPath}/nameEmail.json`));
    return ({ reportList, reportDetail, stockDetail, nameEmail, photoUrls });
}

const getBeforeData = async (resultPath = '../result/20240320_before') => {
    const bReport = JSON.parse(fs.readFileSync(`${resultPath}/Report.json`));
    return (bReport);
}

const check = async (start) => {
    const dateStr = date2str(start);
    const dataPath = `../data/${dateStr}`
    const outputPath = `../output/${dateStr}`
    const dirPath = `../result/${dateStr}`

    const { reportList, reportDetail, stockDetail, nameEmail, photoUrls } = await getData(dataPath, outputPath);
    const bReport = await getBeforeData();

    console.log(reportList.length, reportDetail.length, stockDetail.length, nameEmail.length, bReport.length);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    for (let i = 0; i < reportList.length; i++) {
        if (reportDetail[i].pdfUrl !== bReport[i].pdfUrl) {
            console.log(reportDetail[i].pdfUrl);
            console.log(i);
            break;
        }
        else if (i === reportList.length) {
            console.log("complete");
        }
    }

    const newReportList = [], newReportDetail = [], newStockDetail = [], newNameEmail = [];
    for (let i = 0; i < reportDetail.length; i++) {
        if (i === 6933) {
            continue
        }
        newReportList.push(reportList[i]);
        newReportDetail.push(reportDetail[i]);
        newStockDetail.push(stockDetail[i]);
        newNameEmail.push(nameEmail[i]);
    }

    console.log(newReportList.length, newReportDetail.length, newStockDetail.length, newNameEmail.length, bReport.length);

    for (let i = 0; i < newReportDetail.length; i++) {
        if (newReportDetail[i].pdfUrl !== bReport[i].pdfUrl) {
            console.log(newReportDetail[i].pdfUrl);
            console.log(i);
            break;
        }
        else if (i === newReportDetail.length - 1) {
            console.log("complete");
        }
    }

    return { newReportList, newReportDetail, newStockDetail, newNameEmail, bReport };
}

const fix = async (start) => {
    const nullUrls = [];

    const dateStr = date2str(start);
    const dirPath = `../result/${dateStr}`

    const { newReportList: reportList, newReportDetail: reportDetail, newStockDetail: stockDetail, newNameEmail: nameEmail, bReport } = await check(start);

    console.log(reportList.length, reportDetail.length, stockDetail.length, nameEmail.length, bReport.length);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    let Analyst = [], Firm = new Set(), Report = [], ReportSector = [];

    let count = 0;
    for (let i = 0; i < reportList.length; i++) {
        if (!('pdfUrl' in reportDetail[i])) { continue; console.log("no pdfUrl") };

        let name, email;
        const { firm, date, stock } = reportList[i];
        const { pdfUrl, targetPrice, investmentOpinion, title, summary } = reportDetail[i];
        const { ticker, sectors } = stockDetail[i];

        const photoUrl = null;

        ({ name, email } = nameEmail[i]);
        if (name === null || email === null) {
            nullUrls.push({ i: i, pdfUrl: reportDetail[i].pdfUrl });
            fs.writeFileSync(`${dirPath}/nullUrls.json`, JSON.stringify(nullUrls));
        }
        count++;

        const refPrice = bReport[i].refPrice;

        Analyst.push({ name, firm, email, photoUrl });
        Firm.add(firm);
        Report.push({ pdfUrl, name, email, investmentOpinion, ticker, stock, postedAt: date, refPrice, targetPrice, title, summary });
        sectors.map((sector) => ReportSector.push({ pdfUrl, sectorName: sector }));

        console.log(i + 1, " / ", reportList.length);

        fs.writeFileSync(`${dirPath}/Analyst.json`, JSON.stringify(Analyst));
        fs.writeFileSync(`${dirPath}/Firm.json`, JSON.stringify([...Firm]));
        fs.writeFileSync(`${dirPath}/Report.json`, JSON.stringify(Report));
        fs.writeFileSync(`${dirPath}/ReportSector.json`, JSON.stringify(ReportSector));
    }

    console.log(Analyst.length, Firm.length, Report.length, ReportSector.length, bReport.length);
}

fix(new Date("2024-03-20T23:59:59"))
// check(new Date("2024-03-20T23:59:59"))