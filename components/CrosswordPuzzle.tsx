import React, { useState, useEffect, useCallback } from 'react';
import { Unit, CrosswordData } from '../types';
import { generateCrosswordPuzzle } from '../services/geminiService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import BrainIcon from './icons/BrainIcon';

interface CrosswordPuzzleProps {
    unit: Unit;
}

interface CellState {
    char: string;
    number?: number;
    isWordStart: boolean;
    userInput: string;
    isCorrect: boolean | null;
}

const CrosswordPuzzle: React.FC<CrosswordPuzzleProps> = ({ unit }) => {
    const [puzzleData, setPuzzleData] = useState<CrosswordData | null>(null);
    const [grid, setGrid] = useState<(CellState | null)[][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isStarted, setIsStarted] = useState(false);

    const initializeGrid = useCallback((data: CrosswordData) => {
        const newGrid: (CellState | null)[][] = Array(data.rows).fill(null).map(() => Array(data.cols).fill(null));

        data.entries.forEach(entry => {
            const { row, col, orientation, answer, number } = entry;
            
            for (let i = 0; i < answer.length; i++) {
                let r = row - 1;
                let c = col - 1;
                if (orientation === 'across') {
                    c += i;
                } else {
                    r += i;
                }
                
                if (r < data.rows && c < data.cols) {
                    if (!newGrid[r][c]) {
                        newGrid[r][c] = {
                            char: answer[i].toUpperCase(),
                            isWordStart: false,
                            userInput: '',
                            isCorrect: null,
                        };
                    }
                    if (i === 0) {
                       newGrid[r][c]!.isWordStart = true;
                       newGrid[r][c]!.number = number;
                    }
                }
            }
        });
        setGrid(newGrid);
    }, []);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setPuzzleData(null);
        setGrid([]);

        const data = await generateCrosswordPuzzle(unit.vocab);
        if (data && data.entries.length > 0) {
            data.entries.sort((a, b) => a.number - b.number);
            setPuzzleData(data);
            initializeGrid(data);
        } else {
            setError('No se pudo generar un crucigrama. Por favor, inténtalo de nuevo.');
        }
        setIsLoading(false);
    };

    const handleInputChange = (r: number, c: number, value: string) => {
        const newGrid = [...grid];
        if (newGrid[r][c]) {
            newGrid[r][c]!.userInput = value.toUpperCase();
            newGrid[r][c]!.isCorrect = null; 
            setGrid(newGrid);
        }
    };

    const handleCheckAnswers = () => {
        const newGrid = grid.map(row => 
            row.map(cell => {
                if (cell) {
                    return {
                        ...cell,
                        isCorrect: cell.userInput === cell.char,
                    };
                }
                return null;
            })
        );
        setGrid(newGrid);
    };


    const renderGrid = () => {
        if (!puzzleData) return null;

        return (
            <div className="grid gap-px bg-gray-400 p-px border border-gray-400" style={{
                gridTemplateColumns: `repeat(${puzzleData.cols}, minmax(0, 1fr))`,
                width: '100%',
                maxWidth: `${puzzleData.cols * 2.5}rem`,
                aspectRatio: `${puzzleData.cols} / ${puzzleData.rows}`
            }}>
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        if (!cell) {
                            return <div key={`${r}-${c}`} className="bg-gray-200"></div>;
                        }
                        const cellColor = cell.isCorrect === true ? 'bg-green-100' : cell.isCorrect === false ? 'bg-red-100' : 'bg-white';
                        return (
                            <div key={`${r}-${c}`} className={`relative ${cellColor} transition-colors`}>
                                {cell.number && <span className="absolute top-0 left-0.5 text-[0.6rem] font-bold text-gray-500">{cell.number}</span>}
                                <input
                                    type="text"
                                    maxLength={1}
                                    value={cell.userInput}
                                    onChange={(e) => handleInputChange(r, c, e.target.value)}
                                    className="w-full h-full text-center font-bold text-gray-800 uppercase bg-transparent border-0 focus:ring-1 focus:ring-brand-primary p-0"
                                />
                            </div>
                        );
                    })
                )}
            </div>
        );
    };
    
    const renderClues = () => {
        if (!puzzleData) return null;
        const acrossClues = puzzleData.entries.filter(e => e.orientation === 'across');
        const downClues = puzzleData.entries.filter(e => e.orientation === 'down');
        return (
            <div className="flex flex-col sm:flex-row gap-8 w-full mt-4">
                <div className="flex-1">
                    <h4 className="font-bold text-gray-700">Horizontales</h4>
                    <ul className="text-sm space-y-1 mt-2 text-gray-600">
                        {acrossClues.map(e => <li key={e.number}><strong>{e.number}.</strong> {e.clue}</li>)}
                    </ul>
                </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-gray-700">Verticales</h4>
                     <ul className="text-sm space-y-1 mt-2 text-gray-600">
                        {downClues.map(e => <li key={e.number}><strong>{e.number}.</strong> {e.clue}</li>)}
                    </ul>
                </div>
            </div>
        );
    };

    if (!isStarted) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Crucigrama IA</h3>
                <p className="text-gray-600 mb-4">¡Pon a prueba tu vocabulario! Genera un crucigrama único basado en las palabras de esta unidad.</p>
                <Button onClick={() => { setIsStarted(true); handleGenerate(); }}>
                    Crear Crucigrama
                </Button>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Crucigrama Interactivo</h3>
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Creando tu crucigrama...</p>
                </div>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {puzzleData && (
                <div className="flex flex-col items-center">
                    {renderGrid()}
                    {renderClues()}
                     <div className="flex items-center gap-4 mt-6">
                        <Button onClick={handleCheckAnswers} className="py-2 px-6">Revisar Respuestas</Button>
                        <Button onClick={handleGenerate} className="py-2 px-6 bg-gray-600 hover:bg-gray-700">Generar Nuevo</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrosswordPuzzle;
