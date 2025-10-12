import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { TEMPLATES } from '../constants';
import { Template, PromptType } from '../types';
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
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 flex flex-col justify-between overflow-hidden group">
            <div className="relative">
                <img src={template.imageUrl} alt={template.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2 text-xs font-medium bg-brand-primary/50 backdrop-blur-sm text-white px-2 py-1 rounded-full capitalize">{template.type}</div>
            </div>
            <div className='p-4 flex flex-col flex-grow'>
                <div>
                    <h3 className="font-bold text-lg text-white mb-2">{template.name}</h3>
                    <p className="text-neutral-300 text-sm mb-4 line-clamp-3">{template.prompt}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-xs text-neutral-500">{template.generator} / {t(template.category as any)}</span>
                     <button onClick={handleCopy} className="flex items-center text-sm space-x-2 text-neutral-300 hover:text-brand-primary transition-colors">
                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                        <span>{isCopied ? t('copied_button') : t('copy_button')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ExplorePage: React.FC = () => {
    const { t } = useTranslations();
    const [filter, setFilter] = useState<'all' | PromptType>('all');
    
    const filteredTemplates = TEMPLATES.filter(template => filter === 'all' || template.type === filter);

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold">{t('explore_title')}</h1>
                <p className="text-lg text-neutral-300 mt-2">{t('explore_subtitle')}</p>
            </div>

            <div className="flex justify-center mb-8">
                <div className="flex space-x-1 rounded-md bg-neutral-800 p-1 text-center text-sm font-semibold border border-neutral-700">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md transition-colors ${filter === 'all' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('all_types')}</button>
                    <button onClick={() => setFilter('video')} className={`px-4 py-2 rounded-md transition-colors ${filter === 'video' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('video_prompts')}</button>
                    <button onClick={() => setFilter('image')} className={`px-4 py-2 rounded-md transition-colors ${filter === 'image' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('image_prompts')}</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTemplates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                ))}
            </div>
        </div>
    );
};