
import React, { useState, useCallback, useEffect } from 'react';
import { Unit, VocabWord, ExampleSentence, PronunciationFeedback } from '../types';
import Button from '../components/Button';
import { generateExampleSentence, generatePronunciationTip, generateImageForWord, getCulturalContext } from '../services/geminiService';
import SparklesIcon from '../components/icons/SparklesIcon';
import SoundIcon from '../components/icons/SoundIcon';
import WarningIcon from '../components/icons/WarningIcon';
import BookIcon from '../components/icons/BookIcon';
import PuzzleIcon from '../components/icons/PuzzleIcon';
import ChatBubbleIcon from '../components/icons/ChatBubbleIcon';
import GrammarBlock from '../components/GrammarBlock';
import InteractiveMarkdownBlock from '../components/InteractiveMarkdownBlock';
import TeacherAgentModal from '../components/TeacherAgentModal';
import GraduationCapIcon from '../components/icons/GraduationCapIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import PhoneticsBlock from '../components/PhoneticsBlock';
import ImageIcon from '../components/icons/ImageIcon';
import GlobeIcon from '../components/icons/GlobeIcon';
import StoryWeaver from '../components/StoryWeaver';
import CrosswordPuzzle from '../components/CrosswordPuzzle';

interface UnitDetailPageProps {
    unit: Unit;
    unitId: string;
    onBack: () => void;
    onStartQuiz: () => void;
}

interface VocabItemProps {
    word: VocabWord;
    unitId: string;
}

