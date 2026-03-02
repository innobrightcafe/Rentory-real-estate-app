import { GoogleGenAI } from '@google/genai';
import { db } from '../config/firebase.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PropertyIngestionResult {
    title: string;
    description: string;
    neighborhood_description: string;
    amenities: string[];
    suggested_price: number;
}

/**
 * Analyzes up to 10 property photos using Gemini Multimodal to extract details.
 */
export const analyzePropertyImages = async (
    imageBuffers: { buffer: Buffer; mimeType: string }[]
): Promise<PropertyIngestionResult> => {
    try {
        const prompt = `You are a real estate expert AI orchestrator for the Rentory platform. 
Examine the following property photos and extract the following information. Return ONLY valid JSON matching this schema:
{
  "title": string (A catchy and accurate title for the property),
  "description": string (A detailed description of the property features based on the images),
  "neighborhood_description": string (A vibrant description of the vibe, assume it is empty if not visible),
  "amenities": string[] (List of amenities visible in the photos like "Swimming pool", "AC", "Balcony", etc.),
  "suggested_price": number (Numeric value representing a suggested monthly rent in NGN based on the luxury and quality of the space)
}
No markdown formatting, just pure JSON.`;

        const parts = [
            { text: prompt },
            ...imageBuffers.map((img) => ({
                inlineData: { data: img.buffer.toString('base64'), mimeType: img.mimeType }
            }))
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts }],
            config: {
                responseMimeType: "application/json",
            }
        });

        const rawText = response.text || "{}";
        const result: PropertyIngestionResult = JSON.parse(rawText);
        return result;
    } catch (error) {
        console.error('Error analyzing property images with Gemini:', error);
        throw new Error('Failed to analyze property images.');
    }
};
