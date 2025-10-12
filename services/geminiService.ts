
import { GoogleGenAI } from "@google/genai";
import { PromptType } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

export const generatePrompt = async (
    idea: string,
    type: PromptType,
    generator: string,
    category: string,
    language: 'en' | 'fr',
    negativePrompt: string,
    temperature: number,
    topP: number,
    aspectRatio: string | null
): Promise<string> => {
    if (!API_KEY) {
        return new Promise(resolve => setTimeout(() => resolve(`This is a mock response for a ${type} prompt about "${idea}" for the ${generator} generator in the ${category} category. The style is highly detailed and cinematic. (This is a placeholder as API key is not configured)`), 1000));
    }

    const languageInstruction = language === 'fr' ? 'The final prompt must be in French.' : 'The final prompt must be in English.';

    const systemInstruction = `You are a world-class prompt engineering expert for AI ${type} generators. 
    Your task is to take a user's simple idea and transform it into a highly detailed, rich, and optimized prompt tailored for a specific AI generator.
    The prompt should be descriptive, evocative, and include specific technical details relevant to the generator and media type.
    For video, include cues for camera movement, lighting, sound design, and mood.
    For images, include details about composition, art style, lighting, and technical parameters like aspect ratio if relevant.
    You must ONLY output the final prompt text. Do not include any introductory phrases, explanations, or markdown formatting. Just the raw, ready-to-use prompt.
    ${languageInstruction}
    `;

    let userPrompt = `
    User Idea: "${idea}"
    AI Generator: ${generator}
    Category: ${category}
    Media Type: ${type}
    `;

    if (negativePrompt) {
        userPrompt += `\nNegative Prompt (things to avoid): "${negativePrompt}"`;
    }
    if (aspectRatio) {
        userPrompt += `\nAspect Ratio: ${aspectRatio}`;
    }

    userPrompt += `\n\nGenerate the expert-level prompt based on these details.`;

    if (aspectRatio) {
        userPrompt += ` The final prompt should include a parameter for the aspect ratio if the generator supports it (e.g., '--ar ${aspectRatio}' for MidJourney).`;
    }


    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature,
                topP,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating prompt with Gemini:", error);
        return "An error occurred while generating the prompt. Please check your API key and try again.";
    }
};
