
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (tab: string) => void;
  theme: 'light' | 'dark';
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, onNavigate, theme }) => {
  const [search, setSearch] = useState('');
  
  const commands = [
    { id: 'dashboard', label: 'Pregled Grada', icon: 'dashboard', keys: ['G', 'D'] },
    { id: 'fiscal', label: 'Proračun i Financije', icon: 'account_balance', keys: ['G', 'F'] },
    { id: 'inspection', label: 'Inspekcija Tvrtki', icon: 'manage_search', keys: ['I', 'N'] },
    { id: 'challenges', label: 'Aktivni Izazovi', icon: 'location_city', keys: ['A', 'I'] },
    { id: 'incubator', label: 'Inkubator Ideja', icon: 'psychology', keys: ['I', 'K'] },
    { id: 'community', label: 'Zajednica i Forum', icon: 'forum', keys: ['Z', 'A'] },
    { id: 'factcheck', label: 'AI Fact Check', icon: 'fact_check', keys: ['F', 'C'] },
    { id: 'account', label: 'Moj Profil', icon: 'account_circle', keys: ['P', 'R'] },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-start justify-center pt-24 p-4 bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-white/5 flex items-center gap-4">
          <span className="material-icons-round text-gray-400">search</span>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pretraži komande (npr. 'proračun')..."
            className="flex-1 bg-transparent border-none outline-none font-bold text-lg"
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.map(cmd => (
            <button
              key={cmd.id}
              onClick={() => { onNavigate(cmd.id); onClose(); }}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="material-icons-round text-gray-400 group-hover:text-blue-500">{cmd.icon}</span>
                <span className="font-black text-sm uppercase tracking-widest">{cmd.label}</span>
              </div>
              <div className="flex gap-1">
                {cmd.keys.map(k => (
                  <kbd key={k} className="px-2 py-1 bg-gray-50 dark:bg-white/10 rounded-md text-[9px] font-black border border-gray-200 dark:border-white/10">{k}</kbd>
                ))}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommandPalette;
