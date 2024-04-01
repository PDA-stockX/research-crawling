import fs from 'fs';

const getData = async (srcPath) => {
    const Analyst = JSON.parse(fs.readFileSync(`${srcPath}/Analyst.json`));
    const Report = JSON.parse(fs.readFileSync(`${srcPath}/Report.json`));
    const Firm = JSON.parse(fs.readFileSync(`${srcPath}/Firm.json`));
    const ReportSector = JSON.parse(fs.readFileSync(`${srcPath}/ReportSector.json`));

    return ({ Analyst, Report, Firm, ReportSector });
}

const passFirms = ['DS투자증권', '미래에셋증권', '유안타증권'];

const eliminatePassFirms = async () => {
    const dirPath = '../result/here';
    const srcPath = '../result/20240329';
    const { Analyst, Report, Firm, ReportSector } = await getData(srcPath);

    const newAnalyst = [];
    const newReport = [];
    // const newFirm = [...new Set(Firm)];
    const newReportSector = [];

    for (let i = 0; i < Report.length; i++) {
        if (passFirms.includes(Analyst[i].firm)) {
            console.log()
            continue
        };

        newAnalyst.push(Analyst[i]);
        newReport.push(Report[i]);
        newReportSector.push(ReportSector[i]);
    }

    console.log(Analyst.length, Report.length, ReportSector.length);
    console.log(newAnalyst.length, newReport.length, newReportSector.length);
    // console.log(newFirm);

    fs.writeFileSync(`${dirPath}/Analyst.json`, JSON.stringify(newAnalyst));
    fs.writeFileSync(`${dirPath}/Report.json`, JSON.stringify(newReport));
    // fs.writeFileSync(`${dirPath}/Firm.json`, JSON.stringify(newFirm));
    fs.writeFileSync(`${dirPath}/ReportSector.json`, JSON.stringify(newReportSector));
}

export default eliminatePassFirms;