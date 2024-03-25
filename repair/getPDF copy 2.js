import axios from 'axios';

async function getPDF(url) {
    const response = await axios.get(url, { responseType: 'stream' });

    return {
        data: response.data,
        mediaType: 'application/pdf' // PDF 파일의 미디어 타입 지정
    };
}

export default getPDF;
