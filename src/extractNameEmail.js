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
    const nameRegex = /^(?!.*(팀장|대리|사원|선임|수석|연구원|연구위원|차전지|자동차|반도체))[ㄱ-ㅎㅏ-ㅣ가-힣_]{3,4}/;

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

export default extractNameEmail;