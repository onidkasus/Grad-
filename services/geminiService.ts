
import { GoogleGenAI } from "@google/genai";

export const verifyClaim = async (claim: string) => {
  if (!claim) return null;

  try {
    // Initializing a fresh instance for each call to ensure environment-provided API keys are correctly picked up
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Molim te analiziraj sljedeću tvrdnju o pametnim gradovima u Hrvatskoj: "${claim}". 
      Daj mi stručnu provjeru činjenica (fact-check). 
      Formatiraj odgovor kao JSON sa sljedećim poljima: 
      verdict (String - 'Verified', 'Misleading', 'Unverified'), 
      confidence (Number 0-100), 
      explanation (String - detaljno objašnjenje na hrvatskom), 
      sources (Array of Strings).`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      verdict: 'Unverified',
      confidence: 0,
      explanation: 'Došlo je do greške prilikom analize AI modelom.',
      sources: []
    };
  }
};
