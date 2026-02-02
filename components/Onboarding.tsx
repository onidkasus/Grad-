import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    text: 'Vaša nova destinacija za izravnu suradnju s gradskom upravom. OD GRAĐANA ZA GRAĐANE!', 
    icon: 'auto_awesome',
    targetId: 'center'
  },
  { 
    title: 'Digitalni Uredi', 
    text: 'S lijeve strane nalazi se vaša navigacija. Ovdje pristupate proračunu, e-Sefu i AI provjeri činjenica.', 
    icon: 'menu_open',
    targetId: 'sidebar'
  },
  { 
    title: 'Upravljački Sustav', 
    text: 'Gornji izbornik služi za brzu promjenu gradova, pretragu i pristup postavkama.', 
    icon: 'tune',
    targetId: 'navbar'
  },
  { 
    title: 'Impact Score', 
    text: 'Ovdje pratite svoj doprinos zajednici. Vaš rang raste sa svakom podijeljenom idejom!', 
    icon: 'bolt',
    targetId: 'kpis'
  },
  { 
    title: 'Pametna Podrška', 
    text: 'Ako zapnete, AI asistent je dostupan ovdje za sva vaša pitanja u bilo kojem trenutku.', 
    icon: 'smart_toy',
    targetId: 'ai-chat'
  }
];

const tooltipSpring = { type: 'spring', stiffness: 400, damping: 40, mass: 0.5 } as const;

const SpotlightOverlay: React.FC<{ rect: DOMRect | null }> = ({ rect }) => {
  return (
    <div className="fixed inset-0 z-[900] pointer-events-none overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect 
              initial={false}
              animate={{
                x: rect ? rect.left - 10 : window.innerWidth / 2,
                y: rect ? rect.top - 10 : window.innerHeight / 2,
                width: rect ? rect.width + 20 : 0,
                height: rect ? rect.height + 20 : 0,
                rx: 24
              }}
              // MUST be 0 duration for position to prevent lagging during active scroll
              transition={{ duration: 0 }} 
              fill="black" 
            />
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.8)" 
          mask="url(#spotlight-mask)" 
          className="backdrop-blur-[3px]"
        />
      </svg>
      
      <motion.div
        initial={false}
        animate={{
          opacity: rect ? 1 : 0,
          top: rect ? rect.top - 14 : '50%',
          left: rect ? rect.left - 14 : '50%',
          width: rect ? rect.width + 28 : 0,
          height: rect ? rect.height + 28 : 0,
        }}
        transition={{ duration: 0 }}
        className="absolute border-2 border-white/50 rounded-[2rem] shadow-[0_0_80px_rgba(255,255,255,0.3)]"
      />
    </div>
  );
};

const Onboarding: React.FC<OnboardingProps> = ({ onFinish, primaryColor }) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const requestRef = useRef<number>(null);

  const updateRect = useCallback(() => {
    const targetId = steps[step].targetId;
    if (targetId === 'center') {
      if (targetRect !== null) setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${targetId}"]`);
    if (el) {
      const newRect = el.getBoundingClientRect();
      // Optimization: Only update if changed
      if (!targetRect || newRect.top !== targetRect.top || newRect.left !== targetRect.left) {
        setTargetRect(newRect);
      }
    }
  }, [step, targetRect]);

  const animate = useCallback(() => {
    updateRect();
    requestRef.current = requestAnimationFrame(animate);
  }, [updateRect]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', updateRect);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', updateRect);
    };
  }, [animate, updateRect]);

  useEffect(() => {
    const targetId = steps[step].targetId;
    if (targetId !== 'center') {
      const el = document.querySelector(`[data-tour="${targetId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const getVerticalAlignment = () => {
    if (!targetRect) return 'justify-center';
    const screenHeight = window.innerHeight;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    return targetCenterY < screenHeight / 2 ? 'justify-end pb-48' : 'justify-start pt-48';
  };

  return (
    <div className="fixed inset-0 z-[950] overflow-hidden pointer-events-none">
      <SpotlightOverlay rect={targetRect} />

      <motion.div 
        layout
        transition={tooltipSpring}
        className={`absolute inset-0 z-[1000] flex flex-col items-center p-6 ${getVerticalAlignment()}`}
      >
        <motion.div 
          layout
          transition={tooltipSpring}
          className="pointer-events-auto bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white flex flex-col items-center text-center overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center w-full"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl" 
                style={{ background: `linear-gradient(135deg, ${primaryColor}, #1d1d1f)` }}
              >
                <span className="material-icons-round text-3xl">{steps[step].icon}</span>
              </div>

              <h2 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{steps[step].title}</h2>
              <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm px-4">{steps[step].text}</p>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center gap-2 mb-10">
            {steps.map((_, i) => (
              <motion.div 
                key={i} 
                layout
                className="h-1 rounded-full" 
                animate={{ 
                  width: i === step ? 24 : 8,
                  backgroundColor: i === step ? primaryColor : '#f1f5f9'
                }}
                transition={tooltipSpring}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={handleNext}
              className="w-full py-5 text-white font-black rounded-2xl shadow-2xl transition-all text-[11px] uppercase tracking-widest active:scale-95 hover:brightness-110"
              style={{ backgroundColor: primaryColor }}
            >
              {step === steps.length - 1 ? 'Lansiraj Platformu' : 'Sljedeći Korak'}
            </button>
            <button 
              onClick={onFinish}
              className="text-[10px] font-black text-gray-300 hover:text-gray-900 uppercase tracking-widest py-2 transition-colors"
            >
              Preskoči Vodič
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;