import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface FaqItemProps {
    title: string;
    children: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="glass-effect rounded-xl p-5 mb-4 transition-all duration-300 hover:border-brand-primary/50">
            <button
                className="w-full flex justify-between items-center text-left text-lg font-semibold hover:text-brand-light transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 text-brand-primary ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                 <div className="text-neutral-300 space-y-2 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const Faq: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="container mx-auto px-6 py-16 animate-fade-in">
            <h1 className="text-5xl font-bold text-center mb-4">
                <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                    {t('faq_title')}
                </span>
            </h1>
            <p className="text-center text-neutral-400 text-lg mb-12">Find answers to commonly asked questions</p>
            <div className="max-w-3xl mx-auto">
                <FaqItem title={t('faq_q1_title')}>
                   <p>{t('faq_q1_answer')}</p>
                </FaqItem>
                <FaqItem title={t('faq_q2_title')}>
                   <p>{t('faq_q2_answer')}</p>
                </FaqItem>
                 <FaqItem title={t('faq_q3_title')}>
                   <p>{t('faq_q3_answer')}</p>
                </FaqItem>
                 <FaqItem title={t('faq_q4_title')}>
                   <p>{t('faq_q4_answer')}</p>
                </FaqItem>
                 <FaqItem title={t('faq_q5_title')}>
                   <p>{t('faq_q5_answer')}</p>
                </FaqItem>
            </div>
        </div>
    );
};
