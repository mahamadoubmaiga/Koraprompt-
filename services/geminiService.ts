import { GoogleGenAI, Type } from "@google/genai";
import { PromptType } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

export const generatePrompts = async (
    idea: string,
    type: PromptType,
    generator: string,
    category: string,
    language: 'en' | 'fr',
    negativePrompt: string,
    temperature: number,
    topP: number,
    aspectRatio: string | null,
    promptCount: number = 1
): Promise<string[]> => {
    if (!API_KEY) {
        const mockPrompts = Array.from({ length: promptCount }, (_, i) => 
            `Scene ${i + 1}: This is a mock response for a ${type} prompt about "${idea}" for the ${generator} generator in the ${category} category. The style is highly detailed and cinematic. (This is a placeholder as API key is not configured)`
        );
        return new Promise(resolve => setTimeout(() => resolve(mockPrompts), 1000));
    }

    const languageInstruction = language === 'fr' ? 'The final prompt(s) must be in French.' : 'The final prompt(s) must be in English.';
    const isSequence = promptCount > 1;

    let systemInstruction: string;
    let userPrompt = `
    AI Generator: ${generator}
    Category: ${category}
    Media Type: ${type}
    `;

    if (isSequence) {
        systemInstruction = `You are a world-class scriptwriter and prompt engineering expert for AI ${type} generators.
        Your task is to take a user's story idea and break it down into ${promptCount} coherent scenes/prompts. 
        Each prompt should be detailed, rich, and optimized for the specified AI generator, building upon the previous one to create a logical sequence.
        You must ONLY output a JSON array of strings, where each string is a complete, ready-to-use prompt. Do not include any other text or markdown.
        ${languageInstruction}`;
        userPrompt += `\nStory Idea: "${idea}"\nBreak this down into ${promptCount} prompts.`;
    } else {
        systemInstruction = `You are a world-class prompt engineering expert for AI ${type} generators. 
        Your task is to take a user's simple idea and transform it into a highly detailed, rich, and optimized prompt tailored for a specific AI generator.
        The prompt should be descriptive, evocative, and include specific technical details relevant to the generator and media type.
        You must ONLY output the final prompt text. Do not include any introductory phrases, explanations, or markdown formatting. Just the raw, ready-to-use prompt.
        ${languageInstruction}`;
        userPrompt += `\nUser Idea: "${idea}"`;
    }

    if (negativePrompt) {
        userPrompt += `\nNegative Prompt (things to avoid in all prompts): "${negativePrompt}"`;
    }
    if (aspectRatio) {
        userPrompt += `\nAspect Ratio: ${aspectRatio}. If the generator supports it (e.g., MidJourney), include the aspect ratio parameter (like '--ar ${aspectRatio}') in the prompt(s).`;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature,
                topP,
                ...(isSequence && {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                            description: 'A single, complete, and optimized prompt for an AI generator.'
                        }
                    }
                })
            }
        });
        
        if (isSequence) {
            try {
                return JSON.parse(response.text);
            } catch (e) {
                console.error("Failed to parse JSON response for sequence:", response.text);
                return ["Error: The AI returned an invalid format for the prompt sequence. Please try again."];
            }
        } else {
            return [response.text];
        }

    } catch (error) {
        console.error("Error generating prompt with Gemini:", error);
        return ["An error occurred while generating the prompt. Please check your API key and try again."];
    }
};