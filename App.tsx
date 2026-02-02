
import React, { useState, useEffect, useMemo } from 'react';
// Added missing framer-motion components
import { motion, AnimatePresence } from 'framer-motion';
import { CITIES, BADGES } from './constants';
import { Category, IncubatorStage, CityConfig, Challenge, Idea, User, UserRole, Notification, Poll } from './types';
import { authAPI, ideasAPI, challengesAPI, pollsAPI } from './services/api';
import { websocketService } from './services/websocket';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import IdeaIncubator from './components/IdeaIncubator';
import Community from './components/Community';
import FactCheck from './components/FactCheck';
import ChallengesList from './components/ChallengesList';
import LoginScreen from './components/LoginScreen';
import AdminPortal from './components/AdminPortal';
import UserAccount from './components/UserAccount';
import SupportChat from './components/SupportChat';
import Onboarding from './components/Onboarding';
import FiscalDashboard from './components/FiscalDashboard';
import CompanyInspection from './components/CompanyInspection';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCity, setSelectedCity] = useState<CityConfig>(CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  const [user, setUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // INITIAL BOOTSTRAP
  useEffect(() => {
    const initApp = async () => {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        const city = CITIES.find(c => c.id === currentUser.cityId) || CITIES[0];
        setSelectedCity(city);
        await syncData(city.id);
      }
      setIsLoading(false);
    };
    initApp();
  }, []);

  const syncData = async (cityId: string) => {
    try {
      const [fetchedIdeas, fetchedChallenges, fetchedPolls] = await Promise.all([
        ideasAPI.getAll(cityId),
        challengesAPI.getAll(cityId),
        pollsAPI.getAll(cityId)
      ]);
      setIdeas(fetchedIdeas);
      setChallenges(fetchedChallenges);
      setPolls(fetchedPolls);
    } catch (error) {
      console.error("Critical: Data sync failed", error);
    }
  };

  // REAL-TIME ENGINE
  useEffect(() => {
    if (!isAuthenticated) return;
    websocketService.connect('grad_plus_secure_socket');
    const handleWSMessage = (data: any) => {
      if (data.type === 'NEW_NOTIFICATION') {
        setNotifications(prev => [data.notification, ...prev]);
        showToast(data.notification.title, 'info');
      }
    };
    websocketService.onMessage(handleWSMessage);
    return () => {
      websocketService.offMessage(handleWSMessage);
      websocketService.disconnect();
    };
  }, [isAuthenticated]);

  const handleLogin = async () => {
    const u = authAPI.getCurrentUser();
    if (u) {
      setUser(u);
      setIsAuthenticated(true);
      setShowOnboarding(true);
      await syncData(u.cityId);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const cityVariables = {
    '--city-primary': selectedCity.theme.primary,
    '--city-secondary': selectedCity.theme.secondary,
    '--city-accent': selectedCity.theme.accent,
    '--city-bg-pattern': selectedCity.theme.pattern,
  } as React.CSSProperties;

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Inicijalizacija Sustava...</p>
      </div>
    </div>
  );

  if (!isAuthenticated || !user) return <LoginScreen onLogin={handleLogin} />;

  const handleIdeasUpdate = (newIdeas: Idea[] | ((prev: Idea[]) => Idea[])) => {
    setIdeas(typeof newIdeas === 'function' ? (newIdeas as any)(ideas) : newIdeas);
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#f5f5f7] relative overflow-hidden selection:bg-blue-600 selection:text-white" style={cityVariables}>
      {/* BACKGROUND TEXTURE */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 transition-all duration-1000" style={{ background: selectedCity.theme.pattern }}></div>

      {showOnboarding && <Onboarding primaryColor={selectedCity.theme.primary} onFinish={() => setShowOnboarding(false)} />}
      
      {/* GLOBAL NOTIFICATION SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-[1000] w-full max-w-sm"
          >
             <div className="glass mx-auto px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/40">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}>
                   <span className="material-icons-round text-lg">{toast.type === 'success' ? 'done_all' : 'info'}</span>
                </div>
                <div>
                   <p className="text-xs font-black text-gray-900 leading-tight">{toast.message}</p>
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Sistemska Obavijest</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.role} cityTheme={selectedCity.theme} />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar 
          user={user} 
          selectedCity={selectedCity} 
          onCityChange={(c) => { setSelectedCity(c); syncData(c.id); }} 
          onLogout={handleLogout}
          notifications={notifications}
          setNotifications={setNotifications}
          onToggleRole={async () => {
             const newRole = user.role === UserRole.CITIZEN ? UserRole.ADMIN : UserRole.CITIZEN;
             const updated = { ...user, role: newRole };
             await authAPI.updateProfile(updated);
             setUser(updated);
             showToast(`Profil: ${newRole}`, 'info');
          }}
          onSearch={setSearchQuery}
        />
        
        <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto overflow-x-hidden">
          {activeTab === 'dashboard' && <Dashboard user={user} ideas={ideas} challenges={challenges} city={selectedCity} showToast={showToast} />}
          {activeTab === 'fiscal' && <FiscalDashboard city={selectedCity} showToast={showToast} />}
          {activeTab === 'inspection' && <CompanyInspection showToast={showToast} />}
          {activeTab === 'challenges' && <ChallengesList challenges={challenges} city={selectedCity} onJoin={(id) => showToast('Misija pokrenuta!', 'success')} />}
          {activeTab === 'incubator' && <IdeaIncubator ideas={ideas} setIdeas={handleIdeasUpdate} isReadOnly={user.role === UserRole.CITIZEN} city={selectedCity} />}
          {activeTab === 'community' && <Community ideas={ideas} setIdeas={handleIdeasUpdate} city={selectedCity} polls={polls} onVote={(pid, oid) => showToast('Glas uspješan!', 'success')} user={user} showToast={showToast} />}
          {activeTab === 'factcheck' && <FactCheck city={selectedCity} />}
          {activeTab === 'admin' && <AdminPortal ideas={ideas} setIdeas={handleIdeasUpdate} challenges={challenges} setChallenges={setChallenges} city={selectedCity} showToast={showToast} />}
          {activeTab === 'account' && <UserAccount user={user} setUser={setUser} city={selectedCity} showToast={showToast} />}
        </main>
      </div>

      <SupportChat primaryColor={selectedCity.theme.primary} />
    </div>
  );
};

export default App;
