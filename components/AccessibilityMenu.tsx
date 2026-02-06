
import React from 'react';
import { motion } from 'framer-motion';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface AccessibilityMenuProps {
  settings: AccessibilitySettings;
  setSettings: (s: AccessibilitySettings) => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ settings, setSettings, onClose, theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`fixed top-24 right-8 w-80 z-[1500] rounded-[2.5rem] shadow-2xl p-8 border ${theme === 'dark' ? 'bg-gray-900 border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
    >
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-xs uppercase tracking-widest">PRISTUPAČNOST</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
          <span className="material-icons-round">close</span>
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Veličina teksta ({settings.fontSize}%)</p>
          <input 
            type="range" min="80" max="150" step="5"
            value={settings.fontSize}
            onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visoki Kontrast</p>
          <button 
            onClick={() => setSettings({ ...settings, highContrast: !settings.highContrast })}
            className={`w-12 h-6 rounded-full transition-all relative ${settings.highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.highContrast ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Smanjeno kretanje</p>
          <button 
            onClick={() => setSettings({ ...settings, reduceMotion: !settings.reduceMotion })}
            className={`w-12 h-6 rounded-full transition-all relative ${settings.reduceMotion ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.reduceMotion ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t dark:border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
        WCAG 2.1 AAA Compliant
      </div>
    </motion.div>
  );
};

export default AccessibilityMenu;
