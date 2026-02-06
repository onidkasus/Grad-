
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DigitalDocument, CityConfig } from '../types';

const MOCK_DOCS: DigitalDocument[] = [
  { id: 'DOC-001', title: 'Rodni List (Izvadak)', category: 'Statusna stanja', date: '12.03.2024.', issuer: 'Matični ured Zadar', status: 'VERIFIED', fileType: 'PDF' },
  { id: 'DOC-002', title: 'Rješenje o komunalnoj naknadi', category: 'Financije', date: '01.02.2024.', issuer: 'Grad Zadar - Odjel za financije', status: 'VERIFIED', fileType: 'PDF' },
  { id: 'DOC-003', title: 'Građevinska dozvola - Privremena', category: 'Graditeljstvo', date: '20.03.2024.', issuer: 'Upravni odjel za prostorno uređenje', status: 'PENDING', fileType: 'PDF' },
];

const DigitalVault: React.FC<{ city: CityConfig }> = ({ city }) => {
  const [filter, setFilter] = useState('Svi');

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
        {MOCK_DOCS.map(doc => (
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

            <button className="w-full mt-8 py-4 bg-gray-50 group-hover:bg-gray-900 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              Preuzmi PDF (Digitally Signed)
            </button>
          </motion.div>
        ))}
        
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-all">
          <span className="material-icons-round text-4xl text-gray-300 mb-4">cloud_upload</span>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zatraži novi dokument</p>
        </div>
      </div>
    </div>
  );
};

export default DigitalVault;
