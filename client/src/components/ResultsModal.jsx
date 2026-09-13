import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ResultsModal = ({ isOpen, onClose, title, data, loading }) => {
    const { resumeData } = useAuth();
    const [activeTab, setActiveTab] = useState('chat'); // Default to Chat
    const [chatMessage, setChatMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    // Initial Message Injection
    React.useEffect(() => {
        if (data && !loading) {
            let initialMessage = `Hello! I am your ${title} expert. `;

            // Format initial findings based on feature type
            if (title === '6-Second Scan') {
                initialMessage += `\n\n**My Verdict:** ${data.impression}\n**Clarity Score:** ${data.clarityScore}/100`;
                if (data.redFlags?.length) initialMessage += `\n\nI found these red flags: ${data.redFlags.join(', ')}`;
            } else if (title === 'ATS Score') {
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

    if (!isOpen) return null;

    const handleSendMessage = async () => {
        if (!chatMessage.trim()) return;

        const newMessage = { role: 'user', content: chatMessage };
        setChatHistory(prev => [...prev, newMessage]);
        setChatMessage(""); // Clear input
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
        if (data.error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">{data.error}</div>;

        switch (title) {
            case '6-Second Scan':
                // Data: { impression, redFlags, clarityScore }
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="font-semibold text-slate-700 mb-2">First Impression</h4>
                            <p className="text-slate-900 italic">"{data.impression}"</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data.clarityScore}%` }}></div>
                            </div>
                            <span className="font-bold text-slate-700">{data.clarityScore}/100 Clarity</span>
                        </div>
                        {data.redFlags && data.redFlags.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-red-600 mb-2">🚩 Red Flags</h4>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                    {data.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case 'ATS Score':
                // Data: { score, missingKeywords, formattingIssues }
                return (
                    <div className="space-y-6">
                        <div className="text-center py-6">
                            <div className="text-5xl font-bold text-blue-600 mb-2">{data.score}</div>
                            <p className="text-slate-500 uppercase tracking-wide text-xs">Match Score</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Missing Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.missingKeywords?.map((kw, i) => (
                                        <span key={i} className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">{kw}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Formatting</h4>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    {data.formattingIssues?.length ? data.formattingIssues.map((issue, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="text-yellow-500">⚠️</span> {issue}
                                        </li>
                                    )) : <li className="text-green-600">✅ No issues found</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'Bullet Point Impactifier':
                // Data: [{ original, improved, explanation }]
                return (
                    <div className="space-y-6">
                        {Array.isArray(data) && data.map((item, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="mb-3">
                                    <span className="text-xs font-bold text-red-500 uppercase">Before</span>
                                    <p className="text-slate-600 text-sm mt-1 line-through opacity-70">{item.original}</p>
                                </div>
                                <div className="mb-3">
                                    <span className="text-xs font-bold text-green-600 uppercase">After (XYZ Method)</span>
                                    <p className="text-slate-900 font-medium mt-1">{item.improved}</p>
                                </div>
                                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">💡 {item.explanation}</p>
                            </div>
                        ))}
                    </div>
                );

            case 'Skill Bridge':
                // Data: [{ skill, suggestion, resource }]
                return (
                    <div className="space-y-4">
                        {Array.isArray(data) && data.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg font-bold min-w-[3rem] text-center">
                                    {i + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{item.skill}</h4>
                                    <p className="text-slate-600 text-sm mt-1 mb-2">{item.suggestion}</p>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                        Resource: {item.resource}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'Mock Interview':
                // Data: [{ question, context, difficulty }]
                return (
                    <div className="space-y-4">
                        {Array.isArray(data) && data.map((item, i) => (
                            <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${item.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                        item.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {item.difficulty}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-900 mb-2">"{item.question}"</h4>
                                <p className="text-sm text-slate-500 italic">Context: {item.context}</p>
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                );
        }
    };

    // Chat UI Renderer
    const renderChat = () => (
        <div className="flex flex-col h-full h-[50vh]">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-xl mb-4 border border-slate-200">
                {chatHistory.length === 0 && (
                    <p className="text-center text-slate-400 text-sm mt-10">
                        Top Tip: Ask specific questions about your results!
                    </p>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                            ? 'bg-white border text-slate-800 rounded-br-none shadow-sm'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}>
                            {/* Styling swap: User white/border, AI gray/filled usually better for contrast or vice versa. 
                                Let's stick to standard: User Blue, AI Gray. */}
                            <span className={msg.role === 'user' ? 'text-blue-900' : 'text-slate-900'}>
                                {msg.content}
                            </span>
                        </div>
                    </div>
                ))}
                {chatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full animate-pulse">
                            AI is typing...
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Ask the ${title} AI...`}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={chatLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || chatLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {title}
                        </h3>
                        {/* Tabs */}
                        <div className="flex gap-6 mt-4">
                            <button
                                onClick={() => setActiveTab('results')}
                                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'results' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                Analysis Results
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                Chat with AI Agent
                            </button>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600 self-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                            <p className="text-slate-500 font-medium animate-pulse">Running AI Analysis...</p>
                        </div>
                    ) : (
                        activeTab === 'results' ? renderContent() : renderChat()
                    )}
                </div>

            </div>
        </div>
    );
};

export default ResultsModal;
