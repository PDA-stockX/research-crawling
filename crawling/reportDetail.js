import axios from "axios";
import cheerio from "cheerio";
import fs from 'fs';
import iconv from 'iconv-lite';

import { str2date, date2str } from '../batch/date.js';

const headers = {
    'authority': 'finance.naver.com',
    'method': 'GET',
    // 'path': '/research/company_read.naver?nid=72166&page=1',
    'scheme': 'https',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    'Cookie': 'NNB=Y7Q3NCW3OPGGK; summary_item_type=recent; nid_inf=978176419; NID_JKL=923gKqmUOgLnfF5BFoNl4XRnv7b2XRAGRK+/0F4mQJA=; page_uid=iPHKxwqps8wssUCL5n0ssssssgh-163299; recent_board_read=72166; naver_stock_codeList=020000%7C192820%7C175330%7C222800%7C161890%7C103140%7C047050%7C253450%7C000150%7C045970%7C397030%7C011760%7C033100%7C; JSESSIONID=8F0B873D5586725BE5D6421EB95207BB',
    'Referer': 'https://finance.naver.com/research/company_list.naver?&page=1',
    'Sec-Ch-Ua': `Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"`,
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': `"Windows"`,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function fetchReport(url) {
    try {
        const response = await axios.get(url, { headers: headers, responseType: 'arraybuffer' });

        let contentType = response.headers['content-type']

        let charset = contentType.includes('charset=')
            ? contentType.split('charset=')[1]
            : 'UTF-8'

        let data = iconv.decode(response.data, charset)

        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

const getReport = async (url) => {
    const html = await fetchReport(url);
    const $ = cheerio.load(html);

    const pdfUrl = $(".view_report").find("a").attr("href");
    const targetPrice = parseInt($(".money").find("strong").text().trim().replace(/,/g, ''));
    const investmentOpinion = $(".coment").text().trim();
    const title = $(".view_sbj").contents().filter(function () {
        return this.nodeType === 3;
    }).text().trim();

    const summary = $(".view_cnt div").html();

    const report = { pdfUrl, targetPrice, investmentOpinion, title, summary };
    return report;
};

const reportDetail = async (start) => {
    const dirPath = `../data/${date2str(start)}`
    const reportList = JSON.parse(fs.readFileSync(`${dirPath}/reportList.json`));
    const reportDetail = [];

    console.log("crawling reportDetail...");
    for (const report of reportList) {
        let url = report.reportDetailUrl;

        await getReport(url)
            .then(res => {
                reportDetail.push(res);
            })
            .catch(err => console.log(err));
    }

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(`${dirPath}/reportDetail.json`, JSON.stringify(reportDetail));
};

export default reportDetail;
