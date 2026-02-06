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

function getGrowthIndicator(current: number, previous: number): { text: string; color: string } {
  if (!previous) return { text: '', color: '' };
  const growth = ((current - previous) / previous) * 100;
  if (growth > 0) {
    return { text: `↑ ${growth.toFixed(1)}%`, color: '#30d158' };
  } else if (growth < 0) {
    return { text: `↓ ${Math.abs(growth).toFixed(1)}%`, color: '#ff453a' };
  }
  return { text: '→ 0%', color: '#8e8e93' };
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

const FinancialCard = ({ title, data, field, format, calculateGrowth, colorFunc }: any) => {
    return (
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-default"
        >
            <h3 className="text-sm font-semibold text-gray-700 mb-5 pb-3 border-b border-gray-100">{title}</h3>
            <div className="space-y-5">
                {data.map((fin: any, i: number) => {
                    const nextYear = data[i + 1];
                    const growth = nextYear ? calculateGrowth(fin[field], nextYear[field]) : null;
                    const valueColor = colorFunc ? colorFunc(fin[field]) : undefined;
                    
                    return (
                        <motion.div 
                          key={fin.year} 
                          whileHover={{ x: 4 }}
                          className="flex justify-between items-center group"
                        >
                            <span className="text-gray-500 font-medium text-sm">{fin.year}</span>
                            <div className="text-right flex flex-col items-end">
                                <span className={`font-semibold text-base ${!colorFunc ? 'text-gray-900' : ''}`} style={{ color: valueColor }}>
                                    {format(fin[field])}
                                </span>
                                {growth && growth.text && (
                                    <span className="text-xs font-medium mt-1 px-2 py-1 rounded-full bg-gray-50" style={{ color: growth.color }}>
                                        {growth.text}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

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
              Brz i jednostavan pregled financijskih podataka hrvatskih tvrtki. Pronađite najpotrebnije informacije o bilo kojoj
              <span className="font-semibold"> tvrtki</span> iz baze.
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
                  <p className="text-gray-600 text-base max-w-2xl">Detaljne financijske podatke, vlasničku strukturu i sve što trebate znati o bilo kojoj tvrtki u Hrvatskoj</p>
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
                  className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-20 -mt-20"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                          <motion.h2 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-5xl font-bold text-gray-900"
                          >
                            {currentCompany.name}
                          </motion.h2>
                          <div className="flex flex-wrap gap-2 md:hidden">
                            <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">{currentCompany.status}</span>
                          </div>
                      </div>
                      <p className="text-gray-600 font-medium text-base mb-3">{currentCompany.fullName}</p>
                      <p className="text-gray-500 text-sm">
                          {currentCompany.address}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 hidden md:flex">
                        <div className="flex items-center gap-2">
                             <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">{currentCompany.status}</span>
                             <span className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium">Rating: {currentCompany.rating}</span>
                        </div>
                        <div>
                             <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    currentCompany.blocked
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }`}
                             >
                                {currentCompany.blocked ? 'Blokirana' : 'Aktivna'}
                            </span>
                        </div>
                    </div>
                  </div>

                  <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100"
                  >
                      <div className="space-y-1">
                        <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">OIB</span>
                        <p className="font-semibold text-gray-900 text-lg">{currentCompany.oib}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">MBS</span>
                        <p className="font-semibold text-gray-900 text-lg">{currentCompany.mbs}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Osnovan</span>
                        <p className="font-semibold text-gray-900 text-lg">{currentCompany.founded}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Veličina</span>
                        <p className="font-black text-gray-900 text-lg">{currentCompany.size}</p>
                      </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-4 mt-8"
                  >
                      <a href={`tel:${currentCompany.phone}`} className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        {currentCompany.phone}
                      </a>
                      <span className="text-gray-300">•</span>
                      <a href={`mailto:${currentCompany.email}`} className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        {currentCompany.email}
                      </a>
                      <span className="text-gray-300">•</span>
                      <a href={`https://${currentCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        {currentCompany.website}
                      </a>
                  </motion.div>
                </motion.section>

                {/* Financial Data */}
                <motion.section 
                  variants={slideUpVariants}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Financijski Podaci
                    </h2>
                    <p className="text-gray-500 text-sm">Pregled financijskih metrika za zadnje tri godine</p>
                  </div>
                  <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    <FinancialCard
                      title="Ukupni Dohodak"
                      data={currentCompany.financials}
                      field="income"
                      format={formatCurrency}
                      calculateGrowth={getGrowthIndicator}
                    />
                    <FinancialCard
                      title="Ukupni Troškovi"
                      data={currentCompany.financials}
                      field="expenses"
                      format={formatCurrency}
                      calculateGrowth={getGrowthIndicator}
                    />
                    <FinancialCard
                      title="Dobit/Gubitak"
                      data={currentCompany.financials}
                      field="profit"
                      format={formatCurrency}
                      calculateGrowth={getGrowthIndicator}
                      colorFunc={getProfitColor}
                    />
                    <FinancialCard
                      title="Zaposlenici"
                      data={currentCompany.financials}
                      field="employees"
                      format={formatNumber}
                      calculateGrowth={getGrowthIndicator}
                    />
                  </motion.div>
                </motion.section>

                {/* Management */}
                <motion.section 
                  variants={slideUpVariants}
                  className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">
                    Upravljanje i Vlasništvo
                  </h2>
                  <div className="grid md:grid-cols-2 gap-12">
                    <motion.div variants={itemVariants}>
                       <h4 className="text-sm font-semibold text-gray-500 mb-4">Vlasnik</h4>
                       <p className="font-semibold text-gray-900 text-lg leading-relaxed">{currentCompany.owner}</p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                       <h4 className="text-sm font-semibold text-gray-500 mb-4">Direktori</h4>
                       <ul className="space-y-3">
                         {currentCompany.directors.map((director, idx) => (
                            <motion.li 
                              key={idx}
                              whileHover={{ x: 4 }}
                              className="font-medium text-gray-900 text-base flex items-center gap-3"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {director}
                            </motion.li>
                         ))}
                       </ul>
                    </motion.div>
                  </div>
                </motion.section>

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