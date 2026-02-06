
import React, { useState } from 'react';
import { User, CityConfig } from '../types';
import { getInitials } from '../services/api';

interface UserAccountProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  city: CityConfig;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const UserAccount: React.FC<UserAccountProps> = ({ user, setUser, city, showToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);

  const handleSave = () => {
    setUser(prev => ({ ...prev, name: editName, email: editEmail }));
    setIsEditing(false);
    showToast('Profil uspješno ažuriran!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 p-2 shadow-2xl group transition-transform hover:rotate-3">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-5xl font-black text-blue-600">
              {user.avatar === 'NM' ? getInitials(user.name) : user.avatar}
            </div>
          </div>
          <div className="text-center md:text-left flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="material-icons-round text-sm">verified_user</span>
              NIAS Verificirano
            </div>
            
            {isEditing ? (
              <div className="space-y-4 max-w-md animate-in fade-in">
                <input 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl font-black text-2xl border border-blue-200 text-gray-900"
                />
                <input 
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl font-medium text-gray-600"
                />
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{user.name}</h2>
                <p className="text-gray-500 font-medium text-lg mb-6">{user.email}</p>
              </>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              {isEditing ? (
                  <button onClick={handleSave} className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all">Spremi Promjene</button>
              ) : (
                  <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all">Uredi Profil</button>
              )}
                <button onClick={() => showToast('Digitalna osobna je već povezana.', 'info')} className="px-6 py-3 bg-white border border-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all">Digitalna Osobna</button>
            </div>
          </div>
        </div>
      </div>

      {/* ACHIVEMENTS WALL */}
      <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Kolekcija Bedževa</h3>
            <p className="text-sm font-medium text-gray-400 italic">Vaša digitalna postignuća u razvoju grada.</p>
          </div>
          <div className="text-right">
             <p className="text-3xl font-black text-gray-900">{user.badges.filter(b => b.unlocked).length}/{user.badges.length}</p>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Osvojeno</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {user.badges.map(badge => (
            <div key={badge.id} className={`group relative flex flex-col items-center p-6 rounded-[2.5rem] transition-all duration-500 ${
              badge.unlocked ? 'bg-gray-50 hover:bg-white hover:shadow-2xl hover:-translate-y-2' : 'opacity-20 grayscale cursor-not-allowed'
            }`}>
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4 group-hover:rotate-12 transition-transform"
                style={{ backgroundColor: badge.unlocked ? badge.color : '#e5e7eb' }}
              >
                <span className="material-icons-round text-3xl">{badge.icon}</span>
              </div>
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest text-center leading-tight">{badge.name}</p>
              
              <div className="absolute bottom-full mb-4 w-48 p-4 bg-gray-900 text-white rounded-2xl text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 text-center shadow-2xl">
                <span className="font-black text-blue-400 block mb-1 uppercase">{badge.name}</span>
                {badge.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm text-center">
          <span className="material-icons-round text-4xl text-blue-600 mb-4">analytics</span>
          <h3 className="text-3xl font-black text-gray-900 mb-1">{user.impactScore}</h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Impact Score</p>
        </div>
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm text-center">
          <span className="material-icons-round text-4xl text-amber-600 mb-4">workspace_premium</span>
          <h3 className="text-3xl font-black text-gray-900 mb-1">{user.rank}</h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Gradski Rang</p>
        </div>
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm text-center">
          <span className="material-icons-round text-4xl text-green-600 mb-4">insights</span>
          <h3 className="text-3xl font-black text-gray-900 mb-1">Top 5%</h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Inovatora u {city.name}</p>
        </div>
      </div>

      <div className="text-center pt-10 border-t border-gray-50">
        <p className="text-2xl font-black text-blue-600/20 italic tracking-tighter">Od građana za građane</p>
      </div>
    </div>
  );
};

export default UserAccount;
