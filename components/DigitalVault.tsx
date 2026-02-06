
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DigitalDocument, CityConfig } from '../types';
import { documentService } from '../services/documentService';

// ...existing code...

const DOCUMENT_CATEGORIES = [
  { name: 'Statusna stanja', icon: 'badge', color: 'blue' },
  { name: 'Financije', icon: 'account_balance', color: 'green' },
  { name: 'Graditeljstvo', icon: 'construction', color: 'orange' },
  { name: 'Obrazovanje', icon: 'school', color: 'purple' },
  { name: 'Zdravstvo', icon: 'medical_services', color: 'red' },
  { name: 'Socijalna skrb', icon: 'volunteer_activism', color: 'pink' },
  { name: 'Ostalo', icon: 'folder_open', color: 'gray' }
];

const DigitalVault: React.FC<{ city: CityConfig; user?: { id: string; name: string } }> = ({ city, user }) => {
  const [filter, setFilter] = useState('Svi');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    documentType: '',
    category: '',
    description: '',
    urgency: 'normal'
  });
  const [documents, setDocuments] = useState<DigitalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user?.id) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const docs = await documentService.getUserDocuments(user.id);
        setDocuments(docs);
      } catch (err) {
        setError('Greška pri dohvaćanju dokumenata.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user?.id]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.category || !requestForm.documentType || !user) {
      alert('Molimo ispunite sva obavezna polja.');
      return;
    }
    try {
      await documentService.createDocumentRequest({
        userId: user.id,
        userName: user.name,
        documentType: requestForm.documentType,
        description: requestForm.description,
        status: 'PENDING',
        cityId: city.id
      });
      alert('Zahtjev za dokumentom je poslan! Obavijest ćete dobiti kada dokument bude dostupan.');
      setShowRequestModal(false);
      setRequestForm({
        documentType: '',
        category: '',
        description: '',
        urgency: 'normal'
      });
    } catch (err) {
      alert('Greška pri slanju zahtjeva.');
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (filter === 'Svi') return true;
    if (filter === 'Verificirani') return doc.status === 'VERIFIED';
    if (filter === 'U obradi') return doc.status === 'PENDING';
    return true;
  });

  const getDocCount = (filterType: string) => {
    if (filterType === 'Svi') return documents.length;
    if (filterType === 'Verificirani') return documents.filter(d => d.status === 'VERIFIED').length;
    if (filterType === 'U obradi') return documents.filter(d => d.status === 'PENDING').length;
    return 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Moj Digitalni Sef</h2>
          <p className="text-gray-500 font-medium">Službeni dokumenti sinkronizirani s NIAS (e-Građanin) sustavom.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl">
          {['Svi', 'Verificirani', 'U obradi'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === f ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {f}
              <span className={`px-2 py-0.5 rounded-full text-[8px] ${filter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                {getDocCount(f)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full bg-gray-50 rounded-3xl p-12 text-center">
            <div className="flex flex-col items-center">
              <span className="material-icons-round text-6xl text-gray-300 mb-4">hourglass_empty</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Učitavanje dokumenata...</h3>
            </div>
          </div>
        ) : error ? (
          <div className="col-span-full bg-red-50 rounded-3xl p-12 text-center">
            <div className="flex flex-col items-center">
              <span className="material-icons-round text-6xl text-red-300 mb-4">error</span>
              <h3 className="text-xl font-bold text-red-900 mb-2">{error}</h3>
            </div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full bg-gray-50 rounded-3xl p-12 text-center">
            <div className="flex flex-col items-center">
              <span className="material-icons-round text-6xl text-gray-300 mb-4">folder_off</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nema dokumenata</h3>
              <p className="text-gray-500">Trenutno nema dokumenata u ovoj kategoriji.</p>
            </div>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <motion.div 
              key={doc.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <span className="material-icons-round text-2xl">description</span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  doc.status === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {doc.status}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">{doc.title}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{doc.category}</p>
              <div className="space-y-3 pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Izdavatelj:</span>
                  <span className="text-[10px] font-black text-gray-900">{doc.issuer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Datum:</span>
                  <span className="text-[10px] font-black text-gray-900">{doc.date}</span>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl">
                Preuzmi PDF (Digitally Signed)
              </button>
            </motion.div>
          ))
        )}
        <div 
          onClick={() => setShowRequestModal(true)}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 hover:border-blue-400 transition-all"
        >
          <span className="material-icons-round text-4xl text-gray-300 mb-4">cloud_upload</span>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zatraži novi dokument</p>
        </div>
      </div>

      {/* Request Document Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Zatraži Novi Dokument</h2>
                  <p className="text-gray-500 font-medium">Popunite formu za zahtjev službenog dokumenta</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <span className="material-icons-round text-3xl">close</span>
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Vrsta Dokumenta *
                  </label>
                  <input
                    type="text"
                    required
                    value={requestForm.documentType}
                    onChange={(e) => setRequestForm({...requestForm, documentType: e.target.value})}
                    placeholder="npr. Rodni list, Uvjerenje o prebivalištu..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Kategorija *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DOCUMENT_CATEGORIES.map(cat => {
                      const isSelected = requestForm.category === cat.name;
                      const colorClasses = {
                        blue: isSelected ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-blue-50/50 text-blue-600 border-blue-100',
                        green: isSelected ? 'bg-green-100 text-green-700 border-green-300' : 'bg-green-50/50 text-green-600 border-green-100',
                        orange: isSelected ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-orange-50/50 text-orange-600 border-orange-100',
                        purple: isSelected ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-purple-50/50 text-purple-600 border-purple-100',
                        red: isSelected ? 'bg-red-100 text-red-700 border-red-300' : 'bg-red-50/50 text-red-600 border-red-100',
                        pink: isSelected ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-pink-50/50 text-pink-600 border-pink-100',
                        gray: isSelected ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-50/50 text-gray-600 border-gray-100'
                      };
                      
                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setRequestForm({...requestForm, category: cat.name})}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 hover:scale-105 ${
                            colorClasses[cat.color as keyof typeof colorClasses]
                          } ${isSelected ? 'shadow-md' : 'hover:shadow-sm'}`}
                        >
                          <span className="material-icons-round text-2xl">{cat.icon}</span>
                          <span className="text-xs font-bold text-center leading-tight">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Hitnost
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'normal', label: 'Normalno', color: 'bg-gray-100 text-gray-700' },
                      { value: 'urgent', label: 'Hitno', color: 'bg-orange-100 text-orange-700' },
                      { value: 'very-urgent', label: 'Vrlo hitno', color: 'bg-red-100 text-red-700' }
                    ].map(urgency => (
                      <button
                        key={urgency.value}
                        type="button"
                        onClick={() => setRequestForm({...requestForm, urgency: urgency.value})}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                          requestForm.urgency === urgency.value
                            ? urgency.color + ' shadow-md'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {urgency.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Dodatni Opis
                  </label>
                  <textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                    placeholder="Opišite zašto vam je potreban ovaj dokument..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none text-gray-900"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-wider text-sm transition-all"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg hover:shadow-xl"
                  >
                    Pošalji Zahtjev
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DigitalVault;
