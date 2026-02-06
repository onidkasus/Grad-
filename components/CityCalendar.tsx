import React, { useState, useEffect, useMemo } from 'react';
import DateInput from './DateInput';
import { motion, AnimatePresence } from 'framer-motion';
import { CityConfig, Idea, User, UserRole, CityEvent } from '../types';
import { ideasAPI, eventsAPI } from '../services/api';

interface CityCalendarProps {
  city: CityConfig;
  showToast: (msg: string, type?: 'success' | 'info') => void;
  user: User;
}

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: 'PROJECT' | 'ELECTION' | 'PUBLIC_HEARING' | 'EVENT' | 'HOLIDAY';
  description?: string;
  category?: string;
}

const WEEKDAYS = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED'];
const MONTHS = [
  'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
  'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
];

// Mock generic events for 2026
const GLOBAL_EVENTS: Partial<CalendarEvent>[] = [
  { id: 'evt_1', date: new Date(2026, 0, 1), title: 'Nova Godina', type: 'HOLIDAY' },
  { id: 'evt_2', date: new Date(2026, 4, 1), title: 'Praznik rada', type: 'HOLIDAY' },
  { id: 'evt_3', date: new Date(2026, 4, 17), title: 'Lokalni Izbori 2026', type: 'ELECTION', description: 'Izbori za članove gradskih vijeća i gradonačelnike.' },
  { id: 'evt_4', date: new Date(2026, 5, 22), title: 'Dan antifašističke borbe', type: 'HOLIDAY' },
  { id: 'evt_5', date: new Date(2026, 7, 5), title: 'Dan pobjede', type: 'HOLIDAY' },
  { id: 'evt_6', date: new Date(2026, 11, 25), title: 'Božić', type: 'HOLIDAY' },
  { id: 'evt_7', date: new Date(2026, 2, 15), title: 'Javna rasprava o GUP-u', type: 'PUBLIC_HEARING', description: 'Prezentacija izmjena Generalnog urbanističkog plana.' },
  { id: 'evt_8', date: new Date(2026, 5, 10), title: 'Dan Grada', type: 'EVENT', description: 'Svečana sjednica i koncert na trgu.' },
];

