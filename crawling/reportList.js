import axios from "axios";
import cheerio from "cheerio";
import fs from 'fs';
import iconv from 'iconv-lite';

import { str2date, date2str } from '../main/date.js';

const headers = {
    "authority": "finance.naver.com",
    "method": "GET",
    "path": "/research/company_list.naver",
    "scheme": "https",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "max-age=0",
    "Cookie": "NNB=Y7Q3NCW3OPGGK; summary_item_type=recent; nid_inf=978176419; NID_JKL=923gKqmUOgLnfF5BFoNl4XRnv7b2XRAGRK+/0F4mQJA=; recent_board_read=72151; naver_stock_codeList=161890%7C103140%7C047050%7C192820%7C253450%7C000150%7C045970%7C397030%7C011760%7C033100%7C; page_uid=iPHKxwqps8wssUCL5n0ssssssgh-163299; JSESSIONID=1021DD9876528F653112E80534C7874C",
    "Referer": "https://finance.naver.com/research/",
    "Sec-Ch-Ua": 'Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": 'Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
};
const homeUrl = "https://finance.naver.com";

async function fetchReportList(url) {
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

const getReportList = async (url, start, end) => {
    const html = await fetchReportList(url);
    const $ = cheerio.load(html);
    const reportList = [];

    for (const el of $(".box_type_m tr")) {
        const fileTd = $(el).find("td.file");

        if (fileTd.length) {
            const stockDetailUrl = $(el).find("td").eq(0).find("a").attr("href");
            const reportDetailUrl = $(el).find("td").eq(1).find("a").attr("href");
            const firm = $(el).find("td").eq(2).text().trim();
            const date = str2date($(el).find("td").eq(4).text().trim());
            const stock = $(el).find("td").eq(0).find("a").attr("title");

            if (date <= start && date > end) {
                reportList.push({
                    stockDetailUrl: homeUrl + stockDetailUrl,
                    reportDetailUrl: homeUrl + "/research/" + reportDetailUrl,
                    firm,
                    date,
                    stock
                });
            }
            else { break };
        }
    }
    return reportList;
};

const getLastPageNum = async (url) => {
    const html = await fetchReportList(url);
    const $ = cheerio.load(html);

    const num = parseInt($("td.pgRR").find("a").prop("href").split("=")[1]);

    return num;
};

const reportList = async (
    start = new Date(new Date().setHours(23, 59, 0, 0)),
    end = new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0))
) => {

    const reportList = [];

    const lastPageNum = await getLastPageNum(homeUrl + "/research/company_list.naver?&page=" + 1);
    for (let pageNum = 1; pageNum <= lastPageNum; pageNum++) {
        let url = homeUrl + "/research/company_list.naver?&page=" + pageNum;
        console.log(pageNum);

        const res = await getReportList(url, start, end)
        if (res.length === 0) {
            break
        }
        reportList.push(...res);
    };

    const dirPath = `../data/${date2str(start)}`
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(`${dirPath}/reportList.json`, JSON.stringify(reportList));
};

export default reportList;
