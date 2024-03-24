import openApi from "./openApi.js";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const main = async (start, startIndex, apiCount) => {
    /**
     * join 된 index:  (i+1)7472  /  64296   (count)4935  /  10000
     */
    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜
    // startIndex = 0; // i index (defalut: 0)
    // apiCount = 25; // api로 가져오려는 데이터 갯수 (default: 100)

    // await openApi(start, startIndex, apiCount);

    await openApi(
        new Date(new Date(Date.now() - 86400000).setHours(0, 0, 0, 0)),
        6934,
        1562
    )
}
// main();
// export default main;