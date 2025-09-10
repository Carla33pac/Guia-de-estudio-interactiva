import React, { useState } from 'react';
import { PronunciationFeedback } from '../types';
import { generatePronunciationTip } from '../services/geminiService';
import SoundIcon from './icons/SoundIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface PhoneticsPracticeItemProps {
    text: string;
}

const PhoneticsPracticeItem: React.FC<PhoneticsPracticeItemProps> = ({ text }) => {
    const [pronunciationFeedback, setPronunciationFeedback] = useState<PronunciationFeedback>({ status: 'idle', message: '' });

    const speak = (textToSpeak: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Tu navegador no soporta la síntesis de voz.");
        }
    };

    const handlePronunciationPractice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setPronunciationFeedback({ status: 'incorrect', message: 'Tu navegador no soporta el reconocimiento de voz.' });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setPronunciationFeedback({ status: 'listening', message: 'Escuchando...' });

        recognition.onresult = (event: any) => {
            const spokenWord = event.results[0][0].transcript.trim().toLowerCase();
            const targetWord = text.trim().toLowerCase().replace(/[.,!*]/g, '');

            setPronunciationFeedback({ status: 'processing', message: 'Procesando...' });

            if (spokenWord === targetWord) {
                setPronunciationFeedback({ status: 'correct', message: '¡Perfecto!' });
                setTimeout(() => setPronunciationFeedback({ status: 'idle', message: '' }), 3000);
            } else {
                setPronunciationFeedback({ status: 'incorrect', message: `Escuché "${spokenWord}". ¡Intenta de nuevo!`, tip: 'Generando consejo...' });
                generatePronunciationTip(targetWord, spokenWord).then(tip => {
                    setPronunciationFeedback(prev => ({ ...prev, tip: tip || 'No se pudo generar un consejo.' }));
                });
            }
        };

        recognition.onerror = (event: any) => {
            let errorMessage = 'Ocurrió un error. Intenta de nuevo.';
            if (event.error === 'no-speech') errorMessage = 'No escuché nada. ¿Puedes hablar más fuerte?';
            else if (event.error === 'not-allowed') errorMessage = 'Necesitas permitir el acceso al micrófono.';
            setPronunciationFeedback({ status: 'incorrect', message: errorMessage });
        };

        recognition.onend = () => {
            if (pronunciationFeedback.status === 'listening') {
                setPronunciationFeedback({ status: 'idle', message: '' });
            }
        };

        recognition.start();
    };

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{text}</span>
                <div className="flex items-center">
                    <button onClick={() => speak(text)} className="p-1.5 rounded-full hover:bg-gray-200 transition-colors" title="Escuchar">
                        <SoundIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={handlePronunciationPractice} disabled={pronunciationFeedback.status === 'listening'} className="ml-1.5 p-1.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50" title="Practicar pronunciación">
                        <MicrophoneIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
            {pronunciationFeedback.status !== 'idle' && (
                <div className={`mt-2 text-sm p-2 rounded-md ${pronunciationFeedback.status === 'correct' ? 'bg-green-100 text-green-800' : ''} ${pronunciationFeedback.status === 'incorrect' ? 'bg-red-100 text-red-800' : ''} ${pronunciationFeedback.status === 'listening' || pronunciationFeedback.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}`}>
                    <p>{pronunciationFeedback.message}</p>
                    {pronunciationFeedback.tip && <p className="mt-1 font-semibold">{pronunciationFeedback.tip}</p>}
                </div>
            )}
        </div>
    );
};

export default PhoneticsPracticeItem;
