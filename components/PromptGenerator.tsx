import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { PromptType, SavedPrompt } from '../types';
import { GENERATORS, VIDEO_CATEGORIES, IMAGE_CATEGORIES } from '../constants';
import { generatePrompts } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

export const PromptGenerator: React.FC = () => {
    const { t, language } = useTranslations();
    const [activeTab, setActiveTab] = useState<PromptType>('video');
    const [mode, setMode] = useState<'single' | 'sequence'>('single');
    const [userInput, setUserInput] = useState('');
    const [selectedGenerator, setSelectedGenerator] = useState(GENERATORS.find(g => g.type === 'video')?.id || '');
    const [selectedCategory, setSelectedCategory] = useState(VIDEO_CATEGORIES[0]);
    const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    
    // Advanced options state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [creativity, setCreativity] = useState('medium'); // 'low', 'medium', 'high'
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [promptCount, setPromptCount] = useState(3);

    const handleTabChange = (tab: PromptType) => {
        setActiveTab(tab);
        const firstGenerator = GENERATORS.find(g => g.type === tab);
        setSelectedGenerator(firstGenerator?.id || '');
        setSelectedCategory(tab === 'video' ? VIDEO_CATEGORIES[0] : IMAGE_CATEGORIES[0]);
        setGeneratedPrompts([]);
        setAspectRatio('1:1');
    };

    const handleGenerate = async () => {
        if (!userInput.trim()) return;
        setIsLoading(true);
        setGeneratedPrompts([]);
        
        const creativitySettings: { [key: string]: { temperature: number; topP: number } } = {
            low: { temperature: 0.3, topP: 0.8 },
            medium: { temperature: 0.7, topP: 0.9 },
            high: { temperature: 1.0, topP: 0.95 },
        };
        const { temperature, topP } = creativitySettings[creativity];
        const finalAspectRatio = activeTab === 'image' ? aspectRatio : null;

        try {
            const prompts = await generatePrompts(
                userInput, 
                activeTab, 
                selectedGenerator, 
                selectedCategory, 
                language,
                negativePrompt,
                temperature,
                topP,
                finalAspectRatio,
                mode === 'sequence' ? promptCount : 1
            );
            setGeneratedPrompts(prompts);
        } catch (error) {
            console.error(error);
            setGeneratedPrompts(['An error occurred. Please try again.']);
        }
        setIsLoading(false);
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSave = () => {
        if (generatedPrompts.length === 0) return;
        const savedPrompts: SavedPrompt[] = JSON.parse(localStorage.getItem('kora-prompts') || '[]');
        const newPrompt: SavedPrompt = {
            id: new Date().toISOString(),
            type: activeTab,
            prompts: generatedPrompts,
            generator: selectedGenerator,
            userInput,
            date: new Date().toLocaleDateString()
        };
        localStorage.setItem('kora-prompts', JSON.stringify([newPrompt, ...savedPrompts]));
        alert('Prompt saved to dashboard!');
    };

    const currentGenerators = GENERATORS.filter(g => g.type === activeTab);
    const currentCategories = activeTab === 'video' ? VIDEO_CATEGORIES : IMAGE_CATEGORIES;
    
    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-8">{t('prompt_generator_title')}</h1>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-center border-b border-neutral-700 mb-8">
                    <button onClick={() => handleTabChange('video')} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'video' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-neutral-400'}`}>
                        {t('video_prompts')}
                    </button>
                    <button onClick={() => handleTabChange('image')} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'image' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-neutral-400'}`}>
                        {t('image_prompts')}
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">{t('generation_mode')}</label>
                        <div className="flex space-x-1 rounded-md bg-neutral-800 p-1 text-center text-sm font-semibold border border-neutral-700">
                            <button onClick={() => setMode('single')} className={`w-full py-2 rounded-md transition-colors ${mode === 'single' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('single_prompt')}</button>
                            <button onClick={() => setMode('sequence')} className={`w-full py-2 rounded-md transition-colors ${mode === 'sequence' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('project_sequence')}</button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="idea" className="block text-sm font-medium text-neutral-300 mb-2">{mode === 'single' ? t('your_idea_label') : t('project_idea_label')}</label>
                        <textarea
                            id="idea"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={mode === 'single' ? t('your_idea_placeholder') : t('project_idea_placeholder')}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                           <label htmlFor="generator" className="block text-sm font-medium text-neutral-300 mb-2">{t('generator_label')}</label>
                           <select id="generator" value={selectedGenerator} onChange={e => setSelectedGenerator(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition">
                               {currentGenerators.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                           </select>
                        </div>
                        {mode === 'sequence' ? (
                            <div>
                                <label htmlFor="prompt-count" className="block text-sm font-medium text-neutral-300 mb-2">{t('number_of_prompts_label')}</label>
                                <input type="number" id="prompt-count" value={promptCount} onChange={e => setPromptCount(Math.max(2, parseInt(e.target.value, 10)))} min="2" max="10" className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition" />
                            </div>
                        ) : (
                            <div>
                               <label htmlFor="category" className="block text-sm font-medium text-neutral-300 mb-2">{t('category_label')}</label>
                               <select id="category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition">
                                   {currentCategories.map(c => <option key={c} value={c}>{t(c as any)}</option>)}
                               </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center space-x-2 text-sm text-neutral-400 hover:text-white transition-colors">
                            <span>{t('advanced_options')}</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showAdvanced && (
                        <div className="bg-neutral-800/50 p-4 rounded-lg space-y-6 border border-neutral-700 animate-fade-in">
                             <div>
                                <label htmlFor="negative-prompt" className="block text-sm font-medium text-neutral-300 mb-2">{t('negative_prompt_label')}</label>
                                <textarea
                                    id="negative-prompt"
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    placeholder={t('negative_prompt_placeholder')}
                                    className="w-full bg-neutral-900 border border-neutral-600 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">{t('creativity_label')}</label>
                                    <div className="flex space-x-1 rounded-md bg-neutral-900 p-1 text-center text-sm font-semibold">
                                        <button onClick={() => setCreativity('low')} className={`w-full py-2 rounded-md transition-colors ${creativity === 'low' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('creativity_low')}</button>
                                        <button onClick={() => setCreativity('medium')} className={`w-full py-2 rounded-md transition-colors ${creativity === 'medium' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('creativity_medium')}</button>
                                        <button onClick={() => setCreativity('high')} className={`w-full py-2 rounded-md transition-colors ${creativity === 'high' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('creativity_high')}</button>
                                    </div>
                                </div>
                                {activeTab === 'image' && (
                                     <div>
                                        <label htmlFor="aspect-ratio" className="block text-sm font-medium text-neutral-300 mb-2">{t('aspect_ratio_label')}</label>
                                        <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-neutral-900 border border-neutral-600 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition">
                                            <option value="1:1">1:1 (Square)</option>
                                            <option value="16:9">16:9 (Widescreen)</option>
                                            <option value="9:16">9:16 (Vertical)</option>
                                            <option value="4:3">4:3 (Standard)</option>
                                            <option value="3:4">3:4 (Portrait)</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold text-lg hover:bg-brand-secondary transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed">
                        {isLoading ? t('generating_button') : t('generate_button')}
                    </button>
                </div>
                
                {(isLoading || generatedPrompts.length > 0) && (
                    <div className="mt-10 bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                        <h2 className="text-xl font-semibold mb-4">{mode === 'sequence' ? t('ai_result_sequence_title') : t('ai_result_title')}</h2>
                        {isLoading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-neutral-700 rounded w-full"></div>
                                <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
                                <div className="h-4 bg-neutral-700 rounded w-full mt-2"></div>
                                <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
                            </div>
                        ) : (
                            <div>
                                <div className="space-y-6">
                                {generatedPrompts.map((prompt, index) => (
                                    <div key={index} className="bg-neutral-900 p-4 rounded-md">
                                        {mode === 'sequence' && <h3 className="font-semibold text-brand-light mb-2">{t('scene_prefix')} {index + 1}</h3>}
                                        <p className="text-neutral-200 whitespace-pre-wrap">{prompt}</p>
                                        <div className="mt-3">
                                            <button onClick={() => handleCopy(prompt, index)} className="flex items-center space-x-2 text-sm bg-neutral-700 px-3 py-1.5 rounded-md hover:bg-neutral-600 transition-colors">
                                                {copiedIndex === index ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                                                <span>{copiedIndex === index ? t('copied_button') : t('copy_button')}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                <div className="mt-6">
                                     <button onClick={handleSave} className="bg-brand-primary/80 px-4 py-2 rounded-md hover:bg-brand-primary transition-colors font-semibold">
                                        {t('save_to_dashboard')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};