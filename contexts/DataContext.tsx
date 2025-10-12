import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { SavedPrompt, Folder, Preset, PromptVersion } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  prompts: SavedPrompt[];
  folders: Folder[];
  presets: Preset[];
  addPrompt: (prompt: Omit<SavedPrompt, 'id'>) => void;
  updatePrompt: (prompt: SavedPrompt) => void;
  deletePrompt: (id: string) => void;
  addFolder: (folder: Omit<Folder, 'id'>) => void;
  addPreset: (preset: Omit<Preset, 'id' | 'userId'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper functions to interact with localStorage
const getStorage = <T,>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setStorage = <T,>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    if (user) {
      const allPrompts = getStorage<SavedPrompt>('kora-prompts');
      setPrompts(allPrompts.filter(p => p.userId === user.id));

      const allFolders = getStorage<Folder>('kora-folders');
      setFolders(allFolders.filter(f => f.userId === user.id));

      const allPresets = getStorage<Preset>('kora-presets');
      setPresets(allPresets.filter(p => p.userId === user.id));
    } else {
      setPrompts([]);
      setFolders([]);
      setPresets([]);
    }
  }, [user]);

  const addPrompt = (promptData: Omit<SavedPrompt, 'id'>) => {
    const allPrompts = getStorage<SavedPrompt>('kora-prompts');
    const newPrompt = { ...promptData, id: `prompt_${Date.now()}` };
    const updatedPrompts = [newPrompt, ...allPrompts];
    setStorage('kora-prompts', updatedPrompts);
    if(user) setPrompts(prev => [newPrompt, ...prev]);
  };

  const updatePrompt = (updatedPrompt: SavedPrompt) => {
    const allPrompts = getStorage<SavedPrompt>('kora-prompts');
    const updatedAllPrompts = allPrompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p);
    setStorage('kora-prompts', updatedAllPrompts);
     if(user) setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
  };
  
  const deletePrompt = (id: string) => {
    const allPrompts = getStorage<SavedPrompt>('kora-prompts');
    const updatedAllPrompts = allPrompts.filter(p => p.id !== id);
    setStorage('kora-prompts', updatedAllPrompts);
    if(user) setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const addFolder = (folderData: Omit<Folder, 'id'>) => {
    const allFolders = getStorage<Folder>('kora-folders');
    const newFolder = { ...folderData, id: `folder_${Date.now()}` };
    const updatedFolders = [newFolder, ...allFolders];
    setStorage('kora-folders', updatedFolders);
    if(user) setFolders(prev => [newFolder, ...prev]);
  };

  const addPreset = (presetData: Omit<Preset, 'id' | 'userId'>) => {
      if(!user) return;
      const allPresets = getStorage<Preset>('kora-presets');
      const newPreset = { ...presetData, id: `preset_${Date.now()}`, userId: user.id };
      const updatedPresets = [newPreset, ...allPresets];
      setStorage('kora-presets', updatedPresets);
      setPresets(prev => [newPreset, ...prev]);
  };
  
  // This provides all prompts for the explore page, regardless of user
  const publicPrompts = getStorage<SavedPrompt>('kora-prompts');

  return (
    <DataContext.Provider value={{ prompts: user ? prompts : publicPrompts, folders, presets, addPrompt, updatePrompt, deletePrompt, addFolder, addPreset }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
