import React, { useState, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { SavedPrompt, PromptVersion } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { GENERATORS } from '../constants';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ShareIcon } from './icons/ShareIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { FolderIcon } from './icons/FolderIcon';
import { PlusIcon } from './icons/PlusIcon';

// Reusable Modal Component
const Modal: React.FC<{ children: React.ReactNode; onClose: () => void; title: string }> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-neutral-800 w-full max-w-2xl rounded-lg shadow-xl border border-neutral-700" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button onClick={onClose} className="text-neutral-400 hover:text-white">&times;</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
    </div>
);


const VersionHistoryModal: React.FC<{ prompt: SavedPrompt; onClose: () => void; onRestore: (version: PromptVersion) => void }> = ({ prompt, onClose, onRestore }) => {
    const { t } = useTranslations();
    return (
        <Modal onClose={onClose} title={`${t('version_history_title')} "${prompt.projectName}"`}>
            <div className="space-y-4">
                {prompt.versions.map((version, index) => (
                    <div key={version.date} className="bg-neutral-900 p-4 rounded-md border border-neutral-700">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-neutral-400">
                                {new Date(version.date).toLocaleString()}
                                {index === 0 && <span className="ml-2 text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{t('current_version')}</span>}
                            </p>
                            {index > 0 && <button onClick={() => onRestore(version)} className="bg-brand-primary text-sm px-3 py-1 rounded-md hover:bg-brand-secondary">{t('restore_version')}</button>}
                        </div>
                        <div className="space-y-2">
                          {version.prompts.map((p, pIndex) => (
                              <div key={pIndex}>
                                {version.prompts.length > 1 && <h4 className="font-semibold text-brand-light text-sm mb-1">{t('scene_prefix')} {pIndex + 1}</h4>}
                                <p className="text-neutral-200 text-sm whitespace-pre-wrap">{p}</p>
                              </div>
                          ))}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

const PromptCard: React.FC<{ prompt: SavedPrompt, onUpdate: (prompt: SavedPrompt) => void, onDelete: (id: string) => void }> = ({ prompt, onUpdate, onDelete }) => {
    const { t } = useTranslations();
    const { folders } = useData();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(prompt.projectName);
    const [showHistory, setShowHistory] = useState(false);

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
    
    const handleTogglePublish = () => {
        onUpdate({ ...prompt, isPublished: !prompt.isPublished });
    };

    const handleMoveFolder = (folderId: string | null) => {
        onUpdate({ ...prompt, folderId });
    };
    
    const handleRestoreVersion = (version: PromptVersion) => {
        const newVersions = [version, ...prompt.versions.filter(v => v.date !== version.date)];
        onUpdate({ ...prompt, prompts: version.prompts, versions: newVersions });
        setShowHistory(false);
    };

    return (
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
             {showHistory && <VersionHistoryModal prompt={prompt} onClose={() => setShowHistory(false)} onRestore={handleRestoreVersion} />}
             <div className="flex flex-col md:flex-row md:space-x-4">
                {prompt.generatedImage && (
                    <div className="flex-shrink-0 w-full md:w-48 mb-4 md:mb-0">
                        <img src={prompt.generatedImage} alt={prompt.projectName} className="rounded-md object-cover w-full h-auto" />
                    </div>
                )}
                <div className="flex-grow">
                    {isEditing ? (
                        <div className="flex items-center space-x-2 mb-2">
                            <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-600 rounded-md p-2 text-white focus:ring-brand-primary focus:border-brand-primary" />
                            <button onClick={handleRename} className="bg-brand-primary px-3 py-2 rounded-md font-semibold text-sm">{t('save_button')}</button>
                            <button onClick={() => setIsEditing(false)} className="bg-neutral-600 px-3 py-2 rounded-md font-semibold text-sm">{t('cancel_button')}</button>
                        </div>
                    ) : (
                         <h3 className="font-bold text-lg mb-2 text-white flex items-center space-x-2">
                            <span>{prompt.projectName}</span>
                            {prompt.isPublished && <span className="text-xs font-semibold text-brand-light bg-brand-primary/20 px-2 py-0.5 rounded-full">{t('published_badge')}</span>}
                        </h3>
                    )}
                    
                    <div className="space-y-4">
                        {prompt.prompts.map((p, index) => (
                            <div key={index} className="bg-neutral-900 p-3 rounded-md">
                                {prompt.prompts.length > 1 && <h4 className="font-semibold text-brand-light mb-2">{t('scene_prefix')} {index + 1}</h4>}
                                <p className="text-white text-sm mb-3 whitespace-pre-wrap">{p}</p>
                                <button onClick={() => handleCopy(p, index)} className="flex items-center text-xs space-x-1.5 bg-neutral-700/50 hover:bg-neutral-700 px-2 py-1 rounded-md">
                                    {copiedIndex === index ? <CheckIcon className="w-3 h-3 text-green-400" /> : <ClipboardIcon className="w-3 h-3" />}
                                    <span>{copiedIndex === index ? t('copied_button') : t('copy_button')}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-neutral-700 mt-4 pt-3 flex flex-wrap gap-4 justify-between items-center">
                        <div className="text-xs text-neutral-400 flex items-center flex-wrap gap-2">
                            <span className="font-medium bg-brand-primary/20 text-brand-light px-2 py-1 rounded-full capitalize">{prompt.type}</span>
                             <select value={prompt.folderId || ''} onChange={e => handleMoveFolder(e.target.value || null)} className="bg-neutral-700 text-xs rounded px-2 py-1 border border-transparent hover:border-neutral-500">
                                <option value="">{t('move_to_folder')}</option>
                                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                {prompt.folderId && <option value="">(Remove from folder)</option>}
                            </select>
                        </div>
                        <div className="flex items-center space-x-1">
                             <button onClick={() => setIsEditing(true)} title={t('rename_button')} className="p-2 text-neutral-400 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                             <button onClick={() => setShowHistory(true)} title={t('history_button')} className="p-2 text-neutral-400 hover:text-white"><HistoryIcon className="w-4 h-4" /></button>
                             <button onClick={handleTogglePublish} title={prompt.isPublished ? t('unpublish_button') : t('publish_button')} className={`p-2 transition-colors ${prompt.isPublished ? 'text-brand-primary hover:text-brand-light' : 'text-neutral-400 hover:text-white'}`}><ShareIcon className="w-4 h-4" /></button>
                             <button onClick={() => onDelete(prompt.id)} title={t('delete_button')} className="p-2 text-neutral-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC = () => {
    const { t } = useTranslations();
    const { user } = useAuth();
    const { userPrompts, folders, addFolder, updatePrompt, deletePrompt } = useData();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');

    const handleAddFolder = () => {
        if(newFolderName.trim() && user) {
            addFolder({ name: newFolderName.trim(), userId: user.id });
            setNewFolderName('');
        }
    };
    
    const filteredPrompts = useMemo(() => {
        return userPrompts.filter(p => {
            const searchInput = searchQuery.toLowerCase();
            const inFolder = activeFolderId === null || p.folderId === activeFolderId;
            const matchesSearch = p.projectName.toLowerCase().includes(searchInput) || p.userInput.toLowerCase().includes(searchInput);
            return inFolder && matchesSearch;
        });
    }, [userPrompts, searchQuery, activeFolderId]);

    if (!user) return null;

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center mb-10">{t('dashboard_title')}</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                        <h2 className="text-lg font-semibold mb-3">Folders</h2>
                        <ul className="space-y-1">
                            <li><button onClick={() => setActiveFolderId(null)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFolderId === null ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{t('all_projects')}</button></li>
                            {folders.map(f => (
                                <li key={f.id}><button onClick={() => setActiveFolderId(f.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFolderId === f.id ? 'bg-brand-primary text-white' : 'hover:bg-neutral-700'}`}>{f.name}</button></li>
                            ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-neutral-700">
                            <div className="flex items-center space-x-2">
                                <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder={t('new_folder_placeholder')} className="w-full bg-neutral-900 border border-neutral-600 text-sm rounded-md p-2" />
                                <button onClick={handleAddFolder} className="bg-brand-primary p-2 rounded-md"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="flex-grow">
                    <div className="mb-6">
                         <input
                             type="text"
                             placeholder={t('search_placeholder')}
                             value={searchQuery}
                             onChange={e => setSearchQuery(e.target.value)}
                             className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white focus:ring-brand-primary focus:border-brand-primary transition"
                         />
                    </div>
                    {filteredPrompts.length > 0 ? (
                        <div className="space-y-6">
                            {filteredPrompts.map(prompt => (
                                <PromptCard key={prompt.id} prompt={prompt} onUpdate={updatePrompt} onDelete={deletePrompt} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-neutral-800/50 rounded-lg border border-neutral-700">
                            <FolderIcon className="w-16 h-16 mx-auto text-neutral-600" />
                            <p className="text-neutral-400 mt-4">{t('dashboard_empty')}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};