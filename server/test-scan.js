const aiservices = require('./services/aiservices');

async function testScan() {
    console.log("Testing 6-Second Scan Logic...");

    // Mock Resume Text
    const resumeText = `
    JOHN DOE
    Software Engineer
    Experience:
    - Built a thing using React and Node.js
    - Scaled database to 1M users.
    Education:
    - BS Computer Science
    `;

    const prompt = `
        Act as a senior tech recruiter doing a 6-second scan.
        Analyze this resume text: "${resumeText.substring(0, 3000)}..."
        
        Return a JSON object with:
        - impression (string): Brutal first impression.
        - description (string): A brief professional summary/description of the candidate (2-3 sentences).
        - redFlags (array of strings): Major issues spotted instantly.
        - clarityScore (number): 0-100.
    `;

    try {
        const result = await aiservices.generateGenericResponse(prompt);
        console.log("✅ Success:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("❌ Failed:", error);
    }
}

testScan();
