import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { PromptGenerator } from './components/PromptGenerator';
import { ExplorePage } from './components/ExplorePage';
import { Dashboard } from './components/Dashboard';
import { Faq } from './components/Faq';
import { Page, RemixState } from './types';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [remixState, setRemixState] = useState<RemixState | null>(null);
    const { user } = useAuth();

    const handleSetPage = (page: Page) => {
        // If user is not logged in and tries to access dashboard, open login modal
        if (!user && page === 'dashboard') {
            setAuthModalOpen(true);
            return;
        }
        setRemixState(null); // Clear remix state on page change
        setCurrentPage(page);
    };
    
    const handleRemix = (remixData: RemixState) => {
        setRemixState(remixData);
        setCurrentPage('generator');
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage setPage={handleSetPage} />;
            case 'generator':
                return <PromptGenerator remixState={remixState} clearRemixState={() => setRemixState(null)} />;
            case 'explore':
                return <ExplorePage onRemix={handleRemix} />;
            case 'dashboard':
                return user ? <Dashboard /> : <HomePage setPage={handleSetPage} />;
            case 'faq':
                return <Faq />;
            default:
                return <HomePage setPage={handleSetPage} />;
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header setPage={handleSetPage} currentPage={currentPage} onLoginClick={() => setAuthModalOpen(true)} />
            <main className="flex-grow">
                {renderPage()}
            </main>
            <footer className="glass-effect border-t border-neutral-700/50 py-8 mt-20">
                <div className="container mx-auto px-6 text-center">
                    <div className="text-neutral-400 text-sm">
                        <p className="mb-2">&copy; {new Date().getFullYear()} <span className="font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">KoraPrompt</span>. All rights reserved.</p>
                        <p className="text-xs text-neutral-500">Powered by AI • Designed for Creators</p>
                    </div>
                </div>
            </footer>
            {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        </div>
    );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
