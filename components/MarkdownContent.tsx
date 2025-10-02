import React from 'react';
import WarningIcon from './icons/WarningIcon';
import SoundIcon from './icons/SoundIcon';
import PencilIcon from './icons/PencilIcon';
import CheckIcon from './icons/CheckIcon';

const specialBlockConfig = [
    {
        prefix: '### ⚠️ Errores Comunes',
        title: 'Errores Comunes',
        Icon: WarningIcon,
        styles: {
            container: "bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800",
            icon: "text-yellow-500",
        }
    },
    {
        prefix: '### 🗣️',
        title: 'Fonética y Pronunciación',
        Icon: SoundIcon,
        styles: {
            container: "bg-blue-50 border-l-4 border-blue-400 text-blue-800",
            icon: "text-blue-500",
        }
    },
    {
        prefix: '### ✏️ ¡A Practicar!',
        title: '¡A Practicar!',
        Icon: PencilIcon,
        styles: {
            container: "bg-green-50 border-l-4 border-green-400 text-green-800",
            icon: "text-green-500",
        }
    },
    {
        prefix: '### ✅ Self-Evaluation:',
        title: 'Self-Evaluation:',
        Icon: CheckIcon,
        styles: {
            container: "bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800",
            icon: "text-indigo-500",
        }
    },
];

const inlineMarkdownToHtml = (text: string) => {
    if (!text) return '';
    return text
        .replace(/<br\s*\/?>/gi, '\n') 
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 text-sm rounded px-1 py-0.5">$1</code>')
        .replace(/\n/g, '<br />');
};

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
    const renderBlock = (block: string, index: number) => {
        block = block.trim();
        if (!block) return null;

        for (const config of specialBlockConfig) {
            if (block.startsWith(config.prefix)) {
                const titleMatch = block.match(/### .*\s*([^\n]*)/);
                const titleText = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : config.title;
                const textContent = block.substring(block.indexOf('\n') + 1).trim();
                return (
                    <div key={`special-${index}`} className={`my-4 p-4 rounded-r-lg flex items-start ${config.styles.container}`}>
                        <config.Icon className={`h-6 w-6 mr-3 flex-shrink-0 mt-1 ${config.styles.icon}`} />
                        <div>
                            <strong className="font-bold">{titleText}</strong>
                            <div className="mt-1" dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(textContent) }} />
                        </div>
                    </div>
                );
            }
        }
        
        if (block.startsWith('|')) {
            const lines = block.split('\n').map(l => l.trim());
            if (lines.length < 2 || !lines[1].includes(':---')) {
                 return <div key={index} dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(block) }} />;
            }
            
            const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
            const rows = lines.slice(2).map(rowLine => rowLine.split('|').slice(1, -1).map(c => c.trim()));

            return (
                <div className="overflow-x-auto my-4" key={`table-${index}`}>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                {headers.map((header, i) => (
                                    <th key={i} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(header) }} />
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rows.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors duration-200">
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-6 py-4 whitespace-normal text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(cell) }} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        
        if (block.startsWith('###')) {
            const headingLevel = (block.match(/#/g) || []).length;
            const textContent = block.substring(headingLevel).trim();
            // FIX: Use a simple string for the tag name.
            const Tag = `h${headingLevel}`;
            const styles = {
                2: 'text-2xl font-bold mt-6 mb-3',
                3: 'text-xl font-bold mt-4 mb-2 text-gray-800',
                4: 'text-lg font-semibold mt-3 mb-1',
            }[headingLevel] || 'text-lg font-semibold';
            // FIX: Use React.createElement to robustly create dynamic HTML tags,
            // resolving potential 'JSX' namespace and compilation errors.
            return React.createElement(Tag, {
                className: styles,
                key: `heading-${index}`,
                dangerouslySetInnerHTML: { __html: inlineMarkdownToHtml(textContent) }
            });
        }

        return <div key={`p-${index}`} className="my-2 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(block) }} />;
    };
    
    const blocks = content.split(/\n\s*\n/).filter(b => b.trim() !== '');

    return (
        <div>
            {blocks.map(renderBlock)}
        </div>
    );
};

export default MarkdownContent;