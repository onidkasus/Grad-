
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { CityConfig, User } from '../types';

interface AIAssistantProps {
  onClose: () => void;
  city: CityConfig;
  user: User;
  theme: 'light' | 'dark';
  onNavigate?: (tab: string) => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, city, user, theme, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Pozdrav ${user.name.split(' ')[0]}! Ja sam inteligentni sustav grada ${city.name}. Mogu vam pomoći oko navigacije, analize proračuna ili provjere statusa vaših ideja. Što vas zanima?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const navigateToTabDeclaration: FunctionDeclaration = {
    name: 'navigateToTab',
    parameters: {
      type: Type.OBJECT,
      description: 'Navigira korisnika na određenu sekciju aplikacije.',
      properties: {
        tabId: {
          type: Type.STRING,
          description: 'ID sekcije: dashboard, fiscal, inspection, challenges, incubator, community, vault, account.',
        },
      },
      required: ['tabId'],
    },
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Ti si stručni AI asistent za platformu GRAD+ u Hrvatskoj. Grad: ${city.name}. Korisnik: ${user.name}.
        Tvoja uloga je da budeš koristan, proaktivan i da koristiš alate kada je to potrebno.
        Pitanje: ${textToSend}`,
        config: {
          tools: [{ functionDeclarations: [navigateToTabDeclaration] }],
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'navigateToTab' && onNavigate) {
            onNavigate(fc.args.tabId as string);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `Razumijem, prebacujem vas na sekciju: ${fc.args.tabId}. Mogu li još kako pomoći?`,
              timestamp: new Date()
            }]);
          }
        }
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.text || 'Oprostite, trenutno ne mogu obraditi vaš zahtjev.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Došlo je do greške u komunikaciji s AI servisom.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-2xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl animate-pulse">
              <span className="material-icons-round">psychology</span>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest">GRAD+ INTELIGENCIJA</h3>
              <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Powered by Gemini 3</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-all">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[2rem] ${
                m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-500/20' 
                : 'bg-gray-100 dark:bg-white/5 rounded-tl-none border border-gray-100 dark:border-white/5'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                <p className="text-[8px] mt-3 opacity-50 font-black uppercase tracking-widest">{m.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl animate-pulse flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full delay-75"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full delay-150"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-8 border-t dark:border-white/5">
          <div className="flex gap-4">
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Postavite pitanje ili naredbu (npr. 'Pokaži mi proračun')..."
              className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl px-8 py-5 text-sm outline-none border border-transparent focus:border-blue-500 transition-all font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-icons-round">auto_awesome</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIAssistant;
