import React, { useState, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useData } from '../contexts/DataContext';
import { Template, PromptType, SavedPrompt, RemixState } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RemixIcon } from './icons/RemixIcon';

interface ExploreCardProps {
    prompt: SavedPrompt;
    onRemix: (remixData: RemixState) => void;
}

const ExploreCard: React.FC<ExploreCardProps> = ({ prompt, onRemix }) => {
    const { t } = useTranslations();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompts.join('\n\n'));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRemix = () => {
        onRemix({
            type: prompt.type,
            prompts: prompt.prompts,
            generator: prompt.generator,
            userInput: prompt.userInput,
            projectName: `Remix of ${prompt.projectName}`,
            generatedImage: prompt.generatedImage,
        });
    }

    return (
        <div className="card-modern group overflow-hidden transform transition-all duration-500 hover:scale-105">
            <div className="relative overflow-hidden">
                <img src={prompt.generatedImage || `https://placehold.co/600x400/1F2937/A5B4FC/png?text=${prompt.projectName}`} alt={prompt.projectName} className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-3 right-3 text-xs font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-3 py-1 rounded-full shadow-lg capitalize">{prompt.type}</div>
            </div>
            <div className='p-5 flex flex-col flex-grow'>
                <div>
                    <h3 className="font-bold text-xl text-white mb-2 group-hover:text-brand-light transition-colors">{prompt.projectName}</h3>
                    <p className="text-neutral-400 text-sm mb-4 line-clamp-3">{prompt.prompts[0]}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-neutral-700/50">
                    <span className="text-xs text-neutral-500 font-medium">{prompt.generator}</span>
                     <div className="flex items-center space-x-3">
                        <button onClick={handleRemix} title={t('remix_button')} className="flex items-center text-sm space-x-1.5 text-neutral-300 hover:text-brand-primary transition-all duration-300 hover:scale-110">
                            <RemixIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('remix_button')}</span>
                        </button>
                        <button onClick={handleCopy} title={t('copy_button')} className="flex items-center text-sm space-x-1.5 text-neutral-300 hover:text-green-400 transition-all duration-300 hover:scale-110">
                            {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ExplorePageProps {
    onRemix: (remixData: RemixState) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onRemix }) => {
    const { t } = useTranslations();
    const { prompts } = useData();
    const [filter, setFilter] = useState<'all' | PromptType>('all');
    
    const publishedPrompts = useMemo(() => prompts.filter(p => p.isPublished), [prompts]);
    
    const filteredPrompts = useMemo(() => publishedPrompts.filter(template => filter === 'all' || template.type === filter), [publishedPrompts, filter]);

    return (
        <div className="container mx-auto px-6 py-16 animate-fade-in">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                        {t('explore_title')}
                    </span>
                </h1>
                <p className="text-xl text-neutral-300 mt-4 max-w-2xl mx-auto">{t('explore_subtitle')}</p>
            </div>

            <div className="flex justify-center mb-12">
                <div className="glass-effect rounded-xl p-1.5 inline-flex space-x-1">
                    <button onClick={() => setFilter('all')} className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${filter === 'all' ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-glow' : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'}`}>{t('all_types')}</button>
                    <button onClick={() => setFilter('video')} className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${filter === 'video' ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-glow' : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'}`}>{t('video_prompts')}</button>
                    <button onClick={() => setFilter('image')} className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${filter === 'image' ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-glow' : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'}`}>{t('image_prompts')}</button>
                </div>
            </div>

            {filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPrompts.map(prompt => (
                        <ExploreCard key={prompt.id} prompt={prompt} onRemix={onRemix} />
                    ))}
                </div>
            ) : (
                <div className="text-center mt-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-800/50 rounded-full mb-6">
                        <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="text-neutral-400 text-lg">No community prompts published yet. Be the first!</p>
                </div>
            )}
        </div>
    );
};
