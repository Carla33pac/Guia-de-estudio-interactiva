import React from 'react';
import Card from '../components/Card';
import { UnitsData, GameState } from '../types';

interface UnitsOverviewPageProps {
    units: UnitsData;
    onSelectUnit: (unitId: string) => void;
    gameState: GameState;
}

const UnitsOverviewPage: React.FC<UnitsOverviewPageProps> = ({ units, onSelectUnit, gameState }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FIX: Changed from Object.entries to Object.keys to ensure correct type inference for 'unit'. */}
            {Object.keys(units).map((id) => {
                const unit = units[id];
                const completionData = gameState.completedUnits[id];
                return (
                    <Card 
                        key={id}
                        title={id === 'W' ? 'Welcome Unit' : `Unidad ${id}`}
                        subtitle={unit.title}
                        onClick={() => onSelectUnit(id)}
                        score={completionData?.score}
                        totalQuestions={completionData?.total}
                    />
                );
            })}
        </div>
    );
};

export default UnitsOverviewPage;