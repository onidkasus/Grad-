// If you use date input fields in this file, import DateInput for dd/MM/yyyy
import DateInput from './DateInput';
import { useState, useMemo } from 'react';
// Helper for dd/mm/yyyy
function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
import { motion, AnimatePresence } from 'framer-motion';
import { Idea, Challenge, CityConfig, Category, IncubatorStage, Post, DocumentRequest, Poll } from '../types';
import { CITIES } from '../constants';
import { ideasAPI, challengesAPI, communityAPI, getCityNumber } from '../services/api';

interface AdminPortalProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  polls: Poll[];
  onCreatePoll: (question: string, options: string[], endsInDays?: number | null) => void;
  onDeletePoll: (pollId: string) => void;
  onSetPollClosed: (pollId: string, closed: boolean) => void;
  documentRequests?: DocumentRequest[];
  setDocumentRequests?: React.Dispatch<React.SetStateAction<DocumentRequest[]>>;
  city: CityConfig;
  setCity: React.Dispatch<React.SetStateAction<CityConfig>>;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ ideas, setIdeas, challenges, setChallenges, posts, setPosts, polls, onCreatePoll, onDeletePoll, onSetPollClosed, documentRequests = [], setDocumentRequests, city, setCity, showToast }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'challenges' | 'incubator' | 'posts' | 'documents' | 'polls'>('submissions');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [adminContext, setAdminContext] = useState<string>(city.id); // Default to user city
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
      title: '',
      description: '',
      category: Category.URBAN,
      priority: 'Srednje',
      fund: '0 €',
      deadline: ''
  });
  const [newPost, setNewPost] = useState({
      content: '',
      title: ''
  });
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollEndsInDays, setPollEndsInDays] = useState<number | null>(7);

  const getChallengeIcon = (category: Category): string => {
    switch(category) {
      case Category.ENVIRONMENT: return 'eco';
      case Category.TECHNOLOGY: return 'computer';
      case Category.TRANSPORT: return 'directions_car';
      case Category.TOURISM: return 'travel_explore';
      case Category.EDUCATION: return 'school';
      case Category.ENERGY: return 'bolt';
      case Category.SOCIAL: return 'group';
      case Category.URBAN: return 'location_city';
      default: return 'location_city';
    }
  };

  const handleAddChallenge = async () => {
    if(!newChallenge.title || !newChallenge.description) return;
    try {
        const added = await challengesAPI.add({
            cityId: adminContext,
            title: newChallenge.title || '',
            description: newChallenge.description || '',
            category: (newChallenge.category as Category) || Category.URBAN,
            priority: (newChallenge.priority as any) || 'Srednje',
            fund: newChallenge.fund || '0 €',
            deadline: newChallenge.deadline || 'TBD',
            progress: 0,
            featured: false,
        } as any);
        
        setChallenges(prev => [...prev, added]);
        setShowChallengeModal(false);
        setNewChallenge({ title: '', description: '', category: Category.URBAN, priority: 'Srednje', fund: '0 €', deadline: '' });
        showToast('Izazov uspješno dodan!', 'success');
    } catch(e) {
        showToast('Greška kod dodavanja.', 'info');
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content) return;
    try {
      const post = await communityAPI.createOfficialPost(newPost.content, adminContext);
      setPosts(prev => [post, ...prev]);
      setShowPostModal(false);
      setNewPost({ content: '', title: '' });
      showToast('Objava uspješno objavljena!', 'success');
    } catch(e) {
      showToast('Greška kod objavljivanja.', 'info');
    }
  };

  const submitPoll = () => {
    const trimmedQuestion = pollQuestion.trim();
    const cleanedOptions = pollOptions.map(o => o.trim()).filter(Boolean);
    if (!trimmedQuestion || cleanedOptions.length < 2) {
      showToast('Unesite pitanje i barem dvije opcije.', 'info');
      return;
    }
    onCreatePoll(trimmedQuestion, cleanedOptions, pollEndsInDays);
    setPollQuestion('');
    setPollOptions(['', '']);
  };


  const filteredIdeas = useMemo(() => ideas.filter(i => i.cityId === adminContext), [ideas, adminContext]);
  const pendingIdeas = useMemo(() => filteredIdeas.filter(i => i.status === 'PENDING'), [filteredIdeas]);
  const selectedSubmission = useMemo(() => pendingIdeas.find(i => i.id === selectedSubmissionId) || pendingIdeas[0], [pendingIdeas, selectedSubmissionId]);

  const approveIdea = async (id: string) => {
    try {
        if (adminContext !== 'zagreb') {
           // Move to Zagreb for final verification
           await ideasAPI.recommendToZagreb(id);
           // Optimistically remove from current list since it moved cities
           setIdeas(prev => prev.filter(i => i.id !== id));
           showToast('Inicijativa preporučena i poslana Zagrebu na verifikaciju.', 'success');
        } else {
           // Zagreb actually approves it
           await ideasAPI.accept(id);
           setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: 'APPROVED', stage: IncubatorStage.DISCOVERY, isVerified: true } : i));
           showToast('Inicijativa odobrena i poslana u Inkubator.', 'success');
        }
        
        if (selectedSubmissionId === id) setSelectedSubmissionId(null);
    } catch (e) {
        console.error("Approval failed", e);
        showToast('Greška prilikom odobravanja.', 'info');
    }
  };

  const deleteIdea = async (id: string) => {
    try {
        await ideasAPI.reject(id);
        setIdeas(prev => prev.filter(i => i.id !== id));
        showToast('Prijava je odbijena.');
        if (selectedSubmissionId === id) setSelectedSubmissionId(null);
    } catch (e) {
        console.error("Rejection failed", e);
        showToast('Greška prilikom odbijanja.', 'info');
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await communityAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Objava je uklonjena.', 'success');
    } catch (e) {
      console.error("Error deleting post:", e);
      showToast('Greška kod brisanja objave.', 'info');
    }
  };

  const approveDocumentRequest = (id: string) => {
    if (setDocumentRequests) {
      setDocumentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
      showToast('Zahtjev za dokument je odobren.', 'success');
    }
  };

  const rejectDocumentRequest = (id: string) => {
    if (setDocumentRequests) {
      setDocumentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
      showToast('Zahtjev za dokument je odbijen.', 'success');
    }
  };

  const spring = { type: "spring", stiffness: 400, damping: 40 } as const;
  
  const selectedCity = useMemo(() => CITIES.find(c => c.id === adminContext) || city, [adminContext, city]);

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-500">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-[280px] rounded-[3rem] overflow-visible shadow-2xl group flex flex-col justify-center border border-white/10"
        style={{ 
          background: `linear-gradient(135deg, ${selectedCity.theme.primary}, ${selectedCity.theme.secondary})` 
        }}
      >
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -right-24 top-1/2 -translate-y-1/2 pointer-events-none opacity-15 hidden md:block"
        >
          <span className="material-icons-round text-[28rem] text-white select-none">
            {selectedCity.theme.culturalIcon}
          </span>
        </motion.div>

        <div className="relative z-10 p-10 md:px-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white leading-none">Sustav Administrator • {selectedCity.name}</p>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-none">
              Gradska Uprava
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-lg leading-snug">
              Potpuna kontrola nad gradskom infrastrukturom, inicijativama, izazovima i komunikacijom. Upravljajte svim aspektima <span className="text-white font-black">digitalnog grada</span>.
            </p>
          </div>

          {/* Beautiful City Selector */}
          <div className="relative">
            <motion.button
              onClick={() => setShowCityPicker(!showCityPicker)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 group"
            >
              <motion.div 
                layoutId="city-icon"
                whileHover={{ rotate: 8, scale: 1.1 }}
                className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl transition-all" 
                style={{ backgroundColor: selectedCity.theme.primary }}
              >
                <span className="material-icons-round text-3xl">{selectedCity.theme.culturalIcon}</span>
              </motion.div>
              <div className="text-left">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] leading-none mb-1 flex items-center gap-1">
                  Regija
                  <span className="material-icons-round text-[12px] group-hover:translate-y-0.5 transition-transform">expand_more</span>
                </p>
                <h3 className="text-xl font-black tracking-tighter leading-none text-white">{selectedCity.name}</h3>
              </div>
            </motion.button>

            <AnimatePresence>
              {showCityPicker && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowCityPicker(false)} 
                  />
                  <motion.div 
                    layoutId="city-picker"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute top-28 right-0 w-[420px] p-6 rounded-[2.5rem] shadow-2xl border border-gray-300 bg-white z-50"
                  >
                    <p className="px-4 py-2 text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-5">Odaberite Grad</p>
                    <div className="grid grid-cols-2 gap-3">
                      {CITIES.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            console.log('City selected:', c.id);
                            setAdminContext(c.id);
                            setCity(c);
                            setSelectedSubmissionId(null);
                            setShowCityPicker(false);
                          }}
                          className={`group w-full flex items-center gap-3 px-4 py-4 rounded-2xl relative overflow-hidden transition-all cursor-pointer border ${
                            adminContext === c.id 
                            ? 'bg-blue-50 border-blue-300 shadow-md' 
                            : 'hover:bg-gray-50 bg-white border-gray-200'
                          }`}
                        >
                          <div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                              backgroundColor: adminContext === c.id ? c.theme.primary : 'transparent',
                              opacity: adminContext === c.id ? 0.08 : 0,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-5"
                            style={{ backgroundColor: c.theme.primary }}
                          >
                            <span className="material-icons-round text-xl">{c.theme.culturalIcon}</span>
                          </div>
                          <div className="text-left relative z-10">
                            <span className="block text-[11px] font-black uppercase tracking-widest text-gray-900">
                              {c.name}
                            </span>
                            <span className="text-[8px] font-bold uppercase text-gray-500">
                              RH • 0{CITIES.indexOf(c) + 1}
                            </span>
                          </div>
                          {adminContext === c.id && (
                            <span className="ml-auto material-icons-round text-blue-600 relative z-10 animate-in fade-in duration-300">
                              check_circle
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Main Content - Re-renders when city changes */}
      <div key={adminContext} className="animate-in fade-in duration-300">

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Novih Prijava', value: pendingIdeas.length, icon: 'inbox', color: '#f59e0b' },
          { label: 'Gradski Izazovi', value: challenges.filter(c => c.cityId === adminContext).length, icon: 'location_city', color: selectedCity.theme.primary },
          { label: 'Aktivnih Objava', value: posts.filter(p => p.cityID === getCityNumber(adminContext)).length, icon: 'forum', color: '#3b82f6' },
          { label: 'Zahtjeva Dokumenata', value: documentRequests.filter(r => r.cityId === adminContext).length, icon: 'description', color: '#8b5cf6' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <span className="material-icons-round text-2xl">{stat.icon}</span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap p-1.5 bg-gray-200/50 rounded-[2rem] border border-gray-200 gap-2">
        {[
          { id: 'submissions', label: `Prijave (${pendingIdeas.length})`, icon: 'inbox' },
          { id: 'challenges', label: 'Gradski Izazovi', icon: 'location_city' },
          { id: 'documents', label: `Digitalni Sef (${documentRequests.length})`, icon: 'description' },
          { id: 'posts', label: `Moderacija Objava (${posts.filter(p => p.cityID === getCityNumber(adminContext)).length})`, icon: 'forum' },
          { id: 'incubator', label: 'Inkubator', icon: 'grid_view' },
          { id: 'polls', label: `Ankete (${polls.filter(p => p.cityId === adminContext).length})`, icon: 'poll' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.4rem] text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white shadow-xl text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
            style={activeTab === tab.id ? { color: selectedCity.theme.primary } : {}}
          >
            <span className="material-icons-round text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {activeTab === 'submissions' && (
          <motion.div 
            key="submissions"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={spring}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]"
          >
            {pendingIdeas.length === 0 ? (
               <div className="col-span-12 py-32 text-center bg-white rounded-[4rem] border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200 shadow-inner">
                    <span className="material-icons-round text-5xl">inventory_2</span>
                  </div>
                  <p className="text-xs font-black text-gray-300 uppercase tracking-[0.5em]">Nema prijava za grad {CITIES.find(c => c.id === adminContext)?.name}</p>
               </div>
            ) : (
              <>
                <div className="lg:col-span-4 bg-white rounded-[3rem] border border-gray-100 overflow-hidden flex flex-col shadow-sm">
                  <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Inbox • Nove Inicijative</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {pendingIdeas.map(idea => (
                      <button 
                        key={idea.id}
                        onClick={() => setSelectedSubmissionId(idea.id)}
                        className={`w-full p-6 rounded-[2rem] text-left transition-all relative ${
                          (selectedSubmissionId === idea.id || (!selectedSubmissionId && selectedSubmission?.id === idea.id)) 
                          ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20 translate-x-2' 
                          : 'hover:bg-gray-50'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedSubmissionId === idea.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                              {idea.category}
                            </span>
                            <span className={`text-[8px] font-bold ${selectedSubmissionId === idea.id ? 'text-white/40' : 'text-gray-300'}`}>{formatDate(idea.date)}</span>
                         </div>
                         <h4 className="font-black text-sm tracking-tight leading-tight line-clamp-1 mb-1">{idea.title}</h4>
                         <p className={`text-[10px] font-bold ${selectedSubmissionId === idea.id ? 'text-white/50' : 'text-gray-400'}`}>Od: {idea.author}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white rounded-[4rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col relative">
                  {selectedSubmission ? (
                    <motion.div 
                      key={selectedSubmission.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={spring}
                      className="flex-1 flex flex-col p-14"
                    >
                       <div className="flex items-start justify-between mb-16">
                          <div className="flex items-center gap-8">
                             <div className="w-20 h-20 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center font-black text-2xl shadow-2xl">
                                {selectedSubmission.authorAvatar}
                             </div>
                             <div>
                                <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3">{selectedSubmission.title}</h3>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Digitalni Podnositelj: <span className="text-blue-600">{selectedSubmission.author}</span> • NIAS Verificirano</p>
                                <p className="text-[10px] font-black text-gray-400 mt-1">Datum: <span className="text-gray-900">{formatDate(selectedSubmission.date)}</span></p>
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <button onClick={() => approveIdea(selectedSubmission.id)} className="px-10 py-5 bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all">
                                 {adminContext === 'zagreb' ? 'Verificiraj' : 'Preporuči Zagrebu'}
                             </button>
                             <button onClick={() => deleteIdea(selectedSubmission.id)} className="px-10 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-all">Odbaci</button>
                          </div>
                       </div>

                       <div className="flex-1 space-y-12">
                          <div>
                             <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-6">Opis Inicijative</h4>
                             <p className="text-2xl text-gray-700 font-medium leading-relaxed max-w-3xl">{selectedSubmission.description}</p>
                          </div>
                       </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 font-black uppercase tracking-[0.5em] text-xs">
                       <span className="material-icons-round text-6xl mb-4 opacity-10">touch_app</span>
                       Odaberite prijavu za detaljnu analizu
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Challenges and Incubator remain similar but filtered by adminContext */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="material-icons-round">location_city</span>
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-lg">Upravljanje Izazovima</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Dodaj nove inicijative za grad</p>
                    </div>
                </div>
                <button onClick={() => setShowChallengeModal(true)} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center">
                    <span className="material-icons-round text-sm mr-2">add</span>
                    Novi Izazov
                </button>
            </div>
          <motion.div 
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={spring}
            className="grid grid-cols-1 gap-4"
          >
             {challenges.filter(c => c.cityId === adminContext).map(challenge => (
               <div key={challenge.id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-10">
                     <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <span className="material-icons-round text-3xl">{getChallengeIcon(challenge.category as Category)}</span>
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{challenge.title}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{challenge.category}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-16 mt-8 md:mt-0">
                     <div className="text-right">
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">{challenge.fund}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Sredstva za Grant</p>
                     </div>
                  </div>
               </div>
             ))}
          </motion.div>
          </div>
        )}

        {activeTab === 'documents' && (
          <motion.div 
            key="documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={spring}
            className="space-y-6"
          >
            {documentRequests.filter(r => r.cityId === adminContext).length === 0 ? (
              <div className="py-32 text-center bg-white rounded-[4rem] border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200 shadow-inner">
                  <span className="material-icons-round text-5xl">description</span>
                </div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.5em]">Nema zahtjeva za dokumente</p>
              </div>
            ) : (
              documentRequests.filter(r => r.cityId === adminContext).map(request => (
                <div key={request.id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-lg ${
                          request.status === 'APPROVED' ? 'bg-green-600' : request.status === 'REJECTED' ? 'bg-red-600' : 'bg-amber-600'
                        }`}>
                          <span className="material-icons-round">document_scanner</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-gray-900">{request.userName}</h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{request.documentType}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                            request.status === 'APPROVED' ? 'text-green-600' : request.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'
                          }`}>{request.status}</p>
                        </div>
                      </div>
                      {request.description && (
                        <p className="text-gray-700 font-medium leading-relaxed max-w-3xl mb-6">{request.description}</p>
                      )}
                      <p className="text-[10px] text-gray-400 font-bold">{new Date(request.createdAt).toLocaleDateString('hr-HR')}</p>
                    </div>
                    {request.status === 'PENDING' && (
                      <div className="flex gap-3 shrink-0 ml-6">
                        <button 
                          onClick={() => approveDocumentRequest(request.id)}
                          className="px-6 py-4 bg-green-50 text-green-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all"
                        >
                          <span className="material-icons-round text-sm mr-2 inline-block align-middle">check_circle</span>
                          Odobri
                        </button>
                        <button 
                          onClick={() => rejectDocumentRequest(request.id)}
                          className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                        >
                          <span className="material-icons-round text-sm mr-2 inline-block align-middle">cancel</span>
                          Odbij
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <motion.div 
            key="posts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={spring}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="material-icons-round">forum</span>
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-lg">Upravljanje Objavama</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Objavite nove civilne objave ili moderira postojeće</p>
                    </div>
                </div>
                <button onClick={() => setShowPostModal(true)} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center">
                    <span className="material-icons-round text-sm mr-2">add</span>
                    Nova Objava
                </button>
            </div>
            {posts.filter(p => p.cityID === getCityNumber(adminContext)).length === 0 ? (
              <div className="py-32 text-center bg-white rounded-[4rem] border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200 shadow-inner">
                  <span className="material-icons-round text-5xl">forum</span>
                </div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.5em]">Nema objava za moderaciju</p>
              </div>
            ) : (
              posts.filter(p => p.cityID === getCityNumber(adminContext)).map(post => (
                <div key={post.id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-lg shadow-lg">
                          {post.authorAvatar}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-gray-900">{post.authorName}</h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OIB: {post.authorOIB}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{post.time}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed max-w-3xl mb-6">{post.content}</p>
                      <div className="flex items-center gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                          <span className="material-icons-round text-sm">thumb_up</span>
                          {post.likes} Lajka
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="material-icons-round text-sm">comment</span>
                          {post.comments} Komentara
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deletePost(post.id)}
                      className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all shrink-0 ml-6"
                    >
                      <span className="material-icons-round text-sm mr-2 inline-block align-middle">delete</span>
                      Obriši
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'incubator' && (
          <motion.div 
            key="incubator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={spring}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {Object.values(IncubatorStage).map(stage => {
              const stageIdeas = ideas.filter(i => i.cityId === adminContext && i.status === 'APPROVED' && i.stage === stage);
              return (
                <div key={stage} className="flex flex-col min-h-[600px]">
                  <div className="flex items-center justify-between mb-6 px-5">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{stage}</h4>
                     <span className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">{stageIdeas.length}</span>
                  </div>
                  <div className="flex-1 bg-gray-50/50 rounded-[3.5rem] p-5 border border-gray-100/50 space-y-5">
                    {stageIdeas.map(idea => (
                      <div key={idea.id} className="bg-white p-7 rounded-[2.2rem] shadow-sm border border-gray-100 transition-all hover:shadow-2xl hover:scale-[1.02]">
                                              <h5 className="font-black text-gray-900 text-sm mb-2 leading-tight tracking-tight line-clamp-2">{idea.title}</h5>
                                              {idea.date && (
                                                <p className="text-[10px] text-gray-400 font-bold mb-2">{formatDate(idea.date)}</p>
                                              )}
                      </div>
                    ))}

                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'polls' && (
          <motion.div
            key="polls"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={spring}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ankete</h4>
              <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Kreiraj novu anketu</h3>
              <div className="space-y-4">
                <input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Pitanje ankete"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm text-gray-900"
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Trajanje</label>
                  <select
                    value={pollEndsInDays === null ? 'none' : String(pollEndsInDays)}
                    onChange={(e) => setPollEndsInDays(e.target.value === 'none' ? null : Number(e.target.value))}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  >
                    <option value="1">1 dan</option>
                    <option value="3">3 dana</option>
                    <option value="7">7 dana</option>
                    <option value="14">14 dana</option>
                    <option value="30">30 dana</option>
                    <option value="none">Bez roka</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {pollOptions.map((opt, idx) => (
                    <div key={`poll-opt-${idx}`} className="flex gap-2">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const next = [...pollOptions];
                          next[idx] = e.target.value;
                          setPollOptions(next);
                        }}
                        placeholder={`Opcija ${idx + 1}`}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm text-gray-900"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                          type="button"
                        >
                          <span className="material-icons-round text-sm">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPollOptions(prev => [...prev, ''])}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                    type="button"
                  >
                    Dodaj opciju
                  </button>
                  <button
                    onClick={submitPoll}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                    type="button"
                  >
                    Objavi anketu
                  </button>
                </div>
              </div>
            </div>

            {polls.filter(p => p.cityId === adminContext).length === 0 ? (
              <div className="py-32 text-center bg-white rounded-[4rem] border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200 shadow-inner">
                  <span className="material-icons-round text-5xl">poll</span>
                </div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.5em]">Nema anketa</p>
              </div>
            ) : (
              polls.filter(p => p.cityId === adminContext).map(poll => (
                <div key={poll.id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Anketa</h4>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">{poll.question}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${poll.isClosed ? 'text-red-600' : 'text-gray-400'}`}>
                        {poll.isClosed ? 'Zatvoreno' : poll.endsIn || 'Aktivno'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSetPollClosed(poll.id, !poll.isClosed)}
                        className={`w-10 h-10 rounded-xl transition-all ${poll.isClosed ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                        title={poll.isClosed ? 'Ponovno otvori anketu' : 'Zatvori anketu'}
                        type="button"
                      >
                        <span className="material-icons-round text-sm">{poll.isClosed ? 'lock_open' : 'lock'}</span>
                      </button>
                      <button
                        onClick={() => onDeletePoll(poll.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        title="Obriši anketu"
                        type="button"
                      >
                        <span className="material-icons-round text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                    Ukupno glasova: {poll.totalVotes}
                  </p>
                  <div className="space-y-4">
                    {poll.options.map(option => {
                      const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={option.id} className="w-full p-5 rounded-2xl border bg-gray-50 border-transparent relative overflow-hidden">
                          <div className="flex justify-between items-center relative z-10">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-900">
                              {option.text}
                            </span>
                            <span className="text-[10px] font-black text-gray-500">
                              {`${percent}% (${option.votes})`}
                            </span>
                          </div>
                          <div className="absolute left-0 top-0 bottom-0 bg-gray-200/20" style={{ width: `${percent}%` }}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {showChallengeModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black text-gray-900">Novi Izazov</h3>
                 <button onClick={() => setShowChallengeModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Naziv</label>
                      <input 
                        type="text" 
                        value={newChallenge.title}
                        onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
                        placeholder="Naziv izazova..."
                      />
                  </div>
                   <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Opis</label>
                      <textarea 
                        value={newChallenge.description}
                        onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-gray-900" 
                        placeholder="Detalji..."
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Kategorija</label>
                        <select
                            value={newChallenge.category}
                            onChange={e => setNewChallenge({...newChallenge, category: e.target.value as Category})}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Prioritet</label>
                        <select
                            value={newChallenge.priority}
                            onChange={e => setNewChallenge({...newChallenge, priority: e.target.value as any})}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="Nisko">Nisko</option>
                            <option value="Srednje">Srednje</option>
                            <option value="Visoko">Visoko</option>
                            <option value="Kritično">Kritično</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Fond (€)</label>
                        <input 
                            type="text" 
                            value={newChallenge.fund}
                            onChange={e => setNewChallenge({...newChallenge, fund: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
                            placeholder="e.g. 50.000 €"
                        />
                    </div>
                    <div>
                         <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Rok</label>
                         <DateInput
                            value={newChallenge.deadline}
                            onChange={(date: any) => setNewChallenge({...newChallenge, deadline: date ? date.toISOString() : ''})}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Odaberi rok"
                            minDate={new Date()}
                            maxDate={null}
                         />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                      <button onClick={() => setShowChallengeModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Odustani</button>
                      <button 
                        onClick={handleAddChallenge} 
                        disabled={!newChallenge.title || !newChallenge.description}
                        className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-colors disabled:opacity-50"
                      >
                          Dodaj Izazov
                      </button>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showPostModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black text-gray-900">Nova Civilna Objava</h3>
                 <button onClick={() => setShowPostModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Naslov (Opciono)</label>
                      <input 
                        type="text" 
                        value={newPost.title}
                        onChange={e => setNewPost({...newPost, title: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
                        placeholder="Naslov objave..."
                      />
                  </div>
                  <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Sadržaj</label>
                      <textarea 
                        value={newPost.content}
                        onChange={e => setNewPost({...newPost, content: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-blue-500 h-32 resize-none text-gray-900" 
                        placeholder="Objavi važnuu poruku za građane..."
                      />
                  </div>

                  <div className="pt-4 flex gap-4">
                      <button onClick={() => setShowPostModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Odustani</button>
                      <button 
                        onClick={handleCreatePost} 
                        disabled={!newPost.content}
                        className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-colors disabled:opacity-50"
                      >
                          Objavi
                      </button>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
};

export default AdminPortal;