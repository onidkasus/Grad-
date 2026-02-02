
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
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const Dashboard: React.FC<DashboardProps> = ({ user, ideas, challenges, city, showToast }) => {
  const chartData = [
    { name: 'Sij', val: 400 },
    { name: 'Velj', val: 1200 },
    { name: 'Ožu', val: 900 },
    { name: 'Tra', val: 2400 },
    { name: 'Svi', val: 1800 },
    { name: 'Lip', val: 2800 },
    { name: 'Srp', val: 3400 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] shadow-2xl border border-white/40 animate-in zoom-in-95 duration-200">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mjesec: {payload[0].payload.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">{payload[0].value}</span>
            <span className="text-[10px] font-black uppercase text-blue-600">Bodova</span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 mt-2">Analitika Inovacija</p>
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
      {/* 250px HIGH COMMANDER HEADER WITH ANIMATED ICON */}
      <motion.section 
        data-tour="header"
        variants={itemVariants} 
        className="relative min-h-[250px] rounded-[3rem] overflow-hidden shadow-2xl group flex flex-col justify-center border border-white/10"
        style={{ 
          background: `linear-gradient(135deg, ${city.theme.primary}, ${city.theme.secondary})` 
        }}
      >
        {/* ANIMATED FLOATING CITY ICON */}
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
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white leading-none">Gradski Sustav Online • {city.name}</p>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-none">
              Dobrodošli, {user.name.split(' ')[0]}
            </h1>
            
            <p className="text-xl text-white/70 font-medium max-w-lg leading-snug">
              Vaš personalizirani kontrolni centar za razvoj i inovacije u gradu <span className="text-white font-black underline decoration-white/20 underline-offset-8">{city.name}</span>. 
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
             <button 
               onClick={() => showToast('Pokretanje obrasca za novu viziju...', 'info')}
               className="px-10 py-5 bg-white text-gray-900 font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em]"
             >
                Nova Vizija
             </button>
             <button 
                className="px-10 py-5 bg-black/20 backdrop-blur-2xl border border-white/10 text-white font-black rounded-[2rem] hover:bg-black/30 transition-all text-[11px] uppercase tracking-[0.2em]"
             >
                Moja Arhiva
             </button>
          </div>
        </div>
      </motion.section>

      {/* KPI GRID */}
      <div data-tour="kpis" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Aktivne Misije', value: challenges.length, icon: 'military_tech', color: '#f59e0b' },
          { label: 'Vaše Ideje', value: ideas.length, icon: 'lightbulb', color: city.theme.primary },
          { label: 'Impact Score', value: user.impactScore, icon: 'bolt', color: '#10b981' },
          { label: 'Sustav Rank', value: user.rank.split(' ')[0], icon: 'verified', color: '#8b5cf6' },
        ].map((kpi, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 group-hover:scale-110" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
              <span className="material-icons-round text-2xl">{kpi.icon}</span>
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN ANALYTICS */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Kolektivni Rast Inovacija</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Podaci prikupljeni u realnom vremenu</p>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><span className="material-icons-round">more_horiz</span></button>
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
                <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: city.theme.primary, strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke={city.theme.primary} 
                  strokeWidth={6} 
                  fillOpacity={1}
                  fill="url(#mainGradient)" 
                  animationDuration={2000}
                  activeDot={{ r: 10, fill: city.theme.primary, stroke: 'white', strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* NOTIFICATIONS BOX */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-2xl font-black mb-10 tracking-tight">Zadnje Novosti</h3>
            <div className="space-y-6 flex-1 overflow-y-auto">
              {[
                { title: 'Projekt "Solari" odobren', time: 'Prije 2h', icon: 'check_circle', color: '#10b981' },
                { title: 'Novi izazov objavljen', time: 'Prije 5h', icon: 'campaign', color: '#3b82f6' },
                { title: 'Badž "Eko Vitez" osvojen', time: 'Jučer', icon: 'stars', color: '#f59e0b' },
                { title: 'Komentar na ideju', time: 'Jučer', icon: 'forum', color: '#8b5cf6' },
              ].map((act, i) => (
                <div key={i} className="flex gap-5 group/item">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover/item:scale-110" style={{ backgroundColor: `${act.color}20`, color: act.color }}>
                    <span className="material-icons-round text-xl">{act.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight group-hover/item:text-blue-400 transition-colors">{act.title}</h4>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">Pregledaj sve aktivnosti</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
