import { CompanyData } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Configuration for the AI Service
// If using the "OllamaFreeAPI" python wrapper, find the exposed URL (often localhost:11434 if bridging to local ollama, 
// or a specific forwarded port) and update BASE_URL.
// For DeepSeek R1 via standard Ollama (Using Vite Proxy to avoid CORS):
const BASE_URL = '/api/ollama/chat'; 
const MODEL_NAME = 'deepseek-v3.2:cloud';

export const AiService = {
  /**
   * Sends a chat message to the LLM and returns the response.
   */
  chat: async (messages: ChatMessage[]): Promise<string> => {
    try {
      console.log(`Sending request to ${BASE_URL} with model ${MODEL_NAME}`);
      
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: messages,
          stream: false // For simplicity in this implementation
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let content = data.message?.content || "No response content.";
      
      // Clean up <think> blocks from DeepSeek
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      return content;
    } catch (error) {
      console.error("AI Service Connection Failed:", error);
      
      // Fallback for demo purposes if local Ollama is not running
      // This ensures the UI doesn't break, but warns the user.
      if (messages.some(m => m.content.toLowerCase().includes('fact check') || m.content.toLowerCase().includes('provjeri'))) {
        return JSON.stringify({
            verdict: 'Unverified',
            confidence: 0,
            explanation: `Nisam uspio kontaktirati AI model (${MODEL_NAME} na ${BASE_URL}). Molim provjerite je li Ollama pokrenuta.`,
            sources: []
        });
      }
      
      return `⚠️ Sustav nije uspio kontaktirati lokalni AI model (${MODEL_NAME}).\n\nProvjerite je li "Ollama" pokrenuta lokalno i imate li model "${MODEL_NAME}" instaliran naredbom:\n\`ollama run ${MODEL_NAME}\`\n\n(Greška: ${error instanceof Error ? error.message : 'Unknown'})`;
    }
  },

  /**
   * Specialized method for Fact Checking that enforces JSON output.
   */
  verifyClaim: async (claim: string): Promise<any> => {
    const systemPrompt = `Ti si stručni provjeravatelj informacija (Fact Checker) za hrvatske pametne gradove.
    Tvoj zadatak je analizirati tvrdnju i vratiti ISKLJUČIVO valjani JSON (bez markdowna, bez uvoda).
    
    JSON struktura:
    {
      "verdict": "Verified" | "Misleading" | "Unverified",
      "confidence": broj 0-100,
      "explanation": "Kratko objašnjenje na hrvatskom jeziku (max 2 rečenice).",
      "sources": ["Izvor 1", "Izvor 2"]
    }
    
    Ako ne znaš odgovor ili nemaš podatke, stavi verdict "Unverified" i confidence 0.`;

    const userMessage = `Tvrdnja: "${claim}"`;

    try {
        const responseText = await AiService.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);

        console.log("Raw AI Response:", responseText);

        // 1. Remove <think> blocks common in DeepSeek/Reasoning models
        let cleanContent = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        // 2. Extract JSON if wrapped in markdown
        const jsonMatch = cleanContent.match(/```json\n([\s\S]*?)\n```/) || cleanContent.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            cleanContent = jsonMatch[1];
        }

        // 3. Last resort: Find the first '{' and last '}'
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
        }

        try {
            return JSON.parse(cleanContent);
        } catch (e) {
            console.warn("AI JSON Parse Error, attempting manual fix", cleanContent);
            // Simple robust fallback
            if (cleanContent.includes("Verified")) return { verdict: 'Verified', confidence: 90, explanation: "AI verified (Manual Parse)", sources: [] };
            if (cleanContent.includes("Misleading")) return { verdict: 'Misleading', confidence: 80, explanation: "AI Found Misleading (Manual Parse)", sources: [] };
            if (cleanContent.includes("Unverified")) return { verdict: 'Unverified', confidence: 0, explanation: "AI Could not Verify (Manual Parse)", sources: [] };
            
            // If we have any text, return it as explanation even if JSON failed
            if (cleanContent.length > 10) {
                 return { verdict: 'Unverified', confidence: 50, explanation: cleanContent.substring(0, 150) + "...", sources: [] };
            }
            
            throw e;
        }

    } catch (error) {
        return {
            verdict: 'Unverified',
            confidence: 0,
            explanation: 'Greška pri spajanju na AI servis. Provjerite konzolu.',
            sources: []
        };
    }
  },

  rateIdea: async (title: string, description: string): Promise<number> => {
     const prompt = `Ocijeni ovu ideju za gradski projekt na skali od 1 do 100 na temelju izvedivosti (feasibility), utjecaja (impact) i jasnoće (clarity).
     
     Naslov: ${title}
     Opis: ${description}
     
     Vrati ISKLJUČIVO samo jedan broj (0-100). Ništa drugo.`;

     try {
         const response = await AiService.chat([
             { role: 'user', content: prompt }
         ]);
         
         const nums = response.match(/\d+/);
         const number = parseInt(nums ? nums[0] : '50');
         return isNaN(number) ? 50 : Math.min(100, Math.max(0, number));
     } catch (e) {
         console.error("AI Rating failed", e);
         return 50; // Neutral fallback
     }
  }
};
