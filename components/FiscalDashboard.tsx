import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'CRDT').reduce((a, b) => a + b.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'DBIT').reduce((a, b) => a + b.amount, 0), [transactions]);

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
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ukupni Proračun</p>
              <p className="text-2xl font-black text-green-600 tracking-tighter">€{totalIncome.toLocaleString()}</p>
           </div>
           <div className="w-[1px] bg-gray-100 h-12 self-center"></div>
           <div className="px-8 py-4">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Izvršeno / Potrošeno</p>
              <p className="text-2xl font-black text-red-600 tracking-tighter">€{totalExpense.toLocaleString()}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FiscalDashboard;
