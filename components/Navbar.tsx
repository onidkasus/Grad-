
import React, { useState } from 'react';
import { CITIES } from '../constants';
import { CityConfig, User, Notification, UserRole } from '../types';

interface NavbarProps {
  user: User;
  selectedCity: CityConfig;
  onCityChange: (city: CityConfig) => void;
  onLogout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onToggleRole: () => void;
  onSearch: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  selectedCity, 
  onCityChange, 
  onLogout, 
  notifications, 
  setNotifications,
  onToggleRole,
  onSearch
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header data-tour="navbar" className="sticky top-0 z-50 h-24 bg-white/50 backdrop-blur-2xl border-b border-gray-100/50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="relative group">
          <select 
            value={selectedCity.id}
            onChange={(e) => {
              const city = CITIES.find(c => c.id === e.target.value);
              if (city) onCityChange(city);
            }}
            className="appearance-none bg-white border border-gray-200 text-sm font-black rounded-2xl outline-none block w-full px-6 py-3.5 pr-12 cursor-pointer transition-all hover:shadow-xl uppercase tracking-widest focus:ring-4"
            style={{ color: selectedCity.theme.primary, '--tw-ring-color': `${selectedCity.theme.primary}20` } as any}
          >
            {CITIES.map(city => (
              <option key={city.id} value={city.id}>GRAD {city.name.toUpperCase()}</option>
            ))}
          </select>
          <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]">expand_more</span>
        </div>

        <div className="relative hidden md:block">
           <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
           <input 
             onChange={(e) => onSearch(e.target.value)}
             placeholder="Pretraži sustav grada..."
             className="pl-12 pr-6 py-3.5 bg-gray-50/50 rounded-2xl border border-transparent text-sm focus:bg-white focus:border-gray-200 transition-all w-64 focus:w-96 outline-none font-medium shadow-inner"
           />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleRole}
          className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border shadow-sm group hover:scale-105 active:scale-95"
          style={{ 
            backgroundColor: user.role === UserRole.ADMIN ? selectedCity.theme.primary : 'white',
            color: user.role === UserRole.ADMIN ? 'white' : selectedCity.theme.primary,
            borderColor: `${selectedCity.theme.primary}20`
          }}
        >
          <span className="material-icons-round text-sm">{user.role === UserRole.ADMIN ? 'shield' : 'admin_panel_settings'}</span>
          {user.role === UserRole.CITIZEN ? 'Admin Sučelje' : 'Pogled Građana'}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all relative group"
          >
            <span className="material-icons-round text-2xl group-hover:rotate-12 transition-transform" style={{ color: unreadCount > 0 ? selectedCity.theme.primary : 'inherit' }}>notifications</span>
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-4">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h4 className="font-black text-sm uppercase tracking-widest text-gray-900">Obavijesti</h4>
                <button onClick={markAllRead} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Označi sve pročitano</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 font-medium italic">Nema novih obavijesti</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-4 ${n.read ? 'opacity-60' : ''}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        n.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : n.type === 'ALERT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <span className="material-icons-round text-sm">{n.type === 'SUCCESS' ? 'check_circle' : n.type === 'ALERT' ? 'warning' : 'info'}</span>
                      </div>
                      <div>
                        <h5 className="font-black text-gray-900 text-sm">{n.title}</h5>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase mt-2">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>}
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setShowNotifs(false)} className="w-full py-4 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100">Zatvori</button>
            </div>
          )}
        </div>

        <div className="h-10 w-[1px] bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-tight tracking-tight">{user.name}</p>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: selectedCity.theme.primary }}>{user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl hover:-translate-y-1 transition-all"
            style={{ background: `linear-gradient(135deg, ${selectedCity.theme.primary}, ${selectedCity.theme.secondary})` }}
          >
            {user.avatar}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
