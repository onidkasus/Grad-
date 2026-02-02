import { GoogleGenAI, Type } from "@google/genai";
import { CompanyData } from "../types";

export const verifyClaim = async (claim: string) => {
  if (!claim) return null;

  try {
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

export const searchCompany = async (query: string): Promise<{ data: CompanyData | null, sources: any[], error?: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: `Pronađi službene podatke za hrvatski poslovni subjekt: "${query}". 
      Tražim OIB, MBS, puni naziv, adresu, status, bonitet (procjena), financijske podatke za zadnje 3 godine (prihodi, dobit, zaposleni) i popis direktora.
      Odgovori ISKLJUČIVO u JSON formatu koji odgovara sučelju CompanyData.
      Ako ne pronađeš točne podatke, vrati null.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    const text = response.text?.trim();
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    if (text) {
      // Basic cleanup in case AI adds markdown blocks
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
      return { 
        data: JSON.parse(jsonStr) as CompanyData, 
        sources 
      };
    }
    return { data: null, sources: [] };
  } catch (error: any) {
    console.error("Company Search Error:", error);
    // Return error message to allow components to handle specific issues like "Requested entity was not found"
    return { data: null, sources: [], error: error.message || "Unknown error during search" };
  }
};
