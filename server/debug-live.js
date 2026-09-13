require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const model = 'gemini-2.5-flash-native-audio-preview-12-2025';

async function testLiveConnection() {
    console.log("--- Testing Live API Connection ---");
    console.log(`Model: ${model}`);

    if (!apiKey) {
        console.error("❌ No API Key found.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const session = await ai.live.connect({
            model: model,
            config: { responseModalities: ["AUDIO"] },
            callbacks: {
                onopen: () => {
                    console.log("✅ Connection Opened Successfully!");
                    // Close immediately after success
                    process.exit(0);
                },
                onmessage: (msg) => {
                    console.log("📩 Message received");
                },
                onclose: (e) => {
                    console.log("🔒 Connection Closed:", e);
                },
                onerror: (e) => {
                    console.error("❌ Connection Error:", e);
                    process.exit(1);
                }
            }
        });

        // Keep process alive briefly to allow connection
        setTimeout(() => {
            console.log("Timeout waiting for connection...");
            process.exit(1);
        }, 10000);

    } catch (error) {
        console.error("❌ Setup Error:", error);
    }
}

testLiveConnection();
