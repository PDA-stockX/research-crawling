const path = require('path');
const fs = require('fs');

function extractNameEmail(text) {
    // text.json 파일 내용 가져오기
    // const fileName = '1709767859468';
    // const jsonData = fs.readFileSync("output/" + fileName + ".json", 'utf8');
    // const text = JSON.parse(jsonData);

    // 애널리스트의 이메일 주소 추출
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch ? emailMatch[1] : '';

    // 애널리스트의 이름 추출을 위한 정규표현식
    const nameRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]{2,4}/;
    let name = '';

    // DFS를 사용하여 이메일 시작 인덱스를 기준으로 왼쪽으로 이동하며 이름을 찾기
    function dfsLeft(index) {
        if (index < 0 || name) return;
        if (text.charAt(index) !== ' ') dfsLeft(index - 1);
        else {
            let word = '';
            let i = index + 1;

            while (i < text.length && text.charAt(i) !== ' ') {
                word = word + text.charAt(i);
                i++;
            }
            console.log(word);

            if (word.match(nameRegex)) {
                name = word;
            } else {
                dfsLeft(index - 1);
            }
        }
    }

    if (emailMatch) {
        dfsLeft(emailMatch.index - 3); // 이메일 시작 인덱스의 왼쪽부터 DFS 시작
    }

    // 결과 출력
    if (name && email) {
        return { name, email };
    } else {
        return "None";
    }
}

module.exports = extractNameEmail;