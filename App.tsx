import React, { useState, useCallback } from 'react';
import HomePage from './pages/HomePage';
import UnitsOverviewPage from './pages/UnitsOverviewPage';
import UnitDetailPage from './pages/UnitDetailPage';
import QuizPage from './pages/QuizPage';
import Header from './components/Header';
import Navigation from './components/Navigation';
import { Page, Unit } from './types';
import { units as allUnitsData } from './data/studyData';
import BadgeNotificationManager from './components/BadgeNotificationManager';
import { useGameState } from './hooks/useGameState';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
    const { gameState } = useGameState();

    const navigateTo = useCallback((page: Page) => {
        setCurrentPage(page);
    }, []);

    const handleSelectUnit = useCallback((unitId: string) => {
        setCurrentUnitId(unitId);
        setCurrentPage('unit-detail');
    }, []);

    const handleStartQuiz = useCallback(() => {
        if (currentUnitId) {
            setCurrentPage('quiz');
        }
    }, [currentUnitId]);

    const handleBackToUnits = useCallback(() => {
        setCurrentUnitId(null);
        setCurrentPage('units-overview');
    }, []);

    const handleQuizFinish = useCallback(() => {
        setCurrentUnitId(null);
        setCurrentPage('home');
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage onNavigateToUnits={() => navigateTo('units-overview')} />;
            case 'units-overview':
                return <UnitsOverviewPage units={allUnitsData} onSelectUnit={handleSelectUnit} gameState={gameState} />;
            case 'unit-detail':
                const unit = currentUnitId ? allUnitsData[currentUnitId] : null;
                if (unit) {
                    return <UnitDetailPage unit={unit} unitId={currentUnitId!} onBack={handleBackToUnits} onStartQuiz={handleStartQuiz} />;
                }
                return <HomePage onNavigateToUnits={() => navigateTo('units-overview')} />;
            case 'quiz':
                 const quizUnit = currentUnitId ? allUnitsData[currentUnitId] : null;
                 if (quizUnit) {
                     return <QuizPage unit={quizUnit} unitId={currentUnitId!} onFinish={handleQuizFinish} />;
                 }
                 return <HomePage onNavigateToUnits={() => navigateTo('units-overview')} />;
            default:
                return <HomePage onNavigateToUnits={() => navigateTo('units-overview')} />;
        }
    };

    return (
        <div className="p-4 sm:p-8 min-h-screen flex flex-col items-center">
            <BadgeNotificationManager />
            <div className="max-w-4xl w-full">
                <Header />
                <Navigation currentPage={currentPage} onNavigate={navigateTo} />
                <main>
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;