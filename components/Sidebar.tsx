
import React from 'react';
import { UserRole, CityTheme } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  cityTheme: CityTheme;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, cityTheme }) => {
  const citizenItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Pregled' },
    { id: 'fiscal', icon: 'account_balance', label: 'Gradski Proračun' },
    { id: 'inspection', icon: 'manage_search', label: 'Inspekcija Tvrtki' },
    { id: 'challenges', icon: 'location_city', label: 'Gradski Izazovi' },
    { id: 'incubator', icon: 'psychology', label: 'Inkubator Ideja' },
    { id: 'community', icon: 'forum', label: 'Zajednica' },
    { id: 'factcheck', icon: 'fact_check', label: 'AI Provjera' },
  ];

  return (
    <div data-tour="sidebar" className="hidden lg:flex flex-col w-72 bg-white/80 backdrop-blur-3xl border-r border-gray-100/50 p-8 shadow-2xl z-20">
      <div className="flex items-center gap-4 mb-12">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transform hover:rotate-6 transition-transform"
          style={{ backgroundColor: cityTheme.primary }}
        >
          <span className="material-icons-round text-2xl">{cityTheme.culturalIcon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: cityTheme.primary }}>GRAD+</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Croatia Smart Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {userRole === UserRole.ADMIN && (
          <div className="mb-6">
            <p className="px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Upravljanje Gradom</p>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                activeTab === 'admin' ? 'bg-white shadow-xl border border-gray-50' : 'text-gray-500 hover:bg-white/50'
              }`}
              style={activeTab === 'admin' ? { color: cityTheme.primary } : {}}
            >
              <span className={`material-icons-round text-xl ${activeTab === 'admin' ? '' : 'text-gray-400'}`}>admin_panel_settings</span>
              <span className="font-black text-sm tracking-tight">Admin Portal</span>
            </button>
          </div>
        )}

        <p className="px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Glavni Izbornik</p>
        {citizenItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
              activeTab === item.id
                ? 'bg-white shadow-xl border border-gray-50'
                : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
            }`}
            style={activeTab === item.id ? { color: cityTheme.primary } : {}}
          >
            <span className={`material-icons-round text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? '' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            <span className={`text-sm tracking-tight ${activeTab === item.id ? 'font-black' : 'font-medium'}`}>{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cityTheme.primary }}></div>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-100/50">
        <button 
          onClick={() => setActiveTab('account')}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
            activeTab === 'account' ? 'bg-white shadow-lg font-black' : 'text-gray-500 hover:bg-white/50'
          }`}
          style={activeTab === 'account' ? { color: cityTheme.primary } : {}}
        >
          <span className={`material-icons-round ${activeTab === 'account' ? '' : 'text-gray-400'}`}>account_circle</span>
          <span className="text-sm tracking-tight">Moj Profil</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
