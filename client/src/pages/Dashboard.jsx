import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import FeatureView from '../components/FeatureView';
import { useNavigate } from 'react-router-dom';

// Backend URL from Vercel environment variable
const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const { user, logout, resumeData, setResumeData } = useAuth();
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [activeFeature, setActiveFeature] = useState(null);
    const [featureData, setFeatureData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dashboard features
    const features = [
        {
            id: 'scan',
            title: '6-Second Scan',
            endpoint: '/api/scan',
            icon: '⚡',
            desc: 'Recruiter Impression'
        },
        {
            id: 'match',
            title: 'Analyze Match',
            endpoint: '/api/analyze-match',
            icon: '🔥',
            desc: 'Roast My Resume'
        },
        {
            id: 'ats',
            title: 'ATS Score',
            endpoint: '/api/ats-score',
            icon: '📊',
            desc: 'Match Score'
        },
        {
            id: 'bullet',
            title: 'Bullet Point Impactifier',
            endpoint: '/api/bullet-impact',
            icon: '🎯',
            desc: 'Rewrite Bullets'
        },
        {
            id: 'skill',
            title: 'Skill Bridge',
            endpoint: '/api/skill-bridge',
            icon: '⭐',
            desc: 'Skill Gaps'
        },
        {
            id: 'mock',
            title: 'Mock Interview',
            endpoint: '/api/mock-interview',
            icon: '🎤',
            desc: 'Practice'
        }
    ];

    // Check API URL when dashboard loads
    useEffect(() => {
        if (!API_URL) {
            console.error(
                'VITE_API_URL is not configured. Please add it in Vercel Environment Variables.'
            );
        } else {
            console.log('Backend API URL:', API_URL);
        }

        fetchHistory();
    }, []);

    // Fetch previous resume history
    const fetchHistory = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/`);

            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch history:', error);

            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Response:', error.response.data);
            }
        }
    };

    // Load a previous resume from history
    const handleLoadHistory = (resume) => {
        setResumeData({
            text: resume.text,
            jobDescription: resume.jobDescription,
            fileName: resume.fileName,
            _id: resume._id
        });

        setActiveFeature(null);
        setFeatureData(null);
    };

    // Handle feature selection
    const handleSelectFeature = async (feature) => {
        if (!resumeData) {
            return;
        }

        // Mock interview has a separate page
        if (feature.id === 'mock') {
            navigate('/interview', {
                state: {
                    jobRole:
                        resumeData.jobDescription ||
                        'Software Engineer'
                }
            });

            return;
        }

        // Make sure backend URL exists
        if (!API_URL) {
            setActiveFeature(feature);

            setFeatureData({
                error:
                    'Backend API URL is not configured. Please set VITE_API_URL in Vercel Environment Variables and redeploy the frontend.'
            });

            return;
        }

        setActiveFeature(feature);
        setLoading(true);
        setFeatureData(null);

        try {
            const payload = {
                resumeText: resumeData.text,
                jobDescription: resumeData.jobDescription,
                context: feature.title
            };

            console.log(
                'Sending request to:',
                `${API_URL}${feature.endpoint}`
            );

            const { data } = await axios.post(
                `${API_URL}${feature.endpoint}`,
                payload
            );

            setFeatureData(data);
        } catch (error) {
            console.error('Feature request failed:', error);

            let errorMessage = 'Feature failed. Please try again.';

            if (error.response) {
                console.error(
                    'Backend status:',
                    error.response.status
                );

                console.error(
                    'Backend response:',
                    error.response.data
                );

                errorMessage =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    errorMessage;
            } else if (error.request) {
                errorMessage =
                    'Unable to connect to the backend server. Please check your Vercel backend deployment and API URL.';
            } else {
                errorMessage = error.message;
            }

            setFeatureData({
                error: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden">

            {/* Left Sidebar */}
            <Sidebar
                user={user}
                resumeData={resumeData}
                features={features}
                activeFeature={activeFeature}
                onSelectFeature={handleSelectFeature}
                history={history}
                onLoadHistory={handleLoadHistory}
                onLogout={logout}
            />

            {/* Main Content */}
            <div className="flex-1 ml-64 h-full relative overflow-y-auto bg-slate-50">

                <div className="max-w-7xl mx-auto min-h-full flex flex-col">

                    {/* Header / Welcome Area */}
                    <div className="px-8 pt-8 pb-4">

                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {resumeData
                                ? `Ready to Roast, ${user?.name?.split(' ')[0]}!`
                                : `Welcome, ${user?.name?.split(' ')[0]}!`}
                        </h1>

                        <p className="text-slate-500">
                            {resumeData
                                ? 'Select an analysis tool below to see the results on this page.'
                                : 'Please upload a resume from the sidebar to get started.'}
                        </p>

                    </div>

                    {/* Feature Grid */}
                    {resumeData && (
                        <div className="px-8 mb-6">

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                                {features.map((feature) => (

                                    <button
                                        key={feature.id}
                                        onClick={() =>
                                            handleSelectFeature(feature)
                                        }
                                        disabled={loading}
                                        className={`p-4 rounded-2xl border text-left transition-all ${
                                            activeFeature?.id === feature.id
                                                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600 ring-offset-2'
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-md'
                                        } ${
                                            loading
                                                ? 'opacity-70 cursor-wait'
                                                : ''
                                        }`}
                                    >

                                        <div className="text-2xl mb-2">
                                            {feature.icon}
                                        </div>

                                        <h3
                                            className={`font-bold text-sm leading-tight ${
                                                activeFeature?.id === feature.id
                                                    ? 'text-white'
                                                    : 'text-slate-900'
                                            }`}
                                        >
                                            {feature.title}
                                        </h3>

                                        <p
                                            className={`text-[10px] mt-1 opacity-80 ${
                                                activeFeature?.id === feature.id
                                                    ? 'text-blue-100'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {feature.desc}
                                        </p>

                                    </button>

                                ))}

                            </div>

                        </div>
                    )}

                    {/* Result Content Area */}
                    <div className="flex-1 px-8 pb-8">

                        {activeFeature ? (

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col animate-fadeIn">

                                <FeatureView
                                    title={activeFeature.title}
                                    data={featureData}
                                    loading={loading}
                                    endpoint={activeFeature.endpoint}
                                />

                            </div>

                        ) : (

                            /* Empty State */
                            resumeData && (
                                <div className="h-[400px] rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">

                                    <div className="text-6xl mb-4 opacity-50">
                                        👆
                                    </div>

                                    <p className="font-medium">
                                        Click a card above to analyze your resume
                                    </p>

                                </div>
                            )

                        )}

                        {/* No Resume State */}
                        {!resumeData && (

                            <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center text-slate-400">

                                <div className="text-6xl mb-4">
                                    📄
                                </div>

                                <p>
                                    Upload a resume to unlock the dashboard features.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Dashboard;