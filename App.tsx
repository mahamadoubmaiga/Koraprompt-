
import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { PromptGenerator } from './components/PromptGenerator';
import { TemplateLibrary } from './components/TemplateLibrary';
import { Dashboard } from './components/Dashboard';
import { Faq } from './components/Faq';
import { Page } from './types';


const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage setPage={setCurrentPage} />;
            case 'generator':
                return <PromptGenerator />;
            case 'templates':
                return <TemplateLibrary />;
            case 'dashboard':
                return <Dashboard />;
            case 'faq':
                return <Faq />;
            default:
                return <HomePage setPage={setCurrentPage} />;
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header setPage={setCurrentPage} currentPage={currentPage} />
            <main className="flex-grow">
                {renderPage()}
            </main>
            <footer className="bg-neutral-800 border-t border-neutral-700 py-6">
                <div className="container mx-auto px-6 text-center text-neutral-400 text-sm">
                    &copy; {new Date().getFullYear()} KoraPrompt. All rights reserved.
                </div>
            </footer>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
