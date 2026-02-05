<!-- TECHNOLOGIJE KORIŠTENE U PROJEKTU -->
<div align="center">
	<code><img width="50" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPznwv7OeqDgGjrlZfT28XyX4J9oJyZ9TYwg&s" alt="Motion" title="Motion"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/firebase.png" alt="Firebase" title="Firebase"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/vite.png" alt="Vite" title="Vite"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/typescript.png" alt="TypeScript" title="TypeScript"/></code>
   <code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/tailwind_css.png" alt="Tailwind CSS" title="Tailwind CSS"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/tailwind_css.png" alt="Tailwind CSS" title="Tailwind CSS"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/react.png" alt="React" title="React"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/node_js.png" alt="Node.js" title="Node.js"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/npm.png" alt="npm" title="npm"/></code>
   <code><img width="50" src="https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/ollama.png" alt="Ollama" title="Ollama"/></code>
</div>

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
