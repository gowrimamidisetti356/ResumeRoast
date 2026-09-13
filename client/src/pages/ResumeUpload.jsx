import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';


import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ResumeUpload = () => {
    // Navigation
    const navigate = useNavigate();
    const { setResumeData } = useAuth();
    // Resume State
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Job Description State
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState({ analysis: false });
    const [error, setError] = useState(null);

    // --- File Handlers ---
    const handleFileSelect = (e) => {
        setError(null);
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
        } else {
            setError('Please upload a PDF or DOCX file.');
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setError(null);
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) validateAndSetFile(droppedFile);
    };

    const triggerFileInput = () => fileInputRef.current.click();

    // --- Analysis Handler ---
    const onAnalyze = async () => {
        if (!file || !jobDescription) return;

        setLoading({ analysis: true });
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('jobDescription', jobDescription);

        try {
            const { data } = await axios.post('/api/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Save to Context
            setResumeData({
                text: data.resumeText,
                jobDescription: data.jobDescription,
                fileName: file.name
            });

            // Redirect to Dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error("Analyze Error:", error);
            setLoading({ analysis: false });
            setError(error.response?.data?.message || "Analysis failed. Please try again.");
        } finally { // Double safety
            if (loading.analysis) setLoading({ analysis: false });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Resume Roast AI</h1>
                    <p className="text-slate-500 mt-2">Upload your resume and paste the job description to see how you match.</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                    <h2 className="text-lg font-semibold mb-4">1. Upload your resume</h2>
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer group ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.docx" />

                        {file ? (
                            <div className="py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{file.name}</h3>
                                <p className="text-slate-500 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Change File
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 mb-1">Click to upload or drag and drop</h3>
                                <p className="text-slate-500 text-sm">PDF or DOCX (Max 10MB)</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Step 2: Job Description */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                    <h2 className="text-lg font-semibold mb-4">2. Paste Job Description</h2>
                    <textarea
                        placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications..."
                        className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm bg-slate-50"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            {jobDescription.length} characters
                        </p>
                        <button
                            onClick={onAnalyze}
                            disabled={!file || !jobDescription.trim() || loading.analysis}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-md ${!file || !jobDescription.trim() || loading.analysis
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                                }`}
                        >
                            Analyze Match
                        </button>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default ResumeUpload;