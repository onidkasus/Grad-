
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Transaction, CityConfig } from '../types';
import { MOCK_TRANSACTIONS } from '../constants';

interface FiscalDashboardProps {
  city: CityConfig;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const FiscalDashboard: React.FC<FiscalDashboardProps> = ({ city, showToast }) => {
  const [hoveredData, setHoveredData] = useState<any>(null);

  const chartData = useMemo(() => {
    let cumulative = 0;
    return [...MOCK_TRANSACTIONS].reverse().map(tx => {
      cumulative += tx.type === 'CRDT' ? tx.amount : -tx.amount;
      return {
        name: tx.date.split('-').slice(2).join('.'), // Samo dan
        fullDate: tx.date,
        amount: cumulative,
        raw: tx.amount,
        type: tx.type,
        desc: tx.description
      };
    });
  }, []);

  const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'CRDT').reduce((a, b) => a + b.amount, 0);
  const totalExpense = MOCK_TRANSACTIONS.filter(t => t.type === 'DBIT').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{data.fullDate}</p>
          <p className="text-2xl font-black text-gray-900">€{data.amount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Saldo Likvidnosti</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
             <p className="text-xs font-medium text-gray-500 italic">Zadnja promjena:</p>
             <p className="text-xs font-black text-gray-900">{data.desc}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Proračunski Analitičar</h2>
          <p className="text-gray-400 font-medium italic">Profesionalni alat za sastavljanje i nadzor proračuna grada {city.name}.</p>
        </div>
        <div className="flex p-2 bg-white rounded-3xl border border-gray-100 shadow-sm gap-2">
           <div className="px-6 py-3 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Prihodi</p>
              <p className="text-lg font-black text-green-600">€{totalIncome.toLocaleString()}</p>
           </div>
           <div className="w-[1px] bg-gray-100 h-10 self-center"></div>
           <div className="px-6 py-3 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rashodi</p>
              <p className="text-lg font-black text-red-600">€{totalExpense.toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl overflow-hidden relative group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Krivulja Likvidnosti (Bezier)</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analiza za zadnjih 7 dana</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Projektirani Saldo</span>
               </div>
            </div>
          </div>
          
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} onMouseMove={(e: any) => e && e.activePayload && setHoveredData(e.activePayload[0].payload)}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={city.theme.primary} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={city.theme.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} dy={15} />
                <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: city.theme.primary, strokeWidth: 2, strokeDasharray: '4 4' }} />
                <ReferenceLine y={balance} stroke="#94a3b8" strokeDasharray="3 3" opacity={0.3} />
                <Area 
                  type="monotone" // Bezier krivulja
                  dataKey="amount" 
                  stroke={city.theme.primary} 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorAmt)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Planer Proračuna</p>
                 <h4 className="text-3xl font-black mb-6 tracking-tighter">Financijski Zdravlje</h4>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                          <span>Slobodna Sredstva</span>
                          <span>{((balance/totalIncome)*100).toFixed(1)}%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(balance/totalIncome)*100}%` }}></div>
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                          <span>Realizacija Prihoda</span>
                          <span>94%</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '94%' }}></div>
                       </div>
                    </div>
                 </div>
                 <button 
                   onClick={() => showToast('Izvještaj generiran i poslan na email.', 'success')}
                   className="w-full mt-10 py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                 >
                   Izvezi u PDF/XLS
                 </button>
              </div>
              <span className="material-icons-round absolute -right-8 -bottom-8 text-[12rem] text-white/5 rotate-12 transition-transform group-hover:rotate-0">pie_chart</span>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Najveći rashod tjedna</p>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <span className="material-icons-round">payments</span>
                 </div>
                 <div>
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">Subvencije vrtići</p>
                    <p className="text-xs font-bold text-gray-400">€89.000,00</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Analitika Transakcija</h3>
            <button 
              onClick={() => showToast('Filtri su primijenjeni.', 'info')}
              className="px-6 py-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100"
            >
              Filtri
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-50">
                     <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Datum</th>
                     <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Opis Transakcije</th>
                     <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Iznos</th>
                     <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {MOCK_TRANSACTIONS.map(tx => (
                     <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => showToast(`Detalji transakcije ${tx.id}`, 'info')}>
                        <td className="py-6">
                           <p className="text-xs font-black text-gray-900">{tx.date}</p>
                           <p className="text-[10px] font-bold text-gray-300">{tx.id}</p>
                        </td>
                        <td className="py-6">
                           <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{tx.description}</p>
                        </td>
                        <td className="py-6 text-right">
                           <p className={`text-sm font-black ${tx.type === 'CRDT' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'CRDT' ? '+' : '-'}€{tx.amount.toLocaleString()}
                           </p>
                        </td>
                        <td className="py-6 text-right">
                           <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">Proknjiženo</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default FiscalDashboard;
