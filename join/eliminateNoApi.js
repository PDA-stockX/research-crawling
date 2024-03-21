import fs from 'fs';

const getData = async (srcPath) => {
    const Analyst = JSON.parse(fs.readFileSync(`${srcPath}/Analyst.json`));
    const Report = JSON.parse(fs.readFileSync(`${srcPath}/Report.json`));
    const ReportSector = JSON.parse(fs.readFileSync(`${srcPath}/ReportSector.json`));

    return ({ Analyst, Report, ReportSector });
}

const eliminateNoApi = async () => {
    const srcPath = './0_copy';
    const dirPath = './0';
    const { Analyst, Report, ReportSector } = await getData(srcPath);

    const eliminatePdfUrls = [];
    const newAnalyst = [];
    const newReport = [];

    for (let i = 0; i < Report.length; i++) {
        if (Report[i].refPrice === -1) {
            eliminatePdfUrls.push(Report[i].pdfUrl);
        }
        else {
            newAnalyst.push(Analyst[i]);
            newReport.push(Report[i]);
        }
    }

    const newReportSector = ReportSector.filter((rs) => !eliminatePdfUrls.includes(rs.pdfUrl));

    console.log(Analyst.length, Report.length, ReportSector.length);
    console.log(newAnalyst.length, newReport.length, newReportSector.length);
    console.log(eliminatePdfUrls.length);

    fs.writeFileSync(`${dirPath}/Analyst.json`, JSON.stringify(newAnalyst));
    fs.writeFileSync(`${dirPath}/Report.json`, JSON.stringify(newReport));
    fs.writeFileSync(`${dirPath}/ReportSector.json`, JSON.stringify(newReportSector));
}

// eliminateNoApi();