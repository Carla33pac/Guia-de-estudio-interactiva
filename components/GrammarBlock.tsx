import React from 'react';
import MarkdownContent from './MarkdownContent';
import GrammarDrill from './GrammarDrill';
import GraduationCapIcon from './icons/GraduationCapIcon';

interface GrammarBlockProps {
    content: string;
    onAskTeacher: (topic: string) => void;
}

const extractTitle = (content: string): string => {
    const match = content.match(/^###\s*(.*)/);
    if (!match || !match[1]) return 'Grammar Practice';
    
    return match[1]
        .replace(/(\*\*|`|\*)/g, '')
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        .trim();
};

const GrammarBlock: React.FC<GrammarBlockProps> = ({ content, onAskTeacher }) => {
    const title = extractTitle(content);
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <MarkdownContent content={content} />
            <GrammarDrill grammarTopic={title} grammarExplanation={content} />
            <div className="flex justify-end mt-4 pt-4 border-t">
                <button 
                    onClick={() => onAskTeacher(title)}
                    className="flex items-center text-sm text-brand-primary font-semibold hover:text-brand-primary-dark transition-colors"
                    aria-label={`Preguntar al profesor sobre ${title}`}
                >
                    <GraduationCapIcon className="w-5 h-5 mr-2" />
                    Pregúntale al Profe sobre "{title}"
                </button>
            </div>
        </div>
    );
};

export default GrammarBlock;
