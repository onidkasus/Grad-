
import React, { useState } from 'react';
import { AiService } from '../services/aiService';
import { CityConfig } from '../types';

interface FactCheckProps {
  city?: CityConfig;
}

const FactCheck: React.FC<FactCheckProps> = ({ city }) => {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!claim.trim()) return;
    setIsLoading(true);
    const data = await AiService.verifyClaim(claim);
    setResult(data);
    setIsLoading(false);
  };

  const sampleClaims = [
    `${city?.name || 'Zadar'} je smanjio emisiju CO2 za 40% u 2023. godini.`,
    "Morske orgulje proizvode 20% više energije ove godine.",
    "Hrvatska je vodeća u EU po broju pametnih klupa po glavi stanovnika."
  ];

  const primaryColor = city?.theme.primary || '#6366f1';

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-blue-900/5">
        <div 
          className="p-12 text-center text-white relative"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${city?.theme.secondary || '#a855f7'})` }}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="10" cy="10" r="40" fill="white" />
              <circle cx="90" cy="80" r="30" fill="white" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <span className="material-icons-round text-4xl animate-pulse">psychology</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">AI Fact Check Asistent</h2>
            <p className="text-white/80 font-medium leading-relaxed max-w-md mx-auto">
              Provjerite istinitost tvrdnji o svom gradu uz pomoć napredne umjetne inteligencije i verificiranih podataka.
            </p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Tvrdnja za provjeru</label>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder={`Npr. ${city?.name || 'Zadar'} je najsigurniji grad u Hrvatskoj...`}
              className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 outline-none transition-all font-medium text-gray-900 min-h-[120px] resize-none"
              style={{ '--tw-ring-color': `${primaryColor}20` } as any}
            />
            
            <div className="flex flex-wrap gap-2 pt-2">
              {sampleClaims.map((c, i) => (
                <button 
                  key={i} 
                  onClick={() => setClaim(c)}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all border"
                  style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
                >
                  {c.length > 30 ? c.substring(0, 30) + '...' : c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
            }`}
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analiziranje podataka...
              </>
            ) : (
              <>
                <span className="material-icons-round">fact_check</span>
                Verificiraj s AI Modelom
              </>
            )}
          </button>

          {result && (
            <div className="animate-in slide-in-from-top-4 duration-500 bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
              <div className="flex items-start gap-6 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  result.verdict === 'Verified' ? 'bg-green-500 shadow-green-100' : 
                  result.verdict === 'Misleading' ? 'bg-amber-500 shadow-amber-100' : 'bg-red-500 shadow-red-100'
                }`}>
                  <span className="material-icons-round text-3xl">
                    {result.verdict === 'Verified' ? 'verified' : result.verdict === 'Misleading' ? 'warning' : 'cancel'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{result.verdict === 'Verified' ? 'Provjereno' : result.verdict === 'Misleading' ? 'Zavaravajuće' : 'Nepotvrđeno'}</h3>
                  <div className="flex items-center gap-3">
                     <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pouzdanost modela:</span>
                     <span className="text-sm font-black" style={{ color: primaryColor }}>{result.confidence}%</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 font-medium leading-relaxed mb-8">
                {result.explanation}
              </p>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Analizirani izvori:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.sources?.map((source: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactCheck;
