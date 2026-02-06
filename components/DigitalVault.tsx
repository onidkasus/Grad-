
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DigitalDocument, CityConfig, DocumentRequest } from '../types';

const MOCK_DOCS: DigitalDocument[] = [
  { id: 'DOC-001', title: 'Rodni List (Izvadak)', category: 'Statusna stanja', date: '12.03.2024.', issuer: 'Matični ured Zadar', status: 'VERIFIED', fileType: 'PDF' },
  { id: 'DOC-002', title: 'Rješenje o komunalnoj naknadi', category: 'Financije', date: '01.02.2024.', issuer: 'Grad Zadar - Odjel za financije', status: 'VERIFIED', fileType: 'PDF' },
  { id: 'DOC-003', title: 'Građevinska dozvola - Privremena', category: 'Graditeljstvo', date: '20.03.2024.', issuer: 'Upravni odjel za prostorno uređenje', status: 'PENDING', fileType: 'PDF' },
];

interface DigitalVaultProps {
  city: CityConfig;
  documentRequests?: DocumentRequest[];
  onRequestDocument?: (request: Omit<DocumentRequest, 'id' | 'createdAt'>) => void;
  user?: { name: string; id: string };
}

const DigitalVault: React.FC<DigitalVaultProps> = ({ city, documentRequests = [], onRequestDocument, user }) => {
  const [filter, setFilter] = useState('Svi');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDocType, setRequestDocType] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = () => {
    if (!requestDocType.trim() || !user) return;
    
    setIsSubmitting(true);
    const newRequest: Omit<DocumentRequest, 'id' | 'createdAt'> = {
      userId: user.id,
      userName: user.name,
      documentType: requestDocType,
      description: requestDescription,
      status: 'PENDING',
      cityId: city.id
    };
    
    onRequestDocument?.(newRequest);
    setRequestDocType('');
    setRequestDescription('');
    setShowRequestModal(false);
    setIsSubmitting(false);
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
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DOCS.filter(doc => {
          if (filter === 'Svi') return true;
          if (filter === 'Verificirani') return doc.status === 'VERIFIED';
          if (filter === 'U obradi') return doc.status === 'PENDING';
          return true;
        }).map(doc => (
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

            <button className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
              Preuzmi PDF (Digitally Signed)
            </button>
          </motion.div>
        ))}
        
        <motion.button
          onClick={() => setShowRequestModal(true)}
          whileHover={{ y: -5 }}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-all w-full"
        >
          <span className="material-icons-round text-4xl text-gray-300 mb-4">cloud_upload</span>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zatraži novi dokument</p>
        </motion.button>

        <AnimatePresence>
          {showRequestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestModal(false)}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-2xl font-black text-gray-900 mb-2">Zatraži Dokument</h3>
                <p className="text-sm text-gray-500 mb-6">Unesite tip dokumenta koji trebate</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block mb-2">Tip Dokumenta</label>
                    <input
                      type="text"
                      value={requestDocType}
                      onChange={e => setRequestDocType(e.target.value)}
                      placeholder="npr. Potvrda o kućanstvu"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block mb-2">Napomena (Opcionalno)</label>
                    <textarea
                      value={requestDescription}
                      onChange={e => setRequestDescription(e.target.value)}
                      placeholder="Unesite dodatne informacije..."
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-3 text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Otkaži
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={!requestDocType.trim() || isSubmitting}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? 'Slanje...' : 'Zatraži'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DigitalVault;
