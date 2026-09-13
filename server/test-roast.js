const aiservices = require('./services/aiservices');

async function testRoast() {
    console.log("Testing Roast Logic...");

    const resumeText = "Experienced Software Engineer with Node.js and React skills. 5 years of experience.";
    const jobDescription = "Looking for a Senior Software Engineer with AI experience.";

    try {
        console.log("Calling generateRoast...");
        const result = await aiservices.generateRoast(resumeText, jobDescription);
        console.log("✅ Roast Success:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("❌ Roast Failed:", error);
    }
}

testRoast();
