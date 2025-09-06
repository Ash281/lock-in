import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Loader } from 'lucide-react';
import { Message } from '@/types/Message';

// props for ChatWindow component - open/close state and callback
interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    onEventsCreated?: () => void; // Callback to refresh calendar
}

// ChatWindow component
export default function ChatWindow({ isOpen, onClose, onEventsCreated }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]); // chat messages state (default empty)
    const [inputValue, setInputValue] = useState(''); // input box state (default empty)
    const [isLoading, setIsLoading] = useState(false); // loading state for AI response (default false)
    const [conversationId, setConversationId] = useState<string | null>(null); // track conversation ID for context (default null)
    const messagesEndRef = useRef<HTMLDivElement>(null); // ref to bottom of messages for auto-scroll to the bottom

    // Auto-scroll to bottom when new messages arrive
    // use effect to scroll when messages change to the bottom (messagesEndRef)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null; // if not open, render nothing

    // send message to backend API
    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setIsLoading(true);

        // add user message to chat immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        try {
            // call backend API to get AI response
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationId: conversationId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // add AI response to chat
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message
                }]);

                // update conversation ID for future messages
                if (data.conversationId) {
                    setConversationId(data.conversationId);
                }

                // if events were created, refresh the calendar
                if (onEventsCreated && data.eventsCreated) {
                    onEventsCreated();
                }
            }
            // if response not ok, show error message
            else {
                // Handle error
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.'
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I could not connect to the AI. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // handle Enter key to send message, Shift+Enter for new line
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // handle closing the chat window - reset state
    const handleClose = () => {
        setMessages([]);
        setConversationId(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center gap-2">
                        <MessageCircle size={20} />
                        <h2 className="text-lg font-semibold">Cali</h2>
                        <h3 className='text-sm'>Tell me what events you want to schedule!</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">Ask me to schedule events!</p>
                            <p className="text-xs mt-1 text-gray-400">
                                Try: "Schedule gym sessions 3 times this week"
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-2xl ${message.role === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-md'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md flex items-center gap-2">
                                <Loader size={16} className="animate-spin text-gray-500" />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}