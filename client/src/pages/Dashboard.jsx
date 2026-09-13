import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import FeatureView from '../components/FeatureView';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout, resumeData, setResumeData } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [activeFeature, setActiveFeature] = useState(null); // The currently selected feature object
    const [featureData, setFeatureData] = useState(null); // The result data for the active feature
    const [loading, setLoading] = useState(false);

    const features = [
        { id: 'scan', title: '6-Second Scan', endpoint: '/api/scan', icon: '⚡', desc: "Recruiter Impression" },
        { id: 'match', title: 'Analyze Match', endpoint: '/api/analyze-match', icon: '🔥', desc: "Roast My Resume" },
        { id: 'ats', title: 'ATS Score', endpoint: '/api/ats-score', icon: '📊', desc: "Match Score" },
        { id: 'bullet', title: 'Bullet Point Impactifier', endpoint: '/api/bullet-impact', icon: '🎯', desc: "Rewrite Bullets" },
        { id: 'skill', title: 'Skill Bridge', endpoint: '/api/skill-bridge', icon: '⭐', desc: "Skill Gaps" },
        { id: 'mock', title: 'Mock Interview', endpoint: '/api/mock-interview', icon: '🎤', desc: "Practice" },


    ];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get('/api/');
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const handleLoadHistory = (resume) => {
        setResumeData({
            text: resume.text,
            jobDescription: resume.jobDescription,
            fileName: resume.fileName,
            _id: resume._id
        });
        setActiveFeature(null); // Reset view to home/welcome
    };

    const handleSelectFeature = async (feature) => {
        if (!resumeData) return;

        if (feature.id === 'mock') {
            navigate('/interview', { state: { jobRole: resumeData.jobDescription || "Software Engineer" } });
            return;
        }





        setActiveFeature(feature);
        setLoading(true);
        setFeatureData(null); // Clear old data while loading

        try {
            const payload = {
                resumeText: resumeData.text,
                jobDescription: resumeData.jobDescription,
                context: feature.title
            };

            const { data } = await axios.post(feature.endpoint, payload);
            setFeatureData(data);
        } catch (error) {
            console.error(error);
            setFeatureData({ error: error.response?.data?.message || "Feature failed" });
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
                            {resumeData ? `Ready to Roast, ${user?.name?.split(' ')[0]}!` : `Welcome, ${user?.name?.split(' ')[0]}!`}
                        </h1>
                        <p className="text-slate-500">
                            {resumeData
                                ? "Select an analysis tool below to see the results on this page."
                                : "Please upload a resume from the sidebar to get started."}
                        </p>
                    </div>

                    {/* Feature Grid (Visible when resume is active) */}
                    {resumeData && (
                        <div className="px-8 mb-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {features.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => handleSelectFeature(f)}
                                        className={`p-4 rounded-2xl border text-left transition-all ${activeFeature?.id === f.id
                                            ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600 ring-offset-2'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{f.icon}</div>
                                        <h3 className={`font-bold text-sm leading-tight ${activeFeature?.id === f.id ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                                        <p className={`text-[10px] mt-1 opacity-80 ${activeFeature?.id === f.id ? 'text-blue-100' : 'text-slate-500'}`}>{f.desc}</p>
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
                            // Empty State Placeholder
                            resumeData && (
                                <div className="h-[400px] rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                    <div className="text-6xl mb-4 opacity-50">👆</div>
                                    <p className="font-medium">Click a card above to analyze your resume</p>
                                </div>
                            )
                        )}

                        {!resumeData && (
                            <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
                                <div className="text-6xl mb-4">📄</div>
                                <p>Upload a resume to unlock the dashboard features.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
