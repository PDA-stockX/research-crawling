import fs from 'fs';
import { str2date, date2str } from '../batch/date.js';

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

const fix = async () => {
    const result1 = "../result/before/20240329";
    const result2 = "../result/before/20240328";
    const result3 = "../result/before/20240320";

    const resultPath = `../result/20240329`

    const { Analyst, Report, Firm, ReportSector } = await getResultData(resultPath);

    const { bAnalyst, bReport, bFirm, bReportSector } = await merge(
        await getResultData(result1),
        await getResultData(result2),
        await getResultData(result3)
    );

    console.log(Analyst.length, Report.length, Firm.length, ReportSector.length);
    console.log(bAnalyst.length, bReport.length, bFirm.length, bReportSector.length);

    let finalAnalyst = [], finalFirm = new Set(Firm), finalReport = [], finalReportSector = [];
    fs.writeFileSync(`${resultPath}/Firm.json`, JSON.stringify(finalFirm));

    let count = 0;
    let j = -1;
    for (let i = 0; i < Report.length; i++) {
        j++;
        if (j === bReport.length) break;
        if (Report[i].pdfUrl !== bReport[j].pdfUrl) {
            j--;
            continue;
        }
        const refPrice = bReport[j].refPrice;

        finalAnalyst.push(Analyst[i]);
        finalReport.push({ ...Report[i], refPrice });
        finalReportSector.push(ReportSector[i]);

        console.log("i: ", i + 1, " / ", Report.length, "\tj: ", j + 1, " / ", bReport.length);

        fs.writeFileSync(`${resultPath}/Analyst.json`, JSON.stringify(finalAnalyst));
        fs.writeFileSync(`${resultPath}/Report.json`, JSON.stringify(finalReport));
        fs.writeFileSync(`${resultPath}/ReportSector.json`, JSON.stringify(finalReportSector));
    }

    console.log(finalAnalyst.length, finalFirm.length, finalReport.length, finalReportSector.length);
}

export default fix;
// check(new Date("2024-03-20T23:59:59"))