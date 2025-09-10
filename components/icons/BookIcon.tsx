
import React from 'react';

const BookIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.5M8.25 6.253L3 18.253M15.75 6.253L21 18.253M3.75 12h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 3.75h14.5a1 1 0 011 1v14.5a1 1 0 01-1 1H4.75a1 1 0 01-1-1V4.75a1 1 0 011-1z" />
    </svg>
);

export default BookIcon;
