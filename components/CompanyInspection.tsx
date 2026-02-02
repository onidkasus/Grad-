
import React, { useState } from 'react';
import { CompanyData } from '../types';
import { INFOBIP_DATA } from '../constants';

interface CompanyInspectionProps {
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const CompanyInspection: React.FC<CompanyInspectionProps> = ({ showToast }) => {
  const [query, setQuery] = useState('');
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!query) return;
    setIsLoading(true);
    setTimeout(() => {
      if (query.toLowerCase().includes('infobip') || query === '29756659895') {
        setCompany(INFOBIP_DATA);
        showToast('Podaci uspješno dohvaćeni iz registra.', 'success');
      } else {
        setCompany(null);
        showToast('Subjekt nije pronađen u bazi.', 'info');
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="bg-gray-900 rounded-[3.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                  <span className="material-icons-round text-3xl">manage_search</span>
               </div>
               <div>
                  <h2 className="text-4xl font-black tracking-tighter leading-none">Inspekcija Partnera</h2>
                  <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Povezano s CompanyWall HR</p>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
               <div className="flex-1 relative group">
                  <span className="material-icons-round absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors">business</span>
                  <input 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Naziv tvrtke ili OIB..."
                    className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] outline-none text-white placeholder:text-white/20 font-black text-xl focus:ring-4 focus:ring-blue-500/20 focus:bg-white/10 transition-all"
                  />
               </div>
               <button 
                 onClick={handleSearch}
                 disabled={isLoading}
                 className="px-12 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
               >
                 {isLoading ? 'Provjera Baze...' : 'Pokreni Analizu'}
               </button>
            </div>
            
            <div className="flex gap-8 mt-10 opacity-40">
               <div className="flex items-center gap-2">
                  <span className="material-icons-round text-sm">verified_user</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Službeni registar</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="material-icons-round text-sm">security</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Enkripcija podataka</span>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
      </div>

      {company ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in zoom-in-95 duration-500">
           <div className="lg:col-span-2 space-y-10">
              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl">
                 <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                    <div>
                       <div className="flex items-center gap-3 mb-4">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${company.blocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                             {company.blocked ? 'U blokadi' : 'Nije u blokadi'}
                          </span>
                          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">OIB: {company.oib}</span>
                       </div>
                       <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">{company.name}</h3>
                       <p className="text-gray-400 font-medium">{company.fullName}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bonitetna Ocjena</p>
                       <p className="text-6xl font-black text-blue-600 tracking-tighter">{company.rating}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-gray-50">
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">MBS</p>
                       <p className="text-sm font-black text-gray-900">{company.mbs}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Osnovana</p>
                       <p className="text-sm font-black text-gray-900">{company.founded}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Veličina</p>
                       <p className="text-sm font-black text-gray-900">{company.size}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Zaposleni</p>
                       <p className="text-sm font-black text-gray-900">{company.financials[0].employees}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl">
                 <h4 className="text-xl font-black text-gray-900 mb-10 tracking-tight">Financijski Zdravstveni Karton</h4>
                 <div className="space-y-4">
                    <div className="grid grid-cols-4 pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <span>Godina</span>
                       <span className="text-right">Prihodi</span>
                       <span className="text-right">Rashodi</span>
                       <span className="text-right">Neto Dobit</span>
                    </div>
                    {company.financials.map(fin => (
                       <div key={fin.year} className="grid grid-cols-4 py-6 border-t border-gray-50 items-center group hover:bg-gray-50 transition-colors rounded-2xl px-2">
                          <span className="text-sm font-black text-gray-900">{fin.year}</span>
                          <span className="text-right text-sm font-bold text-gray-900">€{(fin.income/1000000).toFixed(1)}M</span>
                          <span className="text-right text-sm font-bold text-gray-500">€{(fin.expenses/1000000).toFixed(1)}M</span>
                          <span className="text-right text-sm font-black text-green-600">€{(fin.profit/1000000).toFixed(2)}M</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-10">
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl">
                 <h4 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Uprava</h4>
                 <div className="space-y-6">
                    {company.directors.map(dir => (
                       <div key={dir} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <span className="material-icons-round">person</span>
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-900 leading-tight">{dir}</p>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Član Uprave / Zastupnik</p>
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="mt-10 pt-8 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Vlasnička Struktura</p>
                    <p className="text-sm font-bold text-gray-900 leading-relaxed">{company.owner}</p>
                 </div>
              </div>

              <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <h4 className="text-2xl font-black mb-4 tracking-tight">Kreditni Rizik</h4>
                    <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">Tvrtka posluje s iznimno niskim rizikom. Preporučena suradnja u javnim nabavama.</p>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Djelatnost</p>
                       <p className="text-xs font-bold leading-tight">{company.activity}</p>
                    </div>
                 </div>
                 <span className="material-icons-round absolute -right-4 -bottom-4 text-9xl text-white/10 group-hover:rotate-12 transition-transform">verified</span>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white/40 backdrop-blur-3xl rounded-[4rem] p-32 text-center border-2 border-dashed border-gray-200">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <span className="material-icons-round text-5xl">search</span>
           </div>
           <h3 className="text-3xl font-black text-gray-300 tracking-tight">Sustav spreman za pretragu</h3>
           <p className="text-gray-400 font-medium max-w-sm mx-auto mt-4">Pronađite bilo koji registrirani subjekt u RH i provjerite njihovu financijsku povijest.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyInspection;
