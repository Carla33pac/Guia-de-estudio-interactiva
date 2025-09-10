import React from 'react';
import CheckIcon from './icons/CheckIcon';

interface CardProps {
    title: string;
    subtitle: string;
    onClick: () => void;
    score?: number;
    totalQuestions?: number;
}

const Card: React.FC<CardProps> = ({ title, subtitle, onClick, score, totalQuestions }) => {
    const hasProgress = typeof score === 'number' && typeof totalQuestions === 'number' && totalQuestions > 0;
    const percentage = hasProgress ? (score / totalQuestions) * 100 : 0;

    return (
        <div 
            className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1.5 hover:shadow-xl cursor-pointer flex flex-col"
            onClick={onClick}
        >
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-700">{title}</h3>
                <p className="text-brand-secondary-text mt-1">{subtitle}</p>
            </div>
            {hasProgress && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span className="flex items-center font-semibold">
                            <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                            Completado
                        </span>
                        <span className="font-bold text-gray-700">{score}/{totalQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Card;