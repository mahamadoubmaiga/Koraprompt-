
import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { SavedPrompt } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

const PromptCard: React.FC<{ prompt: SavedPrompt; onCopy: (text: string) => void; copiedText: string | null }> = ({ prompt, onCopy, copiedText }) => {
    const { t } = useTranslations();
    const isCopied = copiedText === prompt.prompt;

    return (
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <p className="text-neutral-300 text-sm mb-3">"{prompt.userInput}"</p>
            <p className="text-white bg-neutral-900 p-3 rounded-md text-sm mb-4">{prompt.prompt}</p>
            <div className="flex justify-between items-center">
                <div className="text-xs text-neutral-400 space-x-2">
                    <span className="font-medium bg-brand-primary/20 text-brand-light px-2 py-1 rounded-full capitalize">{prompt.type}</span>
                    <span>{prompt.generator}</span>
                    <span>{prompt.date}</span>
                </div>
                 <button onClick={() => onCopy(prompt.prompt)} className="flex items-center text-sm space-x-2 text-neutral-300 hover:text-brand-primary transition-colors">
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                    <span>{isCopied ? t('copied_button') : t('copy_button')}</span>
                </button>
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { t } = useTranslations();
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    useEffect(() => {
        const prompts = JSON.parse(localStorage.getItem('kora-prompts') || '[]');
        setSavedPrompts(prompts);
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-10">{t('dashboard_title')}</h1>
            {savedPrompts.length > 0 ? (
                <div className="space-y-6 max-w-4xl mx-auto">
                    {savedPrompts.map(prompt => (
                        <PromptCard key={prompt.id} prompt={prompt} onCopy={handleCopy} copiedText={copiedText} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-neutral-400 mt-8">{t('dashboard_empty')}</p>
            )}
        </div>
    );
};
