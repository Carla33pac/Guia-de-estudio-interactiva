import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { createTeacherChat } from '../services/geminiService';
import type { Chat } from '@google/genai';
import GraduationCapIcon from './icons/GraduationCapIcon';
import SendIcon from './icons/SendIcon';
import XCircleIcon from './icons/XCircleIcon';
import MarkdownContent from './MarkdownContent';

interface TeacherAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    topic: string;
}

const TeacherAgentModal: React.FC<TeacherAgentModalProps> = ({ isOpen, onClose, topic }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && topic) {
            setMessages([]);
            const newChat = createTeacherChat(topic);
            setChat(newChat);
            setIsLoading(true);
            newChat.sendMessage({ message: "Hola" }).then(response => {
                setMessages([{ role: 'model', content: response.text }]);
                setIsLoading(false);
            }).catch(err => {
                console.error("Error with initial AI message:", err);
                setMessages([{ role: 'model', content: "¡Hola! Soy Profe Alex. Parece que tengo un problema para conectarme. Por favor, intenta de nuevo más tarde." }]);
                setIsLoading(false);
            });
        }
    }, [isOpen, topic]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || !chat || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: userInput });
            const aiMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending message to AI:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Lo siento, tuve un problema para responder. Por favor, intenta de nuevo." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
                    <div className="flex items-center">
                        <GraduationCapIcon className="w-6 h-6 text-brand-primary mr-3" />
                        <h3 className="text-lg font-bold text-gray-800">Habla con Profe Alex</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-brand-text'}`}>
                                <MarkdownContent content={msg.content} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-md p-3 rounded-2xl bg-gray-100 text-brand-text">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce mr-1"></div>
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-75 mr-1"></div>
                                    <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t bg-white rounded-b-2xl">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                            placeholder="Escribe tu pregunta aquí..."
                            className="w-full p-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-brand-primary transition-colors"
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="ml-3 p-3 bg-brand-primary rounded-full text-white disabled:bg-gray-300 transition-colors">
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default TeacherAgentModal;