import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Language, Page } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
    setPage: (page: Page) => void;
    currentPage: Page;
    onLoginClick: () => void;
}

const FrFlag = () => <span className="text-xl">🇫🇷</span>;
const EnFlag = () => <span className="text-xl">🇬🇧</span>;

export const Header: React.FC<HeaderProps> = ({ setPage, currentPage, onLoginClick }) => {
    const { t, language, setLanguage } = useTranslations();
    const { user, logout } = useAuth();
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const navItems: { page: Page; label: string; authRequired: boolean }[] = [
        { page: 'generator', label: t('nav_generator'), authRequired: false },
        { page: 'explore', label: t('nav_explore'), authRequired: false },
        { page: 'dashboard', label: t('nav_dashboard'), authRequired: true },
        { page: 'faq', label: t('nav_faq'), authRequired: false },
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
                        {navItems.map(item => {
                            if (item.authRequired && !user) return null;
                            return (
                                <li key={item.page}>
                                    <button
                                        onClick={() => setPage(item.page)}
                                        className={`text-neutral-200 hover:text-brand-primary transition-colors duration-200 ${currentPage === item.page ? 'text-brand-primary font-semibold' : ''}`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
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
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="p-2 rounded-full hover:bg-neutral-800 transition-colors">
                                <UserCircleIcon className="w-6 h-6 text-neutral-300" />
                            </button>
                             {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1">
                                    <div className="px-4 py-2 text-sm text-neutral-400 border-b border-neutral-700">{user.email}</div>
                                    <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
                                        <LogoutIcon className="w-4 h-4" />
                                        <span>{t('logout_button')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                         <button onClick={onLoginClick} className="bg-brand-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-brand-secondary transition-colors duration-200">
                            {t('login_button')}
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};