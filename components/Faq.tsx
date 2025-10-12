
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
        <div className="border-b border-neutral-700 py-4">
            <button
                className="w-full flex justify-between items-center text-left text-lg font-semibold"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                 <div className="text-neutral-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const Faq: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-10">{t('faq_title')}</h1>
            <div className="max-w-3xl mx-auto">
                <FaqItem title={t('faq_q1_title')}>
                   <p>{t('faq_q1_answer')}</p>
                </FaqItem>
                <FaqItem title={t('faq_q2_title')}>
                   <p>{t('faq_q2_answer')}</p>
                </FaqItem>
            </div>
        </div>
    );
};
