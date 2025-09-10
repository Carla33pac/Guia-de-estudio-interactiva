
import React from 'react';

const FireIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        viewBox="0 0 20 20" 
        fill="currentColor"
    >
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM10 18a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.404 4.195a.5.5 0 00-.707.707l1.414 1.414a.5.5 0 00.707-.707L9.404 4.195zM12.586 7.414a.5.5 0 00-.707.707l1.414 1.414a.5.5 0 00.707-.707L12.586 7.414zM15.707 10.5a.5.5 0 00-.707.707l1.414 1.414a.5.5 0 00.707-.707l-1.414-1.414z" />
    </svg>
);

export default FireIcon;
