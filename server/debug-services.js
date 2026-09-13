require('dotenv').config();

const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModels() {
    console.log("--- Testing Multiple Models ---");
    const candidates = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    for (const model of candidates) {
        console.log(`Testing: ${model}...`);
        try {
            const result = await genAI.models.generateContent({
                model: model,
                contents: "Hello"
            });
            console.log(`✅ SUCCESS: ${model}`);
            return; // Exit on first success
        } catch (e) {
            console.log(`❌ FAIL: ${model} - ${e.message}`);
        }
    }
    console.log("--- All Failed ---");
}

testModels();
