
import React from 'react';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    // Fix: Add optional disabled and title props to the button component interface to address the type error.
    disabled?: boolean;
    title?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', disabled, title }) => {
    return (
        <button
            onClick={onClick}
            // Fix: Pass down the disabled and title props to the underlying button element.
            disabled={disabled}
            title={title}
            className={`bg-brand-primary text-white py-3 px-8 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transform hover:scale-105 ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
