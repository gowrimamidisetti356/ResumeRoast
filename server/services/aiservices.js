require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined.");
}

// Initialize OLD SDK (Stable)
const genAI = new GoogleGenerativeAI(geminiApiKey);

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX;
if (!pineconeApiKey || !pineconeIndexName) {
    console.warn("WARNING: Pinecone config missing.");
}

const pinecone = pineconeApiKey ? new Pinecone({ apiKey: pineconeApiKey }) : null;
const index = pinecone && pineconeIndexName ? pinecone.index(pineconeIndexName) : null;

// Helper to get model - centralized
function getModel(modelName = "gemini-2.5-flash") {
    return genAI.getGenerativeModel({ model: modelName });
}

// Helper to handle errors
function handleAIError(error, context) {
    if (error.message.includes("429") || error.message.includes("Quota exceeded")) {
        console.warn(`${context}: Rate Limit Hit. 429.`);
        return { error: "Experiencing high traffic (Rate Limit). Please wait 1 minute and try again.", isRateLimit: true };
    }
    console.error(`${context}:`, error);
    return { error: `AI Error: ${error.message}` };
}

// Helper: Retry with Exponential Backoff
async function retryWithBackoff(fn, retries = 5, delay = 2000) {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0 || (!error.message.includes("429") && !error.message.includes("Quota exceeded"))) {
            throw error;
        }
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(res => setTimeout(res, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
}

// 1. Generate Roast
async function generateRoast(resumeText, jobDescription) {
    const prompt = `
        Act as a professional Resume Roaster.
        Analyzes the resume against the job description and provide a CLEAR, DIRECT ROAST DESCRIPTION.

        Resume: "${resumeText.substring(0, 3000)}..."
        Job Description: "${jobDescription ? jobDescription.substring(0, 1000) : 'General Role'}"

        Return a JSON object with:
        - verdict (string): A single, powerful, well-structured paragraph giving the overall "Roast Description" of the candidate's fit. Be direct and clear.
        

        Focus primarily on the Verdict being the main takeaway.
        Do not include markdown formatting like \`\`\`json.
    `;
    try {
        const model = getModel();
        const result = await retryWithBackoff(() => model.generateContent(prompt));
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        const handled = handleAIError(error, "generateRoast");
        if (handled.isRateLimit) return { verdict: handled.error, sections: {}, suggestions: [] };
        return { verdict: "Roast unavailable due to AI error.", error: error.message };
    }
}

// 2. Vision Analysis
async function parseResumeFromImage(imageBuffer, mimeType) {
    const prompt = "Analyze this resume image. Return JSON with fullText, summary, skills.";
    try {
        const model = getModel("gemini-2.5-flash"); // Flash supports vision
        const result = await retryWithBackoff(() => model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: mimeType
                }
            }
        ]));
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Vision Error:", error);
        throw new Error("Failed to analyze resume image");
    }
}

// 3. Embeddings
async function generateEmbedding(text) {
    try {
        const model = getModel("text-embedding-004");
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return new Array(768).fill(0);
    }
}

// 4. Chat with Resume
async function chatWithResume(question, resumeText, history = [], context = "General Helper") {
    try {
        // Vector logic skipped for brevity/stability
        const systemPrompt = `
            You are an AI Resume Assistant. Context: ${context}.
            Resume: "${resumeText.substring(0, 2000)}..."
            User Question: ${question}
            Answer concisely.
        `;
        const model = getModel();
        const result = await retryWithBackoff(() => model.generateContent(systemPrompt));
        return result.response.text();
    } catch (error) {
        console.error("Error in chat:", error);
        return "I'm having trouble thinking right now.";
    }
}

// 5. Generic Helper
async function generateGenericResponse(prompt) {
    try {
        // Reverted to gemini-2.5-flash per user request (Warning: High Rate Limit Risk)
        const model = getModel("gemini-2.5-flash");
        const result = await retryWithBackoff(() => model.generateContent(prompt));
        const text = result.response.text();

        // Robust JSON Cleanup
        let cleanText = text.replace(/```json|```/g, '').trim();

        // Find start: first '{' or '['
        const firstCurly = cleanText.indexOf('{');
        const firstSquare = cleanText.indexOf('[');
        let start = -1;

        if (firstCurly !== -1 && firstSquare !== -1) {
            start = Math.min(firstCurly, firstSquare);
        } else if (firstCurly !== -1) {
            start = firstCurly;
        } else {
            start = firstSquare;
        }

        // Find end: last '}' or ']'
        const lastCurly = cleanText.lastIndexOf('}');
        const lastSquare = cleanText.lastIndexOf(']');
        let end = Math.max(lastCurly, lastSquare);

        if (start !== -1 && end !== -1) {
            cleanText = cleanText.substring(start, end + 1);
        }

        try {
            return JSON.parse(cleanText);
        } catch (parseError) {
            console.error("JSON Parse Failed:", parseError);
            console.log("Raw Text:", text);
            return { raw_response: text, error: "Failed to parse AI response" };
        }
    } catch (error) {
        const handled = handleAIError(error, "generateGenericResponse");
        if (handled.isRateLimit) return { error: handled.error };
        throw new Error("AI Service Failed: " + error.message);
    }
}

module.exports = {
    generateRoast,
    parseResumeFromImage,
    generateEmbedding,
    chatWithResume,
    generateGenericResponse,
    retryWithBackoff
};
