
import React, { useState, useEffect } from 'react';
import { Badge } from '../types';

interface BadgeNotificationProps {
    badge: Badge;
    onDismiss: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true); // Trigger fade-in
        const timer = setTimeout(() => {
            setIsVisible(false); // Trigger fade-out
            setTimeout(onDismiss, 300); // Wait for fade-out to complete before dismissing
        }, 5000);

        return () => clearTimeout(timer);
    }, [badge, onDismiss]);

    return (
        <div 
            className={`bg-white rounded-xl shadow-2xl p-4 flex items-start transition-all duration-300 ease-in-out transform ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
            role="alert"
            aria-live="assertive"
        >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg mr-4 flex-shrink-0">
                <badge.icon className="w-7 h-7" />
            </div>
            <div className="flex-grow">
                <p className="font-bold text-gray-800">¡Insignia Desbloqueada!</p>
                <p className="text-sm font-semibold text-gray-600">{badge.name}</p>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
            </div>
        </div>
    );
};

export default BadgeNotification;
