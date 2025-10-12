
import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { TEMPLATES } from '../constants';
import { Template } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

const TemplateCard: React.FC<{ template: Template }> = ({ template }) => {
    const { t } = useTranslations();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(template.prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-white">{template.name}</h3>
                    <span className="text-xs font-medium bg-brand-primary/20 text-brand-light px-2 py-1 rounded-full capitalize">{template.type}</span>
                </div>
                <p className="text-neutral-300 text-sm mb-4">{template.prompt}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-neutral-500">{template.generator} / {t(template.category as any)}</span>
                 <button onClick={handleCopy} className="flex items-center text-sm space-x-2 text-neutral-300 hover:text-brand-primary transition-colors">
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                    <span>{isCopied ? t('copied_button') : t('copy_button')}</span>
                </button>
            </div>
        </div>
    );
};

export const TemplateLibrary: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold">{t('templates_title')}</h1>
                <p className="text-lg text-neutral-300 mt-2">{t('templates_subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TEMPLATES.map(template => (
                    <TemplateCard key={template.id} template={template} />
                ))}
            </div>
        </div>
    );
};
