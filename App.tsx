/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useEffect, useState, useRef } from 'react';
import PromptForm from './components/PromptForm';
import ChatMessage from './components/ChatMessage';
import { generateResponse } from './services/geminiService';
import {
    AppState,
    GenerateParams,
    Message,
    Conversation
} from './types';
import {

    MenuIcon,
    MessageSquareIcon,
    XMarkIcon,
    SparklesIcon,
    PlusIcon
} from './components/icons';
import { X } from 'lucide-react';

// Sidebar Navigation Item
const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    description: string;
    isActive: boolean;
    onClick: () => void;
    onDelete?: (e: React.MouseEvent) => void;
}> = ({ icon, label, description, isActive, onClick, onDelete }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group relative ${isActive
            ? 'bg-indigo-600/10 border border-indigo-500/50 text-indigo-100'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-100 border border-transparent'
            }`}
    >
        <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-white'}`}>
            {icon}
        </div>
        <div className="min-w-0 flex-grow">
            <div className="font-semibold text-sm truncate pr-4">{label}</div>
            <div className={`text-[10px] truncate ${isActive ? 'text-indigo-300' : 'text-gray-500'}`}>{description}</div>
        </div>
        {onDelete && (
            <div
                role="button"
                onClick={onDelete}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete chat"
            >
                <X className="w-3 h-3" />
            </div>
        )}
    </button>
);

const App: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, appState]);

    // Load History
    useEffect(() => {
        const saved = localStorage.getItem('nexa_conversations');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConversations(parsed);
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    // Save History
    useEffect(() => {
        localStorage.setItem('nexa_conversations', JSON.stringify(conversations));
    }, [conversations]);

    const loadChat = (id: string) => {
        const chat = conversations.find(c => c.id === id);
        if (chat) {
            setCurrentChatId(id);
            setMessages(chat.messages);
            if (window.innerWidth < 768) setIsMobileMenuOpen(false);
        }
    };

    const startNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        if (window.innerWidth < 768) setIsMobileMenuOpen(false);
    };

    const deleteChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Delete this conversation?")) {
            const newConvs = conversations.filter(c => c.id !== id);
            setConversations(newConvs);
            if (currentChatId === id) {
                startNewChat();
            }
        }
    };

    const handleGenerate = useCallback(async (params: GenerateParams) => {
        const userMessageId = Date.now().toString();
        const userMessage: Message = {
            id: userMessageId,
            role: 'user',
            content: params.prompt,
            timestamp: Date.now(),
            images: params.image ? [params.image] : undefined
        };


        const currentHistory = [...messages];

        // Optimistically update UI
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setAppState(AppState.LOADING);
        setError(null);

        // Update Conversations State (Optimistic)
        let activeId = currentChatId;
        let newConversations = [...conversations];

        if (!activeId) {
            activeId = Date.now().toString();
            setCurrentChatId(activeId);
            // Create title from prompt
            const title = params.prompt.length > 30 ? params.prompt.substring(0, 30) + '...' : params.prompt;
            newConversations.unshift({
                id: activeId,
                title: title,
                messages: updatedMessages,
                updatedAt: Date.now()
            });
        } else {
            const idx = newConversations.findIndex(c => c.id === activeId);
            if (idx !== -1) {
                newConversations[idx] = {
                    ...newConversations[idx],
                    messages: updatedMessages,
                    updatedAt: Date.now()
                };
                // Move to top
                const [moved] = newConversations.splice(idx, 1);
                newConversations.unshift(moved);
            }
        }
        setConversations(newConversations);

        try {
            const responseText = await generateResponse({
                ...params,
                history: currentHistory
            });

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: Date.now()
            };

            const finalMessages = [...updatedMessages, botMessage];
            setMessages(finalMessages);
            setAppState(AppState.SUCCESS);

            // Update Conversation with Bot Message
            setConversations(prev => {
                const next = [...prev];
                const idx = next.findIndex(c => c.id === activeId);
                if (idx !== -1) {
                    next[idx] = {
                        ...next[idx],
                        messages: finalMessages,
                        updatedAt: Date.now()
                    };
                }
                return next;
            });

        } catch (err: any) {
            console.error('Generation failed:', err);
            setError(err.message || 'Something went wrong');
            setAppState(AppState.ERROR);
        }
    }, [messages, currentChatId, conversations]);

    return (
        <div className="flex h-screen bg-[#0f1117] text-gray-200 font-sans overflow-hidden selection:bg-indigo-500/30">

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-[#13151c] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-80 md:flex-shrink-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6 border-b border-gray-800/50">
                    <div className="flex items-center gap-4">

                        {/* Logo Box */}
                        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl
                    bg-gradient-to-br from-indigo-500/20 to-cyan-500/20
                    border border-indigo-500/40 shadow-lg">

                            {/* Soft Glow */}
                            <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-xl"></div>

                            {/* Logo Image (Zoomed Out) */}
                            <img
                                src="/logo.png"
                                alt="NEXA AI"
                                className="relative w-11 h-11 object-contain p-1"
                            />
                        </div>

                        {/* Brand Text */}
                        <div>
                            <h1 className="text-lg font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                NEXA AI
                            </h1>
                            <p className="text-[11px] text-gray-400 tracking-widest uppercase">
                                Workspace
                            </p>
                        </div>

                    </div>




                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-gray-400 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                    <button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-3 p-3 mb-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20 group"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="font-semibold text-sm">New Conversation</span>
                    </button>

                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">History</div>

                    <div className="flex flex-col gap-2">
                        {conversations.length === 0 && (
                            <div className="text-center py-8 text-gray-600 text-xs italic">
                                No history yet.
                            </div>
                        )}

                        {conversations.map(chat => (
                            <NavItem
                                key={chat.id}
                                icon={<MessageSquareIcon className="w-4 h-4" />}
                                label={chat.title}
                                description={new Date(chat.updatedAt).toLocaleDateString()}
                                isActive={currentChatId === chat.id}
                                onClick={() => loadChat(chat.id)}
                                onDelete={(e) => deleteChat(e, chat.id)}
                            />
                        ))}
                    </div>
                </div>
            </aside >

            {/* Main Content Area */}
            < main className="flex-grow flex flex-col relative h-full w-full min-w-0 bg-[#0f1117]" >
                {/* Header */}
                < header className="h-16 flex-shrink-0 flex items-center px-4 md:px-8 border-b border-gray-800/50 bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-20 justify-between" >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden text-gray-400 hover:text-white p-2 -ml-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-semibold text-gray-100">
                                {currentChatId ? conversations.find(c => c.id === currentChatId)?.title || "Assistant" : "New Conversation"}
                            </h2>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Online
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                            <SparklesIcon className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-medium text-gray-300">Pro Mode</span>
                        </div>
                    </div>
                </header >

                {/* Chat Area */}
                < div className="flex-grow overflow-y-auto px-4 md:px-8 pt-6 pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" >
                    <div className="max-w-4xl mx-auto flex flex-col min-h-full pb-32">

                        {/* Empty State */}
                        {messages.length === 0 && (
                            <div className="flex-grow flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-700 slide-in-from-bottom-4 mt-20 md:mt-0">
                                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-black/50 overflow-hidden">
                                    <img
                                        src="/logo.png"
                                        alt="NEXA AI"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Welcome to NEXA AI</h3>
                                <p className="text-gray-400 max-w-sm leading-relaxed mb-8">
                                    I'm your professional assistant. I can help you write code, analyze data, generate creative content, and much more.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                    {['Draft a marketing email', 'Explain quantum computing', 'Write a React component', 'Analyze an image'].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            className="p-3 text-sm text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/50 rounded-xl transition-all text-gray-300 hover:text-indigo-200"
                                            onClick={() => handleGenerate({ prompt: suggestion, model: import.meta.env.VITE_DEFAULT_MODEL || 'gemini-3-flash-preview' } as any)}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message List */}
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}

                        {/* Loading State Bubble */}
                        {appState === AppState.LOADING && (
                            <div className="flex w-full mb-6 justify-start animate-in fade-in duration-300">
                                <div className="flex max-w-[80%] gap-3">
                                    <img
                                        src="/logo.png"
                                        alt="AI"
                                        className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg shadow-indigo-500/10 object-cover bg-black/20"
                                    />
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-2 mb-1 opacity-60 text-xs px-1">
                                            <span className="font-semibold text-gray-300">Nexa AI</span>
                                            <span className="text-gray-500">•</span>
                                            <span className="text-gray-500">Thinking...</span>
                                        </div>
                                        <div className="bg-[#1a1d26] border border-gray-800 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-12">
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {appState === AppState.ERROR && error && (
                            <div className="w-full mb-6 p-4 bg-red-900/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                                {error}
                                <button
                                    onClick={() => setAppState(AppState.IDLE)}
                                    className="ml-2 underline hover:text-red-300"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div >

                {/* Fixed Bottom Input Area */}
                < div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f1117] via-[#0f1117] to-transparent z-10" >
                    <div className="max-w-4xl mx-auto bg-[#13151c]/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
                        <PromptForm
                            onGenerate={handleGenerate}
                        />
                    </div>
                    <p className="text-center text-[10px] text-gray-600 mt-2">
                        Nexa AI can make mistakes. Consider checking important information.
                    </p>
                </div >
            </main >
        </div >
    );
};

export default App;