import { GoogleGenAI, Type } from "@google/genai";
import { PromptType } from "../types";

// Adhere to guideline: Initialize directly and assume API_KEY is present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getMediaTypeDescription = (type: PromptType): string => {
    switch (type) {
        case 'video':
            return 'AI video generators';
        case 'image':
            return 'AI image generators';
        case 'audio':
            return 'AI music and audio generators';
        default:
            return 'AI generators';
    }
};

const getPromptGuidelines = (type: PromptType): string => {
    switch (type) {
        case 'video':
            return 'Include details about cinematography, camera movements, lighting, atmosphere, pacing, and visual style. Consider shot composition, transitions, and mood.';
        case 'image':
            return 'Include details about composition, lighting, color palette, artistic style, camera angle, and visual atmosphere. Consider texture, mood, and artistic references.';
        case 'audio':
            return 'Include details about genre, tempo (BPM), mood, instruments, vocals (if any), production style, song structure, and overall vibe. Consider dynamics, energy level, and musical references.';
        default:
            return '';
    }
};

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
    const languageInstruction = language === 'fr' ? 'The final prompt(s) must be in French.' : 'The final prompt(s) must be in English.';
    const isSequence = promptCount > 1;
    const mediaTypeDesc = getMediaTypeDescription(type);
    const promptGuidelines = getPromptGuidelines(type);

    let systemInstruction: string;
    let userPrompt = `
    AI Generator: ${generator}
    Category/Genre: ${category}
    Media Type: ${type}
    `;

    if (isSequence) {
        const sequenceLabel = type === 'audio' ? 'tracks/sections' : 'scenes/prompts';
        systemInstruction = `You are a world-class creative director and prompt engineering expert for ${mediaTypeDesc}.
        Your task is to take a user's idea and break it down into ${promptCount} coherent ${sequenceLabel}. 
        Each prompt should be detailed, rich, and optimized for the specified AI generator, building upon the previous one to create a logical sequence.
        ${promptGuidelines}
        You must ONLY output a JSON array of strings, where each string is a complete, ready-to-use prompt. Do not include any other text or markdown.
        ${languageInstruction}`;
        userPrompt += `\nCreative Idea: "${idea}"\nBreak this down into ${promptCount} prompts.`;
    } else {
        systemInstruction = `You are a world-class prompt engineering expert for ${mediaTypeDesc}. 
        Your task is to take a user's simple idea and transform it into a highly detailed, rich, and optimized prompt tailored for a specific AI generator.
        ${promptGuidelines}
        The prompt should be descriptive, evocative, and include specific technical details relevant to the generator and media type.
        You must ONLY output the final prompt text. Do not include any introductory phrases, explanations, or markdown formatting. Just the raw, ready-to-use prompt.
        ${languageInstruction}`;
        userPrompt += `\nUser Idea: "${idea}"`;
    }

    if (negativePrompt) {
        userPrompt += `\nNegative Prompt (things to avoid in all prompts): "${negativePrompt}"`;
    }
    // Aspect ratio only applies to image generation - video and audio don't use this parameter
    if (aspectRatio && type === 'image') {
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
                // Add trim() to handle potential whitespace from API response.
                const jsonStr = response.text.trim();
                return JSON.parse(jsonStr);
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

export const generateImageFromPrompt = async (prompt: string, aspectRatio: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Failed to generate image.");
    }
};


export const generatePromptFromImage = async (base64Image: string, mimeType: string, language: 'en' | 'fr'): Promise<string> => {
    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image.split(',')[1],
      },
    };

    const languageInstruction = language === 'fr' ? 'Describe the image in French.' : 'Describe the image in English.';

    const textPart = {
      text: `Analyze this image in detail. Describe the subject, setting, style, composition, colors, and lighting to create a detailed and evocative text prompt for an AI image generator. ${languageInstruction}`
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch(error) {
        console.error("Error generating prompt from image:", error);
        throw new Error("Failed to analyze image.");
    }
};