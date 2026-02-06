import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { CompanyData } from '../types';
import CompanyService from '../services/companyService';

// Formatting helpers
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('hr-HR').format(value);
}

function getProfitColor(profit: number): string {
  return profit >= 0 ? '#30d158' : '#ff453a';
}

interface CompanyInspectionProps {
  showToast?: (msg: string, type?: 'success' | 'info') => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const slideUpVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.1 } }
};

const displayValue = (value: string | undefined | null) => value && value !== '-' ? value : 'N/A';
const isMissing = (value: string | undefined | null) => !value || value === '-' || value === 'N/A';

const CompanyInspection: React.FC<CompanyInspectionProps> = ({ showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<CompanyData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setCurrentCompany(null);

    const query = searchQuery.trim();
    try {
      const data = await CompanyService.search(query);
      if (data) {
        setCurrentCompany(data);
      } else {
        setErrorMessage(`Tvrtka "${searchQuery}" nije pronađena.`);
      }
    } catch (error: any) {
      console.error('API error:', error);
      setErrorMessage(`Greška pri dohvaćanju podataka: ${error.message || 'Nepoznata greška'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
      
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 min-h-[360px] rounded-t-3xl overflow-hidden flex flex-col justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -ml-32 -mb-32"></div>
        </div>

        <div className="relative z-10 px-6 md:px-16 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                Inspekcija Tvrtki
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 font-medium max-w-2xl leading-relaxed"
            >
              Detaljne financijske podatke, vlasničku strukturu i sve što trebate znati o bilo kojoj tvrtki u Hrvatskoj
            </motion.p>
          </div>
        </div>
      </motion.section>

      <div className="relative z-0 bg-gray-50 min-h-screen rounded-t-3xl -mt-8 pt-8">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16">
          {/* Search Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative bg-white rounded-3xl p-8 md:p-12 shadow-md border border-gray-100 mb-12 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-blue-600/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-1/2 w-52 h-52 bg-gradient-to-br from-blue-400/5 to-transparent rounded-full -ml-10 -mb-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="inline-block bg-blue-100 px-4 py-2 rounded-full mb-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Brza Pretraga</p>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    Pronađite Tvrtku
                  </h2>
                  <p className="text-gray-600 text-base max-w-2xl">Financijske podatke, vlasničku strukturu, kontakte i sve što trebate znati</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder-gray-500"
                        placeholder="Unesite naziv ili OIB..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-md hover:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>Pretraži</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.section>

          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.section 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-700 mb-12"
              >
                <p className="font-medium text-base">{errorMessage}</p>
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {currentCompany && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={currentCompany.oib}
                className="space-y-8"
              >
                
                {/* Header Card */}
                <motion.section 
                  variants={slideUpVariants}
                  className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-20 -mt-20"></div>
                  
                  <div className="relative z-10">
                    <motion.h2 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-5xl md:text-6xl font-black text-gray-900 mb-2"
                    >
                      {currentCompany.name}
                    </motion.h2>
                    <p className="text-gray-600 font-medium text-lg mb-4">{currentCompany.address}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">{currentCompany.status}</span>
                      {currentCompany.inBlockade && <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold">U BLOKADI</span>}
                    </div>

                    {!isMissing(currentCompany.description) && (
                      <p className="text-gray-700 leading-relaxed mt-4 text-base">{currentCompany.description}</p>
                    )}
                  </div>
                </motion.section>

                {/* Basic Info Grid */}
                <motion.section 
                  variants={slideUpVariants}
                  className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
                >
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Osnovni Podaci</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: 'OIB', value: currentCompany.oib },
                      { label: 'MBS', value: currentCompany.mbs },
                      { label: 'Datum osnivanja', value: currentCompany.founded },
                      { label: 'Djelatnost', value: currentCompany.activity },
                      { label: 'Veličina', value: currentCompany.size },
                      { label: 'Rating', value: currentCompany.rating }
                    ]
                      .filter(item => !isMissing(item.value))
                      .map((item) => (
                        <motion.div key={item.label} variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                          <p className="text-base font-semibold text-gray-900 mt-2">{displayValue(item.value)}</p>
                        </motion.div>
                      ))}
                  </div>
                </motion.section>

                {/* Contact Information */}
                {(!isMissing(currentCompany.phone) || !isMissing(currentCompany.email) || !isMissing(currentCompany.website) || (currentCompany.phones && currentCompany.phones.length > 0)) && (
                  <motion.section 
                    variants={slideUpVariants}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Kontakti</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {!isMissing(currentCompany.phone) && (
                        <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Glavni Telefon</span>
                          <p className="text-base font-semibold text-gray-900 mt-2">{displayValue(currentCompany.phone)}</p>
                        </motion.div>
                      )}
                      {!isMissing(currentCompany.email) && (
                        <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">E-mail</span>
                          <p className="text-base font-semibold text-gray-900 mt-2">{displayValue(currentCompany.email)}</p>
                        </motion.div>
                      )}
                      {!isMissing(currentCompany.website) && (
                        <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100 md:col-span-2">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Web stranica</span>
                          <a href={currentCompany.website} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-blue-600 hover:text-blue-700 mt-2 block truncate">{displayValue(currentCompany.website)}</a>
                        </motion.div>
                      )}
                      {currentCompany.phones && currentCompany.phones.length > 0 && (
                        <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100 md:col-span-2">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Svi Telefonski Brojevi</span>
                          <div className="mt-2 space-y-1">
                            {currentCompany.phones.map((phone, idx) => (
                              <p key={idx} className="text-base font-medium text-gray-900">{phone}</p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.section>
                )}

                {/* Ownership & Management */}
                {(!isMissing(currentCompany.owner) || (currentCompany.directors && currentCompany.directors.length > 0)) && (
                  <motion.section 
                    variants={slideUpVariants}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Vlasništvo i Upravljanje</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {!isMissing(currentCompany.owner) && (
                        <motion.div variants={itemVariants}>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Vlasnik</h4>
                          <p className="text-base font-semibold text-gray-900">{displayValue(currentCompany.owner)}</p>
                        </motion.div>
                      )}
                      {currentCompany.directors && currentCompany.directors.length > 0 && (
                        <motion.div variants={itemVariants}>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Direktori</h4>
                          <ul className="space-y-2">
                            {currentCompany.directors.map((director, idx) => (
                              <li key={idx} className="text-base font-medium text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {director}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </motion.section>
                )}

                {/* Financial Summary */}
                {currentCompany.financials && currentCompany.financials.length > 0 && (
                  <motion.section 
                    variants={slideUpVariants}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Financijski Sažetak</h2>
                      <p className="text-gray-500 text-sm">Financijski pokazatelji po godinama</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {currentCompany.financials.map((fin) => (
                        <motion.div 
                          key={fin.year}
                          variants={itemVariants}
                          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                        >
                          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 pb-4 border-b border-gray-100">Godina {fin.year}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Prihodi</span>
                              <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(fin.income)}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Rashodi</span>
                              <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(fin.expenses)}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Rezultat</span>
                              <p className="text-lg font-bold mt-2" style={{ color: getProfitColor(fin.profit) }}>
                                {formatCurrency(fin.profit)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Zaposlenici</span>
                              <p className="text-lg font-bold text-gray-900 mt-2">{fin.employees}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Bank Accounts */}
                {currentCompany.bankAccounts && currentCompany.bankAccounts.length > 0 && (
                  <motion.section 
                    variants={slideUpVariants}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Bankovni Računi</h3>
                    <div className="space-y-4">
                      {currentCompany.bankAccounts.map((account, idx) => (
                        <motion.div key={idx} variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-sm font-bold text-gray-900 mb-2">{account.iban}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Banka</span>
                              <p className="font-medium text-gray-900 mt-1">{account.bank}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Otvoreno</span>
                              <p className="font-medium text-gray-900 mt-1">{account.opened}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</span>
                              <p className={`font-medium mt-1 ${account.status.toLowerCase() === 'aktivan' ? 'text-green-600' : 'text-red-600'}`}>{account.status}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Additional Info */}
                {(!isMissing(currentCompany.taxDebt) || !isMissing(currentCompany.realEstate)) && (
                  <motion.section 
                    variants={slideUpVariants}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
                  >
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Dodatne Informacije</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {!isMissing(currentCompany.taxDebt) && (
                        <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Porezni Dug</span>
                          <p className="text-base font-semibold text-gray-900 mt-2">{displayValue(currentCompany.taxDebt)}</p>
                        </motion.div>
                      )}
                      {!isMissing(currentCompany.realEstate) && (
                        <motion.div variants={itemVariants} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Nekretnine</span>
                          <p className="text-base font-semibold text-gray-900 mt-2">{displayValue(currentCompany.realEstate)}</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.section>
                )}

                <motion.section 
                  variants={slideUpVariants}
                  className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-sm transition-all"
                >
                  <p className="text-sm text-gray-600 font-medium">
                    Izvor podataka: <a
                      href={`https://www.companywall.hr/pretraga?q=${encodeURIComponent(currentCompany.name)}`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-blue-600 font-semibold hover:text-blue-700"
                    >CompanyWall.hr</a>
                  </p>
                </motion.section>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CompanyInspection;