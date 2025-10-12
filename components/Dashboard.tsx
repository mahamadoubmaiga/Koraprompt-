import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { SavedPrompt } from '../types';
import { GENERATORS } from '../constants';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ShareIcon } from './icons/ShareIcon';

interface PromptCardProps {
    prompt: SavedPrompt;
    onUpdate: (prompt: SavedPrompt) => void;
    onDelete: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onUpdate, onDelete }) => {
    const { t } = useTranslations();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [shareCopied, setShareCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(prompt.projectName);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleRename = () => {
        if (editedName.trim()) {
            onUpdate({ ...prompt, projectName: editedName.trim() });
            setIsEditing(false);
        }
    };
    
    const handleShare = () => {
        const promptText = prompt.prompts.length > 1
            ? prompt.prompts.map((p, i) => `${t('scene_prefix')} ${i + 1}: ${p}`).join('\n\n')
            : prompt.prompts[0];
        
        const shareString = `Check out this project from KoraPrompt!\n\nProject: "${prompt.projectName}"\nGenerator: ${prompt.generator}\n\n${promptText}`;
        navigator.clipboard.writeText(shareString);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    return (
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
             <div className="flex flex-col md:flex-row md:space-x-4">
                {prompt.generatedImage && (
                    <div className="flex-shrink-0 w-full md:w-48 mb-4 md:mb-0">
                        <img src={prompt.generatedImage} alt={prompt.projectName} className="rounded-md object-cover w-full h-auto" />
                    </div>
                )}
                <div className="flex-grow">
                    {isEditing ? (
                        <div className="mb-3">
                            <label className="text-sm font-medium text-neutral-300">{t('project_name_label')}</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-600 rounded-md p-2 text-white focus:ring-brand-primary focus:border-brand-primary transition"
                                />
                                <button onClick={handleRename} className="bg-brand-primary px-3 py-2 rounded-md font-semibold text-sm hover:bg-brand-secondary">{t('save_button')}</button>
                                <button onClick={() => setIsEditing(false)} className="bg-neutral-600 px-3 py-2 rounded-md font-semibold text-sm hover:bg-neutral-500">{t('cancel_button')}</button>
                            </div>
                        </div>
                    ) : (
                        <h3 className="font-bold text-lg mb-2 text-white">{prompt.projectName}</h3>
                    )}
                    
                    <p className="text-neutral-400 text-sm mb-3 italic">Idea: "{prompt.userInput}"</p>
                    <div className="space-y-4">
                        {prompt.prompts.map((p, index) => (
                            <div key={index} className="bg-neutral-900 p-3 rounded-md">
                                {prompt.prompts.length > 1 && (
                                    <h4 className="font-semibold text-brand-light mb-2">{t('scene_prefix')} {index + 1}</h4>
                                )}
                                <p className="text-white text-sm mb-3 whitespace-pre-wrap">{p}</p>
                                <button onClick={() => handleCopy(p, index)} className="flex items-center text-xs space-x-1.5 text-neutral-300 hover:text-brand-primary transition-colors bg-neutral-700/50 hover:bg-neutral-700 px-2 py-1 rounded-md">
                                    {copiedIndex === index ? <CheckIcon className="w-3 h-3 text-green-400" /> : <ClipboardIcon className="w-3 h-3" />}
                                    <span>{copiedIndex === index ? t('copied_button') : t('copy_button')}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-neutral-400 flex items-center flex-wrap gap-2">
                            <span className="font-medium bg-brand-primary/20 text-brand-light px-2 py-1 rounded-full capitalize">{prompt.type}</span>
                            <span>{prompt.generator}</span>
                            <span>{prompt.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => setIsEditing(true)} title={t('rename_button')} className="p-2 text-neutral-400 hover:text-white transition-colors"><PencilIcon className="w-4 h-4" /></button>
                             <button onClick={handleShare} title={t('share_button')} className="p-2 text-neutral-400 hover:text-white transition-colors">{shareCopied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <ShareIcon className="w-4 h-4" />}</button>
                             <button onClick={() => onDelete(prompt.id)} title={t('delete_button')} className="p-2 text-neutral-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { t } = useTranslations();
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [generatorFilter, setGeneratorFilter] = useState('all');

    useEffect(() => {
        const prompts = JSON.parse(localStorage.getItem('kora-prompts') || '[]');
        setSavedPrompts(prompts);
    }, []);
    
    const handleUpdatePrompt = (updatedPrompt: SavedPrompt) => {
        const newPrompts = savedPrompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p);
        setSavedPrompts(newPrompts);
        localStorage.setItem('kora-prompts', JSON.stringify(newPrompts));
    };

    const handleDeletePrompt = (promptId: string) => {
        if (window.confirm(t('confirm_delete_message'))) {
            const newPrompts = savedPrompts.filter(p => p.id !== promptId);
            setSavedPrompts(newPrompts);
            localStorage.setItem('kora-prompts', JSON.stringify(newPrompts));
        }
    };

    const availableGenerators = useMemo(() => {
        return [...new Set(savedPrompts.map(p => p.generator))];
    }, [savedPrompts]);

    const filteredPrompts = useMemo(() => savedPrompts.filter(p => {
        const searchInput = searchQuery.toLowerCase();
        const matchesSearch = p.projectName.toLowerCase().includes(searchInput) || p.userInput.toLowerCase().includes(searchInput);
        const matchesType = typeFilter === 'all' || p.type === typeFilter;
        const matchesGenerator = generatorFilter === 'all' || p.generator === generatorFilter;
        return matchesSearch && matchesType && matchesGenerator;
    }), [savedPrompts, searchQuery, typeFilter, generatorFilter]);

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-10">{t('dashboard_title')}</h1>
            
            {savedPrompts.length > 0 && (
                 <div className="max-w-4xl mx-auto mb-8 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 space-y-4">
                     <input
                         type="text"
                         placeholder={t('search_placeholder')}
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                         className="w-full bg-neutral-800 border border-neutral-600 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition"
                     />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-neutral-800 border border-neutral-600 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition">
                            <option value="all">{t('all_types')}</option>
                            <option value="video">{t('video_prompts')}</option>
                            <option value="image">{t('image_prompts')}</option>
                         </select>
                         <select value={generatorFilter} onChange={e => setGeneratorFilter(e.target.value)} className="w-full bg-neutral-800 border border-neutral-600 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition">
                             <option value="all">{t('all_generators')}</option>
                             {availableGenerators.map(gen => <option key={gen} value={gen}>{GENERATORS.find(g => g.id === gen)?.name || gen}</option>)}
                         </select>
                     </div>
                 </div>
            )}

            {filteredPrompts.length > 0 ? (
                <div className="space-y-6 max-w-4xl mx-auto">
                    {filteredPrompts.map(prompt => (
                        <PromptCard key={prompt.id} prompt={prompt} onUpdate={handleUpdatePrompt} onDelete={handleDeletePrompt} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-neutral-400 mt-8">{t('dashboard_empty')}</p>
            )}
        </div>
    );
};