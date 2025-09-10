
import React from 'react';
import Button from '../components/Button';
import GamificationDashboard from '../components/GamificationDashboard';
import { useGameState } from '../hooks/useGameState';

interface HomePageProps {
    onNavigateToUnits: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToUnits }) => {
    const { gameState } = useGameState();

    return (
        <div>
            <div className="text-center py-10">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">¡Bienvenido a tu guía de estudio interactiva!</h2>
                <div className="text-gray-600 mb-8 max-w-3xl mx-auto space-y-4 text-left">
                    <p>
                        ¡Hola! Esta guía es tu mejor amiga para estudiar y prepararte para los exámenes del libro Open Day 3. Ha sido creada especialmente para ti, pensando en que estás empezando a aprender inglés. Aquí encontrarás todo explicado de forma muy sencilla, con muchos ejemplos para que no te quede ninguna duda.
                    </p>
                    <p>
                        Cada unidad tiene todo lo que necesitas: las reglas de gramática, ejemplos, vocabulario importante, y consejos para recordar todo.
                    </p>
                    <p>
                        <strong>¿Cómo estudiar?</strong> Lee con calma cada sección. No intentes aprender todo en un día. Practica diciendo las oraciones en voz alta. ¡Verás qué fácil es aprender inglés con esta guía!
                    </p>
                </div>
                <Button onClick={onNavigateToUnits}>
                    Explorar Unidades
                </Button>
            </div>
            <GamificationDashboard gameState={gameState} />
        </div>
    );
};

export default HomePage;
