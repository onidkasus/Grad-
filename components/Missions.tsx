import React, { useEffect, useState } from 'react';
import { Mission, User, UserRole } from '../types';
import { missionService } from '../services/missionService';
import { motion } from 'framer-motion';

interface MissionsProps {
  user: User | null;
}

const Missions: React.FC<MissionsProps> = ({ user }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [beginDate, setBeginDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadMissions = async () => {
    try {
      const data = await missionService.getAll();
      setMissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !desc || !beginDate || !endDate) return;
    
    try {
      await missionService.add(name, desc, new Date(beginDate), new Date(endDate));
      setName('');
      setDesc('');
      setBeginDate('');
      setEndDate('');
      loadMissions();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8">Učitavanje misija...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
         <h1 className="text-4xl font-black tracking-tight text-gray-900">Gradske Misije</h1>
         <p className="text-gray-500 text-lg">Pregled i upravljanje strateškim misijama grada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((m, i) => (
             <motion.div 
               key={m.id} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-xl transition-all duration-300 group"
             >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-icons-round text-2xl">flag</span>
                  </div>
                  <span className="px-3 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider">
                    Aktivan
                  </span>
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{m.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{m.desc}</p>
                
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 pt-4">
                   <span className="material-icons-round text-sm">schedule</span>
                   <span>{new Date(m.duration_begin).toLocaleDateString()} - {new Date(m.duration_end).toLocaleDateString()}</span>
                </div>
             </motion.div>
          ))}
      </div>

      {user?.isAdmin && (
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center">
                <span className="material-icons-round text-3xl">add</span>
              </div>
              <div>
                <h2 className="text-2xl font-black">Nova Misija</h2>
                <p className="text-gray-400 font-medium">Kreirajte novu stratešku misiju</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 pl-4">Naziv Misije</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 placeholder:text-gray-300"
                      placeholder="npr. Projekt Zeleni Grad"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    {/* Empty filler or maybe category selector later */}
                  </div>
              </div>
              
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400 pl-4">Opis</label>
                  <textarea 
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-300 min-h-[120px]"
                    placeholder="Detaljan opis misije..."
                    required
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 pl-4">Početak</label>
                    <input 
                      type="datetime-local" 
                      value={beginDate}
                      onChange={e => setBeginDate(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-400 pl-4">Završetak</label>
                    <input 
                      type="datetime-local" 
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                      required
                    />
                  </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-5 rounded-2xl bg-black text-white font-black tracking-wide text-lg hover:scale-[1.02] active:scale-95 transition-transform shadow-xl"
              >
                KREIRAJ MISIJU
              </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default Missions;
