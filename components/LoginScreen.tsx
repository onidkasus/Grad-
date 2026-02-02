
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CITIES } from '../constants';
import { authAPI } from '../services/api';

interface LoginScreenProps {
  onLogin: () => void;
}

const CITY_IMAGES = [
  "https://images.unsplash.com/photo-1583259833894-077596c0966a?auto=format&fit=crop&q=80&w=2560", // Zagreb
  "https://images.unsplash.com/photo-1620658422613-28956488732e?auto=format&fit=crop&q=80&w=2560", // Zadar
  "https://images.unsplash.com/photo-1563292440-2792c90c76b9?auto=format&fit=crop&q=80&w=2560", // Split
  "https://images.unsplash.com/photo-1596464528156-3c66f542472b?auto=format&fit=crop&q=80&w=2560", // Rijeka
];

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCityIdx, setCurrentCityIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCityIdx(prev => (prev + 1) % CITY_IMAGES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNiasLogin = async () => {
    setIsLoading(true);
    try {
      await authAPI.login('marko.horvat@e-gradjanin.hr');
      onLogin();
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f5f5f7] font-sans">
      {/* BACKGROUND CAROUSEL - VERY LOW OPACITY ON WHITE BG */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img 
            key={CITY_IMAGES[currentCityIdx]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
            src={CITY_IMAGES[currentCityIdx]}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* LEFT SIDE: BRANDING - DARK TEXT */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:max-w-xl text-center lg:text-left"
        >
          <div className="inline-block px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 backdrop-blur-xl mb-8">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Hrvatska Digitalna Platforma</p>
          </div>
          <h1 className="text-7xl md:text-[8rem] font-black text-gray-900 leading-[0.85] tracking-tighter mb-8 drop-shadow-sm">
            GRAD<span className="text-blue-600">+</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-lg mb-12 leading-tight">
            Novi standard suradnje između građana i moderne uprave. Sigurno, brzo i transparentno.
          </p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 opacity-40">
            {CITIES.map(c => (
              <div key={c.id} className="flex items-center gap-2 px-4 py-2 bg-gray-200/50 rounded-2xl border border-gray-300/30">
                <span className="material-icons-round text-sm text-blue-600">{c.theme.culturalIcon}</span>
                <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SIDE: LOGIN CARD - CLEAN WHITE GLASS */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-12 md:p-16 border border-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-gray-100">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Coat_of_arms_of_Croatia.svg" alt="HR" className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Prijava</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identifikacija putem NIAS sustava</p>
            </div>

            <div className="space-y-6">
              <button 
                onClick={handleNiasLogin}
                disabled={isLoading}
                className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-icons-round">fingerprint</span>
                    E-Građanin Prijava
                  </>
                )}
              </button>
              
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 text-center leading-relaxed">
                  GRAD+ koristi službeni NIAS sustav za sigurnu autentifikaciju u skladu s EU direktivama o digitalnoj sigurnosti.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Informacije o privatnosti podataka</a>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sustav spreman</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-xs text-gray-300">verified</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verzija: 3.5.2</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center opacity-40">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.8em]">REPUBLIKA HRVATSKA • SMART CITY TEMPLATE</p>
      </div>
    </div>
  );
};

export default LoginScreen;
