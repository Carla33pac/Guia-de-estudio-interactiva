
import { Badge, GameState } from '../types';
import TrophyIcon from '../components/icons/TrophyIcon';
import FireIcon from '../components/icons/FireIcon';
import BookIcon from '../components/icons/BookIcon';

export const badges: Badge[] = [
    {
        id: 'first-steps',
        name: 'Primeros Pasos',
        description: 'Completa tu primer cuestionario.',
        icon: BookIcon,
        isUnlocked: (state: GameState) => Object.keys(state.completedUnits).length >= 1,
    },
    {
        id: 'on-fire',
        name: '¡En Racha!',
        description: 'Alcanza una racha de 5 respuestas correctas.',
        icon: FireIcon,
        isUnlocked: (state: GameState) => state.highestStreak >= 5,
    },
    {
        id: 'perfect-score',
        name: 'Puntuación Perfecta',
        description: 'Consigue un 100% en cualquier cuestionario.',
        icon: TrophyIcon,
        isUnlocked: (state: GameState) => Object.values(state.completedUnits).some(unit => unit.score === unit.total && unit.total > 0),
    },
    {
        id: 'scholar',
        name: 'Erudito',
        description: 'Completa 3 cuestionarios de unidades diferentes.',
        icon: BookIcon,
        isUnlocked: (state: GameState) => Object.keys(state.completedUnits).length >= 3,
    },
     {
        id: 'unstoppable',
        name: 'Imparable',
        description: 'Alcanza una racha de 10 respuestas correctas.',
        icon: FireIcon,
        isUnlocked: (state: GameState) => state.highestStreak >= 10,
    },
];
