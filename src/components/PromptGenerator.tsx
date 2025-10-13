import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { PromptType, SavedPrompt, RemixState, Preset } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { GENERATORS, VIDEO_CATEGORIES, IMAGE_CATEGORIES, SURPRISE_ME_IDEAS } from '../constants';
import { generatePrompts, generateImageFromPrompt, generatePromptFromImage } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { CloseIcon } from './icons/CloseIcon';

interface PromptGeneratorProps {
    remixState: RemixState | null;
    clearRemixState: () => void;
}

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({ remixState, clearRemixState }) => {
    const { t, language } = useTranslations();
    const { user } = useAuth();
    const { presets, addPreset } = useData();

    const [activeTab, setActiveTab] = useState<PromptType>('video');
    const [mode, setMode] = useState<'single' | 'sequence'>('single');
    const [userInput, setUserInput] = useState('');
    const [selectedGenerator, setSelectedGenerator] = useState(GENERATORS.find(g => g.type === 'video')?.id || '');
    const [selectedCategory, setSelectedCategory] = useState(VIDEO_CATEGORIES[0]);
    const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    
    // New features state
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImageData, setGeneratedImageData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Advanced & Refinement state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [creativity, setCreativity] = useState('medium');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [promptCount, setPromptCount] = useState(3);
    const [refinementInput, setRefinementInput] = useState('');
    const [newPresetName, setNewPresetName] = useState('');

    useEffect(() => {
        if (remixState) {
            setActiveTab(remixState.type);
            setUserInput(remixState.userInput);
            setSelectedGenerator(remixState.generator);
            // Additional settings from remix could be applied here
            clearRemixState();
        }
    }, [remixState, clearRemixState]);

    const resetGenerationState = () => {
        setGeneratedPrompts([]);
        setGeneratedImageData(null);
        setImagePreview(null);
        setUserInput('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleTabChange = (tab: PromptType) => {
        setActiveTab(tab);
        const firstGenerator = GENERATORS.find(g => g.type === tab);
        setSelectedGenerator(firstGenerator?.id || '');
        setSelectedCategory(tab === 'video' ? VIDEO_CATEGORIES[0] : IMAGE_CATEGORIES[0]);
        resetGenerationState();
        setAspectRatio('1:1');
    };
    
    const performGeneration = async (idea: string) => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setGeneratedPrompts([]);
        setGeneratedImageData(null);
        
        const creativitySettings: { [key: string]: { temperature: number; topP: number } } = {
            low: { temperature: 0.3, topP: 0.8 },
            medium: { temperature: 0.7, topP: 0.9 },
            high: { temperature: 1.0, topP: 0.95 },
        };
        const { temperature, topP } = creativitySettings[creativity];
        const finalAspectRatio = activeTab === 'image' ? aspectRatio : null;

        try {
            const prompts = await generatePrompts(
                idea, 
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

    const handleGenerate = () => performGeneration(userInput);

    const handleRefine = () => {
        if (!refinementInput.trim() || generatedPrompts.length === 0) return;
        
        const refinedIdea = `${userInput} (Refinement: ${refinementInput})`;
        setUserInput(refinedIdea); 
        performGeneration(refinedIdea);
        setRefinementInput('');
    };

    const handleSurpriseMe = () => {
        const randomIndex = Math.floor(Math.random() * SURPRISE_ME_IDEAS.length);
        resetGenerationState();
        setUserInput(SURPRISE_ME_IDEAS[randomIndex]);
    };

    const handleAnalyzeImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzingImage(true);
        resetGenerationState();
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64Image = reader.result as string;
                setImagePreview(base64Image);
                const prompt = await generatePromptFromImage(base64Image, file.type, language);
                setUserInput(prompt);
            } catch (error) {
                console.error(error);
                setUserInput('Failed to analyze the image. Please try again.');
            }
            setIsAnalyzingImage(false);
        };
        reader.onerror = () => {
            console.error('Error reading file');
            setUserInput('Error reading the image file.');
            setIsAnalyzingImage(false);
        };
    };

    const handleGenerateImage = async () => {
        if (generatedPrompts.length === 0 || activeTab !== 'image' || mode !== 'single') return;
        setIsGeneratingImage(true);
        try {
            const imageData = await generateImageFromPrompt(generatedPrompts[0], aspectRatio);
            setGeneratedImageData(imageData);
        } catch (error) {
            console.error(error);
        }
        setIsGeneratingImage(false);
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const { addPrompt } = useData();
    const handleSave = () => {
        if (generatedPrompts.length === 0 || !user) {
             alert('You must be logged in to save prompts.');
            return;
        }
        
        const newPrompt: Omit<SavedPrompt, 'id'> = {
            type: activeTab,
            prompts: generatedPrompts,
            versions: [{ prompts: generatedPrompts, date: new Date().toISOString() }],
            generator: selectedGenerator,
            userInput: userInput,
            projectName: userInput.substring(0, 70) || "Untitled Project",
            date: new Date().toISOString(),
            ...(generatedImageData && { generatedImage: generatedImageData }),
            userId: user.id,
            folderId: null,
            isPublished: false,
            likes: 0,
            likedBy: [],
        };
        addPrompt(newPrompt);
        alert('Prompt saved to dashboard!');
    };

    const handleSavePreset = () => {
        if (!newPresetName.trim() || !user) return;
        const newPreset: Omit<Preset, 'id' | 'userId'> = {
            name: newPresetName,
            settings: {
                generator: selectedGenerator,
                category: selectedCategory,
                negativePrompt,
                creativity,
                aspectRatio,
            }
        };
        addPreset(newPreset);
        setNewPresetName('');
    };

    const applyPreset = (preset: Preset) => {
        const { generator, category, negativePrompt, creativity, aspectRatio } = preset.settings;
        const gen = GENERATORS.find(g => g.id === generator);
        if (gen) {
            setActiveTab(gen.type);
            setSelectedGenerator(gen.id);
        }
        setSelectedCategory(category);
        setNegativePrompt(negativePrompt);
        setCreativity(creativity);
        setAspectRatio(aspectRatio);
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
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="idea" className="block text-sm font-medium text-neutral-300">{mode === 'single' ? t('your_idea_label') : t('project_idea_label')}</label>
                            <div className="flex items-center space-x-4">
                               {activeTab === 'image' && mode === 'single' && (
                                   <>
                                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                   <button onClick={handleAnalyzeImageClick} disabled={isAnalyzingImage} className="flex items-center space-x-2 text-sm text-brand-light hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <PhotoIcon className="w-4 h-4" />
                                        <span>{isAnalyzingImage ? t('analyzing_image_button') : t('analyze_image_button')}</span>
                                   </button>
                                   </>
                               )}
                               <button onClick={handleSurpriseMe} className="flex items-center space-x-2 text-sm text-brand-light hover:text-white transition-colors">
                                   <SparklesIcon className="w-4 h-4" />
                                   <span>{t('surprise_me_button')}</span>
                               </button>
                           </div>
                        </div>
                        <div className={`flex gap-4 items-start ${isAnalyzingImage ? 'opacity-50' : ''}`}>
                            {imagePreview && (
                                <div className="relative w-48 flex-shrink-0">
                                    <img src={imagePreview} alt="Uploaded for analysis" className="rounded-md object-cover aspect-square w-full" />
                                    <button 
                                        onClick={resetGenerationState} 
                                        className="absolute top-1.5 right-1.5 bg-black/60 p-1 rounded-full text-white hover:bg-black/80 transition-colors"
                                        aria-label="Clear image"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <textarea
                                id="idea"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder={mode === 'single' ? t('your_idea_placeholder') : t('project_idea_placeholder')}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition"
                                rows={imagePreview ? 8 : 3}
                                disabled={isAnalyzingImage}
                            />
                        </div>
                         {isAnalyzingImage && <div className="text-sm text-center text-neutral-400 mt-2">Analyzing image...</div>}
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">{t('generation_mode')}</label>
                        <div className="flex space-x-1 rounded-md bg-neutral-800 p-1 text-center text-sm font-semibold border border-neutral-700">
                            <button onClick={() => setMode('single')} className={`w-full py-2 rounded-md transition-colors ${mode === 'single' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('single_prompt')}</button>
                            <button onClick={() => setMode('sequence')} className={`w-full py-2 rounded-md transition-colors ${mode === 'sequence' ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('project_sequence')}</button>
                        </div>
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
                        <div className="bg-neutral-800/50 p-4 rounded-lg space-y-6 border border-neutral-700">
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
                             {user && <div className="border-t border-neutral-700 pt-4">
                                <label className="block text-sm font-medium text-neutral-300 mb-2">{t('presets_label')}</label>
                                <div className="space-y-2">
                                    {presets.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {presets.map(p => <button key={p.id} onClick={() => applyPreset(p)} className="bg-neutral-700 text-sm px-3 py-1 rounded-md hover:bg-brand-secondary">{p.name}</button>)}
                                        </div>
                                    ) : <p className="text-sm text-neutral-500">{t('presets_none')}</p>}
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input type="text" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} placeholder={t('preset_name_placeholder')} className="w-full bg-neutral-900 border border-neutral-600 rounded-md p-2 text-white text-sm focus:ring-brand-primary focus:border-brand-primary transition" />
                                        <button onClick={handleSavePreset} className="bg-brand-primary text-white px-3 py-2 rounded-md font-semibold text-sm hover:bg-brand-secondary whitespace-nowrap">{t('save_button')}</button>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    )}
                    
                    <button onClick={handleGenerate} disabled={isLoading || isAnalyzingImage} className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold text-lg hover:bg-brand-secondary transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed">
                        {isLoading ? t('generating_button') : t('generate_button')}
                    </button>
                </div>
                
                {(isLoading || generatedPrompts.length > 0) && (
                    <div className="mt-10">
                        <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                            <h2 className="text-xl font-semibold mb-4">{mode === 'sequence' ? t('ai_result_sequence_title') : t('ai_result_title')}</h2>
                            {isLoading && generatedPrompts.length === 0 ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-neutral-700 rounded w-full"></div>
                                    <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                                        
                                        {activeTab === 'image' && mode === 'single' && (
                                            <div className="flex flex-col items-center justify-center bg-neutral-900 p-4 rounded-md h-full">
                                                {isGeneratingImage ? (
                                                    <div className="w-full aspect-square bg-neutral-700 rounded-md animate-pulse flex items-center justify-center">
                                                        <p className="text-neutral-400">{t('generating_image_button')}</p>
                                                    </div>
                                                ) : generatedImageData ? (
                                                    <img src={generatedImageData} alt="AI generated" className="rounded-md w-full" />
                                                ) : (
                                                     <button onClick={handleGenerateImage} className="w-full aspect-square border-2 border-dashed border-neutral-600 rounded-md flex flex-col items-center justify-center text-neutral-400 hover:bg-neutral-700 hover:border-neutral-500 transition-colors">
                                                        <PhotoIcon className="w-12 h-12 mb-2" />
                                                        <span className="font-semibold">{t('generate_image_button')}</span>
                                                     </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-6 flex items-center justify-between">
                                         <button onClick={handleSave} className="bg-brand-primary/80 px-4 py-2 rounded-md hover:bg-brand-primary transition-colors font-semibold disabled:opacity-50" disabled={!user}>
                                            {user ? t('save_to_dashboard') : t('login_button') + ' to save'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isLoading && generatedPrompts.length > 0 && mode === 'single' && (
                             <div className="mt-6 bg-neutral-800/60 p-6 rounded-lg border border-neutral-700">
                                <h3 className="text-lg font-semibold mb-2">{t('refine_prompt_title')}</h3>
                                 <textarea
                                    value={refinementInput}
                                    onChange={(e) => setRefinementInput(e.target.value)}
                                    placeholder={t('refine_prompt_placeholder')}
                                    className="w-full bg-neutral-800 border border-neutral-600 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition"
                                    rows={2}
                                />
                                <button onClick={handleRefine} disabled={isLoading} className="mt-3 bg-brand-secondary text-white py-2 px-5 rounded-md font-semibold hover:bg-brand-primary transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed">
                                    {isLoading ? t('refining_button') : t('refine_button')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};