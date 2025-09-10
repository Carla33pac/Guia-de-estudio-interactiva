
import React from 'react';
import { GameState } from '../types';
import { badges } from '../data/gamificationData';
import SparklesIcon from './icons/SparklesIcon';
import FireIcon from './icons/FireIcon';
import CheckIcon from './icons/CheckIcon';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-xl flex items-center">
        <div className="p-3 rounded-full bg-brand-primary text-white mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-brand-secondary-text">{title}</p>
            <p className="text-2xl font-bold text-brand-text">{value}</p>
        </div>
    </div>
);

const BadgeDisplay: React.FC<{ badgeId: string }> = ({ badgeId }) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge) return null;

    return (
        <div className="group relative flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform group-hover:scale-110">
                <badge.icon className="w-8 h-8" />
            </div>
            <p className="text-xs mt-2 font-semibold text-brand-secondary-text">{badge.name}</p>
            <div className="absolute bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <p className="font-bold">{badge.name}</p>
                <p>{badge.description}</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
            </div>
        </div>
    );
};

const GamificationDashboard: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg mt-10">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Tus Logros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Puntos Totales" value={gameState.totalPoints} icon={<SparklesIcon className="w-6 h-6" />} />
                <StatCard title="Mejor Racha" value={gameState.highestStreak} icon={<FireIcon className="w-6 h-6" />} />
                <StatCard title="Unidades Completadas" value={Object.keys(gameState.completedUnits).length} icon={<CheckIcon className="w-6 h-6" />} />
            </div>

            <div>
                <h4 className="text-lg font-bold mb-3 text-center text-gray-700">Insignias Obtenidas</h4>
                {gameState.earnedBadgeIds.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-6">
                        {gameState.earnedBadgeIds.map(badgeId => (
                            <BadgeDisplay key={badgeId} badgeId={badgeId} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-brand-secondary-text">¡Completa cuestionarios y consigue rachas para ganar insignias!</p>
                )}
            </div>
        </div>
    );
};

export default GamificationDashboard;
