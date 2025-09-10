
import React from 'react';
import { Page } from '../types';

interface NavigationProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{ page: Page; label: string; currentPage: Page; onNavigate: (page: Page) => void }> = ({ page, label, currentPage, onNavigate }) => {
    const isActive = currentPage === page || (page === 'units-overview' && ['unit-detail', 'quiz'].includes(currentPage));
    const activeClasses = 'bg-brand-secondary-text text-white';
    const inactiveClasses = 'hover:bg-gray-200';

    return (
        <span
            className={`cursor-pointer py-2 px-5 rounded-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
            onClick={() => onNavigate(page)}
        >
            {label}
        </span>
    );
};


const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
    return (
        <nav className="bg-white p-2 rounded-full shadow-lg flex justify-center space-x-2 sm:space-x-4 mb-8">
            <NavItem page="home" label="Inicio" currentPage={currentPage} onNavigate={onNavigate} />
            <NavItem page="units-overview" label="Unidades" currentPage={currentPage} onNavigate={onNavigate} />
        </nav>
    );
};

export default Navigation;
