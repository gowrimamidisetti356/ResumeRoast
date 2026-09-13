require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test25() {
    console.log("Testing gemini-2.5-flash for TEXT generation...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, are you there?");
        console.log("RESPONSE: " + result.response.text());
        console.log("SUCCESS: gemini-2.5-flash is working!");
    } catch (error) {
        console.error("FAILED:");
        console.error(error.message);
    }
}

test25();
