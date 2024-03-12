const OpenAI = require("openai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    organization: ORGANIZATION_ID,
    headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
    }
});

async function callChatGPT(reports) {
    const prompt = `
    주어지는 리포트 배열에 대해 해당 리포트를 작성한 애널리스트 1 인의 이름과 이메일을 다음과 같은 형식으로 변환하고 그 결과들로 배열을 만들기. 단, 중간 과정없고 과정 설명 없고 오로지 결과만 반환할 것.
[
    {
    name: String,
    email: String,
    },
]

    `;

    console.log("in gpt api: ", prompt + reports);

    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "system",
            content: prompt + reports
        }],
        stream: true,
    });

    let result = '';
    for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
    return result;
}

module.exports = callChatGPT;