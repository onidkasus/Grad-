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
import { Idea, Challenge, CityConfig, Category, IncubatorStage } from '../types';
import { CITIES } from '../constants';
import { ideasAPI, challengesAPI } from '../services/api';

interface AdminPortalProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  city: CityConfig;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ ideas, setIdeas, challenges, setChallenges, city, showToast }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'challenges' | 'incubator' | 'global'>('submissions');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [adminContext, setAdminContext] = useState<string>(city.id); // Default to user city
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
      title: '',
      description: '',
      category: Category.URBAN,
      priority: 'Srednje',
      fund: '0 €',
      deadline: ''
  });

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


  const filteredIdeas = useMemo(() => ideas.filter(i => i.cityId === adminContext), [ideas, adminContext]);
  const pendingIdeas = useMemo(() => filteredIdeas.filter(i => i.status === 'PENDING'), [filteredIdeas]);
  const selectedSubmission = useMemo(() => pendingIdeas.find(i => i.id === selectedSubmissionId) || pendingIdeas[0], [pendingIdeas, selectedSubmissionId]);

  const globalStats = useMemo(() => {
    return {
      totalIdeas: ideas.length,
      totalPending: ideas.filter(i => i.status === 'PENDING').length,
      totalChallenges: challenges.length,
      byCity: CITIES.map(c => ({
        id: c.id,
        name: c.name,
        primary: c.theme.primary,
        count: ideas.filter(i => i.cityId === c.id).length,
        pending: ideas.filter(i => i.cityId === c.id && i.status === 'PENDING').length
      }))
    };
  }, [ideas, challenges]);

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

  const spring = { type: "spring", stiffness: 400, damping: 40 } as const;

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Gradska Uprava</h2>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.5em]">Nadzorna Ploča •</p>
            <select 
              value={adminContext}
              onChange={(e) => { setAdminContext(e.target.value); setSelectedSubmissionId(null); }}
              className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 border-none outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex p-1.5 bg-gray-200/50 rounded-[2rem] border border-gray-200 overflow-x-auto max-w-full">
          {[
            { id: 'submissions', label: `Prijave (${pendingIdeas.length})`, icon: 'inbox' },
            { id: 'challenges', label: 'Gradski Izazovi', icon: 'location_city' },
            { id: 'incubator', label: 'Inkubator', icon: 'grid_view' },
            { id: 'global', label: 'Nacionalni Pregled', icon: 'public' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.4rem] text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab.id ? 'bg-white shadow-xl text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
              style={activeTab === tab.id ? { color: city.theme.primary } : {}}
            >
              <span className="material-icons-round text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'global' && (
          <motion.div 
            key="global"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <div className="bg-gray-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8">Nacionalna Aktivnost</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-4xl font-black">{globalStats.totalIdeas}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Ukupno Ideja</p>
                     </div>
                     <span className="material-icons-round text-blue-500 text-4xl">analytics</span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-white/10">
                     <div>
                        <p className="text-4xl font-black text-amber-500">{globalStats.totalPending}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Čeka Verifikaciju</p>
                     </div>
                     <span className="material-icons-round text-amber-500 text-4xl">hourglass_top</span>
                  </div>
               </div>
               <span className="material-icons-round absolute -right-8 -bottom-8 text-white/5 text-[15rem] rotate-12">flag</span>
            </div>

            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Status po Gradovima</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {globalStats.byCity.map(cityStats => (
                    <div key={cityStats.id} className="p-6 rounded-2xl bg-gray-50 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-blue-50">
                       <div>
                          <p className="text-sm font-black uppercase tracking-tighter" style={{ color: city.theme.primary }}>{cityStats.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{cityStats.count} Projekata</p>
                       </div>
                       {cityStats.pending > 0 && (
                         <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black animate-pulse">
                           {cityStats.pending} NOVO
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

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
                        <span className="material-icons-round text-3xl">location_city</span>
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
      </AnimatePresence>

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
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Naziv izazova..."
                      />
                  </div>
                   <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Opis</label>
                      <textarea 
                        value={newChallenge.description}
                        onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" 
                        placeholder="Detalji..."
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Kategorija</label>
                        <select
                            value={newChallenge.category}
                            onChange={e => setNewChallenge({...newChallenge, category: e.target.value as Category})}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Prioritet</label>
                        <select
                            value={newChallenge.priority}
                            onChange={e => setNewChallenge({...newChallenge, priority: e.target.value as any})}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500" 
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
      </AnimatePresence>
    </div>

  );
};

export default AdminPortal;