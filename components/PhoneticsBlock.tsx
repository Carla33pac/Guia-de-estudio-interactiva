import React from 'react';
import MarkdownContent from './MarkdownContent';
import PhoneticsPracticeItem from './PhoneticsPracticeItem';
import InteractiveMarkdownBlock from './InteractiveMarkdownBlock';
import SoundIcon from './icons/SoundIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface PhoneticsBlockProps {
    content: string;
    onAskTeacher: (topic: string) => void;
}

const PhoneticsBlock: React.FC<PhoneticsBlockProps> = ({ content, onAskTeacher }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    const titleLine = lines.find(line => line.startsWith('### 🗣️')) || '';
    const title = titleLine.replace('### 🗣️', '').trim();
    
    const explanationLines: string[] = [];
    const mainSentenceLines: string[] = [];
    const exampleLines: string[] = [];
    
    let currentSection = 'explanation';

    lines.slice(1).forEach(line => {
        if (line.toLowerCase().startsWith('**repite:**')) {
            currentSection = 'main';
            mainSentenceLines.push(line.replace(/\*\*repite:\*\*/i, '').trim());
        } else if (line.toLowerCase().startsWith('**ejemplos:**')) {
            currentSection = 'examples';
        } else if (line.match(/^\d+\./)) {
            if (currentSection !== 'examples') currentSection = 'examples'; // Implicit start of examples
            exampleLines.push(line.replace(/^\d+\.\s*/, '').trim());
        } else {
            if (currentSection === 'explanation') {
                explanationLines.push(line);
            } else if (currentSection === 'main') {
                 mainSentenceLines.push(line);
            }
        }
    });

    const explanation = explanationLines.join('\n');
    const mainSentence = mainSentenceLines.join('\n');

    return (
        <div>
            <div className="mb-4">
                 <div className="flex items-center text-xl font-bold text-gray-800">
                    <SoundIcon className="w-6 h-6 mr-3 text-blue-500" />
                    <h3>{title}</h3>
                </div>
                <MarkdownContent content={explanation} />
            </div>

            {mainSentence && (
                 <div className="my-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-sm font-semibold text-blue-700 mb-2">
                        <ArrowPathIcon className="w-5 h-5 mr-2" />
                        <span>Repite esta frase:</span>
                    </div>
                    <PhoneticsPracticeItem text={mainSentence} />
                </div>
            )}
            
            {exampleLines.length > 0 && (
                 <div className="my-4">
                    <h4 className="font-bold text-gray-700 mb-2">Ejemplos:</h4>
                     {exampleLines.map((example, index) => (
                        <PhoneticsPracticeItem key={index} text={example} />
                    ))}
                 </div>
            )}
            <InteractiveMarkdownBlock content="" topic={`Fonética: ${title}`} onAskTeacher={onAskTeacher} />
        </div>
    );
};

export default PhoneticsBlock;
