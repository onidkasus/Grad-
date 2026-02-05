import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, CityConfig } from '../types';
import { transactionsAPI } from '../services/api';

interface FiscalDashboardProps {
  city: CityConfig;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const FiscalDashboard: React.FC<FiscalDashboardProps> = ({ city, showToast }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const data = await transactionsAPI.getAll(city.id);
      setTransactions(data);
      setLoading(false);
    };
    fetchTransactions();
  }, [city.id]);

  const chartData = useMemo(() => {
    let cumulative = 0;
    return [...transactions].reverse().map(tx => {
      cumulative += tx.type === 'CRDT' ? tx.amount : -tx.amount;
      return {
        name: tx.date.split('-').slice(2).join('.'),
        fullDate: tx.date,
        amount: cumulative,
        raw: tx.amount,
        type: tx.type,
        desc: tx.description
      };
    });
  }, [transactions]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'CRDT').reduce((a, b) => a + b.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'DBIT').reduce((a, b) => a + b.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;
  const executionPercentage = totalIncome > 0 ? ((balance/totalIncome)*100).toFixed(1) : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white/40 animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{data.fullDate}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">€{data.amount.toLocaleString()}</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Status Likvidnosti</p>
             <p className="text-xs font-medium text-gray-500 leading-snug">{data.desc}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
     return <div className="p-10 text-center flex h-96 items-center justify-center text-gray-400 font-bold">Učitavanje financijskih podataka...</div>;
  }

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
             <span className="material-icons-round text-sm">verified</span> Transparentni Sustav 2.0
          </div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Proračunski Radar</h2>
          <p className="text-xl text-gray-400 font-medium mt-2 leading-tight">Uvid u financijsku cirkulaciju grada <span className="text-gray-900 font-bold">{city.name}</span>.</p>
        </div>
        
        <div className="flex bg-white p-3 rounded-[2.5rem] border border-gray-100 shadow-xl gap-4">
           <div className="px-8 py-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ukupni Priljev</p>
              <p className="text-2xl font-black text-green-600 tracking-tighter">€{totalIncome.toLocaleString()}</p>
           </div>
           <div className="w-[1px] bg-gray-100 h-12 self-center"></div>
           <div className="px-8 py-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldni Odljev</p>
              <p className="text-2xl font-black text-red-600 tracking-tighter">€{totalExpense.toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl overflow-hidden relative group">
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Kretanje Likvidnosti</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dnevni Saldo</span>
               </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={city.id} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={city.theme.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={city.theme.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} 
                  dy={15} 
                />
                <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: city.theme.primary, strokeWidth: 2, strokeDasharray: '6 6' }}
                  isAnimationActive={false}
                />
                <ReferenceLine y={balance} stroke="#94a3b8" strokeDasharray="3 3" opacity={0.3} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={city.theme.primary} 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorAmt)" 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8 animate-in fade-in duration-1000">
           <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl h-full flex flex-col justify-between group overflow-hidden">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Sinteza Podataka</p>
                 <h4 className="text-3xl font-black mb-8 tracking-tighter leading-tight">Financijska Održivost</h4>
                 <div className="space-y-8">
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                          <span className="opacity-50">Slobodni Kapital</span>
                          <span>{executionPercentage}%</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, parseFloat(executionPercentage as string))}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-blue-500 rounded-full" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                          <span className="opacity-50">Izvršenje Proračuna</span>
                          <span>94%</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-green-500 rounded-full" />
                       </div>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => showToast('Izvještaj je spreman za preuzimanje.', 'success')}
                className="w-full mt-10 py-5 bg-white text-gray-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
              >
                Preuzmi Analizu
              </button>
              <span className="material-icons-round absolute -right-12 -bottom-12 text-[15rem] text-white/5 rotate-12 transition-transform group-hover:rotate-0">insights</span>
           </div>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-1000">
         <h3 className="text-2xl font-black text-gray-900 tracking-tight ml-4">Povijest Transakcija</h3>
         <div className="grid grid-cols-1 gap-4">
            {transactions.length === 0 ? (
                <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-[2rem]">Nema zabilježenih transakcija za ovaj grad.</div>
            ) : transactions.map((tx, idx) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, x: 10 }}
                className="bg-white rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 ${tx.type === 'CRDT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      <span className="material-icons-round text-2xl">{tx.type === 'CRDT' ? 'south_west' : 'north_east'}</span>
                   </div>
                   <div>
                      <p className="text-lg font-black text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{tx.description}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{tx.date} • ID: {tx.id}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                      <p className={`text-xl font-black ${tx.type === 'CRDT' ? 'text-green-600' : 'text-red-600'}`}>
                         {tx.type === 'CRDT' ? '+' : '-'} €{tx.amount.toLocaleString()}
                      </p>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300">Valuta: EUR</span>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Verificirano</span>
                   </div>
                   <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all">
                      <span className="material-icons-round text-lg">more_horiz</span>
                   </button>
                </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default FiscalDashboard;
