import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, TrendingUp, AlertCircle, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { useStock } from '@/modules/admin/stock/hooks/useStock';
import { useCrm } from '@/modules/admin/crm/hooks/useCrm';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const AIAssistant: React.FC<{ companyId: string }> = ({ companyId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Bonjour ! Je suis **CompanyOS AI**, votre partenaire stratégique. Je peux analyser vos flux financiers, détecter les risques de stock ou évaluer la performance de vos ventes. Comment puis-je vous éclairer ?',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { items: stock, movements } = useStock(companyId);
    const { contacts, deals } = useCrm(companyId);
    const { user } = useAuth();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        try {
            const result = await apiFetch(`/erp/${companyId}/ai-query`, {
                method: 'POST',
                body: JSON.stringify({ query: currentInput })
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Désolé, une erreur s'est produite lors de la connexion à l'IA.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all z-[60] group ${isOpen ? 'bg-slate-900 rotate-90' : 'bg-sky-600 hover:bg-sky-700 hover:scale-110'
                    }`}
            >
                {isOpen ? (
                    <X className="text-white" size={24} />
                ) : (
                    <div className="relative">
                        <Bot className="text-white" size={28} />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-300"></span>
                        </span>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-8 w-80 md:w-96 h-[500px] bg-white border border-slate-200 shadow-2xl rounded-sm z-[60] flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                                <Bot size={18} className="text-sky-400" />
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-black uppercase tracking-widest">ENEA AI Assistant</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Système Cognitif Actif</span>
                                </div>
                            </div>
                        </div>
                        <Sparkles size={16} className="text-sky-500" />
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar"
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-3 rounded-sm text-xs leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-sky-600 text-white font-medium'
                                    : 'bg-white border border-slate-200 text-slate-700'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    ) : (
                                        <div className="prose prose-xs max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-black text-slate-900">{children}</strong>,
                                                    em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                                    li: ({ children }) => <li className="text-slate-700">{children}</li>,
                                                    code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono text-sky-700">{children}</code>,
                                                    pre: ({ children }) => <pre className="bg-slate-900 text-sky-300 p-2 rounded text-[10px] overflow-x-auto my-2">{children}</pre>,
                                                    h1: ({ children }) => <h1 className="text-sm font-black text-slate-900 mb-2">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-xs font-black text-slate-800 mb-1">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-xs font-bold text-slate-700 mb-1">{children}</h3>,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                    <div className={`text-[8px] mt-1.5 font-bold uppercase opacity-50 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'
                                        }`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-sm flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggested Queries */}
                    {messages.length < 3 && !isTyping && (
                        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                            {[
                                { icon: <TrendingUp size={10} />, text: 'Analyse de croissance' },
                                { icon: <AlertCircle size={10} />, text: 'Risques de stock' },
                                { icon: <Users size={10} />, text: 'Productivité RH' },
                                { icon: <DollarSign size={10} />, text: 'Santé financière' }
                            ].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(q.text);
                                        // Auto send would be better but let user edit
                                    }}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 text-[10px] font-bold text-slate-500 hover:text-sky-600 rounded-full transition-all"
                                >
                                    {q.icon} {q.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Posez une question à l'IA..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 p-1.5 bg-sky-600 text-white rounded-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 active:scale-90"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
