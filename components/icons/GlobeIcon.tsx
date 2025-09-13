import React from 'react';

const GlobeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.757 14.243l.01.01M16.243 14.243l.01.01M12 20.25a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zM12 2.25A10.5 10.5 0 001.5 12.75h21A10.5 10.5 0 0012 2.25z" />
    </svg>
);

export default GlobeIcon;