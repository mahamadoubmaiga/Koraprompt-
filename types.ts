export enum Language {
  EN = 'en',
  FR = 'fr',
}

export type Page = 'home' | 'generator' | 'explore' | 'dashboard' | 'faq' | 'profile';

export type PromptType = 'video' | 'image' | 'audio';

export interface User {
  id: string;
  email: string;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
}

export interface Preset {
  id: string;
  name: string;
  userId: string;
  settings: {
    generator: string;
    category: string;
    negativePrompt: string;
    creativity: string;
    aspectRatio: string;
  };
}

export interface PromptVersion {
  prompts: string[];
  date: string;
}

export interface SavedPrompt {
  id: string;
  type: PromptType;
  prompts: string[];
  versions: PromptVersion[];
  generator: string;
  userInput: string; 
  projectName: string; 
  date: string;
  generatedImage?: string;
  userId: string | null;
  folderId: string | null;
  isPublished: boolean;
}

export interface Generator {
    id: string;
    name: string;
    type: PromptType;
}

export interface Template {
    id: string;
    name: string;
    prompt: string;
    type: PromptType;
    category: string;
    generator: string;
    imageUrl: string;
}

export type RemixState = Omit<SavedPrompt, 'id' | 'date' | 'userId' | 'folderId' | 'isPublished' | 'versions'>;
