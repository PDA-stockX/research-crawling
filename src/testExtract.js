import getContent from './pdfjs.js';

function extractNameEmail(text) {
    // 애널리스트의 이메일 주소 추출
    const emailRegex = /(?:(?:\d{2,4}-\d{2,4})(?:-\d{2,4})*)*([a-zA-Z0-9._-]*@[a-zA-Z0-9._-]+\.[a-z.]+)(?:RA)?/;
    const textWithoutSpaces = text.replace(/\s/g, '');
    const emailMatch = textWithoutSpaces.match(emailRegex);
    let email = emailMatch ?
        emailMatch[1].replace(/.*Analyst\s*/, '').charAt(0) === '_'
            ?
            emailMatch[1].replace(/.*Analyst\s*/, '').substring(1)
            : emailMatch[1].replace(/.*Analyst\s*/, '')
        : null;

    // 애널리스트의 이름 추출을 위한 정규표현식
    const AnalystNameRegex = /(?:Analyst|\(Analyst\))\s*([ㄱ-ㅎㅏ-ㅣ가-힣\s]{2,6})/;
    const nameMatch = text.match(AnalystNameRegex);
    let name = nameMatch ? nameMatch[1].replace(/\s/g, '') ? nameMatch[1].replace(/\s/g, '') : null : null;

    // 이름 추출을 위한 정규표현식
    const nameRegex = /^(?!.*(팀장|대리|사원|선임|수석|연구원|연구위원))[ㄱ-ㅎㅏ-ㅣ가-힣_]{3,4}/;

    // 이메일 시작 인덱스를 기준으로 왼쪽으로 이동하며 이름을 찾기
    function shiftLeft(index) {
        if (index < 0 || name) return;
        if (text.charAt(index) !== ' ') shiftLeft(index - 1);
        else if (name === null && index + 7 < text.length) {
            const word = text.substring(index + 1, index + 7).split(/\s{2,}/)[0];
            const wordMatch = word.replace(/[\s_]/g, '').match(nameRegex);
            // console.log(word, wordMatch);
            name = wordMatch ? wordMatch[0] : null;

            if (name === null) {
                shiftLeft(index - 1);
            }
        }
    }

    if (email !== null && name === null) {
        const temp = text.indexOf(email);
        const emailIndex = temp !== -1 ? temp : text.indexOf('@');
        // console.log("start dfs index:", emailIndex, ", ", text[emailIndex]);
        shiftLeft(emailIndex - 1);
    }

    return { name, email };
}

(async () => {
    const url1 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1710119151881.pdf';
    const url2 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1709103775681.pdf';
    const url3 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1709166464346.pdf';
    const url4 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1709514590653.pdf';
    const url5 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1709857251930.pdf';
    const url6 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1710113107594.pdf';
    const url7 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1710112767446.pdf';
    const url8 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1709854066536.pdf';
    const url9 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1708990764485.pdf';

    const text1 = await getContent(url1); //삼성증권
    const text2 = await getContent(url2); //IBK투자증권
    const text3 = await getContent(url3); //DS투자증권 해결 X
    const text4 = await getContent(url4); //교보증권
    const text5 = await getContent(url5); //한화투자증권
    const text6 = await getContent(url6); //유안타증권 해결 X
    const text7 = await getContent(url7); //신한투자증권 연구위원
    const text8 = await getContent(url8); //신한투자증권 연구원
    const text9 = await getContent(url9); //유진투자증권

    // console.log(text1);
    console.log(extractNameEmail(text1));
    // console.log(text2);
    console.log(extractNameEmail(text2));
    // console.log(text3);
    console.log(extractNameEmail(text3));
    // console.log(text4);
    console.log(extractNameEmail(text4));
    // console.log(text5);
    console.log(extractNameEmail(text5));
    // console.log(text6);
    console.log(extractNameEmail(text6));
    // console.log(text7);
    console.log(extractNameEmail(text7));
    // console.log(text8);
    console.log(extractNameEmail(text8));
    // console.log(text9);
    console.log(extractNameEmail(text9));
})();