import getContent from './pdfjs.js';

function extractNameEmail(text) {
    let email = null;
    let name = null;

    // 이름 추출을 위한 정규표현식
    const nameRegex = /^(?!.*(팀장|대리|사원|선임|수석|연구원|연구위원|차전지|자동차))[ㄱ-ㅎㅏ-ㅣ가-힣_]{3,4}/;

    // 이메일 시작 인덱스를 기준으로 왼쪽으로 이동하며 이름을 찾기
    function shiftLeft(index) {
        if (index < 0 || name) return;
        if (text.charAt(index) !== ' ') shiftLeft(index - 1);
        else if (name === null && index + 7 < text.length) {
            const word = text.substring(index + 1, index + 7).split(/\s{2,}/)[0];
            const wordMatch = word.replace(/[\s_]/g, '').match(nameRegex);
            name = wordMatch ? wordMatch[0] : null;

            if (name === null) {
                shiftLeft(index - 1);
            }
        }
    }

    const index = text.indexOf('■');
    shiftLeft(index - 1);

    return { name, email };
}

(async () => {
    const url1 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711073904305.pdf';
    const url2 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf';
    const url3 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711063577689.pdf';
    const url4 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711062264878.pdf';

    const text1 = await getContent(url1); //한국기술신용평가(주) - 작 성 자 {이름} --연구원 (메일X)
    const text2 = await getContent(url2); //미래에셋증권
    const text3 = await getContent(url3); //유안타증권
    const text4 = await getContent(url4); //나이스디앤비 - 작 성 자 {이름} --연구원 (메일X)

    console.log(text1);
    console.log(extractNameEmail(text1));
    // console.log(text2);
    // console.log(extractNameEmail(text2));
    // console.log(text3);
    // console.log(extractNameEmail(text3));
    console.log(text4);
    console.log(extractNameEmail(text4));
})();