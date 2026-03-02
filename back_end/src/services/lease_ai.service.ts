import { GoogleGenAI } from '@google/genai';
import { db } from '../config/firebase.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates a real estate lease agreement in Markdown using Gemini Legal Architect.
 */
export const generateLeaseAgreement = async (
    propertyDetails: any,
    tenantDetails: any,
    landlordDetails: any,
    negotiationPoints: string[] = []
): Promise<string> => {
    try {
        const prompt = `You are a legal expert AI architect specializing in Nigerian tenancy laws.
Draft a professional lease agreement in Markdown format.
Use the following details:
- Property: ${propertyDetails.title}, Address: ${propertyDetails.address}, Rent: ₦${propertyDetails.price}
- Landlord: ${landlordDetails.full_name}, Email: ${landlordDetails.email}
- Tenant: ${tenantDetails.full_name}, Email: ${tenantDetails.email}
- Additional Negotiation Points: ${negotiationPoints.join(', ') || 'Standard terms.'}

Ensure the lease includes standard clauses for maintenance, subletting restrictions, and termination. Format the output cleanly in Markdown. Do not include any JSON wrapping.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Pro model for legal reasoning
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        return response.text || "Failed to generate lease agreement.";
    } catch (error) {
        console.error('Error generating lease agreement with Gemini:', error);
        throw new Error('Legal AI Service failed.');
    }
};
