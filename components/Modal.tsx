
import React from 'react';

interface ModalProps {
    message: string;
    isVisible: boolean;
}

const Modal: React.FC<ModalProps> = ({ message, isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center transform transition-all scale-100 opacity-100">
                <p className="text-lg font-semibold">{message}</p>
            </div>
        </div>
    );
};

export default Modal;
