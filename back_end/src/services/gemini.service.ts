import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { admin } from '../config/firebase.js';

dotenv.config();

// Lazy reference to the Google Gen AI client
let ai: GoogleGenAI | null = null;
const getAiClient = () => {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. Gemini features may fail.");
        }
        // Fallback to a dummy key to prevent process crash on initialization if missing
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });
    }
    return ai;
};

export interface FaceMatchAuditResult {
    match_score: number; // 0 to 100
    ai_confidence: number;
    reasoning: string;
    status: 'PASSED' | 'FAILED' | 'MANUAL_REVIEW_REQUIRED';
}

/**
 * Compares an ID photo with a selfie photo using Gemini Vision Preview.
 * Expects image buffers as input.
 */
export const verifyIdentityPhotos = async (
    idPhotoBuffer: Buffer,
    idMimeType: string,
    selfieBuffer: Buffer,
    selfieMimeType: string
): Promise<FaceMatchAuditResult> => {
    try {
        const prompt = `You are an expert identity verification assistant for a KYC process.
Please compare the face on the official ID card with the live selfie photo provided. 
Analyze facial features carefully to determine if they are the same person.
Provide a JSON response with the following schema:
{
  "match_score": number (0 to 100 representing similarity),
  "ai_confidence": number (0 to 100 representing how confident you are in this analysis),
  "reasoning": string (explanation of your conclusion),
  "status": string (must be exactly 'PASSED', 'FAILED', or 'MANUAL_REVIEW_REQUIRED'. Use PASSED if score > 85, FAILED if score < 40, otherwise MANUAL_REVIEW_REQUIRED)
}`;

        const client = getAiClient();
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    role: 'user', parts: [
                        { text: prompt },
                        { inlineData: { data: idPhotoBuffer.toString('base64'), mimeType: idMimeType } },
                        { inlineData: { data: selfieBuffer.toString('base64'), mimeType: selfieMimeType } }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const rawText = response.text || "{}";
        const result: FaceMatchAuditResult = JSON.parse(rawText);
        return result;
    } catch (error) {
        console.error('Error verifying identity with Gemini:', error);
        throw new Error('Failed to run face match audit.');
    }
};
