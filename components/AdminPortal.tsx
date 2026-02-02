
import React, { useState } from 'react';
import { Idea, Challenge, CityConfig, Category, IncubatorStage } from '../types';

interface AdminPortalProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  city: CityConfig;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ ideas, setIdeas, challenges, setChallenges, city, showToast }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'incubator' | 'challenges'>('submissions');

  // Form State for New Challenge
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>(Category.URBAN);
  const [newFund, setNewFund] = useState('');

  const pendingIdeas = ideas.filter(i => i.cityId === city.id && i.status === 'PENDING');
  const approvedIdeas = ideas.filter(i => i.cityId === city.id && i.status === 'APPROVED');
  
  const approveIdea = (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: 'APPROVED', stage: IncubatorStage.VALIDATION } : i));
    showToast('Projekt je odobren i prebačen u inkubator.', 'success');
  };

  const deleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    showToast('Prijava je odbijena.');
  };

  const moveIdea = (id: string, stage: IncubatorStage) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, stage } : i));
  };

  const createChallenge = () => {
    if (!newTitle || !newFund) return;
    
    const challenge: Challenge = {
      id: Date.now().toString(),
      cityId: city.id,
      title: newTitle,
      description: 'Novi strateški izazov za razvoj grada.',
      category: newCategory,
      progress: 0,
      deadline: '31.12.2024.',
      ideasCount: 0,
      priority: 'Visoko',
      fund: `${newFund} €`,
      featured: false,
      created_at: new Date().toISOString()
    };

    setChallenges(prev => [...prev, challenge]);
    setNewTitle('');
    setNewFund('');
    showToast('Nova misija je uspješno objavljena!', 'success');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight" style={{ color: city.theme.primary }}>Upravljačka Ploča: {city.name}</h2>
          <p className="text-gray-500 font-medium text-lg">Centralni sustav za moderaciju i strateško planiranje.</p>
        </div>
        <div className="flex p-1.5 bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] overflow-hidden">
          {[
            { id: 'submissions', label: `Prijave (${pendingIdeas.length})` },
            { id: 'incubator', label: 'Inkubator Plan' },
            { id: 'challenges', label: 'Gradski Izazovi' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-gray-900 shadow-2xl text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 gap-6">
          {pendingIdeas.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-200">
               <span className="material-icons-round text-8xl text-gray-100 mb-6">verified_user</span>
               <p className="text-gray-400 font-black text-xl">Sve građanske inicijative za grad {city.name} su obrađene.</p>
            </div>
          ) : (
            pendingIdeas.map(idea => (
              <div key={idea.id} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl flex flex-col md:flex-row gap-10 items-center hover:shadow-2xl transition-all group">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span 
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full"
                      style={{ backgroundColor: `${city.theme.primary}15`, color: city.theme.primary }}
                    >
                      {idea.category}
                    </span>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{idea.date}</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4 group-hover:translate-x-1 transition-transform">{idea.title}</h3>
                  <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed">{idea.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 border-2 border-white shadow-sm">{idea.authorAvatar}</div>
                    <span className="text-sm font-bold text-gray-600">Autor: <span className="font-black text-gray-900">{idea.author}</span></span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => approveIdea(idea.id)} 
                    className="w-full md:w-48 py-5 text-white font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    Odobri Projekt
                  </button>
                  <button 
                    onClick={() => deleteIdea(idea.id)}
                    className="w-full md:w-48 py-5 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all text-[11px] uppercase tracking-widest"
                  >
                    Odbaci Prijavu
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'incubator' && (
        <div className="flex gap-8 overflow-x-auto pb-12 snap-x px-2">
          {Object.values(IncubatorStage).map(stage => {
            const stageIdeas = approvedIdeas.filter(i => i.stage === stage);
            return (
              <div key={stage} className="flex-shrink-0 w-80 snap-start">
                <div className="flex items-center justify-between mb-6 px-6">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400">{stage}</h4>
                  <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-inner">{stageIdeas.length}</span>
                </div>
                <div className="bg-gray-50/50 backdrop-blur-3xl rounded-[3rem] p-5 min-h-[600px] border border-gray-100/50 space-y-5 shadow-inner">
                  {stageIdeas.map(idea => (
                    <div key={idea.id} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-50 group hover:-translate-y-2 transition-all cursor-move">
                      <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: city.theme.primary }}>{idea.category}</p>
                      <h5 className="font-black text-gray-900 mb-6 text-lg leading-tight">{idea.title}</h5>
                      <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                        <div className="flex gap-2">
                          {Object.values(IncubatorStage).indexOf(stage) > 0 && (
                            <button 
                              onClick={() => moveIdea(idea.id, Object.values(IncubatorStage)[Object.values(IncubatorStage).indexOf(stage) - 1])} 
                              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                            >
                                <span className="material-icons-round text-sm">chevron_left</span>
                            </button>
                          )}
                          {Object.values(IncubatorStage).indexOf(stage) < Object.values(IncubatorStage).length - 1 && (
                            <button 
                              onClick={() => moveIdea(idea.id, Object.values(IncubatorStage)[Object.values(IncubatorStage).indexOf(stage) + 1])} 
                              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                            >
                                <span className="material-icons-round text-sm">chevron_right</span>
                            </button>
                          )}
                        </div>
                        <span className="material-icons-round text-gray-200">drag_indicator</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl h-fit">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: city.theme.primary }}>
                  <span className="material-icons-round">add_task</span>
               </div>
               <h3 className="text-2xl font-black text-gray-900">Objavi Novu Misiju</h3>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Naslov Misije</label>
                <input 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  type="text" 
                  className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 outline-none transition-all font-bold focus:ring-4" 
                  style={{ '--tw-ring-color': `${city.theme.primary}20` } as any} 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategorija</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-black text-sm"
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dodijeljeni Fond (€)</label>
                  <input 
                    value={newFund}
                    onChange={(e) => setNewFund(e.target.value)}
                    type="text" 
                    placeholder="npr. 15.000" 
                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 font-black" 
                  />
                </div>
              </div>
              <button 
                onClick={createChallenge}
                className="w-full py-6 text-white font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest"
                style={{ backgroundColor: city.theme.primary }}
              >
                Objavi na Sustav
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black text-gray-900 mb-8">Aktivni Fondovi i Misije</h3>
            {challenges.filter(c => c.cityId === city.id).map(c => (
              <div key={c.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl flex items-center justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <span className="material-icons-round text-3xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: city.theme.primary }}>{c.category}</p>
                    <h4 className="font-black text-gray-900 text-lg leading-tight">{c.title}</h4>
                    <p className="text-xs font-bold text-gray-400 mt-1">Status: {c.progress}% Završeno</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                     setChallenges(prev => prev.filter(ch => ch.id !== c.id));
                     showToast('Misija je obrisana.');
                  }}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <span className="material-icons-round">delete_sweep</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
