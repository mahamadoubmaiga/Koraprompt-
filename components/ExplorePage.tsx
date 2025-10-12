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
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 flex flex-col justify-between overflow-hidden group">
            <div className="relative">
                <img src={prompt.generatedImage || `https://placehold.co/600x400/1F2937/A5B4FC/png?text=${prompt.projectName}`} alt={prompt.projectName} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2 text-xs font-medium bg-brand-primary/50 backdrop-blur-sm text-white px-2 py-1 rounded-full capitalize">{prompt.type}</div>
            </div>
            <div className='p-4 flex flex-col flex-grow'>
                <div>
                    <h3 className="font-bold text-lg text-white mb-2">{prompt.projectName}</h3>
                    <p className="text-neutral-300 text-sm mb-4 line-clamp-3">{prompt.prompts[0]}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-xs text-neutral-500">{prompt.generator}</span>
                     <div className="flex items-center space-x-4">
                        <button onClick={handleRemix} title={t('remix_button')} className="flex items-center text-sm space-x-2 text-neutral-300 hover:text-brand-primary transition-colors">
                            <RemixIcon className="w-4 h-4" />
                            <span>{t('remix_button')}</span>
                        </button>
                        <button onClick={handleCopy} title={t('copy_button')} className="flex items-center text-sm space-x-2 text-neutral-300 hover:text-brand-primary transition-colors">
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

            {filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPrompts.map(prompt => (
                        <ExploreCard key={prompt.id} prompt={prompt} onRemix={onRemix} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-neutral-400 mt-12">No community prompts published yet. Be the first!</p>
            )}
        </div>
    );
};
