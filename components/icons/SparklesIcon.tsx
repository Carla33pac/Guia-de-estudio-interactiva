
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.184c0-1.681.673-3.352 1.88-4.566z" clipRule="evenodd" />
        <path d="M1.5 21.75a.75.75 0 01.75-.75c5.056 0 9.555-2.383 12.436-6.084a6.75 6.75 0 010-1.132c-2.881 3.701-7.381 6.084-12.436 6.084a.75.75 0 01-.75-.75z" />
    </svg>
);

export default SparklesIcon;
