
import React, { useState } from 'react';
import { AiService } from '../services/aiService';

interface SupportChatProps {
  primaryColor: string;
}

const SupportChat: React.FC<SupportChatProps> = ({ primaryColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Pozdrav! Ja sam vaš Građani+ AI asistent. Kako vam mogu pomoći s digitalnim gradskim uslugama?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const responseText = await AiService.chat([
        { role: 'system', content: `Korisnik pita o platformi Građani+ za pametne gradove u Hrvatskoj. Budi kratak, profesionalan i uslužan na hrvatskom jeziku.` },
        { role: 'user', content: userMsg }
      ]);
      
      setMessages(prev => [...prev, { role: 'bot', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Trenutno imam tehničkih poteškoća. Provjerite lokalni AI servis.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div data-tour="ai-chat" className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-4 flex items-center gap-3 text-white" style={{ backgroundColor: primaryColor }}>
            <span className="material-icons-round">smart_toy</span>
            <span className="font-black text-sm uppercase tracking-widest">Gradska Podrška</span>
            <button onClick={() => setIsOpen(false)} className="ml-auto opacity-70 hover:opacity-100">
               <span className="material-icons-round">close</span>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                  m.role === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-blue-50 text-blue-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-gray-400 font-bold animate-pulse">Asistent piše...</div>}
          </div>
          <div className="p-3 border-t border-gray-50 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Postavite pitanje..."
              className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-xs outline-none border border-transparent focus:border-blue-200"
            />
            <button onClick={handleSend} className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
               <span className="material-icons-round text-sm">send</span>
            </button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
        style={{ backgroundColor: primaryColor }}
      >
        <span className="material-icons-round text-3xl">{isOpen ? 'close' : 'chat'}</span>
      </button>
    </div>
  );
};

export default SupportChat;
