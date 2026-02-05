<!-- TECHNOLOGIJE KORIŠTENE U PROJEKTU -->
<p align="left">
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/nodejs.svg" alt="Node.js" title="Node.js" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/npm.svg" alt="npm" title="npm" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/react.svg" alt="React" title="React" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/typescript.svg" alt="TypeScript" title="TypeScript" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/tailwindcss.svg" alt="Tailwind CSS" title="Tailwind CSS" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/firebase.svg" alt="Firebase" title="Firebase" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/vite.svg" alt="Vite" title="Vite" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/ollama.svg" alt="Ollama" title="Ollama" height="32"/>
  <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/framer.svg" alt="Framer Motion" title="Framer Motion" height="32"/>
</p>

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
