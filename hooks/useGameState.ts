
import { useState, useEffect, useCallback } from 'react';
import { GameState, Badge } from '../types';
import { badges } from '../data/gamificationData';

const GAME_STATE_KEY = 'spanishStudyGuideGameState';

const defaultState: GameState = {
    totalPoints: 0,
    highestStreak: 0,
    completedUnits: {},
    earnedBadgeIds: [],
};

const loadState = (): GameState => {
    try {
        const storedState = localStorage.getItem(GAME_STATE_KEY);
        if (storedState) {
            return { ...defaultState, ...JSON.parse(storedState) };
        }
    } catch (error) {
        console.error("Failed to load game state from localStorage", error);
    }
    return defaultState;
};

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(loadState);

    const saveState = useCallback((newState: GameState) => {
        try {
            const newBadgeIds = badges
                .filter(badge => !newState.earnedBadgeIds.includes(badge.id) && badge.isUnlocked(newState))
                .map(badge => badge.id);
            
            if (newBadgeIds.length > 0) {
                 const stateWithNewBadges = { ...newState, earnedBadgeIds: [...newState.earnedBadgeIds, ...newBadgeIds] };
                 setGameState(stateWithNewBadges);
                 localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateWithNewBadges));
                 
                 // Dispatch event for newly unlocked badges
                 const unlockedBadges = badges.filter(b => newBadgeIds.includes(b.id));
                 unlockedBadges.forEach(badge => {
                     document.dispatchEvent(new CustomEvent('badgeUnlocked', { detail: badge }));
                 });
            } else {
                setGameState(newState);
                localStorage.setItem(GAME_STATE_KEY, JSON.stringify(newState));
            }
        } catch (error) {
            console.error("Failed to save game state to localStorage", error);
        }
    }, []);

    const addPoints = useCallback((points: number) => {
        setGameState(prevState => {
            const newState = { ...prevState, totalPoints: prevState.totalPoints + points };
            saveState(newState);
            return newState;
        });
    }, [saveState]);

    const updateHighestStreak = useCallback((currentStreak: number) => {
        setGameState(prevState => {
            if (currentStreak > prevState.highestStreak) {
                const newState = { ...prevState, highestStreak: currentStreak };
                saveState(newState);
                return newState;
            }
            return prevState;
        });
    }, [saveState]);

    const completeQuiz = useCallback((unitId: string, score: number, totalQuestions: number) => {
        setGameState(prevState => {
            const newState = {
                ...prevState,
                completedUnits: {
                    ...prevState.completedUnits,
                    [unitId]: { score, total: totalQuestions },
                },
            };
            saveState(newState);
            return newState;
        });
    }, [saveState]);

    return { gameState, addPoints, updateHighestStreak, completeQuiz };
};
