import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { Unit, ChatMessage } from '../types';
import { createStoryChat } from '../services/geminiService';
import Button from './Button';
import SendIcon from './icons/SendIcon';
import MarkdownContent from './MarkdownContent';

interface StoryWeaverProps {
    unit: Unit;
}

const StoryWeaver: React.FC<StoryWeaverProps> = ({ unit }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [story, setStory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const vocabList = unit.vocab.map(v => v.en).join(', ');
        const newChat = createStoryChat(unit.title, vocabList);
        setChat(newChat);
    }, [unit]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [story, isLoading]);

    const handleStartStory = async () => {
        if (!chat) return;
        setIsStarted(true);
        setIsLoading(true);
        try {
            const response = await chat.sendMessage({ message: "Start the story." });
            setStory([{ role: 'model', content: response.text }]);
        } catch (error) {
            console.error("Error starting story:", error);
            setStory([{ role: 'model', content: "I'm having a little trouble thinking of a story right now. Let's try again in a moment!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueStory = async () => {
        if (!userInput.trim() || !chat || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setStory(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: userInput });
            const aiMessage: ChatMessage = { role: 'model', content: response.text };
            setStory(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error continuing story:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Oops, I lost my train of thought! Can you say that again?" };
            setStory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isStarted) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Aventura de Cuentos</h3>
                <p className="text-gray-600 mb-4">¡Crea una historia junto con la IA! Usa el vocabulario de esta unidad para continuar la aventura.</p>
                <Button onClick={handleStartStory} disabled={isLoading}>
                    {isLoading ? "Preparando la historia..." : "¡Comenzar una Aventura!"}
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center border-b pb-2">Nuestra Historia Juntos</h3>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {story.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-brand-text'}`}>
                            <MarkdownContent content={msg.content} />
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-md p-3 rounded-2xl bg-gray-100 text-brand-text">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce mr-1"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75 mr-1"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
             <div className="p-2 border-t">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleContinueStory(); }}
                        placeholder="Escribe la siguiente parte..."
                        className="w-full p-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-brand-primary transition-colors"
                        disabled={isLoading}
                    />
                    <button onClick={handleContinueStory} disabled={isLoading || !userInput.trim()} className="ml-3 p-3 bg-brand-primary rounded-full text-white disabled:bg-gray-300 transition-colors">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryWeaver;
