import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    

                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
                        Stop Getting <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Ghosted</span> by Recruiters
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Your resume is being rejected by ATS systems before humans ever see it. Get brutally honest feedback and transform your resume into an interview magnet.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/upload"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-1"
                        >
                            Scan My Resume Free
                        </Link>
                        
                    </div>

                    <div className="mt-16 relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        
                    </div>

                    
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to get hired</h2>
                        <p className="text-lg text-slate-500">Comprehensive tools to supercharge your job application process</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "6-second scan",
                                desc: "See your resume through a recruiter's eyes. Get brutal first impressions in seconds.",
                                icon: "⚡"
                            },
                            {
                                title: "ATS score Predictor",
                                desc: "Check if your resume can be read by Applicant Tracking Systems used by 99% of Fortune 500 companies.",
                                icon: "📊"
                            },
                            {
                                title: " Bullet Point Impactifier",
                                desc: "Transform weak responsibilities into powerful achievements that highlight your impact.",
                                icon: "✍️"
                            },
                            {
                                title: "Skill bridge recommender",
                                desc: " practical projects or resources to help users genuinely acquire missing skills.",
                                icon: "⭐"
                            },
                            {
                                title: "Mock Interviewer",
                                desc: "Practice with our AI interviewer customized to the specific job description you're applying for.",
                                icon: "🎤"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
