import React from 'react';
import MarkdownContent from './MarkdownContent';
import GraduationCapIcon from './icons/GraduationCapIcon';

interface InteractiveMarkdownBlockProps {
    content: string;
    topic: string;
    onAskTeacher: (topic: string) => void;
}

const InteractiveMarkdownBlock: React.FC<InteractiveMarkdownBlockProps> = ({ content, topic, onAskTeacher }) => {
    return (
        <div>
            <MarkdownContent content={content} />
            <div className="flex justify-end mt-2">
                <button 
                    onClick={() => onAskTeacher(topic)}
                    className="flex items-center text-sm text-brand-primary font-semibold hover:text-brand-primary-dark transition-colors"
                >
                    <GraduationCapIcon className="w-5 h-5 mr-2" />
                    Pregúntale al Profe
                </button>
            </div>
        </div>
    );
};

export default InteractiveMarkdownBlock;
