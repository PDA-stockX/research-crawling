import getContent from './pdfjs.js';

function extractNameEmail(text) {
    // 애널리스트의 이메일 주소 추출
    const emailRegex = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+)\.([a-z.]+)/;
    const emailMatch = text.match(emailRegex);
    let email = null
    if (emailMatch) {
        email = emailMatch[0];
    }
    else {
        const nextEmailRegex = /(?:(?:\d{2,4}-\d{2,4})(?:-\d{2,4})*)*([a-zA-Z0-9._-]*@[a-zA-Z0-9._-]+\.[a-z.]+)(?:RA)?/;
        const textWithoutSpaces = text.replace(/\s/g, '');
        const nextEmailMatch = textWithoutSpaces.match(nextEmailRegex);
        email = nextEmailMatch
            ? nextEmailMatch[1].replace(/.*Analyst\s*/, '').charAt(0) === '_'
                ? nextEmailMatch[1].replace(/.*Analyst\s*/, '').substring(1)
                : nextEmailMatch[1].replace(/.*Analyst\s*/, '')
            : null;
    }

    // 애널리스트의 이름 추출을 위한 정규표현식
    const AnalystNameRegex = /(?:Analyst|\(Analyst\))\s*([ㄱ-ㅎㅏ-ㅣ가-힣\s]{2,6})/;
    const nameMatch = text.match(AnalystNameRegex);
    // let name = nameMatch ? nameMatch[1].replace(/\s/g, '') ? nameMatch[1].replace(/\s/g, '') : null : null;
    let name = nameMatch
        ? nameMatch[1].split(" ")[0].length >= 3
            ? nameMatch[1].split(" ")[0]
            : nameMatch[1].replace(/\s/g, '')
                ? nameMatch[1].replace(/\s/g, '')
                : null
        : null;

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

    if (email !== null && name === null) {
        const temp = text.indexOf(email);
        const emailIndex = temp !== -1 ? temp : text.indexOf('@');
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
    const url10 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1708990270924.pdf';
    const url11 = 'http://imgstock.naver.com/upload/research/company/1402877043607.pdf';
    const url12 = 'http://imgstock.naver.com/upload/research/company/1377820909683.pdf';
    const url13 = 'http://imgstock.naver.com/upload/research/company/1371520189709.pdf';

    const url14 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1710898634054.pdf';
    const url15 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1710895748648.pdf';

    // const text1 = await getContent(url1); //삼성증권
    // const text2 = await getContent(url2); //IBK투자증권
    // const text3 = await getContent(url3); //DS투자증권 (차전지)
    // const text4 = await getContent(url4); //교보증권
    // const text5 = await getContent(url5); //한화투자증권
    // const text6 = await getContent(url6); //유안타증권 해결 X
    // const text7 = await getContent(url7); //신한투자증권 연구위원
    // const text8 = await getContent(url8); //신한투자증권 연구원
    // const text9 = await getContent(url9); //유진투자증권
    // const text10 = await getContent(url10); //키움증권 해결 X
    // const text11 = await getContent(url11); //김현용김현
    // const text12 = await getContent(url12); //장우용장우
    // const text13 = await getContent(url13); //조성경조성

    // const text14 = await getContent(url14); //미래에셋증권
    const text15 = await getContent(url15); //미래에셋증권2

    // console.log(text1);
    // console.log(extractNameEmail(text1));
    // console.log(text2);
    // console.log(extractNameEmail(text2));
    // console.log(text3);
    // console.log(extractNameEmail(text3));
    // console.log(text4);
    // console.log(extractNameEmail(text4));
    // console.log(text5);
    // console.log(extractNameEmail(text5));
    // console.log(text6);
    // console.log(extractNameEmail(text6));
    // console.log(text7);
    // console.log(extractNameEmail(text7));
    // console.log(text8);
    // console.log(extractNameEmail(text8));
    // console.log(text9);
    // console.log(extractNameEmail(text9));
    // console.log(text10);
    // console.log(extractNameEmail(text10));
    // console.log(text11);
    // console.log(extractNameEmail(text11));
    // console.log(text12);
    // console.log(extractNameEmail(text12));
    // console.log(text13);
    // console.log(extractNameEmail(text13));

    // console.log(text14);
    // console.log(extractNameEmail(text14));
    console.log(text15);
    // console.log(extractNameEmail(text15));
})();