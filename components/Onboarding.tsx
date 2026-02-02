
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onFinish: () => void;
  primaryColor: string;
}

interface Step {
  title: string;
  text: string;
  icon: string;
  targetId: 'center' | 'sidebar' | 'navbar' | 'header' | 'kpis' | 'ai-chat';
}

const steps: Step[] = [
  { 
    title: 'Dobrodošli na GRAD+', 
    text: 'Vaša nova destinacija za izravnu suradnju s gradskom upravom. Krenimo u kratki obilazak!', 
    icon: 'auto_awesome',
    targetId: 'center'
  },
  { 
    title: 'Digitalni Uredi', 
    text: 'S lijeve strane nalazi se vaša navigacija. Ovdje pristupate proračunu, inkubatoru i AI provjeri činjenica.', 
    icon: 'menu_open',
    targetId: 'sidebar'
  },
  { 
    title: 'Upravljački Sustav', 
    text: 'Ovdje možete brzo mijenjati gradove, pretraživati bazu ili se prebaciti u Admin pogled.', 
    icon: 'tune',
    targetId: 'navbar'
  },
  { 
    title: 'Vaš Fokus', 
    text: 'Na vrhu uvijek vidite personaliziranu poruku i status online gradskih sustava.', 
    icon: 'dashboard_customize',
    targetId: 'header'
  },
  { 
    title: 'Impact Score', 
    text: 'Pratite svoj doprinos zajednici u realnom vremenu. Vaš rang raste sa svakom inovacijom!', 
    icon: 'bolt',
    targetId: 'kpis'
  },
  { 
    title: 'Pametna Podrška', 
    text: 'Zapeli ste? Naš AI asistent je dostupan 24/7 za sva pitanja o digitalnom gradu.', 
    icon: 'smart_toy',
    targetId: 'ai-chat'
  }
];

const SpotlightOverlay = ({ rect }: { rect: DOMRect | null }) => {
  if (!rect) return <div className="fixed inset-0 bg-gray-950/80 z-[201]" />;

  const { x, y, width, height } = rect;
  const padding = 10;
  
  // Create an SVG path for a full-screen rectangle with a hole cut out
  const path = `M 0,0 H 100% V 100% H 0 Z M ${x - padding},${y - padding} v ${height + padding * 2} h ${width + padding * 2} v ${-(height + padding * 2)} z`;

  return (
    <svg className="fixed inset-0 w-full h-full z-[201] pointer-events-none fill-gray-950/80 backdrop-blur-[2px] transition-all duration-500">
      <path d={path} fillRule="evenodd" />
    </svg>
  );
};

const Onboarding: React.FC<OnboardingProps> = ({ onFinish, primaryColor }) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const targetId = steps[step].targetId;
    if (targetId === 'center') {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(`[data-tour="${targetId}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  // Determine card position based on target
  const getCardPosition = () => {
    if (!targetRect) return {};
    const margin = 20;
    const { x, y, width, height } = targetRect;
    
    // Logic for finding best side to place the card
    if (steps[step].targetId === 'sidebar') return { left: `${x + width + margin}px`, top: '150px' };
    if (steps[step].targetId === 'navbar') return { top: `${y + height + margin}px`, left: '50%', transform: 'translateX(-50%)' };
    if (steps[step].targetId === 'header') return { bottom: '50px', left: '50%', transform: 'translateX(-50%)' };
    if (steps[step].targetId === 'ai-chat') return { bottom: '150px', right: '100px' };
    if (steps[step].targetId === 'kpis') return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    return {};
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <AnimatePresence>
        <SpotlightOverlay key={`spotlight-${step}`} rect={targetRect} />
      </AnimatePresence>

      <div className="fixed inset-0 z-[205] pointer-events-none">
        <AnimatePresence mode="wait">
          {targetRect && (
            <motion.div 
              key={`arrow-${step}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                y: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                duration: 0.3 
              }}
              className="absolute pointer-events-none"
              style={{ 
                top: `${targetRect.top + targetRect.height / 2 - 80}px`,
                left: `${targetRect.left + targetRect.width / 2 - 20}px`
              }}
            >
              <div className="flex flex-col items-center">
                 <div className="bg-white p-3 rounded-full shadow-2xl border-4" style={{ borderColor: primaryColor }}>
                   <span className="material-icons-round text-3xl" style={{ color: primaryColor }}>south</span>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="absolute z-[210] pointer-events-auto bg-white rounded-[3rem] p-10 max-w-md w-full text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20"
          style={targetRect ? getCardPosition() : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl" 
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #1d1d1f)` }}
          >
            <span className="material-icons-round text-4xl">{steps[step].icon}</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter">{steps[step].title}</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed text-sm">{steps[step].text}</p>
          
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ 
                  width: i === step ? 30 : 8,
                  backgroundColor: i === step ? primaryColor : '#f1f5f9'
                }}
                className="h-1.5 rounded-full transition-all" 
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleNext}
              className="w-full py-4 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
              style={{ backgroundColor: primaryColor }}
            >
              {step === steps.length - 1 ? 'Kreni u Grad+' : 'Sljedeći Korak'}
            </button>
            
            <button 
              onClick={onFinish}
              className="text-[9px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest py-2"
            >
              Preskoči Obilazak
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
