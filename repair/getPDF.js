import axios from 'axios';

async function getPDF(url) {
    const response = await axios.get(url, { responseType: 'stream' });

    return response.data;
}

export default getPDF;
