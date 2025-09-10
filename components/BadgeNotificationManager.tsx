
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '../types';
import BadgeNotification from './BadgeNotification';

const BadgeNotificationManager: React.FC = () => {
    const [notificationQueue, setNotificationQueue] = useState<Badge[]>([]);
    
    const handleBadgeUnlocked = useCallback((event: Event) => {
        const badge = (event as CustomEvent<Badge>).detail;
        setNotificationQueue(prevQueue => [...prevQueue, badge]);
    }, []);

    useEffect(() => {
        document.addEventListener('badgeUnlocked', handleBadgeUnlocked);
        return () => {
            document.removeEventListener('badgeUnlocked', handleBadgeUnlocked);
        };
    }, [handleBadgeUnlocked]);

    const handleDismiss = () => {
        setNotificationQueue(prevQueue => prevQueue.slice(1));
    };

    const currentBadge = notificationQueue.length > 0 ? notificationQueue[0] : null;

    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm">
            {currentBadge && (
                <BadgeNotification 
                    key={currentBadge.id} 
                    badge={currentBadge} 
                    onDismiss={handleDismiss} 
                />
            )}
        </div>
    );
};

export default BadgeNotificationManager;
