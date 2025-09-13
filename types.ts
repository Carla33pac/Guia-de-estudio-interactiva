import React from 'react';

export type Page = 'home' | 'units-overview' | 'unit-detail' | 'quiz' | 'review';

export interface VocabWord {
    en: string;
    es: string;
}

export interface Unit {
    title:string;
    vocab: VocabWord[];
    grammar: string[];
    phonetics: string[];
    commonErrors: string[];
    practiceTips: string[];
}

export interface UnitsData {
    [key: string]: Unit;
}

export interface MultipleChoiceQuestion {
    type: 'multiple-choice';
    questionWord: VocabWord;
    options: VocabWord[];
}

export interface FillInTheBlankQuestion {
    type: 'fill-in-the-blank';
    questionWord: VocabWord;
    englishSentence: string;
    spanishSentence: string;
    correctAnswer: string;
}

export type QuizQuestion = MultipleChoiceQuestion | FillInTheBlankQuestion;

export interface ExampleSentence {
    english: string;
    spanish: string;
}

export type GrammarDrillType = 'fill-in-the-blank' | 'sentence-reordering' | 'multiple-choice';

export interface GrammarDrill {
    type: GrammarDrillType;
    instruction: string;
    question: string;
    options?: string[];
    words?: string[];
    correctAnswer: string;
    explanation: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    isUnlocked: (state: GameState) => boolean;
}

export interface GameState {
    totalPoints: number;
    highestStreak: number;
    completedUnits: { [unitId: string]: { score: number; total: number } };
    earnedBadgeIds: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface PronunciationFeedback {
    status: 'idle' | 'listening' | 'processing' | 'correct' | 'incorrect';
    message: string;
    tip?: string;
}

export interface CrosswordEntry {
    number: number;
    clue: string;
    answer: string;
    orientation: 'across' | 'down';
    row: number;
    col: number;
}

export interface CrosswordData {
    rows: number;
    cols: number;
    entries: CrosswordEntry[];
}
