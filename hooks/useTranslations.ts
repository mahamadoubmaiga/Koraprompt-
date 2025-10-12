
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';

type TranslationKey = keyof typeof translations['en'];

export const useTranslations = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }

  const { language } = context;

  const t = (key: TranslationKey) => {
    return translations[language][key] || translations['en'][key];
  };

  return { t, language, setLanguage: context.setLanguage };
};
