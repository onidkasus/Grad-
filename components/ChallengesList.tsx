
import React from 'react';
import { Challenge, CityConfig } from '../types';

interface ChallengesListProps {
  challenges: Challenge[];
  city: CityConfig;
  onJoin: (id: string) => void;
}

const ChallengesList: React.FC<ChallengesListProps> = ({ challenges, city, onJoin }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Aktivni Gradski Izazovi</h2>
          <p className="text-gray-500 font-medium">Odaberite misiju i doprinesite gradu {city.name} kroz inovacije.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full overflow-hidden">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  challenge.priority === 'Kritično' ? 'bg-red-500 shadow-red-100' : 
                  challenge.priority === 'Visoko' ? 'bg-amber-500 shadow-amber-100' : ''
                }`} style={challenge.priority !== 'Kritično' && challenge.priority !== 'Visoko' ? { backgroundColor: city.theme.primary } : {}}>
                  <span className="material-icons-round">stars</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: city.theme.primary, borderColor: `${city.theme.primary}20` }}>
                  {challenge.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors" style={{ color: city.theme.primary }}>
                {challenge.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8 text-sm line-clamp-3">
                {challenge.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Napredak misije</span>
                  <span className="text-sm font-black" style={{ color: city.theme.primary }}>{challenge.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${challenge.progress}%`, background: `linear-gradient(to right, ${city.theme.primary}, ${city.theme.secondary})` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rok</p>
                  <p className="text-sm font-black text-gray-900">{challenge.deadline}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Grant Fond</p>
                  <p className="text-sm font-black" style={{ color: city.theme.primary }}>{challenge.fund.split(' ')[0]}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onJoin(challenge.id)}
              className="w-full py-6 bg-gray-50 border-t border-gray-100 text-gray-900 font-bold hover:text-white transition-all flex items-center justify-center gap-2"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = city.theme.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              Pridruži se misiji
              <span className="material-icons-round text-lg">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesList;
