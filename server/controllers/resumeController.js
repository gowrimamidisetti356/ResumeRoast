const multer = require('multer');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const aiService = require('../services/aiservices');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed!'), false);
        }
    }
});

// @desc    Analyze resume & Store (Simplified Logic)
// @route   POST /api/analyze
const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a resume file' });
        }

        const { jobDescription } = req.body;

        // 1. Extract Text
        console.log("Starting text extraction...");
        let resumeText = "";
        if (req.file.mimetype === 'application/pdf') {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
                console.log("PDF parsed successfully. Length:", resumeText.length);
            } catch (pdfError) {
                console.error("PDF Parse Error:", pdfError);
                throw new Error("Failed to parse PDF file.");
            }
        } else {
            resumeText = "Resume content extracted placeholder for non-PDF files.";
        }
        console.log("Text extraction complete.");

        // 2. Generate Embedding (Using Service)
        // We trigger it but don't block the response strictly on it unless we want to index immediately.
        // The service handles Pinecone internally if configured.
        // For this "Analyze" endpoint, we mainly want the text back for the UI.

        // Note: The original controller handled persistent storage here.
        // The Service handles Vectors, but we still handle MongoDB here.

        const mockAnalysis = {
            score: Math.floor(Math.random() * (95 - 60) + 60),
            summary: "Analysis complete.",
            matches: ["Quick Scan", "Parsing"],
            missing: [],
            suggestions: ["Use the specific features below for detailed feedback."]
        };

        // 3. Save to MongoDB (Persistence) - Optional
        if (req.user) {
            await Resume.create({
                user: req.user._id,
                fileName: req.file.originalname,
                text: resumeText,
                jobDescription: jobDescription,
                initialAnalysis: mockAnalysis
            });
        }

        // 4. Indexing (Side Effect)
        // We can call a service method to index if we want, or just generate embedding.
        // For now, let's just ensure we get the text back.
        // Ideally, we'd add an "indexResume" function to the service if we want that logic there.
        // But the previous "Pinecone Upload" code was inside the controller. 
        // We'll skip explicit Pinecone upload here relying on specific features unless we move that logic to service.
        // Given the user instructions, we'll keep it simple: Return the text.

        res.status(200).json({
            message: "Analysis Complete",
            result: mockAnalysis,
            resumeText: resumeText,
            jobDescription: jobDescription
        });

    } catch (error) {
        console.error("Analyze Resume Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Database Validation Error: " + error.message });
        }
        res.status(500).json({ message: "Server Error during Analysis: " + error.message });
    }
};

// 1. Recruiter Scan
const scanResume = async (req, res) => {
    try {
        const { resumeText } = req.body;
        const prompt = `
            Act as a senior tech recruiter doing a 6-second scan.
            Analyze this resume text: "${resumeText.substring(0, 3000)}..."
            
            Return a JSON object with:
            - impression (string): Brutal first impression.
            - description (string): A brief professional summary/description of the candidate (2-3 sentences).
            - redFlags (array of strings): Major issues spotted instantly.
            - clarityScore (number): 0-100.
        `;
        const result = await aiService.generateGenericResponse(prompt);
        console.log("AI Scan Result:", JSON.stringify(result, null, 2));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. ATS Score
const calculateATSScore = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        const prompt = `
            Act as an ATS (Applicant Tracking System).
            Resume: "${resumeText.substring(0, 3000)}..."
            Job Description: "${jobDescription ? jobDescription.substring(0, 1000) : 'General Software Engineering'}"
            
            Return a JSON object with:
            - score (number): 0-100 match score.
            - missingKeywords (array of strings): Critical skills missing.
        `;
        const result = await aiService.generateGenericResponse(prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Bullet Point Impactifier
const impactifyBullets = async (req, res) => {
    try {
        const { resumeText } = req.body;
        const prompt = `
            Extract 3 weak bullet points from this resume and rewrite them using the XYZ method (Action + Task + Result/Metric).
            Resume: "${resumeText.substring(0, 2000)}..."
            
            Return a JSON array of objects:
            [{ "original": "...", "improved": "...", "explanation": "..." }]
        `;
        const result = await aiService.generateGenericResponse(prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Skill Bridge
const recommendSkills = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        const prompt = `
            Compare this resume to the job description (or general market). Identify gap skills.
            Resume: "${resumeText.substring(0, 2000)}..."
            Job: "${jobDescription ? jobDescription.substring(0, 1000) : 'Modern Tech Stack'}"
            
            Return a JSON array of objects:
            [{ "skill": "...", "suggestion": "Specific mini-project idea", "resource": "Type of resource/link" }]
        `;
        const result = await aiService.generateGenericResponse(prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Analyze Match (Roast) - Uses Specialized Service Function
const analyzeMatch = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        // Use the specialized function we created in aiservices.js
        const result = await aiService.generateRoast(resumeText, jobDescription);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Mock Interview
const generateInterviewQuestions = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        const prompt = `
            Generate 3 technical interview questions based narrowly on this resume's claims.
            Resume: "${resumeText.substring(0, 2000)}..."
            Job: "${jobDescription ? jobDescription.substring(0, 500) : ''}"
            
            Return a JSON array of objects:
            [{ "question": "...", "context": "Referencing your experience with...", "difficulty": "Medium/Hard" }]
        `;
        const result = await aiService.generateGenericResponse(prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Chat with Feature Context - Uses Specialized Service Function
const chatWithFeature = async (req, res) => {
    try {
        const { message, context, resumeText } = req.body;

        // We pass the context as a string to the service
        const reply = await aiService.chatWithResume(message, resumeText, [], context);
        res.json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// 8. Get User History
const getUserResumes = async (req, res) => {
    try {
        if (!req.user) return res.json([]); // No user = no history
        const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    analyzeResume,
    upload,
    scanResume,
    calculateATSScore,
    impactifyBullets,
    recommendSkills,
    analyzeMatch,
    generateInterviewQuestions,
    chatWithFeature,
    getUserResumes
};
