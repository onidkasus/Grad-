# Kako pokrenuti lokalno

## Preduvjeti
- **Node.js** (preporučeno v18+)
- **npm** (dolazi uz Node.js)
- **Ollama** (za lokalne AI modele)
  - Preuzmite i instalirajte s [https://ollama.com/download](https://ollama.com/download)
  - Ili koristite `brew install ollama` (macOS) ili slijedite upute za svoj OS
- **Model**: `deepseek-v3.2:cloud` (ili drugi kompatibilan model)

## Koraci
1. **Instalirajte ovisnosti**
   ```sh
   npm install
   ```
2. **Pokrenite Ollama server**
   ```sh
   ollama run deepseek-v3.2:cloud
   ```
   - (Možete koristiti bilo koji kompatibilan model, ali ovaj je zadani u projektu.)
   - Provjerite da Ollama radi na `localhost:11434` (zadano).
3. **Pokrenite aplikaciju**
   ```sh
   npm run dev
   ```
   - Aplikacija će biti dostupna na [http://localhost:3000](http://localhost:3000)

## Napomene
- Ako Ollama nije pokrenuta, AI funkcionalnosti (asistent, fact check) neće raditi ili će prikazivati zamjenske poruke.
- Za produkciju ili cloud AI, ažurirajte proxy i BASE_URL u `vite.config.ts` i `aiService.ts`.
