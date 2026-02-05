
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CityConfig, User, Notification, UserRole } from '../types';
import { CITIES } from '../constants';

interface NavbarProps {
  user: User;
  selectedCity: CityConfig;
  onCityChange: (city: CityConfig) => void;
  onLogout: () => void;
  notifications: Notification[];
  onClearNotifications: () => void;
  onSearch: (query: string) => void;
  onToggleTheme: () => void;
  onOpenAI: () => void;
  onOpenAccessibility: () => void;
  currentTheme: 'light' | 'dark';
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, selectedCity, onCityChange, onLogout, notifications, onClearNotifications,
  onSearch, onToggleTheme, onOpenAI, onOpenAccessibility, currentTheme
}) => {
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const spring = { type: "spring", stiffness: 400, damping: 40 } as const;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header 
      data-tour="navbar"
      className={`sticky top-0 z-[100] h-24 border-b px-8 md:px-12 flex items-center justify-between transition-all duration-500 shadow-sm ${
        currentTheme === 'light' 
        ? 'bg-white/80 border-gray-100 text-gray-900' 
        : 'bg-[#0a0a0c]/80 border-white/5 text-white'
      } backdrop-blur-3xl`}
    >
      <div className="flex items-center gap-12">
        <div className="relative">
          <button 
            onClick={() => user.cityID === 0 && setShowCityPicker(!showCityPicker)}
            className={`flex items-center gap-4 group text-left outline-none ${user.cityID !== 0 ? 'cursor-default' : 'cursor-pointer'}`}
          >
             <motion.div 
               whileHover={{ rotate: 5, scale: 1.05 }}
               className="w-12 h-12 rounded-[1.4rem] flex items-center justify-center text-white shadow-2xl transition-all" 
               style={{ backgroundColor: selectedCity.theme.primary }}
             >
                <span className="material-icons-round text-2xl">{selectedCity.theme.culturalIcon}</span>
             </motion.div>
             <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none mb-1.5 flex items-center gap-1">
                  RH • Regija {selectedCity.name} 
                  {user.cityID === 0 && (
                    <span className="material-icons-round text-[10px] group-hover:translate-y-0.5 transition-transform text-blue-600">expand_more</span>
                  )}
                </p>
                <h2 className="text-lg font-black tracking-tighter leading-none">{selectedCity.name.toUpperCase()}</h2>
             </div>
          </button>

          <AnimatePresence>
            {showCityPicker && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowCityPicker(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={spring}
                  className={`absolute top-24 left-0 w-[480px] p-6 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] border overflow-hidden ${
                    currentTheme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-900 border-white/10'
                  }`}
                >
                  {user.cityID === 0 && (
                    <p className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] mb-6">Administracija Regija (7)</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {CITIES.map(city => (
                      <button 
                        key={city.id}
                        onClick={() => { onCityChange(city); setShowCityPicker(false); }}
                        className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                          selectedCity.id === city.id 
                          ? 'bg-blue-600 shadow-xl' 
                          : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${selectedCity.id === city.id ? 'bg-white/20' : ''}`} style={{ backgroundColor: selectedCity.id === city.id ? undefined : city.theme.primary }}>
                           <span className="material-icons-round text-lg">{city.theme.culturalIcon}</span>
                         </div>
                         <div className="text-left">
                            <span className={`block text-[11px] font-black uppercase tracking-widest ${selectedCity.id === city.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{city.name}</span>
                            <span className={`text-[8px] font-bold uppercase ${selectedCity.id === city.id ? 'text-white/60' : 'text-gray-400'}`}>HR • 0{CITIES.indexOf(city) + 1}</span>
                         </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative hidden xl:block">
           <span className="material-icons-round absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">search</span>
           <input 
             onChange={(e) => onSearch(e.target.value)}
             placeholder="Traži gradske resurse..."
             className={`pl-14 pr-8 py-4 rounded-2xl border text-[10px] transition-all w-64 focus:w-80 outline-none font-black uppercase tracking-widest ${
               currentTheme === 'light'
               ? 'bg-gray-100/50 border-transparent focus:bg-white focus:border-gray-200'
               : 'bg-white/5 border-transparent focus:bg-white/10 focus:border-white/10'
             }`}
           />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex p-1.5 rounded-2xl gap-1 ${currentTheme === 'light' ? 'bg-gray-100/50' : 'bg-white/5'}`}>
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-all ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <span className={`material-icons-round text-xl ${unreadCount > 0 ? 'animate-bounce' : ''}`}>notifications</span>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className={`absolute top-14 right-0 w-80 p-6 rounded-[2.5rem] shadow-2xl border ${
                      currentTheme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-900 border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4 px-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Obavijesti</h4>
                       <button 
                         onClick={() => { onClearNotifications(); setShowNotifications(false); }}
                         className="text-[9px] text-blue-600 font-bold cursor-pointer hover:underline outline-none"
                       >
                         Označi pročitano
                       </button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">Nema novih obavijesti</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/20 transition-all">
                             <div className="flex justify-between items-start mb-1">
                               <p className="text-[11px] font-black tracking-tight leading-tight">{notif.title}</p>
                               <span className="text-[8px] font-bold text-gray-400 shrink-0 ml-2">{notif.time}</span>
                             </div>
                             <p className="text-[10px] text-gray-500 leading-tight">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button onClick={onOpenAI} className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-all text-gray-400 hover:text-blue-600">
            <span className="material-icons-round text-xl">psychology</span>
          </button>
          <button onClick={onToggleTheme} className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-all text-gray-400">
            <span className="material-icons-round text-xl">{currentTheme === 'light' ? 'dark_mode' : 'light_mode'}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-gray-100 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black tracking-tight leading-none uppercase">{user.name}</p>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">
              {user.role === UserRole.ADMIN ? 'Sustav Nadzornik' : user.rank}
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="w-12 h-12 rounded-[1.4rem] flex items-center justify-center text-white font-black shadow-2xl hover:scale-105 active:scale-95 transition-all bg-black text-xs"
          >
            {user.avatar}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