const CityCalendar: React.FC<CityCalendarProps> = ({ city, showToast, user }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 5)); // Feb 5, 2026
  const [projects, setProjects] = useState<Idea[]>([]);
  const [customEvents, setCustomEvents] = useState<CityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 1, 5));
  
  // Admin Add Event Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'EVENT' as 'EVENT' | 'ELECTION' | 'PUBLIC_HEARING' | 'HOLIDAY',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ideasData, eventsData] = await Promise.all([
         ideasAPI.getAll(city.id),
         eventsAPI.getAll(city.id)
      ]);
      setProjects(ideasData);
      setCustomEvents(eventsData);
    } catch (e) {
      console.error("Failed to load data", e);
      showToast("Neuspješno učitavanje podataka.", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [city.id]);

  const handleCreateEvent = async () => {
    if(!newEvent.title || !newEvent.date) return;
    setIsSubmitting(true);
    try {
        await eventsAPI.add({
            cityId: city.id,
            title: newEvent.title,
            description: newEvent.description,
            date: newEvent.date, // Store as ISO string
            type: newEvent.type,
            createdBy: user.id
        });
        showToast("Događaj uspješno dodan!", "success");
        setShowAddModal(false);
        setNewEvent({ title: '', description: '', type: 'EVENT', date: '' });
        fetchData(); // Refresh
    } catch (e) {
        showToast("Greška pri dodavanju događaja.", "info");
    } finally {
        setIsSubmitting(false);
    }
  };

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // 1. Add Global Events
    GLOBAL_EVENTS.forEach(evt => {
        if(evt.date) {
            allEvents.push({
                id: evt.id!,
                date: evt.date,
                title: evt.title!,
                type: evt.type || 'EVENT',
                description: evt.description
            });
        }
    });

    // 2. Map Projects
    projects.forEach(p => {
        const d = new Date(p.created_at);
        allEvents.push({
            id: p.id,
            date: d,
            title: `Projekt: ${p.title}`,
            type: 'PROJECT',
            description: p.description,
            category: p.category
        });
    });

    // 3. Map Custom DB Events
    customEvents.forEach(e => {
        const d = new Date(e.date);
        allEvents.push({
            id: e.id,
            date: d,
            title: e.title,
            type: e.type,
            description: e.description
        });
    });

    return allEvents;
  }, [projects, customEvents]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
      const day = new Date(year, month, 1).getDay();
      return day === 0 ? 6 : day - 1; // Adjust for Monday start (0=Mon, 6=Sun)
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const changeMonth = (delta: number) => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const dayEvents = (date: Date) => {
      return events.filter(e => 
          e.date.getDate() === date.getDate() && 
          e.date.getMonth() === date.getMonth() && 
          e.date.getFullYear() === date.getFullYear()
      );
  };

  const selectedDayEvents = selectedDate ? dayEvents(selectedDate) : [];

  const getEventTypeColor = (type: string) => {
      switch(type) {
          case 'ELECTION': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'HOLIDAY': return 'bg-red-100 text-red-700 border-red-200';
          case 'PROJECT': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'PUBLIC_HEARING': return 'bg-amber-100 text-amber-700 border-amber-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  return (
    <div className="space-y-8 pb-32">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
             <span className="material-icons-round text-sm">calendar_month</span> Službeni Raspored
          </div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Gradski Kalendar</h2>
          <p className="text-xl text-gray-400 font-medium mt-2 leading-tight">Pregled projekata i važnih događaja u gradu <span className="text-gray-900 font-bold">{city.name}</span>.</p>
        </div>
        
        <div className="flex items-center gap-4">
            {user.role === UserRole.ADMIN && (
            <button 
                onClick={() => setShowAddModal(true)}
                className="hidden md:flex items-center gap-2 h-14 px-6 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                <span className="material-icons-round">add</span>
                <span>Dodaj</span>
            </button>
            )}
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
                <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-icons-round">chevron_left</span>
                </button>
                <div className="px-4 text-center min-w-[150px]">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mjesec</p>
                    <p className="text-xl font-black text-gray-900">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}.</p>
                </div>
                <button onClick={() => changeMonth(1)} className="p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="material-icons-round">chevron_right</span>
                </button>
            </div>
        </div>

      </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Calendar Grid */}
           <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
               <div className="grid grid-cols-7 mb-4">
                   {WEEKDAYS.map(day => (
                       <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">
                           {day}
                       </div>
                   ))}
               </div>
               <div className="grid grid-cols-7 gap-2">
                   {days.map((date, idx) => {
                       if (!date) return <div key={`empty-${idx}`} className="h-32 bg-gray-50/30 rounded-2xl" />;
                       
                       const evts = dayEvents(date);
                       const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                       const isToday = date.toDateString() === new Date(2026, 1, 5).toDateString(); // Mock Today Feb 5

                       return (
                           <motion.button
                                whileHover={{ scale: 0.98 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(date)}
                                key={date.toISOString()}
                                className={`h-32 rounded-2xl p-3 flex flex-col items-start justify-start border transition-all relative overflow-hidden ${
                                    isSelected 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg ring-4 ring-blue-100' 
                                    : isToday
                                        ? 'bg-blue-50 border-blue-200 text-gray-900'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:shadow-md'
                                }`}
                           >
                               <span className={`text-lg font-black ${isSelected ? 'text-white' : isToday ? 'text-blue-600' : 'text-gray-900'}`}>{date.getDate()}</span>
                               
                               <div className="flex flex-wrap gap-1 mt-2 w-full">
                                   {evts.slice(0, 3).map((e, i) => (
                                       <div 
                                        key={i} 
                                        className={`w-full h-1.5 rounded-full ${
                                            e.type === 'ELECTION' ? 'bg-purple-400' :
                                            e.type === 'PROJECT' ? (isSelected ? 'bg-white/50' : 'bg-blue-400') :
                                            'bg-gray-300'
                                        }`} 
                                       />
                                   ))}
                                   {evts.length > 3 && <div className="json-full h-1.5 w-1.5 rounded-full bg-gray-300" />}
                               </div>
                           </motion.button>
                       );
                   })}
               </div>
           </div>

           {/* Event List / Details */}
           <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 min-h-[500px]">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <span className="material-icons-round text-blue-600">event</span>
                        {selectedDate ? `${selectedDate.getDate()}. ${MONTHS[selectedDate.getMonth()]}` : 'Odaberi datum'}
                    </h3>
                    
                    <div className="space-y-4">
                        {selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map(evt => (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={evt.id} 
                                    className={`p-4 rounded-2xl border ${getEventTypeColor(evt.type)}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{evt.type === 'PROJECT' ? 'Projekt' : evt.type}</span>
                                        {evt.type === 'ELECTION' && <span className="material-icons-round text-sm">how_to_vote</span>}
                                    </div>
                                    <h4 className="font-bold text-lg leading-tight mb-2">{evt.title}</h4>
                                    {evt.description && <p className="text-xs opacity-80 leading-relaxed">{evt.description}</p>}
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <span className="material-icons-round text-4xl mb-2 opacity-20">event_busy</span>
                                <p className="text-sm font-medium">Nema događaja za ovaj datum.</p>
                            </div>
                        )}
                        
                        {selectedDate && (
                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <button className="w-full py-4 bg-gray-50 text-gray-900 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                                    Dodaj Podsjetnik
                                </button>
                            </div>
                        )}
                    </div>
                </div>
           </div>
       </div>

       <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black text-gray-900">Novi Događaj</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Naziv</label>
                      <input 
                        type="text" 
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Naziv događaja..."
                      />
                  </div>
                   <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Datum</label>
                      <DateInput
                        value={newEvent.date}
                        onChange={date => setNewEvent({ ...newEvent, date })}
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500"
                        minDate={null}
                        maxDate={null}
                        placeholder="Odaberi datum"
                      />
                  </div>
                  <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Tip</label>
                      <select 
                        value={newEvent.type}
                        onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500"
                      >
                          <option value="EVENT">Događaj</option>
                          <option value="PUBLIC_HEARING">Javna Rasprava</option>
                          <option value="ELECTION">Izbori</option>
                          <option value="HOLIDAY">Praznik</option>
                      </select>
                  </div>
                   <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">Opis</label>
                      <textarea 
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" 
                        placeholder="Detalji..."
                      />
                  </div>
                  
                  <div className="pt-4 flex gap-4">
                      <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Odustani</button>
                      <button 
                        onClick={handleCreateEvent} 
                        disabled={isSubmitting || !newEvent.title}
                        className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-colors disabled:opacity-50"
                      >
                          {isSubmitting ? 'Spremanje...' : 'Spremi'}
                      </button>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityCalendar;