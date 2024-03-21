import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const headers = {
    "authority": "namu.wiki",
    "method": "GET",
    "path": "/w/%EB%AF%B8%EB%9E%98%EC%97%90%EC%85%8B%EC%A6%9D%EA%B6%8C",
    "scheme": "https",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "max-age=0",
    "Cookie": "__cfuid=zmsl0AeJ1QoqbikdKjdnsQ%3D%3D; __cf_bm=IMQyxdUc6_yRweVMCPrrEM8eb7UyIpJS3gNgaNgy8zM-1710720051-1.0.1.1-rK17UeN01okvYDB4Tw3uyPTgKP8.E4XVezFIrvpveQ9EqHpTHRB09yc15hLSxoUY90F.6grbuv9xVf_pHc9dXA; cf_clearance=vOmk1n559btN15aa57MCNL4z9sQqYEmdciOkAgt2cU0-1710720062-1.0.1.1-7I3TwpohgJUqDc3HJ5nKj094SmqHlmU72Bu_mYas2JxQcKBiqG6NihdlwCpyHC_jY6xdDbxrHjNV3UqMzVbaLg; __gsas=ID=f8f0db850736185a:T=1710720240:RT=1710720240:S=ALNI_Mag6s-aDEjPfd8nUpOEAWzLhPdf8g; FCNEC=%5B%5B%22AKsRol-5qoIwV6Ao5CM-6op1NqWotu22yL6Qky2UKITdQt5mTg8izuX3pU2gKFRyZ8vewXJ0cwja6BXgr4WJx5fylt_toCSwAGO3xwZBBcOAYR_0FUzEURSmQ47QixTlyki9pEZ2OFevMfhtLyodbJ2qWpxRPEr4Lg%3D%3D%22%5D%5D",
    "Referer": "https://www.google.com/",
    "Sec-Ch-Ua": `"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"`,
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": `"Windows"`,
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
};

async function fetchLogo(url) {
    try {
        const response = await axios.get(url, { headers: headers });
        return response.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

const getLogo = async () => {
    const url = "https://namu.wiki/w/%EC%8B%A0%ED%95%9C%ED%88%AC%EC%9E%90%EC%A6%9D%EA%B6%8C";
    const html = await fetchLogo(url);
    const $ = cheerio.load(html, { scriptingEnabled: false });

    const data = $("span._5z5vsy6g div span.XBc8G3Rq span.sizHuKZx noscript img._2NID3an1").map((i, el) => {
        return {
            title: $(el).prop("alt").split(" ")[0].replace(/\bCI\b$/, "").replace(/로고$/, ""),
            photoUrl: $(el).prop("src")
        }
    });

    return data.get();
}

const photoUrl = async () => {
    const photoUrls = await getLogo();
    fs.writeFileSync("../data/photoUrls.json", JSON.stringify(photoUrls));
}

export default photoUrl;