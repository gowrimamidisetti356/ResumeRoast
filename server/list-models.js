require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init
        // There is no direct "listModels" on the client instance in some versions, 
        // but we can try the REST API or use a known fallback.
        // Actually, for nodejs, let's try to just generate with PRO to see if that works.
        // But better: use the fetch API to hit the endpoint directly if SDK fails.

        console.log("Checking gemini-pro...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-pro" });
            await m.generateContent("test");
            console.log("SUCCESS: gemini-pro works.");
        } catch (e) { console.log("gemini-pro failed: " + e.message); }

        console.log("Checking gemini-1.5-flash...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            await m.generateContent("test");
            console.log("SUCCESS: gemini-1.5-flash works.");
        } catch (e) { console.log("gemini-1.5-flash failed: " + e.message); }

        console.log("Checking gemini-1.5-flash-001...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            await m.generateContent("test");
            console.log("SUCCESS: gemini-1.5-flash-001 works.");
        } catch (e) { console.log("gemini-1.5-flash-001 failed: " + e.message); }

        console.log("Checking gemini-2.0-flash-exp...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            await m.generateContent("test");
            console.log("SUCCESS: gemini-2.0-flash-exp works.");
        } catch (e) { console.log("gemini-2.0-flash-exp failed: " + e.message); }

        console.log("Checking gemini-1.5-flash-8b...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
            await m.generateContent("test");
            console.log("SUCCESS: gemini-1.5-flash-8b works.");
        } catch (e) { console.log("gemini-1.5-flash-8b failed: " + e.message); }

        console.log("Checking gemini-2.5-flash...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            await m.generateContent("test");
            console.log("SUCCESS: gemini-2.5-flash works.");
        } catch (e) { console.log("gemini-2.5-flash failed: " + e.message); }

        console.log("Checking gemini-exp-1206...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-exp-1206" });
            await m.generateContent("test");
            console.log("SUCCESS: gemini-exp-1206 works.");
        } catch (e) { console.log("gemini-exp-1206 failed: " + e.message); }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
