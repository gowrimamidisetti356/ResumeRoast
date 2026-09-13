import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { io } from "socket.io-client";
import { useLocation, useNavigate } from 'react-router-dom';

const MockInterview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState("idle");
    const [isMicOn, setIsMicOn] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [report, setReport] = useState(null);

    // Refs
    const socketRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorRef = useRef(null);
    const sourceRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const nextStartTimeRef = useRef(0);

    const jobRole = location.state?.jobRole || "Software Engineer";

    useEffect(() => {
        return () => stopInterview();
    }, []);

    const startInterview = async () => {
        if (status === 'connected' || status === 'connecting') return;

        try {
            setStatus("connecting");

            // Socket Setup
            if (socketRef.current) socketRef.current.disconnect();
            socketRef.current = io("http://localhost:5000/interview");

            socketRef.current.on("connect", () => {
                console.log("Socket Connected");
                socketRef.current.emit("start-interview", { jobRole });
            });

            socketRef.current.on("status", (data) => setStatus(data.state));

            socketRef.current.on("audio-stream", (base64Data) => {
                // Queue audio chunks
                queueAudio(base64Data);
            });

            socketRef.current.on("audio-interrupt", () => {
                // Clear queue on interruption
                audioQueueRef.current = [];
                // Optionally stop current source if possible
            });

            socketRef.current.on("transcript-update", (data) => {
                setTranscript(prev => [...prev, data]);
            });

            socketRef.current.on("interview-report", (data) => {
                setReport(data);
                setStatus("idle");
            });

            // Audio Context Setup
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = audioContextRef.current.currentTime;

            // Start Mic
            await startMicrophone();

        } catch (e) {
            console.error("Start Error:", e);
            setStatus("error");
        }
    };

    const stopInterview = () => {
        if (socketRef.current) {
            socketRef.current.emit("end-interview");
            socketRef.current.disconnect();
        }
        if (audioContextRef.current) audioContextRef.current.close();
        setIsMicOn(false);
        setStatus("idle");
    };

    const startMicrophone = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicOn(true);

        const context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(context.destination); // Need to connect to dest for script to run? Usually yes, checking silence.

        processor.onaudioprocess = (e) => {
            if (socketRef.current && socketRef.current.connected) {
                const input = e.inputBuffer.getChannelData(0);
                const pcm = floatTo16BitPCM(input);
                socketRef.current.emit("audio-input", arrayBufferToBase64(pcm));
            }
        };

        sourceRef.current = source;
        processorRef.current = processor;
    };

    // --- Audio Utils ---
    const floatTo16BitPCM = (input) => {
        const output = new DataView(new ArrayBuffer(input.length * 2));
        for (let i = 0; i < input.length; i++) {
            let s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return output.buffer;
    };

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
        return window.btoa(binary);
    };

    // --- Playback Queue Logic ---
    const queueAudio = (base64Data) => {
        const audioData = window.atob(base64Data);
        // Play immediately using scheduler logic
        playAudioDirectly(audioData);
    };

    const playAudioDirectly = (binaryString) => {
        if (!audioContextRef.current) return;

        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

        const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000); // 24kHz output
        buffer.getChannelData(0).set(float32);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);

        const now = audioContextRef.current.currentTime;
        if (nextStartTimeRef.current < now) nextStartTimeRef.current = now;

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += buffer.duration;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center">
            <Navbar />
            <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                    Live Mock Interview
                </h1>
                <p className="text-slate-400 mb-8">{jobRole}</p>

                {/* Main Orb / Status */}
                <div className="relative mb-8">
                    <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'connected' ? 'bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.5)] animate-pulse' :
                            status === 'connecting' ? 'bg-amber-500' : 'bg-slate-700'
                        }`}>
                        <div className="text-5xl">
                            {status === 'connected' ? '🎙️' : status === 'connecting' ? '⏳' : '😶'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={startInterview}
                        disabled={status === 'connected' || status === 'connecting'}
                        className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 font-bold disabled:opacity-50"
                    >
                        Start Interview
                    </button>
                    <button
                        onClick={stopInterview}
                        disabled={status === 'idle'}
                        className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 font-bold disabled:opacity-50"
                    >
                        End Interview
                    </button>
                </div>

                {/* Transcript Preview */}
                <div className="mt-8 w-full max-w-2xl bg-slate-800/50 p-6 rounded-2xl h-64 overflow-y-auto">
                    <h3 className="text-xs uppercase font-bold text-slate-500 mb-4">Live Transcript</h3>
                    {transcript.map((t, i) => (
                        <div key={i} className={`mb-2 text-sm ${t.role === 'ai' ? 'text-blue-300' : 'text-slate-300'}`}>
                            <span className="font-bold opacity-50 mr-2">{t.role}:</span>
                            {t.text}
                        </div>
                    ))}
                </div>

                {/* Report Modal */}
                {report && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                        <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
                            <h2 className="text-3xl font-bold mb-6">Interview Summary</h2>
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="p-4 bg-slate-100 rounded-xl">
                                    <div className="text-4xl font-bold text-blue-600 mb-1">{report.score}/100</div>
                                    <div className="text-sm text-slate-500 font-bold uppercase">Overall Score</div>
                                </div>
                                <div className="p-4 bg-slate-100 rounded-xl">
                                    <div className="text-lg font-bold mb-2">Readiness</div>
                                    <div className="text-slate-600">{report.readiness}</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Strengths</h3>
                                    <ul className="list-disc pl-5 text-green-700">
                                        {report.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Weaknesses & Gaps</h3>
                                    <ul className="list-disc pl-5 text-red-600">
                                        {report.weaknesses?.map((s, i) => <li key={i}>{s}</li>)}
                                        {report.skill_gaps?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Summary</h3>
                                    <p className="text-slate-600 leading-relaxed">{report.summary}</p>
                                </div>
                            </div>

                            <button onClick={() => setReport(null)} className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
                                Close Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterview;
