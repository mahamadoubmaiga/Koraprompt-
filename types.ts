export enum Language {
  EN = 'en',
  FR = 'fr',
}

export type Page = 'home' | 'generator' | 'templates' | 'dashboard' | 'faq';

export type PromptType = 'video' | 'image';

export interface SavedPrompt {
  id: string;
  type: PromptType;
  prompts: string[];
  generator: string;
  userInput: string;
  date: string;
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
}