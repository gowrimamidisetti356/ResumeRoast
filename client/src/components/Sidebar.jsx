import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ user, resumeData, features, activeFeature, onSelectFeature, history, onLoadHistory, onLogout }) => {
    return (
        <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800 text-slate-300">
            {/* Logo area */}
            <div className="p-6 border-b border-slate-800">
                <Link to="/" className="flex items-center gap-2 text-white">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        ResumeRoast
                    </span>
                </Link>
            </div>

            {/* Resume Context */}
            {resumeData && (
                <div className="px-4 py-4 bg-slate-800/50">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Resume</div>
                    <div className="text-sm text-white font-medium truncate" title={resumeData.fileName}>
                        📄 {resumeData.fileName}
                    </div>
                </div>
            )}

            {/* Navigation - Features */}
            <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                <div className="space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        AI Features
                    </div>
                    {features.map(feature => (
                        <button
                            key={feature.id}
                            onClick={() => onSelectFeature(feature)}
                            disabled={!resumeData}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${activeFeature?.id === feature.id
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                } ${!resumeData ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="text-lg">{feature.icon}</span>
                            <span className="text-sm font-medium">{feature.title}</span>
                        </button>
                    ))}
                </div>

                {/* History Section */}
                {history && history.length > 0 && (
                    <div className="mt-8 space-y-1">
                        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Recent History
                        </div>
                        {history.map(item => (
                            <button
                                key={item._id}
                                onClick={() => onLoadHistory(item)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-xs truncate ${resumeData?._id === item._id
                                    ? 'text-blue-400 font-medium'
                                    : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.fileName}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* User / Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="grid grid-cols-1 gap-2">
                    <Link
                        to="/upload"
                        className="flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white transition-colors shadow-lg shadow-blue-900/20"
                    >
                        Upload New Resume
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
