
import React, { useState, useCallback } from 'react';
import { GrammarDrill as GrammarDrillType } from '../types';
import { generateGrammarDrill } from '../services/geminiService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import BrainIcon from './icons/BrainIcon';

interface GrammarDrillProps {
    grammarTopic: string;
    grammarExplanation: string;
}

const GrammarDrill: React.FC<GrammarDrillProps> = ({ grammarTopic, grammarExplanation }) => {
    const [drill, setDrill] = useState<GrammarDrillType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDrillVisible, setIsDrillVisible] = useState(false);
    const [drillHistory, setDrillHistory] = useState<string[]>([]);

    const [userAnswer, setUserAnswer] = useState('');
    const [chosenWords, setChosenWords] = useState<{ word: string, id: number }[]>([]);
    const [availableWords, setAvailableWords] = useState<{ word: string, id: number }[]>([]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const resetDrillState = () => {
        setUserAnswer('');
        setChosenWords([]);
        setAvailableWords([]);
        setIsAnswered(false);
        setIsCorrect(null);
        setError(null);
    };

    const fetchDrill = useCallback(async () => {
        resetDrillState();
        setIsLoading(true);
        // Fix: Pass drillHistory as the third argument to avoid generating duplicate drills.
        const generatedDrill = await generateGrammarDrill(grammarTopic, grammarExplanation, drillHistory);
        if (generatedDrill) {
            setDrill(generatedDrill);
            setDrillHistory(prev => [...prev, generatedDrill.question]); // Add new drill to history
            if(generatedDrill.type === 'sentence-reordering' && generatedDrill.words) {
                setAvailableWords(generatedDrill.words.map((word, index) => ({ word, id: index })));
            }
        } else {
            setError('No se pudo generar un ejercicio. Inténtalo de nuevo.');
        }
        setIsLoading(false);
    }, [grammarTopic, grammarExplanation, drillHistory]);

    const handleStartDrill = () => {
        setIsDrillVisible(true);
        if (!drill) {
            fetchDrill();
        }
    };

    const handleCheckAnswer = () => {
        if (!drill) return;
        setIsAnswered(true);

        let finalAnswer: string;
        if (drill.type === 'sentence-reordering') {
            finalAnswer = chosenWords.map(w => w.word).join(' ');
        } else {
            finalAnswer = userAnswer;
        }

        const isAnswerCorrect = finalAnswer.trim().toLowerCase() === drill.correctAnswer.trim().toLowerCase();
        setIsCorrect(isAnswerCorrect);
    };

    const handleWordClick = (word: {word: string, id: number}) => {
        setChosenWords(prev => [...prev, word]);
        setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    };

    const handleChosenWordClick = (word: {word: string, id: number}) => {
        setChosenWords(prev => prev.filter(w => w.id !== word.id));
        setAvailableWords(prev => [...prev, word].sort((a,b) => a.id - b.id));
    };

    const renderDrill = () => {
        if (!drill) return null;

        switch (drill.type) {
            case 'multiple-choice':
                return (
                    <div>
                        <p className="font-semibold text-gray-700 mb-4">{drill.question}</p>
                        <div className="flex flex-col space-y-2">
                            {drill.options?.map(option => {
                                const isSelected = userAnswer === option;
                                const isCorrectAnswer = option === drill.correctAnswer;
                                let buttonClass = "bg-white border-gray-300 hover:bg-gray-100";
                                if (isAnswered) {
                                    if(isCorrectAnswer) buttonClass = "bg-green-100 border-green-400 text-green-800";
                                    else if(isSelected) buttonClass = "bg-red-100 border-red-400 text-red-800";
                                    else buttonClass = "bg-gray-100 border-gray-200 text-gray-500 opacity-70";
                                } else if (isSelected) {
                                    buttonClass = "bg-purple-100 border-brand-primary";
                                }
                                return (
                                    <button key={option} disabled={isAnswered} onClick={() => setUserAnswer(option)} className={`p-3 border-2 rounded-lg text-left transition-all ${buttonClass}`}>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'fill-in-the-blank':
                 return (
                    <div>
                        <p className="font-semibold text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: drill.question.replace('___', '<span class="font-bold">___</span>') }} />
                         <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={isAnswered}
                            placeholder="Tu respuesta..."
                            className={`w-full p-3 border-2 rounded-lg transition-colors focus:outline-none focus:border-brand-primary ${
                                isAnswered ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-300'
                            }`}
                        />
                    </div>
                );
            case 'sentence-reordering':
                return (
                    <div>
                        <p className="font-semibold text-gray-700 mb-2">{drill.question}</p>
                        <div className="min-h-[4rem] w-full p-3 border-2 border-dashed bg-gray-50 rounded-lg mb-4 flex flex-wrap gap-2 items-center">
                            {chosenWords.map(word => (
                                <button key={word.id} onClick={() => !isAnswered && handleChosenWordClick(word)} className="bg-brand-primary text-white px-3 py-1 rounded-md cursor-pointer">
                                    {word.word}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            {availableWords.map(word => (
                                <button key={word.id} onClick={() => !isAnswered && handleWordClick(word)} className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors">
                                    {word.word}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <p>Tipo de ejercicio no soportado.</p>;
        }
    };


    return (
        <div className="mt-4 border-t pt-4">
            {!isDrillVisible ? (
                <div className="text-center">
                    <button onClick={handleStartDrill} className="flex items-center justify-center mx-auto text-brand-primary font-semibold hover:text-brand-primary-dark transition-colors">
                        <BrainIcon className="w-5 h-5 mr-2" />
                        Practicar este concepto
                    </button>
                </div>
            ) : (
                <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-800">{drill?.instruction || "Cargando ejercicio..."}</h4>
                    <div className="p-4 bg-purple-50 rounded-lg min-h-[100px] flex items-center justify-center">
                        {isLoading && <LoadingSpinner />}
                        {error && <p className="text-red-500">{error}</p>}
                        {!isLoading && !error && renderDrill()}
                    </div>
                    
                    {isAnswered && drill && (
                         <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <p className="font-semibold">{isCorrect ? '¡Excelente!' : 'No es del todo correcto.'}</p>
                            <p className="text-sm">{drill.explanation}</p>
                             {!isCorrect && <p className="text-sm mt-1"><strong>Respuesta correcta:</strong> {drill.correctAnswer}</p>}
                        </div>
                    )}

                    {!isLoading && drill && (
                        <div className="flex justify-end items-center gap-2 mt-4">
                            <button onClick={() => setIsDrillVisible(false)} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">Cerrar</button>
                            {!isAnswered ? (
                                <Button onClick={handleCheckAnswer} className="py-2 px-6">Revisar</Button>
                            ) : (
                                <Button onClick={fetchDrill} className="py-2 px-6">Intentar otro</Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GrammarDrill;
