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
    const url1 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711073904305.pdf';
    const url2 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf';
    const url3 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711063577689.pdf';
    const url4 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1711062264878.pdf';
    const url5 = 'https://ssl.pstatic.net/imgstock/upload/research/company/1710899160024.pdf';

    const text1 = await getContent(url1); //한국기술신용평가(주) - 작 성 자 {이름} --연구원 (메일X)
    const text2 = await getContent(url2); //미래에셋증권
    const text3 = await getContent(url3); //유안타증권
    const text4 = await getContent(url4); //나이스디앤비 - 작 성 자 {이름} --연구원 (메일X)
    const text5 = await getContent(url5); //한화투자증권

    // console.log(text1);
    // console.log(extractNameEmail(text1));
    // console.log(text2);
    // console.log(extractNameEmail(text2));
    // console.log(text3);
    // console.log(extractNameEmail(text3));
    // console.log(text4);
    // console.log(extractNameEmail(text4));
    console.log(text5);
    console.log(extractNameEmail(text5));
})();