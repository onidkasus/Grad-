
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge, CityConfig, Category, Idea, IncubatorStage, User } from '../types';

// Helper for dd/mm/yyyy
function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  // Check if it's "TBD" or similar text
  if (typeof dateStr === 'string' && !dateStr.includes('-')) return dateStr;

  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return dateStr as string;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

interface ChallengesListProps {
  challenges: Challenge[];
  city: CityConfig;
  user: User;
  onSubmitIdea: (idea: Partial<Idea>) => void;
  ideas: Idea[]; // Dodano za provjeru statusa prijave
}

const ChallengesList: React.FC<ChallengesListProps> = ({ challenges, city, user, onSubmitIdea, ideas }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Provjera je li se korisnik već pridružio određenoj misiji
  const userApplications = useMemo(() => {
    return ideas.reduce((acc, idea) => {
      if (idea.challenge_id && idea.author === user.name) {
        acc.add(idea.challenge_id);
      }
      return acc;
    }, new Set<string>());
  }, [ideas, user.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedChallenge) return;

    setIsSubmitting(true);
    // Simuliramo mrežni zahtjev
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSubmitIdea({
      title,
      description,
      category: selectedChallenge.category,
      challenge_id: selectedChallenge.id
    });

    setTitle('');
    setDescription('');
    setSelectedChallenge(null);
    setIsSubmitting(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Aktivni Gradski Izazovi</h2>
          <p className="text-gray-500 font-medium">Odaberite izazov i doprinesite gradu {city.name} kroz inovacije.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge) => {
          const hasApplied = userApplications.has(challenge.id);
          
          return (
            <div key={challenge.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full overflow-hidden">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    challenge.priority === 'Kritično' ? 'bg-red-500 shadow-red-100' : 
                    challenge.priority === 'Visoko' ? 'bg-amber-500 shadow-amber-100' : ''
                  }`} style={challenge.priority !== 'Kritično' && challenge.priority !== 'Visoko' ? { backgroundColor: city.theme.primary } : {}}>
                    <span className="material-icons-round">{hasApplied ? 'check_circle' : 'stars'}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: city.theme.primary, borderColor: `${city.theme.primary}20` }}>
                      {challenge.category}
                    </span>
                    {hasApplied && (
                      <span className="text-[8px] font-black uppercase tracking-tighter text-green-600 bg-green-50 px-2 py-0.5 rounded">Moj Izazov</span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors" style={{ color: city.theme.primary }}>
                  {challenge.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8 text-sm line-clamp-3">
                  {challenge.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Napredak izazova</span>
                    <span className="text-sm font-black" style={{ color: city.theme.primary }}>{challenge.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${challenge.progress}%`, background: `linear-gradient(to right, ${city.theme.primary}, ${city.theme.secondary})` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rok</p>
                    <p className="text-sm font-black text-gray-900">{formatDate(challenge.deadline)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Grant Fond</p>
                    <p className="text-sm font-black" style={{ color: city.theme.primary }}>{challenge.fund.split(' ')[0]}</p>
                  </div>
                </div>
              </div>

              {hasApplied ? (
                <div className="w-full py-6 bg-green-50 text-green-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <span className="material-icons-round text-sm">check_circle</span>
                  Prijava poslana adminima
                </div>
              ) : (
                <button 
                  onClick={() => setSelectedChallenge(challenge)}
                  className="w-full py-6 bg-gray-50 border-t border-gray-100 text-gray-900 font-bold hover:text-white transition-all flex items-center justify-center gap-2"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = city.theme.primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  Pridruži se izazovu
                  <span className="material-icons-round text-lg">arrow_forward</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* SUBMISSION MODAL */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChallenge(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 md:p-12"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Prijavi rješenje</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Za izazov: {selectedChallenge.title}</p>
                </div>
                <button onClick={() => setSelectedChallenge(null)} className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <span className="material-icons-round">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Naslov vaše ideje</label>
                  <input 
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="npr. Automatizacija solarne mreže..."
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none font-bold transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Detaljan opis</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Kako planirate riješiti ovaj izazov? Opišite prednosti..."
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none font-medium min-h-[160px] resize-none transition-all"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 rounded-3xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3"
                    style={{ backgroundColor: city.theme.primary, boxShadow: `0 20px 40px -10px ${city.theme.primary}40` }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Slanje prijave...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round text-sm">rocket_launch</span>
                        Pošalji Adminima na Verifikaciju
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-gray-400 text-center mt-4 font-medium italic">Vaša prijava će biti poslana na pregled gradskim službama.</p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChallengesList;
