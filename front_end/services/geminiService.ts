
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

/**
 * Advanced AI Search Consultant
 * Conducts a deep lifestyle interview to find exactly the top 2 matches.
 */
export const runAIConciergeSession = async (history: {role: 'user' | 'model', text: string}[]): Promise<{question: string, profileFound?: string}> => {
  try {
    const ai = getAiClient();
    const prompt = `You are a friendly Real Estate Matchmaker. Conduct a deep interview to find a perfect property or land match.
    Ask about:
    - Daily routine and commute needs.
    - Remote work vs office requirements.
    - Lifestyle (Gyms, nightlife, quiet areas, schools).
    - Long term goals (Investing in land vs renting a luxury pad).
    
    Current History:
    ${history.map(h => `${h.role}: ${h.text}`).join('\n')}

    Rules:
    1. If you've asked at least 3 intelligent questions and understand their profile, summarize it in 'profileFound'.
    2. Otherwise, ask a probing question in 'question'.
    
    Return JSON: { "question": "string", "profileFound": "string or null" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { question: "What's the one thing that would make you fall in love with a new location?" };
  }
};

/**
 * Voice Search Parser
 */
export const processVoiceSearch = async (transcript: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract real estate search parameters from this voice transcript: "${transcript}". 
      Return a single short string summarizing Category, Location, Budget, and Key Features.`,
    });
    return response.text || transcript;
  } catch (e) {
    return transcript;
  }
};

export const analyzePropertyImage = async (base64Images: string[]): Promise<any> => {
  try {
    const ai = getAiClient();
    const prompt = `Analyze these real estate photos. Provide a high-end listing details.
    Return JSON with:
    - style: Elegant name (e.g. Modern Minimalist Loft)
    - category: (RESIDENTIAL, LAND, COMMERCIAL, or EVENT_CENTER)
    - condition: (e.g. Brand New)
    - features: List 6 clear highlights.
    - description: A warm marketing text.
    - neighborhoodDescription: A friendly description of the area's vibe.
    - nearbyAttractions: List 3 nearby points of interest (Malls, Parks, etc)
    - suggestedPrice: Monthly Naira amount`;

    const parts = base64Images.map(img => ({ inlineData: { mimeType: 'image/jpeg', data: img } }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [...parts, { text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
};

export const calculateMatchScore = async (preferences: string, property: any): Promise<{ score: number, reason: string }> => {
  try {
    const ai = getAiClient();
    const prompt = `Compare these tenant needs with this property data.
    Needs: "${preferences}"
    Property: ${JSON.stringify(property)}
    Return JSON: { "score": number, "reason": "A short, friendly explanation of why this matches" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return response.text ? JSON.parse(response.text) : { score: 85, reason: "A great fit for your goals." };
  } catch (e) {
    return { score: 80, reason: "Matches your basic criteria." };
  }
};

export const generateSmartReplies = async (messages: {text: string, isMe: boolean}[]): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest 3 short replies: ${messages.map(m => (m.isMe ? "Me: " : "Other: ") + m.text).join(' | ')}`,
            config: { 
              responseMimeType: 'application/json',
              responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return response.text ? JSON.parse(response.text) : ["Interested", "Can I see it?", "More info"];
    } catch (error) {
        return ["Interested", "Can I see it?", "Tell me more."];
    }
};

export const generateLeaseAgreement = async (tenantName: string, landlordName: string, propertyAddress: string, price: number): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Draft a clear lease for: ${tenantName} & ${landlordName} at ${propertyAddress} for ₦${price}.`,
        });
        return response.text || "Lease Drafted.";
    } catch (e) {
        return "Standard Lease Agreement";
    }
};
