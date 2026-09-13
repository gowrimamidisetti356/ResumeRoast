import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FeatureView = ({ title, data, loading, endpoint }) => {
    const { resumeData } = useAuth();
    // Default to 'results' if it is "Analyze Match", else 'chat'
    const [activeTab, setActiveTab] = useState(title === 'Analyze Match' ? 'results' : 'chat');
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    // Initial Message Injection
    React.useEffect(() => {
        // Reset history when title/data changes significantly
        setChatHistory([]);

        // Ensure correct tab is active when title changes
        if (title === 'Analyze Match' || title === '6-Second Scan' || title === 'ATS Score' || title === 'Bullet Point Impactifier' || title === 'Skill Bridge') {
            setActiveTab('results');
        } else {
            setActiveTab('chat');
        }

        if (data && !loading && title !== 'Analyze Match' && title !== '6-Second Scan' && title !== 'ATS Score' && title !== 'Bullet Point Impactifier' && title !== 'Skill Bridge') {
            let initialMessage = `Hello! I am your ${title} expert. `;

            if (title === 'ATS Score') {
                initialMessage += `\n\n**Match Score:** ${data.score}/100`;
                if (data.missingKeywords?.length) initialMessage += `\n\nMissing Keywords: ${data.missingKeywords.join(', ')}`;
            } else if (title === 'Bullet Point Impactifier') {
                initialMessage += `\n\nI've rewritten your weak bullet points using the XYZ method. Check the "Analysis Results" tab for the full comparison.`;
            } else if (title === 'Skill Bridge') {
                initialMessage += `\n\nI've identified some skill gaps. Ask me how to bridge them!`;
            } else if (title === 'Mock Interview') {
                initialMessage += `\n\nI'm ready to interview you. Shall we start with the first question?`;
            }

            initialMessage += `\n\nWhat would you like to know?`;

            setChatHistory([{ role: 'ai', content: initialMessage }]);
        }
    }, [data, loading, title]);

    const handleSendMessage = async () => {
        if (!chatMessage.trim()) return;

        const newMessage = { role: 'user', content: chatMessage };
        setChatHistory(prev => [...prev, newMessage]);
        setChatMessage("");
        setChatLoading(true);

        try {
            const { data: resData } = await axios.post('/api/chat', {
                message: chatMessage,
                context: title,
                resumeText: resumeData?.text
            });

            setChatHistory(prev => [...prev, { role: 'ai', content: resData.reply }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', content: "Error: Could not get response." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const renderContent = () => {
        if (!data) return null;
        if (data.error) return (
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                <p className="font-bold">Analysis Failed</p>
                <p>{data.error}</p>
                {data.raw_response && (
                    <details className="mt-2">
                        <summary className="text-xs cursor-pointer opacity-70">View Raw Response</summary>
                        <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-auto max-h-40">{data.raw_response}</pre>
                    </details>
                )}
            </div>
        );

        switch (title) {
            case 'Analyze Match':
                return (
                    <div className="space-y-8 max-w-4xl mx-auto pb-10">
                        {/* Hero Verdict */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-2xl text-white shadow-lg transform hover:scale-[1.01] transition-all">
                            <h3 className="text-2xl font-extrabold mb-2 uppercase tracking-wider text-white/90">The Roast Verdict</h3>
                            <p className="text-xl font-medium leading-relaxed italic">"{data.verdict}"</p>
                        </div>
                    </div>
                );
            case '6-Second Scan':
                return (
                    <div className="space-y-6 max-w-3xl">
                        {data.description && (
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <h4 className="font-semibold text-blue-800 mb-2 uppercase tracking-wide text-xs">Professional Summary</h4>
                                <p className="text-slate-800 text-lg leading-relaxed">{data.description}</p>
                            </div>
                        )}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h4 className="font-semibold text-slate-700 mb-2 uppercase tracking-wide text-xs">Recruiter's First Impression</h4>
                            <p className="text-slate-900 italic font-medium">"{data.impression}"</p>
                        </div>
                        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-bold text-slate-900 text-lg">Clarity Score</span>
                                <span className="font-bold text-3xl text-blue-600">{data.clarityScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${data.clarityScore}%` }}></div>
                            </div>
                        </div>
                        {data.redFlags?.length > 0 && (
                            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                                    <span>🚩</span> Red Flags Detected
                                </h4>
                                <ul className="space-y-2">
                                    {data.redFlags.map((flag, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-800">
                                            <span className="text-red-400 mt-1.5">•</span>
                                            <span>{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'ATS Score':
                return (
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="relative w-40 h-40">
                                {/* SVG Donut Chart */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {/* Background Circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="#eff6ff" // blue-50
                                        strokeWidth="10"
                                    />
                                    {/* Foreground Circle (Score) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="#2563eb" // blue-600
                                        strokeWidth="10"
                                        strokeDasharray="251.2" // 2 * PI * 40
                                        strokeDashoffset={251.2 - (251.2 * data.score) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-slate-900">{data.score}</span>
                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Score</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <h4 className="font-semibold text-slate-700 mb-2">Missing Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.missingKeywords?.map((kw, i) => (
                                    <span key={i} className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">{kw}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'Bullet Point Impactifier':
                return (
                    <div className="space-y-6 max-w-3xl">
                        {Array.isArray(data) && data.map((item, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {/* Left: Original */}
                                    <div className="p-6 bg-red-50/50 border-b md:border-b-0 md:border-r border-slate-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded uppercase tracking-wider">Original Point</span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed line-through opacity-70">{item.original}</p>
                                    </div>

                                    {/* Right: Improved */}
                                    <div className="p-6 bg-green-50/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider">Perfected Bullet</span>
                                        </div>
                                        <p className="text-slate-900 font-medium leading-relaxed">{item.improved}</p>
                                    </div>
                                </div>
                                {/* Explanation Footer */}
                                <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
                                    <span className="text-lg">💡</span>
                                    <p className="text-xs text-slate-600 italic mt-1">{item.explanation}</p>
                                </div>
                            </div>
                        ))
                        }
                    </div>
                );
            case 'Skill Bridge':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
                        {Array.isArray(data) && data.map((item, i) => (
                            <div key={i} className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors h-full">
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-bold text-slate-900 text-lg">{item.skill}</h4>
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{i + 1}</span>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 flex-grow leading-relaxed">{item.suggestion}</p>
                                <div className="mt-auto pt-3 border-t border-slate-100">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recommended Resource</span>
                                    <p className="text-sm text-blue-600 font-medium mt-1">{item.resource}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Mock Interview':
                return (
                    <div className="space-y-4 max-w-3xl">
                        {Array.isArray(data) && data.map((item, i) => (
                            <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs px-2 py-1 rounded font-medium bg-blue-100 text-blue-700">{item.difficulty}</span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-900 mb-2">"{item.question}"</h4>
                                <p className="text-sm text-slate-500 italic">Context: {item.context}</p>
                            </div>
                        ))}
                    </div>
                );

            default:
                return <pre className="p-4 bg-slate-50 rounded">{JSON.stringify(data, null, 2)}</pre>;
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {title}
                </h2>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    {/* Hide Tabs if it's Analyze Match OR 6-Second Scan, forcing focus on the Report */}
                    {title !== 'Analyze Match' && title !== '6-Second Scan' && title !== 'ATS Score' && title !== 'Bullet Point Impactifier' && title !== 'Skill Bridge' && (
                        <>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('results')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'results' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Results
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="text-slate-500 font-medium mt-4 animate-pulse">Running AI Analysis...</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {activeTab === 'chat' ? (
                            <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6">
                                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                                                }`}>
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Ask a follow-up question..."
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                            disabled={chatLoading}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!chatMessage.trim() || chatLoading}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 font-medium transition-colors shadow-lg shadow-blue-600/20"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="max-w-4xl mx-auto">
                                    {renderContent()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeatureView;
