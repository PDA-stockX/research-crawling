import axios from 'axios';

async function getPDF(url) {
    const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
            'Content-Type': 'application/pdf' // 미디어 타입 지정
        }
    });

    return response.data; // 스트림 반환
}

export default getPDF;
