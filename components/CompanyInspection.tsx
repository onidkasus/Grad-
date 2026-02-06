import React, { useState } from 'react';
import { CompanyData } from '../types';
import CompanyService from '../services/companyService';
// import { INFOBIP_DATA } from '../constants';

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

const FinancialCard = ({ title, data, field, format, calculateGrowth, colorFunc }: any) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-gray-500 mb-5 uppercase tracking-wider border-b border-gray-100 pb-2">{title}</h3>
            <div className="space-y-4">
                {data.map((fin: any, i: number) => {
                    const nextYear = data[i + 1];
                    const growth = nextYear ? calculateGrowth(fin[field], nextYear[field]) : null;
                    const valueColor = colorFunc ? colorFunc(fin[field]) : undefined;
                    
                    return (
                        <div key={fin.year} className="flex justify-between items-center group">
                            <span className="font-mono text-gray-400 font-medium text-sm group-hover:text-gray-600 transition-colors">{fin.year}</span>
                            <div className="text-right flex flex-col items-end">
                                <span className={`font-bold text-base ${!colorFunc ? 'text-gray-900' : ''}`} style={{ color: valueColor }}>
                                    {format(fin[field])}
                                </span>
                                {growth && growth.text && (
                                    <span className="text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full bg-gray-50" style={{ color: growth.color }}>
                                        {growth.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
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
    <div className="font-sans text-gray-900 bg-gray-50/50 min-h-screen p-6 md:p-10 animate-in fade-in duration-500">
      
      <header className="mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-2 tracking-tight text-gray-900">🔍 Company Inspection</h1>
        <p className="text-gray-500 font-medium">
          View financial data of Croatian companies via the <span className="text-blue-600 font-bold">CompanyWall</span> database
        </p>
      </header>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
            Search Company
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder-gray-400"
                placeholder="Enter company name or OIB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </section>

        {errorMessage && (
          <section className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 flex items-center gap-3 animate-in slide-in-from-top-2">
            <span className="text-xl">⚠️</span>
            <p className="font-medium text-sm">{errorMessage}</p>
          </section>
        )}

        {currentCompany && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Header Card */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">{currentCompany.name}</h2>
                      <div className="flex flex-wrap gap-2 md:hidden">
                        <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">{currentCompany.status}</span>
                      </div>
                  </div>
                  <p className="text-gray-500 font-medium text-base mb-4">{currentCompany.fullName}</p>
                  <p className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <span>📍</span> 
                      {currentCompany.address}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-3 hidden md:flex">
                    <div className="flex items-center gap-2">
                         <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">{currentCompany.status}</span>
                         <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold">Rating: {currentCompany.rating}</span>
                    </div>
                    <div>
                         <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                currentCompany.blocked
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-green-50 text-green-700 border-green-100'
                            }`}
                         >
                            {currentCompany.blocked ? '🔴 Blocked' : '🟢 Not Blocked'}
                        </span>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
                  <div className="space-y-1">
                    <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">OIB</span>
                    <p className="font-mono font-bold text-gray-900">{currentCompany.oib}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">MBS</span>
                    <p className="font-mono font-bold text-gray-900">{currentCompany.mbs}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">Founded</span>
                    <p className="font-bold text-gray-900">{currentCompany.founded}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">Size</span>
                    <p className="font-bold text-gray-900">{currentCompany.size}</p>
                  </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                  <a href={`tel:${currentCompany.phone}`} className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    📞 {currentCompany.phone}
                  </a>
                  <a href={`mailto:${currentCompany.email}`} className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    ✉️ {currentCompany.email}
                  </a>
                  <a href={`https://${currentCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                    🌐 {currentCompany.website}
                  </a>
              </div>
            </section>

            {/* Financial Data */}
            <section className="bg-gray-50/50 rounded-3xl p-1 md:p-6 border border-dashed border-gray-200">
              <h2 className="text-xl font-bold mb-6 px-2 flex items-center gap-2 text-gray-800">
                <span>📈</span> Financial Data (Last 3 Years)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FinancialCard
                  title="💰 Total Income"
                  data={currentCompany.financials}
                  field="income"
                  format={formatCurrency}
                  calculateGrowth={getGrowthIndicator}
                />
                <FinancialCard
                  title="💸 Total Expenses"
                  data={currentCompany.financials}
                  field="expenses"
                  format={formatCurrency}
                  calculateGrowth={getGrowthIndicator}
                />
                <FinancialCard
                  title="📊 Profit/Loss"
                  data={currentCompany.financials}
                  field="profit"
                  format={formatCurrency}
                  calculateGrowth={getGrowthIndicator}
                  colorFunc={getProfitColor}
                />
                <FinancialCard
                  title="👥 Employees"
                  data={currentCompany.financials}
                  field="employees"
                  format={formatNumber}
                  calculateGrowth={getGrowthIndicator}
                />
              </div>
            </section>

            {/* Management */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span>👔</span> Management & Ownership
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Owner</h4>
                   <p className="font-medium text-gray-900 text-lg leading-relaxed">{currentCompany.owner}</p>
                </div>
                <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Directors</h4>
                   <ul className="space-y-2">
                     {currentCompany.directors.map((director, idx) => (
                        <li key={idx} className="font-medium text-gray-900 text-lg flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {director}
                        </li>
                     ))}
                   </ul>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-xl p-4 text-center">
				<p className="text-sm text-blue-800 font-medium">
					📋 Data source: <a
						href={`https://www.companywall.hr/pretraga?q=${encodeURIComponent(currentCompany.name)}`}
						target="_blank"
						rel="noopener noreferrer" 
                        className="underline hover:no-underline font-bold"
                    >CompanyWall.hr</a>
				</p>
			</section>

          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInspection;
