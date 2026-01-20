/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";
import { GenerateParams, Message } from '../types';

export const generateResponse = async (params: GenerateParams): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. Construct the history for the model
    // The Gemini API expects an array of contents with 'role' and 'parts'.
    // role: 'user' or 'model'
    const contents: any[] = [];

    // Add previous history if available
    if (params.history && params.history.length > 0) {
        params.history.forEach((msg: Message) => {
            const role = msg.role === 'user' ? 'user' : 'model';
            
            const parts: any[] = [];
            
            // Add images if they exist in history (only for user messages usually)
            if (msg.images && msg.images.length > 0) {
                 msg.images.forEach(img => {
                    parts.push({
                        inlineData: {
                            mimeType: img.mimeType,
                            data: img.base64
                        }
                    });
                 });
            }

            parts.push({ text: msg.content });

            contents.push({
                role: role,
                parts: parts
            });
        });
    }

    // 2. Add the *current* prompt
    const currentParts: any[] = [];
    if (params.image) {
        currentParts.push({
            inlineData: {
                mimeType: params.image.mimeType,
                data: params.image.base64,
            },
        });
    }
    currentParts.push({ text: params.prompt });

    contents.push({
        role: 'user',
        parts: currentParts
    });

    try {
        const response = await ai.models.generateContent({
            model: params.model,
            contents: contents, // Send full conversation
            config: {
                systemInstruction: "You are NEXA AI, a helpful, intelligent, and professional AI assistant. You answer concisely, use markdown for formatting, and are helpful.",
            }
        });
        return response.text || "";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        
        let errorMessage = error.message || "Unknown error occurred";
        if (typeof errorMessage === 'string' && (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED"))) {
             throw new Error("Quota limit reached. Please try 'Gemini 2.5 Flash' or check your billing.");
        }
        
        throw error;
    }
};

export const enhanceUserPrompt = async (originalPrompt: string, model: string): Promise<string> => {
    if (!originalPrompt.trim()) return "";
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                role: 'user',
                parts: [{ text: `You are an expert prompt engineer. Your goal is to rewrite the user's raw prompt into a highly structured, clear, and professional version optimized for LLMs. 
                
                Guidelines:
                1. Clarify the intent.
                2. Add necessary context if implied.
                3. Structure complex requests with bullet points or steps.
                4. Maintain the original meaning.
                5. Output ONLY the rewritten prompt.

                Original Prompt: "${originalPrompt}"` }]
            }
        });
        return response.text?.trim() || originalPrompt;
    } catch (error) {
        console.error("Enhance Prompt Error:", error);
        return originalPrompt; // Fallback to original if error
    }
}

export const generateScript = generateResponse;