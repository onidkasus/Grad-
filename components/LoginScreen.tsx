import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { storeLogin } from '../services/firebase';

interface LoginScreenProps {
  onLogin: () => void;
}

const CITY_IMAGES = [
  "https://images.unsplash.com/photo-1583259833894-077596c0966a?auto=format&fit=crop&q=80&w=2560",
  "https://images.unsplash.com/photo-1563292440-2792c90c76b9?auto=format&fit=crop&q=80&w=2560",
  "https://images.unsplash.com/photo-1596464528156-3c66f542472b?auto=format&fit=crop&q=80&w=2560",
  "https://images.unsplash.com/photo-1620658422613-28956488732e?auto=format&fit=crop&q=80&w=2560",
];

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCityIdx, setCurrentCityIdx] = useState(0);
  const [credential, setCredential] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCityIdx(prev => (prev + 1) % CITY_IMAGES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleNiasLogin = async () => {
    if (!credential.trim()) {
      setError('OIB je obavezan polje za pristup sustavu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await authAPI.login(credential);
      onLogin();
    } catch (e: any) {
      setError(e.message || 'Greška pri prijavi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f5f5f7] font-sans">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img 
            key={CITY_IMAGES[currentCityIdx]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 4, ease: "easeInOut" }}
            src={CITY_IMAGES[currentCityIdx]}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/90"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center justify-between gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:max-w-2xl text-center lg:text-left"
        >
          <div className="inline-block px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 backdrop-blur-xl mb-8">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">OD GRAĐANA ZA GRAĐANE</p>
          </div>
          <h1 className="text-7xl md:text-[9rem] font-black text-gray-900 leading-[0.8] tracking-tighter mb-10">
            GRAD<span className="text-blue-600">+</span>
          </h1>
          <p className="text-xl md:text-3xl text-gray-400 font-medium max-w-lg mb-12 leading-tight">
            Nacionalni standard suradnje između građana i moderne uprave. <span className="text-gray-900 font-black">Digitalna budućnost Hrvatske.</span>
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <motion.div 
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            className={`bg-white/80 backdrop-blur-3xl rounded-[3.5rem] p-12 md:p-16 border shadow-2xl relative overflow-hidden transition-colors ${error ? 'border-red-500 shadow-red-100' : 'border-white'}`}
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-gray-100">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Coat_of_arms_of_Croatia.svg" alt="HR" className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Sigurna Prijava</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Integracija NIAS sustava v3.0</p>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <span className={`material-icons-round absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-gray-300 group-focus-within:text-blue-500'}`}>fingerprint</span>
                <input 
                  type="text"
                  value={credential}
                  onChange={e => { setCredential(e.target.value); setError(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleNiasLogin()}
                  placeholder="Unesite vaš OIB..."
                  className={`w-full pl-16 pr-8 py-6 bg-gray-50 border rounded-[2rem] outline-none text-gray-900 font-bold text-center tracking-widest focus:bg-white transition-all ${error ? 'border-red-200 placeholder:text-red-300' : 'border-gray-100 focus:border-blue-200 placeholder:text-gray-300'}`}
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-black text-red-500 text-center uppercase tracking-widest">
                  {error}
                </motion.p>
              )}

              <button 
                onClick={handleNiasLogin}
                disabled={isLoading}
                className="w-full py-6 rounded-[2rem] bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-icons-round">vpn_key</span>
                    E-Građanin Prijava
                  </>
                )}
              </button>
              
              <div className="pt-8 mt-4 border-t border-gray-100">
                <p className="text-[9px] font-medium text-gray-400 text-center leading-relaxed">
                  Pristupom sustavu prihvaćate uvjete korištenja nacionalne platforme za digitalnu suradnju. Podaci se obrađuju u skladu s GDPR-om unutar EU regije.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginScreen;
