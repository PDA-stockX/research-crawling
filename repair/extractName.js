function usePdfjs(text) {
    let email = null;
    let name = null;

    // -위원 기준으로 이름 찾기
    const classRegex = /위원/;
    const classMatch = text.match(classRegex);
    const classIndex = classMatch ? classMatch.index : 0;

    // 이름 추출을 위한 정규표현식
    const nameRegex = /^(?!.*(팀장|대리|사원|선임|수석|연구원|연구위원|전문위원|차전지|자동차))[ㄱ-ㅎㅏ-ㅣ가-힣_]{3,4}/;

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

    const squareIndex = text.indexOf('■');

    if (squareIndex > classIndex) {
        shiftLeft(squareIndex - 1);
    }
    else if (classIndex !== 0) {
        shiftLeft(classIndex - 1);
    }

    return { name, email };
}

export default usePdfjs;