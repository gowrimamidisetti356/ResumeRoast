import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Backend URL from Vercel environment variable
const API_URL = import.meta.env.VITE_API_URL;

const ResumeUpload = () => {
    // Navigation
    const navigate = useNavigate();

    // Auth Context
    const { setResumeData } = useAuth();

    // Resume State
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Job Description State
    const [jobDescription, setJobDescription] = useState('');

    // Loading & Error State
    const [loading, setLoading] = useState({
        analysis: false
    });

    const [error, setError] = useState(null);

    // -----------------------------
    // File Handlers
    // -----------------------------

    const handleFileSelect = (e) => {
        setError(null);

        const selectedFile = e.target.files[0];

        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (validTypes.includes(selectedFile.type)) {
            // Optional 10MB validation
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB.');
                return;
            }

            setFile(selectedFile);
        } else {
            setError('Please upload a PDF or DOCX file.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();

        setError(null);
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // -----------------------------
    // Resume Analysis
    // -----------------------------

    const onAnalyze = async () => {
        // Basic validation
        if (!file) {
            setError('Please upload your resume first.');
            return;
        }

        if (!jobDescription.trim()) {
            setError('Please enter the job description.');
            return;
        }

        // Check backend URL
        if (!API_URL) {
            console.error('VITE_API_URL is not configured.');

            setError(
                'Backend API URL is not configured. Please add VITE_API_URL in Vercel Environment Variables and redeploy the frontend.'
            );

            return;
        }

        setLoading({
            analysis: true
        });

        setError(null);

        // Create multipart form data
        const formData = new FormData();

        formData.append('file', file);
        formData.append('jobDescription', jobDescription);

        try {
            // Full backend URL
            const analyzeURL = `${API_URL}/api/analyze`;

            console.log('Sending resume to:', analyzeURL);

            const { data } = await axios.post(
                analyzeURL,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Analysis response:', data);

            // Save resume information in AuthContext
            setResumeData({
                text: data.resumeText,
                jobDescription: data.jobDescription,
                fileName: file.name
            });

            // Redirect to dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error('Analyze Error:', error);

            if (error.response) {
                console.error(
                    'Backend Status:',
                    error.response.status
                );

                console.error(
                    'Backend Response:',
                    error.response.data
                );
            }

            let errorMessage =
                'Analysis failed. Please try again.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.request) {
                errorMessage =
                    'Unable to connect to the backend server. Please check your Vercel backend deployment and API URL.';
            }

            setError(errorMessage);

        } finally {
            setLoading({
                analysis: false
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Page Header */}
                <div className="text-center mb-10">

                    <h1 className="text-3xl font-bold text-slate-900">
                        Resume Roast AI
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Upload your resume and paste the job description to see how you match.
                    </p>

                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>

                        <span>{error}</span>

                    </div>
                )}

                {/* ----------------------------- */}
                {/* Step 1: Resume Upload */}
                {/* ----------------------------- */}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">

                    <h2 className="text-lg font-semibold mb-4">
                        1. Upload your resume
                    </h2>

                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer group ${
                            isDragging
                                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                                : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                    >

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".pdf,.docx"
                        />

                        {file ? (

                            <div className="py-4">

                                {/* Success Icon */}
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-8 h-8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>

                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {file.name}
                                </h3>

                                <p className="text-slate-500 text-sm mb-6">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Change File
                                </button>

                            </div>

                        ) : (

                            <>

                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-8 h-8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                        />
                                    </svg>

                                </div>

                                <h3 className="text-lg font-medium text-slate-900 mb-1">
                                    Click to upload or drag and drop
                                </h3>

                                <p className="text-slate-500 text-sm">
                                    PDF or DOCX (Max 10MB)
                                </p>

                            </>

                        )}

                    </div>

                </div>

                {/* ----------------------------- */}
                {/* Step 2: Job Description */}
                {/* ----------------------------- */}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">

                    <h2 className="text-lg font-semibold mb-4">
                        2. Paste Job Description
                    </h2>

                    <textarea
                        placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications..."
                        className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm bg-slate-50"
                        value={jobDescription}
                        onChange={(e) =>
                            setJobDescription(e.target.value)
                        }
                    />

                    <div className="mt-4 flex items-center justify-between">

                        <p className="text-xs text-slate-400">
                            {jobDescription.length} characters
                        </p>

                        <button
                            onClick={onAnalyze}
                            disabled={
                                !file ||
                                !jobDescription.trim() ||
                                loading.analysis
                            }
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-md ${
                                !file ||
                                !jobDescription.trim() ||
                                loading.analysis
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                            }`}
                        >

                            {loading.analysis ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />

                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>

                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Match'
                            )}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ResumeUpload;