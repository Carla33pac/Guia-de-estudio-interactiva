
import React, { useState, useEffect, useCallback } from 'react';
import { VocabWord, QuizQuestion, MultipleChoiceQuestion, FillInTheBlankQuestion } from '../types';
import { units as allUnitsData, allVocab } from '../data/studyData';
import Button from '../components/Button';
import { generateQuizHint, generateFillInTheBlankQuestion } from '../services/geminiService';
import SparklesIcon from '../components/icons/SparklesIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGameState } from '../hooks/useGameState';
import FireIcon from '../components/icons/FireIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import StarIcon from '../components/icons/StarIcon';

interface ReviewPageProps {
    onFinish: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const REVIEW_QUESTIONS_COUNT = 10;

const ReviewPage: React.FC<ReviewPageProps> = ({ onFinish }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const [isLoadingHint, setIsLoadingHint] = useState(false);

    const [currentStreak, setCurrentStreak] = useState(0);
    const { gameState, addPoints, updateHighestStreak } = useGameState();

    const generateReviewQuestions = useCallback(async () => {
        setIsLoading(true);
        const { completedUnits } = gameState;

        const weakUnitIds = Object.keys(completedUnits).filter(id => (completedUnits[id].score / completedUnits[id].total) < 0.75);
        const strongUnitIds = Object.keys(completedUnits).filter(id => (completedUnits[id].score / completedUnits[id].total) >= 0.75);

        let weakWords = weakUnitIds.flatMap(id => allUnitsData[id]?.vocab || []);
        let strongWords = strongUnitIds.flatMap(id => allUnitsData[id]?.vocab || []);
        
        weakWords = shuffleArray(weakWords);
        strongWords = shuffleArray(strongWords);

        const selectedWords: VocabWord[] = [];
        const wordsFromWeakUnits = Math.min(weakWords.length, 7);
        selectedWords.push(...weakWords.slice(0, wordsFromWeakUnits));
        
        const wordsFromStrongUnits = REVIEW_QUESTIONS_COUNT - selectedWords.length;
        selectedWords.push(...strongWords.slice(0, wordsFromStrongUnits));

        if (selectedWords.length < REVIEW_QUESTIONS_COUNT && selectedWords.length > 0) {
            const allCompletedWords = shuffleArray(Object.keys(completedUnits).flatMap(id => allUnitsData[id]?.vocab || []));
            const existingWords = new Set(selectedWords.map(w => w.en));
            for (const word of allCompletedWords) {
                if(selectedWords.length >= REVIEW_QUESTIONS_COUNT) break;
                if (!existingWords.has(word.en)) {
                    selectedWords.push(word);
                    existingWords.add(word.en);
                }
            }
        }
        
        const finalSelectedWords = shuffleArray(selectedWords).slice(0, REVIEW_QUESTIONS_COUNT);
        
        const generatedQuestions: QuizQuestion[] = [];
        for (const word of finalSelectedWords) {
            const questionType: 'multiple-choice' | 'fill-in-the-blank' = Math.random() > 0.5 ? 'multiple-choice' : 'fill-in-the-blank';
            
            if (questionType === 'multiple-choice') {
                const distractors = allVocab
                    .filter(v => v.en !== word.en)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                const options = shuffleArray([...distractors, word]);
                generatedQuestions.push({ type: 'multiple-choice', questionWord: word, options });
            } else {
                const fillInBlankData = await generateFillInTheBlankQuestion(word);
                if (fillInBlankData) {
                    generatedQuestions.push({
                        type: 'fill-in-the-blank',
                        questionWord: word,
                        ...fillInBlankData
                    });
                } else {
                    const distractors = allVocab.filter(v => v.en !== word.en).sort(() => 0.5 - Math.random()).slice(0, 3);
                    const options = shuffleArray([...distractors, word]);
                    generatedQuestions.push({ type: 'multiple-choice', questionWord: word, options });
                }
            }
        }

        setQuestions(generatedQuestions);
        setIsLoading(false);
    }, [gameState]);

    useEffect(() => {
        generateReviewQuestions();
    }, [generateReviewQuestions]);

    const handleAnswerSubmit = useCallback(async () => {
        if (isAnswered) return;

        const currentQuestion = questions[currentQuestionIndex];
        let isCorrect: boolean;
        
        if(currentQuestion.type === 'multiple-choice') {
            isCorrect = userAnswer === currentQuestion.questionWord.es;
        } else {
            isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.questionWord.en.toLowerCase();
        }

        setIsAnswered(true);

        if (isCorrect) {
            const newStreak = currentStreak + 1;
            const streakBonus = Math.floor(newStreak / 3) * 5;
            addPoints(10 + streakBonus);
            setCorrectAnswers(prev => prev + 1);
            setCurrentStreak(newStreak);
            updateHighestStreak(newStreak);
        } else {
            setCurrentStreak(0);
            setIsLoadingHint(true);
            const generatedHint = await generateQuizHint(currentQuestion.questionWord.en, 'repaso general');
            setHint(generatedHint);
            setIsLoadingHint(false);
        }
    }, [isAnswered, questions, currentQuestionIndex, userAnswer, addPoints, updateHighestStreak, currentStreak]);
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswered(false);
            setUserAnswer('');
            setHint(null);
        } else {
            setIsFinished(true);
        }
    };

    const handleOptionClick = (optionEs: string) => {
        if (isAnswered) return;
        setUserAnswer(optionEs);
    };

    useEffect(() => {
        if (isAnswered === false && userAnswer !== '' && questions[currentQuestionIndex]?.type === 'multiple-choice') {
            handleAnswerSubmit();
        }
    }, [userAnswer, isAnswered, questions, currentQuestionIndex, handleAnswerSubmit]);
    
    if (isLoading) {
        return (
             <div className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 font-semibold">Preparando tu sesión de repaso...</p>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg mt-10 max-w-lg mx-auto">
                <TrophyIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">¡Repaso Completado!</h2>
                 <p className="text-lg mb-4">
                    Puntuación: <span className="text-brand-primary font-bold text-2xl">{correctAnswers} / {questions.length}</span>
                </p>
                <p className="text-gray-600 mb-6">¡Sigue practicando para mejorar aún más!</p>
                <div className="grid grid-cols-2 gap-4 text-left p-4 bg-gray-50 rounded-lg mb-6">
                    <div className="flex items-center">
                        <StarIcon className="w-8 h-8 text-yellow-500 mr-3"/>
                        <div>
                            <p className="font-bold text-lg">{gameState.totalPoints}</p>
                            <p className="text-sm text-gray-500">Puntos Totales</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <FireIcon className="w-8 h-8 text-red-500 mr-3"/>
                        <div>
                            <p className="font-bold text-lg">{gameState.highestStreak}</p>
                            <p className="text-sm text-gray-500">Mejor Racha</p>
                        </div>
                    </div>
                </div>
                <Button onClick={onFinish}>Volver al Inicio</Button>
            </div>
        );
    }
    
    if (questions.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg mt-10 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4">¡Todo listo para repasar!</h2>
                <p className="text-gray-600 mb-6">Completa algunos cuestionarios de las unidades primero para que podamos crear una sesión de repaso personalizada para ti.</p>
                <Button onClick={onFinish}>Volver al Inicio</Button>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    const renderQuestion = () => {
        if (currentQuestion.type === 'multiple-choice') {
            const q = currentQuestion as MultipleChoiceQuestion;
            
            const getButtonClass = (optionEs: string) => {
                if (!isAnswered) return "bg-gray-200 hover:bg-gray-300";
                if (optionEs === q.questionWord.es) return "bg-green-200 border-2 border-green-500 text-green-800";
                if (optionEs === userAnswer) return "bg-red-200 border-2 border-red-500 text-red-800";
                return "bg-gray-100 text-gray-500 cursor-not-allowed";
            };

            return (
                <>
                    <h3 className="text-2xl font-bold mb-6">¿Qué significa "{q.questionWord.en}"?</h3>
                    <div className="w-full space-y-3">
                        {q.options.map((opt) => (
                            <button
                                key={opt.es}
                                onClick={() => handleOptionClick(opt.es)}
                                disabled={isAnswered}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${getButtonClass(opt.es)}`}
                            >
                                {opt.es}
                            </button>
                        ))}
                    </div>
                </>
            );
        }

        if (currentQuestion.type === 'fill-in-the-blank') {
            const q = currentQuestion as FillInTheBlankQuestion;
            return (
                <>
                    <h3 className="text-xl font-bold mb-2">Completa la frase</h3>
                    <p className="text-gray-500 mb-4">Escribe la palabra correcta en inglés.</p>
                    <div className="w-full p-4 bg-gray-100 rounded-lg text-center">
                        <p className="text-lg font-semibold text-gray-800">"{q.englishSentence}"</p>
                        <p className="text-sm text-gray-500 mt-1">({q.spanishSentence})</p>
                    </div>
                    <div className="w-full mt-4 flex items-center gap-2">
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={isAnswered}
                            placeholder="Tu respuesta..."
                            className={`flex-grow p-3 border-2 rounded-lg transition-colors ${
                                isAnswered ? (userAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase() ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-300 focus:border-brand-primary'
                            } focus:outline-none`}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAnswerSubmit(); }}
                        />
                         {!isAnswered && (
                            <Button onClick={handleAnswerSubmit} className="py-3 px-6">
                                Revisar
                            </Button>
                        )}
                    </div>
                </>
            );
        }
        return null;
    };
    
    const renderFeedback = () => {
         if (!isAnswered) return null;
         
         const isCorrect = currentQuestion.type === 'multiple-choice'
            ? userAnswer === currentQuestion.questionWord.es
            : userAnswer.trim().toLowerCase() === currentQuestion.questionWord.en.toLowerCase();

        return (
             <div className="w-full mt-6 text-left p-4 bg-gray-50 rounded-lg">
                {isCorrect ? (
                    <p className="font-semibold text-green-700">¡Correcto! +10 puntos</p>
                ) : (
                    <div>
                        <p className="font-semibold text-red-700">La respuesta correcta es: "{currentQuestion.type === 'multiple-choice' ? currentQuestion.questionWord.es : currentQuestion.questionWord.en}"</p>
                        <div className="mt-3 p-3 bg-purple-50 border-l-4 border-purple-300 rounded-r-lg">
                            <div className="flex items-center text-purple-800">
                               <SparklesIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                               <strong className="text-sm">Pista con IA:</strong>
                            </div>
                            {isLoadingHint ? (
                                <p className="mt-1 text-sm text-gray-600 animate-pulse">Generando pista...</p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-600">{hint}</p>
                            )}
                        </div>
                    </div>
                )}
                <Button onClick={handleNextQuestion} className="w-full mt-4">
                    Siguiente
                </Button>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Modo de Repaso</h2>
            <div className="flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto relative">
                {currentStreak > 0 && (
                    <div className="absolute top-0 -right-4 bg-amber-500 text-white px-3 py-1 rounded-full flex items-center shadow-lg text-sm font-bold">
                        <FireIcon className="w-4 h-4 mr-1"/>
                        Racha x{currentStreak}
                    </div>
                )}
                <p className="text-sm text-gray-500 mb-4">
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                </p>
                {renderQuestion()}
                {renderFeedback()}
            </div>
        </div>
    );
};

export default ReviewPage;
