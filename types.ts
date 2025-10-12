export enum Language {
  EN = 'en',
  FR = 'fr',
}

export type Page = 'home' | 'generator' | 'explore' | 'dashboard' | 'faq';

export type PromptType = 'video' | 'image';

export interface SavedPrompt {
  id: string;
  type: PromptType;
  prompts: string[];
  generator: string;
  userInput: string; // The original idea
  projectName: string; // User-editable name, defaults to userInput
  date: string;
  generatedImage?: string; // Base64 string of the generated image
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