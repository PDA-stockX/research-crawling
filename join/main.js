import openApi from "./openApi.js";

const main = (start, startIndex = 0, apiCount = 1000) => {
    /**
     * join 된 index:  (i+1)7472  /  64296   (count)4935  /  10000
     */
    // start = new Date(new Date().setHours(23, 59, 0, 0)); // 시작 날짜
    // startIndex = 0; // i index (defalut: 0)
    // apiCount = 25; // api로 가져오려는 데이터 갯수 (default: 1000)

    openApi(start, startIndex, apiCount);
}

export default main;