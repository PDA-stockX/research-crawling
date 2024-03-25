import axios from 'axios';
import { Base64Encode } from 'base64-stream';
import { PassThrough, Transform } from 'stream';
import fs from 'fs';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';

async function getPDF(url) {
    let axiosConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        headers: {
            "Content-Type": "application/pdf",
        },
        encoding: null
        // responseType: "arraybuffer",
    };
    const response = await axios(url, axiosConfig);
    const base64EncodingString = Buffer.from(response.data).toString('base64');
    const base64DecodeString = Buffer.from(base64EncodingString, 'base64').toString('utf8');
    const { encoding } = jschardet.detect(response.data);
    // const str = iconv.decode(base64DecodeString, 'euc-kr').toString('utf8')
    const iconv = new Iconv(encoding, 'utf-8//translit//ignore');
    const str = iconv.convert(response.data).toString()
    console.log(str);
    // console.log(response);


    // const chunks = response.data.pipe(new PassThrough({ encoding: 'utf8' }));
    // let str = '';
    // for await (let chunk of chunks) {
    //     let line = iconv.decode(Buffer.from(chunk), 'utf-8');
    //     console.log(line)
    //     str += line;
    // }

    // // et voila! :)
    // fs.writeFileSync(`./temp.txt`, JSON.stringify(str));
    // return inoutStream;
    // return {
    //     // data: response.data.pipe(new Base64Encode()),
    //     data: response.data,
    //     mediaType: 'application/pdf' // PDF 파일의 미디어 타입 지정
    // };
}

getPDF("https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf");
// export default getPDF;
