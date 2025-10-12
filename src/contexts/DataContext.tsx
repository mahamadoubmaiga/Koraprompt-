import React, { createContext, useState, useEffect, ReactNode, useContext, useMemo } from 'react';
import { SavedPrompt, Folder, Preset } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  userPrompts: SavedPrompt[];
  publicPrompts: SavedPrompt[];
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
  
  const [allPrompts, setAllPrompts] = useState<SavedPrompt[]>(() => getStorage<SavedPrompt>('kora-prompts'));
  const [folders, setFolders] = useState<Folder[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    if (user) {
      const allFolders = getStorage<Folder>('kora-folders');
      setFolders(allFolders.filter(f => f.userId === user.id));

      const allPresets = getStorage<Preset>('kora-presets');
      setPresets(allPresets.filter(p => p.userId === user.id));
    } else {
      setFolders([]);
      setPresets([]);
    }
  }, [user]);

  const userPrompts = useMemo(() => {
    if (!user) return [];
    return allPrompts.filter(p => p.userId === user.id);
  }, [user, allPrompts]);

  const publicPrompts = useMemo(() => {
    return allPrompts.filter(p => p.isPublished);
  }, [allPrompts]);

  const addPrompt = (promptData: Omit<SavedPrompt, 'id'>) => {
    const newPrompt = { ...promptData, id: `prompt_${Date.now()}` };
    const updatedPrompts = [newPrompt, ...allPrompts];
    setAllPrompts(updatedPrompts);
    setStorage('kora-prompts', updatedPrompts);
  };

  const updatePrompt = (updatedPrompt: SavedPrompt) => {
    const updatedAllPrompts = allPrompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p);
    setAllPrompts(updatedAllPrompts);
    setStorage('kora-prompts', updatedAllPrompts);
  };
  
  const deletePrompt = (id: string) => {
    const updatedAllPrompts = allPrompts.filter(p => p.id !== id);
    setAllPrompts(updatedAllPrompts);
    setStorage('kora-prompts', updatedAllPrompts);
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
  
  return (
    <DataContext.Provider value={{ userPrompts, publicPrompts, folders, presets, addPrompt, updatePrompt, deletePrompt, addFolder, addPreset }}>
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