const VocabItem: React.FC<VocabItemProps> = ({ word, unitId }) => {
    const [example, setExample] = useState<ExampleSentence | null>(null);
    const [isLoadingExample, setIsLoadingExample] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pronunciationFeedback, setPronunciationFeedback] = useState<PronunciationFeedback>({ status: 'idle', message: '' });

    const [image, setImage] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const [context, setContext] = useState<{ text: string; sources: {uri: string, title: string}[] } | null>(null);
    const [isLoadingContext, setIsLoadingContext] = useState(false);
    const [contextError, setContextError] = useState<string | null>(null);

    const handleGenerateExample = async () => {
        setIsLoadingExample(true);
        setError(null);
        setExample(null);
        const result = await generateExampleSentence(word.en);
        setIsLoadingExample(false);
        if (result) {
            setExample(result);
        } else {
            setError('No se pudo generar un ejemplo. Inténtalo de nuevo.');
        }
    };

    const handleGenerateImage = useCallback(async () => {
        if (isLoadingImage) return;
        setIsLoadingImage(true);
        setImageError(null);
        setImage(null);
        const result = await generateImageForWord(word.en);
        setIsLoadingImage(false);
        if (result) {
            setImage(result);
        } else {
            setImageError('No se pudo generar una imagen. Inténtalo de nuevo.');
        }
    }, [isLoadingImage, word.en]);

    useEffect(() => {
        if (unitId === 'W' && !image && !imageError) {
            handleGenerateImage();
        }
    }, [unitId, image, imageError, handleGenerateImage]);

    const handleGetContext = async () => {
        setIsLoadingContext(true);
        setContextError(null);
        setContext(null);
        const result = await getCulturalContext(word.en);
        setIsLoadingContext(false);
        if (result) {
            setContext(result);
        } else {
            setContextError('No se pudo obtener contexto. Inténtalo de nuevo.');
        }
    };

    const speak = (text: string, lang: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Lo siento, tu navegador no soporta la síntesis de voz.");
        }
    };

    const handlePronunciationPractice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setPronunciationFeedback({ status: 'incorrect', message: 'Tu navegador no soporta el reconocimiento de voz.', tip: '' });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setPronunciationFeedback({ status: 'listening', message: 'Escuchando...', tip: '' });

        recognition.onresult = (event: any) => {
            const spokenWord = event.results[0][0].transcript.trim().toLowerCase();
            setPronunciationFeedback({ status: 'processing', message: 'Procesando...', tip: '' });

            if (spokenWord.toLowerCase() === word.en.toLowerCase()) {
                setPronunciationFeedback({ status: 'correct', message: '¡Perfecto!', tip: '' });
                 setTimeout(() => setPronunciationFeedback({ status: 'idle', message: '' }), 3000);
            } else {
                setPronunciationFeedback({ status: 'incorrect', message: `Escuché "${spokenWord}". ¡Intenta de nuevo!`, tip: 'Generando consejo...' });
                generatePronunciationTip(word.en, spokenWord).then(tip => {
                     setPronunciationFeedback(prev => ({ ...prev, tip: tip || 'No se pudo generar un consejo.' }));
                });
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Ocurrió un error. Intenta de nuevo.';
            if (event.error === 'no-speech') {
                errorMessage = 'No escuché nada. ¿Puedes hablar más fuerte?';
            } else if (event.error === 'not-allowed') {
                 errorMessage = 'Necesitas permitir el acceso al micrófono.';
            }
            setPronunciationFeedback({ status: 'incorrect', message: errorMessage, tip: '' });
        };
        
        recognition.onend = () => {
            if (pronunciationFeedback.status === 'listening') {
                 setPronunciationFeedback({ status: 'idle', message: '' });
            }
        };

        recognition.start();
    };


    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex-grow mr-2">
                        <div className="flex items-center flex-wrap">
                            <span className="font-bold text-lg text-gray-800">{word.en}</span>
                            <button onClick={() => speak(word.en, 'en-US')} className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors" title="Listen" aria-label={`Listen to ${word.en}`}>
                                <SoundIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <button onClick={handlePronunciationPractice} disabled={pronunciationFeedback.status === 'listening'} className="ml-1 p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50" title="Practicar pronunciación" aria-label={`Practice pronouncing ${word.en}`}>
                                <MicrophoneIcon className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <p className="text-gray-600">{word.es}</p>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <button onClick={handleGenerateExample} disabled={isLoadingExample} className="p-2 rounded-full bg-purple-100 text-brand-primary hover:bg-purple-200 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Generar ejemplo con IA" aria-label="Generar frase de ejemplo con IA">
                            {isLoadingExample ? <div className="w-5 h-5 border-2 border-purple-200 border-t-brand-primary rounded-full animate-spin"></div> : <SparklesIcon />}
                        </button>
                         <button onClick={handleGenerateImage} disabled={isLoadingImage} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed ml-2" title="Generar imagen con IA" aria-label="Generar imagen con IA">
                            {isLoadingImage ? <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div> : <ImageIcon />}
                        </button>
                        <button onClick={handleGetContext} disabled={isLoadingContext} className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition disabled:opacity-50 disabled:cursor-not-allowed ml-2" title="Obtener contexto cultural" aria-label="Obtener contexto cultural">
                            {isLoadingContext ? <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div> : <GlobeIcon />}
                        </button>
                    </div>
                </div>
                 {pronunciationFeedback.status !== 'idle' && (
                    <div className={`mt-3 text-sm p-2 rounded-md ${pronunciationFeedback.status === 'correct' ? 'bg-green-100 text-green-800' : ''} ${pronunciationFeedback.status === 'incorrect' ? 'bg-red-100 text-red-800' : ''} ${pronunciationFeedback.status === 'listening' || pronunciationFeedback.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}`}>
                        <p>{pronunciationFeedback.message}</p>
                        {pronunciationFeedback.tip && <p className="mt-1 font-semibold">{pronunciationFeedback.tip}</p>}
                    </div>
                )}
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            {example && (
                <div className="mt-3 p-3 bg-purple-50 border-l-4 border-purple-300 rounded-r-lg">
                    <div className="flex items-center">
                        <p className="text-sm text-gray-800 flex-grow"><strong>EN:</strong> {example.english}</p>
                        <button onClick={() => speak(example.english, 'en-US')} className="ml-2 p-1 rounded-full hover:bg-purple-200 transition-colors flex-shrink-0" title="Escuchar ejemplo" aria-label="Escuchar la frase de ejemplo">
                            <SoundIcon className="w-5 h-5 text-purple-700" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1"><strong>ES:</strong> {example.spanish}</p>
                </div>
            )}
            {imageError && <p className="mt-2 text-sm text-red-500">{imageError}</p>}
            {image && (
                <div className="mt-3">
                    <img src={image} alt={`Illustration of ${word.en}`} className="rounded-lg border border-gray-200" />
                </div>
            )}
            {contextError && <p className="mt-2 text-sm text-red-500">{contextError}</p>}
            {context && (
                <div className="mt-3 p-3 bg-teal-50 border-l-4 border-teal-300 rounded-r-lg">
                    <p className="text-sm text-gray-800">{context.text}</p>
                    {context.sources && context.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-teal-200">
                            <h4 className="text-xs font-bold text-teal-800">Fuentes:</h4>
                            <ul className="list-disc list-inside text-xs text-teal-700">
                                {context.sources.map(source => (
                                    <li key={source.uri} className="truncate">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center text-sm sm:text-base font-semibold py-3 px-4 sm:px-6 w-full text-center transition-colors duration-300 ease-in-out border-b-4 ${
            isActive
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-secondary-text hover:bg-gray-100'
        }`}
    >
        <span className="mr-2">{icon}</span>
        {label}
    </button>
);

const UnitDetailPage: React.FC<UnitDetailPageProps> = ({ unit, unitId, onBack, onStartQuiz }) => {
    const [activeTab, setActiveTab] = useState('vocab');
    const [isTeacherModalOpen, setTeacherModalOpen] = useState(false);
    const [currentTopic, setCurrentTopic] = useState('');

    const handleAskTeacher = (topic: string) => {
        setCurrentTopic(topic);
        setTeacherModalOpen(true);
    };

    const tabs = [
        { id: 'vocab', label: 'Vocabulario', icon: <BookIcon className="w-5 h-5"/>, content: (
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unit.vocab.map(v => <VocabItem key={v.en} word={v} unitId={unitId} />)}
                </div>
                 <div className="mt-6 text-center">
                    <button 
                        onClick={() => handleAskTeacher(`Vocabulario de la unidad: "${unit.title}"`)}
                        className="flex items-center justify-center mx-auto text-brand-primary font-semibold hover:text-brand-primary-dark transition-colors py-2 px-4 rounded-full bg-purple-100 hover:bg-purple-200"
                    >
                        <GraduationCapIcon className="w-5 h-5 mr-2" />
                        ¿Dudas sobre el vocabulario? ¡Pregúntale al Profe!
                    </button>
                </div>
            </div>
        )},
        { id: 'grammar', label: 'Gramática', icon: <PuzzleIcon className="w-5 h-5"/>, content: (
            <div className="space-y-4">
                {unit.grammar.map((g, index) => <GrammarBlock key={index} content={g} onAskTeacher={handleAskTeacher} />)}
            </div>
        )},
        { id: 'phonetics', label: 'Fonética', icon: <SoundIcon className="w-5 h-5"/>, content: (
            <div className="space-y-4">
                {unit.phonetics.map((p, index) => <PhoneticsBlock key={index} content={p} onAskTeacher={handleAskTeacher} />)}
            </div>
        )},
        { id: 'errors', label: 'Errores', icon: <WarningIcon className="w-5 h-5"/>, content: (
             <div className="space-y-4">
                {unit.commonErrors.map((e, index) => <InteractiveMarkdownBlock key={index} content={e} topic="Errores Comunes" onAskTeacher={handleAskTeacher} />)}
            </div>
        )},
        { id: 'practice', label: 'Práctica', icon: <ChatBubbleIcon className="w-5 h-5"/>, content: (
            <div>
                <StoryWeaver unit={unit} />
                <CrosswordPuzzle unit={unit} />
                <div className="mt-8 border-t pt-6 space-y-4">
                     {unit.practiceTips.map((p, index) => <InteractiveMarkdownBlock key={index} content={p} topic="Consejos de Práctica" onAskTeacher={handleAskTeacher} />)}
                </div>
            </div>
        )},
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    {unitId === 'W' ? `Welcome Unit: ${unit.title}` : `Unidad ${unitId}: ${unit.title}`}
                </h2>
                <button onClick={onBack} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-full font-semibold hover:bg-gray-300 transition-colors">
                    Volver
                </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px" aria-label="Tabs">
                        {tabs.map(tab => (
                            <TabButton
                                key={tab.id}
                                label={tab.label}
                                icon={tab.icon}
                                isActive={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </nav>
                </div>
                <div className="p-6 bg-gray-50 rounded-b-2xl">
                    {tabs.find(tab => tab.id === activeTab)?.content}
                </div>
            </div>

            <div className="text-center mt-8">
                <Button onClick={onStartQuiz}>
                    Iniciar Cuestionario
                </Button>
            </div>
            
            <TeacherAgentModal 
                isOpen={isTeacherModalOpen}
                onClose={() => setTeacherModalOpen(false)}
                topic={currentTopic}
            />
        </div>
    );
};

export default UnitDetailPage;
