import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { SavedPrompt } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

const PromptCard: React.FC<{ prompt: SavedPrompt }> = ({ prompt }) => {
    const { t } = useTranslations();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <p className="text-neutral-300 text-sm mb-3 italic">Your idea: "{prompt.userInput}"</p>
            <div className="space-y-4">
                {prompt.prompts.map((p, index) => (
                    <div key={index} className="bg-neutral-900 p-3 rounded-md">
                        {prompt.prompts.length > 1 && (
                            <h4 className="font-semibold text-brand-light mb-2">{t('scene_prefix')} {index + 1}</h4>
                        )}
                        <p className="text-white text-sm mb-3">{p}</p>
                        <button onClick={() => handleCopy(p, index)} className="flex items-center text-xs space-x-1.5 text-neutral-300 hover:text-brand-primary transition-colors bg-neutral-700/50 hover:bg-neutral-700 px-2 py-1 rounded-md">
                            {copiedIndex === index ? <CheckIcon className="w-3 h-3 text-green-400" /> : <ClipboardIcon className="w-3 h-3" />}
                            <span>{copiedIndex === index ? t('copied_button') : t('copy_button')}</span>
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-neutral-400 space-x-2">
                    <span className="font-medium bg-brand-primary/20 text-brand-light px-2 py-1 rounded-full capitalize">{prompt.type}</span>
                    <span>{prompt.generator}</span>
                    <span>{prompt.date}</span>
                </div>
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { t } = useTranslations();
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

    useEffect(() => {
        const prompts = JSON.parse(localStorage.getItem('kora-prompts') || '[]');
        setSavedPrompts(prompts);
    }, []);

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-10">{t('dashboard_title')}</h1>
            {savedPrompts.length > 0 ? (
                <div className="space-y-6 max-w-4xl mx-auto">
                    {savedPrompts.map(prompt => (
                        <PromptCard key={prompt.id} prompt={prompt} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-neutral-400 mt-8">{t('dashboard_empty')}</p>
            )}
        </div>
    );
};