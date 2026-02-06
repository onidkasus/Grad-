
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { User, Idea, Challenge, CityConfig } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  ideas: Idea[];
  challenges: Challenge[];
  city: CityConfig;
  showToast: (msg: string, type?: 'success' | 'info') => void;
  setActiveTab: (tab: string) => void;
  onOpenAI: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const Dashboard: React.FC<DashboardProps> = ({ user, ideas, challenges, city, showToast, setActiveTab, onOpenAI }) => {
  const chartData = [
    { name: 'Sij', val: 400, pred: 400 },
    { name: 'Velj', val: 1200, pred: 1100 },
    { name: 'Ožu', val: 900, pred: 1000 },
    { name: 'Tra', val: 2400, pred: 2200 },
    { name: 'Svi', val: 1800, pred: 1900 },
    { name: 'Lip', val: 2800, pred: 3000 },
    { name: 'Srp', val: null, pred: 3800 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] shadow-2xl border border-white/40 animate-in zoom-in-95 duration-200">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mjesec: {payload[0].payload.name}</p>
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">{payload[0].value || 'NA'}</span>
                <span className="text-[10px] font-black uppercase text-blue-600">Bodova</span>
             </div>
             {payload[1] && (
               <div className="flex items-center gap-2 opacity-50">
                  <span className="text-lg font-black text-gray-600">{payload[1].value}</span>
                  <span className="text-[10px] font-black uppercase text-gray-400">Predviđeno (AI)</span>
               </div>
             )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-32"
    >
      <motion.section 
        data-tour="header"
        variants={itemVariants} 
        className="relative min-h-[250px] rounded-[3rem] overflow-hidden shadow-2xl group flex flex-col justify-center border border-white/10"
        style={{ 
          background: `linear-gradient(135deg, ${city.theme.primary}, ${city.theme.secondary})` 
        }}
      >
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 hidden md:block"
        >
          <span className="material-icons-round text-[22rem] text-white select-none">
            {city.theme.culturalIcon}
          </span>
        </motion.div>

        <div className="relative z-10 p-10 md:px-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white leading-none">AI Predikcija Aktivna • {city.name}</p>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-none">
              Dobrodošli natrag, {user.name.split(' ')[0]}
            </h1>
            
            <p className="text-xl text-white/70 font-medium max-w-lg leading-snug">
              Vaš gradski operativni centar za razvoj i transparentnost. Danas je fokus na <span className="text-white font-black underline decoration-white/20 underline-offset-8">održivoj energiji</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
             <button 
               onClick={onOpenAI}
               className="px-10 py-5 bg-white text-gray-900 font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em]"
             >
                AI Savjetnik
             </button>
             <button 
                onClick={() => setActiveTab('vault')}
                className="px-10 py-5 bg-black/20 backdrop-blur-2xl border border-white/10 text-white font-black rounded-[2rem] hover:bg-black/30 transition-all text-[11px] uppercase tracking-[0.2em]"
             >
                Digitalni Sef
             </button>
          </div>
        </div>
      </motion.section>

      <div data-tour="kpis" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { id: 'challenges', label: 'Aktivne Misije', value: challenges.length, icon: 'auto_awesome_motion', color: '#f59e0b' },
          { id: 'community', label: 'Moje Inicijative', value: ideas.length, icon: 'tips_and_updates', color: city.theme.primary },
          { id: 'impact', label: 'Globalni Utjecaj', value: user.impactScore, icon: 'energy_savings_leaf', color: '#10b981' },
          { id: 'account', label: 'Status Člana', value: user.rank.split(' ')[0], icon: 'shield', color: '#8b5cf6' },
        ].map((kpi, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onClick={() => kpi.id !== 'impact' && setActiveTab(kpi.id)}
            className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group ${kpi.id !== 'impact' ? 'cursor-pointer' : ''}`}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
              <span className="material-icons-round text-2xl">{kpi.icon}</span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Kretanje Inovacija & AI Predviđanje</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Stvarni podaci vs AI model rasta</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-[9px] font-black uppercase text-gray-400">Stvarno</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <span className="text-[9px] font-black uppercase text-gray-400">AI Model</span>
               </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={city.theme.primary} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={city.theme.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="6 6" stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} dy={15} />
                <YAxis hide domain={['dataMin - 500', 'dataMax + 1000']} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pred" 
                  stroke="#e2e8f0" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  fill="transparent"
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke={city.theme.primary} 
                  strokeWidth={6} 
                  fillOpacity={1}
                  fill="url(#mainGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-black tracking-tight">Status Sustava</h3>
               <span className="material-icons-round text-blue-500 animate-spin">hub</span>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { title: 'e-Građanin Sinkronizacija', val: 'Aktivna', icon: 'sync', color: '#10b981', action: () => setActiveTab('vault') },
                { title: 'Digitalni Identitet', val: 'Verificiran', icon: 'fingerprint', color: '#3b82f6', action: () => setActiveTab('account') },
                { title: 'Proračunska Transparentnost', val: '98%', icon: 'visibility', color: '#f59e0b', action: () => setActiveTab('fiscal') },
                { title: 'Kripto-Sigurnost', val: 'AES-256', icon: 'security', color: '#8b5cf6' },
              ].map((act, i) => (
                <div 
                  key={i} 
                  onClick={act.action}
                  className={`flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all ${act.action ? 'cursor-pointer' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${act.color}20`, color: act.color }}>
                    <span className="material-icons-round text-lg">{act.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest">{act.title}</h4>
                    <p className="text-xs font-black tracking-tight mt-1">{act.val}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => showToast('Otvaranje tehničkih specifikacija sustava...', 'info')}
              className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-700 transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20"
            >
              Otvori Tehnički Centar
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
