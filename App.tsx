
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CITIES, BADGES } from './constants';
import { Category, IncubatorStage, CityConfig, Challenge, Idea, User, UserRole, Notification, Poll } from './types';
import { authAPI, ideasAPI, challengesAPI, pollsAPI } from './services/api';
import { websocketService } from './services/websocket';

// Components
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
import AIAssistant from './components/AIAssistant';
import Onboarding from './components/Onboarding';
import FiscalDashboard from './components/FiscalDashboard';
import CompanyInspection from './components/CompanyInspection';
import CommandPalette from './components/CommandPalette';
import AccessibilityMenu from './components/AccessibilityMenu';
import DigitalVault from './components/DigitalVault';
import Missions from './components/Missions';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCity, setSelectedCity] = useState<CityConfig>(CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Menus
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);

  // Accessibility Settings
  const [a11y, setA11y] = useState({ fontSize: 100, highContrast: false, reduceMotion: false });

  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  
  const [user, setUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowAIAssistant(true);
      }
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowAccessibility(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.fontSize = `${a11y.fontSize}%`;
    if (a11y.highContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
    if (a11y.reduceMotion) document.body.classList.add('reduce-motion');
    else document.body.classList.remove('reduce-motion');
  }, [theme, a11y]);

  const syncData = useCallback(async (cityId: string) => {
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
  }, []);

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
  }, [syncData]);

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
  }, [isAuthenticated, showToast]);

  const handleLogin = async () => {
    const u = authAPI.getCurrentUser();
    if (u) {
      setUser(u);
      setIsAuthenticated(true);
      setShowOnboarding(true);
      const city = CITIES.find(c => c.id === u.cityId) || CITIES[0];
      setSelectedCity(city);
      if (u.role === UserRole.ADMIN) setActiveTab('admin');
      else setActiveTab('dashboard');
      await syncData(city.id);
    }
  };

  const handleCityChange = async (city: CityConfig) => {
    // Restriction: User cannot switch cities if their cityID is not 0 (Global/Super Admin)
    if (user && user.cityID !== 0) {
      showToast("Nemate ovlasti za promjenu grada.", "info");
      return;
    }

    setSelectedCity(city);
    await syncData(city.id);
    showToast(`Kontekst prebačen na regiju ${city.name}`, 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Sve obavijesti su pročitane', 'success');
  };

  const cityVariables = useMemo(() => ({
    '--city-primary': selectedCity.theme.primary,
    '--city-secondary': selectedCity.theme.secondary,
    '--city-accent': selectedCity.theme.accent,
    '--city-bg-pattern': selectedCity.theme.pattern,
  }), [selectedCity]) as React.CSSProperties;

  const spring = { type: "spring", stiffness: 400, damping: 40 } as const;

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7]">
      <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-black border-t-transparent rounded-full shadow-2xl"></motion.div>
    </div>
  );

  if (!isAuthenticated || !user) return <LoginScreen onLogin={handleLogin} />;

  const handleIdeasUpdate = (newIdeas: Idea[] | ((prev: Idea[]) => Idea[])) => {
    setIdeas(typeof newIdeas === 'function' ? (newIdeas as any)(ideas) : newIdeas);
  };

  const handleChallengeIdeaSubmission = async (partialIdea: Partial<Idea>) => {
    try {
      const finalIdea = { ...partialIdea, cityId: selectedCity.id };
      const newIdea = await ideasAPI.create(finalIdea, user);
      setIdeas(prev => [newIdea, ...prev]);
      showToast('Prijava uspješno zaprimljena u sustav.', 'success');
    } catch (error) {
      showToast('Greška pri sinkronizaciji s poslužiteljem.', 'info');
    }
  };

  return (
    <div className={`flex min-h-screen relative overflow-hidden selection:bg-blue-600 selection:text-white transition-colors duration-500 ${theme === 'dark' ? 'dark bg-[#0a0a0c]' : 'bg-[#f5f5f7]'}`} style={cityVariables}>
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 transition-all duration-1000" style={{ background: selectedCity.theme.pattern }}></div>

      <AnimatePresence>
        {showOnboarding && <Onboarding primaryColor={selectedCity.theme.primary} onFinish={() => setShowOnboarding(false)} />}
        {showCommandPalette && <CommandPalette theme={theme} onClose={() => setShowCommandPalette(false)} onNavigate={setActiveTab} />}
        {showAIAssistant && <AIAssistant user={user} city={selectedCity} theme={theme} onClose={() => setShowAIAssistant(false)} onNavigate={setActiveTab} />}
        {showAccessibility && <AccessibilityMenu theme={theme} settings={a11y} setSettings={setA11y} onClose={() => setShowAccessibility(false)} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} className="fixed top-8 left-1/2 -translate-x-1/2 z-[3000] w-full max-w-sm px-4">
             <div className="glass backdrop-blur-3xl mx-auto px-6 py-4 rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] flex items-center gap-4 border border-white/60">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-black'}`}>
                   <span className="material-icons-round text-lg">{toast.type === 'success' ? 'done_all' : 'priority_high'}</span>
                </div>
                <p className="text-[11px] font-black text-gray-900 leading-tight tracking-tight">{toast.message}</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.role} cityTheme={selectedCity.theme} />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar 
          user={user} 
          selectedCity={selectedCity} 
          onCityChange={handleCityChange}
          onLogout={() => { authAPI.logout(); setIsAuthenticated(false); }}
          notifications={notifications}
          onClearNotifications={clearNotifications}
          onSearch={setSearchQuery}
          onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          onOpenAI={() => setShowAIAssistant(true)}
          onOpenAccessibility={() => setShowAccessibility(p => !p)}
          currentTheme={theme}
        />
        
        <main className="flex-1 p-8 md:p-14 max-w-7xl mx-auto w-full overflow-y-auto overflow-x-hidden scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + selectedCity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={spring}
            >
              {activeTab === 'dashboard' && <Dashboard user={user} ideas={ideas} challenges={challenges} city={selectedCity} showToast={showToast} setActiveTab={setActiveTab} onOpenAI={() => setShowAIAssistant(true)} />}
              {activeTab === 'fiscal' && <FiscalDashboard city={selectedCity} showToast={showToast} />}
              {activeTab === 'inspection' && <CompanyInspection showToast={showToast} />}
              {activeTab === 'missions' && <Missions user={user} />}
              {activeTab === 'challenges' && <ChallengesList challenges={challenges} city={selectedCity} user={user} onSubmitIdea={handleChallengeIdeaSubmission} ideas={ideas} />}
              {activeTab === 'incubator' && <IdeaIncubator ideas={ideas} setIdeas={handleIdeasUpdate} isReadOnly={user.role === UserRole.CITIZEN} city={selectedCity} />}
              {activeTab === 'community' && <Community ideas={ideas} setIdeas={handleIdeasUpdate} city={selectedCity} polls={polls} onVote={() => showToast('Glas uspješan!', 'success')} user={user} showToast={showToast} />}
              {activeTab === 'factcheck' && <FactCheck city={selectedCity} />}
              {activeTab === 'admin' && <AdminPortal ideas={ideas} setIdeas={handleIdeasUpdate} challenges={challenges} setChallenges={setChallenges} city={selectedCity} showToast={showToast} />}
              {activeTab === 'account' && <UserAccount user={user} setUser={setUser} city={selectedCity} showToast={showToast} />}
              {activeTab === 'vault' && <DigitalVault city={selectedCity} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <div className="fixed bottom-10 right-10 z-[500] flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowAIAssistant(true)}
          className="w-16 h-16 rounded-full bg-black text-white shadow-2xl flex items-center justify-center hover:rotate-2 transition-transform"
        >
          <span className="material-icons-round text-3xl">psychology</span>
        </motion.button>
      </div>
    </div>
  );
};

export default App;
