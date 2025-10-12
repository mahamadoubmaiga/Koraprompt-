
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(Language.EN);

  useEffect(() => {
    const storedLang = localStorage.getItem('kora-lang') as Language;
    if (storedLang && Object.values(Language).includes(storedLang)) {
      setLanguageState(storedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      setLanguageState(browserLang === 'fr' ? Language.FR : Language.EN);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('kora-lang', lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
