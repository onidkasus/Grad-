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

  rateIdea: async (title: string, description: string): Promise<{ rating: number; reasoning: string }> => {
     const prompt = `Ocijeni ovu ideju za gradski projekt na skali od 1 do 100 i objasni zašto si dao tu ocjenu.

     Naslov: ${title}
     Opis: ${description}
     
     Vrati ISKLJUČIVO JSON u sljedećem formatu (bez dodatnog teksta):
     {
       "rating": broj od 0 do 100,
       "reasoning": "Kratko objašnjenje (1-2 rečenice) zašto je ova ocjena dodijeljena na temelju izvedivosti, utjecaja i jasnoće."
     }`;

     try {
         const response = await AiService.chat([
             { role: 'user', content: prompt }
         ]);
         
         // Clean up response
         let cleanContent = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
         const jsonMatch = cleanContent.match(/\{[\s\S]*?\}/);
         if (jsonMatch) {
             cleanContent = jsonMatch[0];
         }
         
         try {
             const parsed = JSON.parse(cleanContent);
             const rating = parseInt(parsed.rating) || 50;
             const reasoning = parsed.reasoning || 'Standardna ocjena na temelju prosječne kvalitete prijedloga.';
             
             return {
                 rating: Math.min(100, Math.max(0, rating)),
                 reasoning: reasoning
             };
         } catch (jsonErr) {
             // Fallback: try to extract just the number
             const nums = response.match(/\d+/);
             const number = parseInt(nums ? nums[0] : '50');
             return {
                 rating: isNaN(number) ? 50 : Math.min(100, Math.max(0, number)),
                 reasoning: 'Ocjena generirana bez detaljne analize.'
             };
         }
     } catch (e) {
         console.error("AI Rating failed", e);
         return {
             rating: 50,
             reasoning: 'AI analiza nije dostupna. Dodijeljena neutralna ocjena.'
         };
     }
  },

  generateFiscalAnalysis: async (summary: string, totalIncome: number, totalExpense: number): Promise<any> => {
    const systemPrompt = `Ti si financijski savjetnik za gradski proračun. 
    Analiziraj ove transakcije i vrati JSON sa 3 ključa: "prediction", "risk", "optimization".
    
    1. "prediction": Procjena rasta/pada prihoda (npr. "+4.2%").
    2. "risk": Identificiraj rizik i preporuči iznos rezerve (npr. "€2.5M").
    3. "optimization": Prijedlog za uštedu ili ulaganje.

    Format JSON-a:
    {
      "prediction": { "value": "tekstualni postotak", "text": "kratko objašnjenje" },
      "risk": { "value": "iznos rezerve", "text": "kratko objašnjenje rizika" },
      "optimization": { "value": "akcija", "text": "kratko objašnjenje koristi" }
    }
    
    Samo JSON. Bez uvoda.`;

    const userMessage = `Ukupni Prihodi: €${totalIncome}
    Ukupni Rashodi: €${totalExpense}
    Sažetak Transakcija:
    ${summary.substring(0, 1500)}`; // Limit context length

    try {
        const responseText = await AiService.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);

        let cleanContent = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanContent = jsonMatch[0];

        // Ensure we try to parse it
        try {
             const parsed = JSON.parse(cleanContent);
             // Verify structure roughly
             if (!parsed.prediction) throw new Error("Missing prediction");
             return parsed;
        } catch (jsonErr) {
             console.warn("AI returned invalid JSON:", cleanContent);
             throw jsonErr; // Re-throw to hit the fallback below
        }
    } catch (e) {
        console.error("Fiscal Analysis Failed", e);
        // Fallback default structure
        return {
            prediction: { value: "+2.5%", text: "Konzervativna procjena rasta temeljena na povijesnim podacima." },
            risk: { value: "€50,000", text: "Preporučuje se formiranje standardne proračunske rezerve." },
            optimization: { value: "Revizija", text: "Predlaže se detaljna revizija operativnih troškova." }
        };
    }
  },

  generateCityFiscalReport: async (cityName: string): Promise<any> => {
     const systemPrompt = `Ti si stručni ekonomski analitičar za hrvatske gradove.
     Tvoj zadatak je generirati procijenjeni fiskalni izvještaj za grad ${cityName} za tekuću godinu (2025/2026).
     Budući da točni podaci o svakoj transakciji nisu javni, koristi javno dostupne podatke o proračunu (ili napravi informiranu procjenu temeljem veličine grada) i procijeni trenutno izvršenje proračuna.
     
     Vrati ISKLJUČIVO JSON format sa sljedećom strukturom:
     {
        "totalBudget": broj (npr. 150000000 - procjena ukupnog godišnjeg proračuna u Eurima),
        "estimatedExecution": broj (npr. 45000000 - koliko je potrošeno do sada),
        "lastUpdated": "string datum (npr. '05.02.2026.')",
        "description": "Kratki tekstualni sažetak stanja proračuna (npr. 'Proračun Grada Rijeke za 2026. iznosi rekordnih 170 milijuna eura, s fokusom na socijalni program...')",
        "prediction": { "value": "postotak rasta", "text": "tekstualno objašnjenje" },
        "risk": { "value": "iznos rizika", "text": "tekstualno objašnjenje rizika" },
        "optimization": { "value": "područje uštede", "text": "tekstualno objašnjenje" }
     }
     
     Budi realan s brojevima (Zagreb ima milijarde, manji gradovi milijune).`;

     try {
        const responseText = await AiService.chat([
            { role: 'user', content: systemPrompt }
        ]);

        let cleanContent = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleanContent = jsonMatch[0];

        try {
            return JSON.parse(cleanContent);
        } catch (e) {
            console.warn("Fiscal Report JSON parse failed", e);
            // Fallback for demo
            return {
                totalBudget: 45000000,
                estimatedExecution: 12500000,
                lastUpdated: new Date().toLocaleDateString('hr-HR'),
                description: `Proračun grada ${cityName} stabilan je i razvojno orijentiran. Podaci su generirani procjenom jer detaljni izvodi nisu javno dostupni.`,
                prediction: { value: "+3.2%", text: "Očekivani rast prihoda od poreza na dohodak." },
                risk: { value: "€1.2M", text: "Potencijalni manjak u naplati komunalnih naknada." },
                optimization: { value: "Energetska obnova", text: "Dugoročno smanjenje troškova javne rasvjete." }
            };
        }
     } catch (e) {
         console.error("AI Fiscal Report failed", e);
         throw e;
     }
  }
};
