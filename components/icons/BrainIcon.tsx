import React from 'react';

const BrainIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.871 14.142c-1.333-2.472-1.333-5.812 0-8.284M19.129 14.142c1.333-2.472 1.333-5.812 0-8.284M12 21a9.002 9.002 0 008.13-5.858M12 21a9.002 9.002 0 01-8.13-5.858m16.26 0H3.87m16.26 0c.001-.002.002-.004.002-.006a4.502 4.502 0 00-4.326-4.502c-1.256 0-2.428.504-3.284 1.353-.856-.849-2.028-1.353-3.284-1.353A4.502 4.502 0 003.87 15.136c0 .002.001.004.002.006m11.636 0c-.856-.849-2.028-1.353-3.284-1.353s-2.428.504-3.284 1.353m6.568 0v-1.125c0-1.242-.504-2.375-1.353-3.232" />
    </svg>
);

export default BrainIcon;
