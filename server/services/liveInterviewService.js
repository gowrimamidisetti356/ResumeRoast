const { GoogleGenAI } = require("@google/genai");
const aiservices = require("./aiservices");

// Configuration from User Request
const MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY missing for Live Service");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function setupLiveInterview(io) {
    const interviewNamespace = io.of("/interview");

    interviewNamespace.on("connection", (socket) => {
        console.log(`🎤 Client connected to interview: ${socket.id}`);

        let liveSession = null;
        let transcript = []; // Store text turns for report generation

        socket.on("start-interview", async (data) => {
            try {
                const { jobRole } = data;
                console.log(`Starting interview for role: ${jobRole}`);

                if (liveSession) {
                    console.log("⚠️ Session already active. Ignoring.");
                    return;
                }

                // Connect to Gemini Live API
                // Config adapted from user snippet but mapped to Socket.IO
                liveSession = await aiservices.retryWithBackoff(() => ai.live.connect({
                    model: MODEL,
                    config: {
                        responseModalities: ["AUDIO"], // User requested Audio-only responses (we can infer text if needed or just use audio)
                        // Actually, for the transcript/report, we prefer AUDIO and TEXT if possible.
                        // But user snippet said: responseModalities: [Modality.AUDIO]
                        // Let's stick to user request, but usually 'AUDIO' implies it returns text too in the metadata?
                        // Let's verify behavior. If we only get Audio, we can't generate a text transcript easily without STT.
                        // Gemini Live usually returns "serverContent.modelTurn.parts" which has inlineData (audio) and potentially text.
                        // We'll try ["AUDIO", "TEXT"] to ensure we get transcript for the report.

                        responseModalities: ["AUDIO"],

                        systemInstruction: `
                            You are a professional, friendly, but rigorous Interviewer for the role of ${jobRole}.
                            
                            Your Goal: Conduct a mock interview.
                            1. Start by welcoming the candidate and asking them to introduce themselves.
                            2. Ask 2-3 relevant technical/behavioral questions based on their answers.
                            3. Listen patiently.
                            4. Keep your responses concise (under 20 seconds).
                            5. Provide brief feedback on clarity/confidence after answers if needed.
                            
                            Tone: Professional, encouraging, clear voice.
                        `,
                    },
                    callbacks: {
                        onopen: () => {
                            console.log("🔗 Connected to Gemini Live API");
                            socket.emit("status", { state: "connected" });
                        },
                        onmessage: (msg) => {
                            // Logic adapted from user snippet:
                            // if (message.serverContent && message.serverContent.interrupted) -> clear queue
                            // if (message.serverContent.modelTurn.parts) -> push to queue

                            if (msg.serverContent && msg.serverContent.interrupted) {
                                socket.emit("audio-interrupt");
                            }

                            if (msg.serverContent && msg.serverContent.modelTurn && msg.serverContent.modelTurn.parts) {
                                msg.serverContent.modelTurn.parts.forEach(part => {
                                    if (part.inlineData && part.inlineData.data) {
                                        // Forward Audio Chunk to Client
                                        socket.emit("audio-stream", part.inlineData.data);
                                    }

                                    // Capture text for transcript if available (even if modality is audio, sometimes text is sent as metadata)
                                    // If strictly AUDIO modality, we might miss text.
                                    if (part.text) {
                                        transcript.push({ role: "ai", text: part.text });
                                        socket.emit("transcript-update", { role: "ai", text: part.text });
                                    }
                                });
                            }

                            if (msg.serverContent && msg.serverContent.turnComplete) {
                                socket.emit("turn-complete");
                            }
                        },
                        onclose: (e) => {
                            console.log("🔒 Gemini Live Disconnected", e);
                            socket.emit("status", { state: "disconnected" });
                        },
                        onerror: (err) => {
                            console.error("❌ Gemini Live Error:", err);
                            socket.emit("error", { message: "AI Connection Error" });
                        }
                    }
                }));

            } catch (error) {
                console.error("Failed to start session:", error);
                socket.emit("error", { message: error.message });
            }
        });

        // Handle Audio Input from Client (Replaces micInputStream)
        socket.on("audio-input", (base64Audio) => {
            if (liveSession) {
                try {
                    liveSession.sendRealtimeInput({
                        audio: {
                            data: base64Audio,
                            mimeType: "audio/pcm;rate=16000"
                        }
                    });
                } catch (e) {
                    console.error("Error sending audio to Gemini:", e);
                }
            }
        });

        // Handle End Interview & Report
        socket.on("end-interview", async () => {
            console.log("Ending interview...");
            if (liveSession) {
                // liveSession.close(); // Not always available, but we drop ref
                liveSession = null;
            }

            // Guard: Short transcript
            if (!transcript || transcript.length < 2) {
                socket.emit("status", { state: "idle" });
                return;
            }

            // Generate Report
            try {
                const conversationText = transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join("\n");
                const prompt = `
                    Analyze this mock interview interactions:
                    ${conversationText}

                    Provide a JSON report with:
                    - score (0-100)
                    - strengths (list)
                    - weaknesses (list)
                    - summary (detailed text)
                    - skill_gaps (list)
                    - readiness (string)
                `;
                const report = await aiservices.generateGenericResponse(prompt);
                socket.emit("interview-report", report);
            } catch (err) {
                console.error("Report Error:", err);
                socket.emit("error", { message: "Failed to generate report" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`👋 Client disconnected: ${socket.id}`);
            liveSession = null;
        });
    });
}

module.exports = { setupLiveInterview };
