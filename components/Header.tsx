
import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Language, Page } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface HeaderProps {
    setPage: (page: Page) => void;
    currentPage: Page;
}

const FrFlag = () => <span className="text-xl">🇫🇷</span>;
const EnFlag = () => <span className="text-xl">🇬🇧</span>;

export const Header: React.FC<HeaderProps> = ({ setPage, currentPage }) => {
    const { t, language, setLanguage } = useTranslations();
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const navItems: { page: Page; label: string }[] = [
        { page: 'generator', label: t('nav_generator') },
        { page: 'templates', label: t('nav_templates') },
        { page: 'dashboard', label: t('nav_dashboard') },
        { page: 'faq', label: t('nav_faq') },
    ];

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setIsLangDropdownOpen(false);
    };

    return (
        <header className="bg-neutral-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-neutral-700">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <button onClick={() => setPage('home')} className="text-2xl font-bold text-white">
                        Kora<span className="text-brand-primary">Prompt</span>
                    </button>
                    <ul className="hidden md:flex items-center space-x-6">
                        {navItems.map(item => (
                            <li key={item.page}>
                                <button
                                    onClick={() => setPage(item.page)}
                                    className={`text-neutral-200 hover:text-brand-primary transition-colors duration-200 ${currentPage === item.page ? 'text-brand-primary font-semibold' : ''}`}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-800 transition-colors">
                            {language === 'fr' ? <FrFlag/> : <EnFlag/>}
                            <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
                        </button>
                        {isLangDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-neutral-800 rounded-md shadow-lg py-1">
                                <button onClick={() => handleLanguageChange(Language.EN)} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
                                    <EnFlag/> <span>English</span>
                                </button>
                                <button onClick={() => handleLanguageChange(Language.FR)} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
                                    <FrFlag/> <span>Français</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="bg-brand-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-secondary transition-colors duration-200">
                        {t('login_button')}
                    </button>
                </div>
            </nav>
        </header>
    );
};
