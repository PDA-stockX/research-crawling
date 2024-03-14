function extractNameEmail(text) {
    // 애널리스트의 이메일 주소 추출
    const emailRegex = /(?:Analyst\s+)?([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-z.]+)(?:RA)?/;
    const textWithoutSpaces = text.replace(/\s/g, '');
    const emailMatch = textWithoutSpaces.match(emailRegex);
    let email = emailMatch ? emailMatch[1].replace(/.*Analyst\s*/, '') : null;

    // 애널리스트의 이름 추출을 위한 정규표현식
    const AnalystNameRegex = /(?:Analyst|\(Analyst\))\s*([ㄱ-ㅎㅏ-ㅣ가-힣]{2,4})/;
    const nameMatch = text.match(AnalystNameRegex);
    let name = nameMatch ? nameMatch[1] : null;

    // 이름 추출을 위한 정규표현식
    const nameRegex = /^[ㄱ-ㅎㅏ-ㅣ가-힣]{3}$/;

    // DFS를 사용하여 이메일 시작 인덱스를 기준으로 왼쪽으로 이동하며 이름을 찾기
    function dfsLeft(index) {
        if (index < 0 || name) return;
        if (text.charAt(index) !== ' ') dfsLeft(index - 1);
        else {
            let word = '';
            let i = index + 1;

            while (i < text.length && text.charAt(i) !== ' ') {
                if (text.charAt(i) !== '\n') {
                    word = word + text.charAt(i);
                    i++;
                }
            }

            if (word.match(nameRegex)) {
                name = word;
            } else {
                dfsLeft(index - 1);
            }
        }
    }

    if (email !== null && name === null) {
        const temp = text.indexOf(email);
        const emailIndex = temp !== -1 ? temp : text.indexOf('@');
        dfsLeft(emailIndex - 1);
    }

    return { name, email }
}

// module.exports = extractNameEmail;
export default extractNameEmail;