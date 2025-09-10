
import React from 'react';

const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path fillRule="evenodd" d="M11.624 3.32a1 1 0 0 1 1.06.096l2.75 2.5a1 1 0 0 1-1.496 1.328L12 5.452l-1.938 1.792a1 1 0 0 1-1.496-1.328l2.75-2.5a1 1 0 0 1 .308-.096Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M3.75 6.75a1 1 0 0 1 1-1h14.5a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1h-5.5a1 1 0 0 0-1 1v1.5a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1v-1.5a1 1 0 0 0-1-1H4.75a1 1 0 0 1-1-1V6.75Zm.5 10.25a.5.5 0 0 1 .5-.5h4.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-4.5a.5.5 0 0 1-.5-.5v-1Zm10.5-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-4.5Z" clipRule="evenodd" />
    </svg>
);

export default TrophyIcon;
