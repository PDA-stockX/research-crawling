const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const iconv = require('iconv-lite')

const headers = {
    'authority': 'finance.naver.com',
    'method': 'GET',
    'path': '/research/company_list.naver',
    'scheme': 'https',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'max-age=0',
    'Cookie': 'NNB=Y7Q3NCW3OPGGK; summary_item_type=recent; nid_inf=978176419; NID_JKL=923gKqmUOgLnfF5BFoNl4XRnv7b2XRAGRK+/0F4mQJA=; recent_board_read=72151; naver_stock_codeList=161890%7C103140%7C047050%7C192820%7C253450%7C000150%7C045970%7C397030%7C011760%7C033100%7C; page_uid=iPHKxwqps8wssUCL5n0ssssssgh-163299; JSESSIONID=1021DD9876528F653112E80534C7874C',
    'Referer': 'https://finance.naver.com/research/',
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

async function fetchStock(url) {
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

const getStock = async (url) => {
    const html = await fetchStock(url);
    const $ = cheerio.load(html);

    const ticker = $(".description .code").text().trim();
    const sectorString = $(".section.trade_compare .h_sub.sub_tit7").find("em").find("a").text().trim();
    const sectors = sectorString.split(',');

    const stock = { ticker, sectors };

    return stock;
};

const stockDetail = async (start) => {
    const reportList = JSON.parse(fs.readFileSync('../data/reportList.json'));
    const stocks = [];

    for (const report of reportList) {
        let url = report.stockDetailUrl;
        console.log(url);

        await getStock(url)
            .then(res => {
                stocks.push(res);
            })
            .catch(err => console.log(err));
    }

    const dirPath = `../data/${date2str(start)}`
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(`${dirPath}/stockDetail.json`, JSON.stringify(stocks));
};

export default stockDetail;