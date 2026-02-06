
import React, { useState } from 'react';
import { Idea, IncubatorStage, CityConfig } from '../types';
import { ideasAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaIncubatorProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  isReadOnly?: boolean;
  city: CityConfig;
}

const IdeaIncubator: React.FC<IdeaIncubatorProps> = ({ ideas, setIdeas, isReadOnly = true, city }) => {
  const stages = Object.values(IncubatorStage);
  const approvedIdeas = ideas.filter(i => i.status === 'APPROVED');
  const [collapsedDescriptions, setCollapsedDescriptions] = useState<Set<string>>(new Set());
  const [enlargedIdea, setEnlargedIdea] = useState<Idea | null>(null);
  const [showAiReasoning, setShowAiReasoning] = useState<string | null>(null);

  const toggleDescription = (ideaId: string) => {
    setCollapsedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId);
      } else {
        newSet.add(ideaId);
      }
      return newSet;
    });
  };

  const moveIdea = async (ideaId: string, newStage: IncubatorStage) => {
    if (isReadOnly) return;
    
    // Optimistic update
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, stage: newStage } : idea
    ));

    try {
      await ideasAPI.updateStage(ideaId, newStage);
    } catch (error) {
      console.error("Failed to update idea stage:", error);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (isReadOnly) return;
    e.dataTransfer.setData("ideaId", id);
  };

  const handleDrop = (e: React.DragEvent, stage: IncubatorStage) => {
    if (isReadOnly) return;
    const ideaId = e.dataTransfer.getData("ideaId");
    moveIdea(ideaId, stage);
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="animate-in slide-in-from-bottom duration-700 pb-20">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm"
          style={{ backgroundColor: `${city.theme.primary}10`, color: city.theme.primary }}
        >
          <span className="material-icons-round text-sm">precision_manufacturing</span>
          Gradski Razvojni Plan
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Inkubator Ideja {city.name.toUpperCase()}</h2>
        <p className="text-gray-500 font-medium text-lg leading-relaxed">
          {isReadOnly 
            ? "Ovdje možete pratiti projekte koji su prošli verifikaciju i na kojima gradske službe trenutno rade. Sve faze razvoja vidljive su na jednom mjestu." 
            : "Upravljačko sučelje za inkubaciju. Prevucite kartice između faza za promjenu statusa implementacije."}
        </p>
      </div>

      {/* Grid layout umjesto horizontalnog slidera */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {stages.map((stage) => {
          const stageIdeas = approvedIdeas.filter(i => i.stage === stage);
          return (
            <div 
              key={stage} 
              className="flex flex-col h-full"
              onDrop={(e) => handleDrop(e, stage)}
              onDragOver={allowDrop}
            >
              <div className="flex items-center justify-between mb-5 px-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-500">{stage}</h3>
                  <span 
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-md border-2"
                    style={{ backgroundColor: `${city.theme.primary}15`, color: city.theme.primary, borderColor: `${city.theme.primary}30` }}
                  >
                    {stageIdeas.length}
                  </span>
                </div>
              </div>

              <div className={`flex-1 rounded-[2.5rem] p-5 border-2 transition-all duration-500 ${
                stageIdeas.length > 0 ? 'bg-white/60 shadow-md border-gray-200' : 'bg-gray-50 border-dashed border-gray-200 min-h-[400px]'
              }`}>
                <div className="space-y-5">
                  {stageIdeas.length === 0 ? (
                    <div className="py-16 text-center">
                      <span className="material-icons-round text-5xl text-gray-200 mb-3 block">inbox</span>
                      <p className="text-gray-300 text-xs font-bold uppercase tracking-widest">Prazno</p>
                    </div>
                  ) : (
                    stageIdeas.map((idea) => (
                      <div 
                        key={idea.id}
                        draggable={!isReadOnly}
                        onDragStart={(e) => handleDragStart(e, idea.id)}
                        className={`bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-md group transition-all ${!isReadOnly ? 'cursor-grab active:cursor-grabbing hover:shadow-2xl hover:-translate-y-2 hover:border-gray-200' : 'hover:shadow-lg hover:-translate-y-1'}`}
                      >
                        <div className="mb-4">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-wrap gap-2">
                               <span 
                                 className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm"
                                 style={{ backgroundColor: `${city.theme.primary}15`, color: city.theme.primary }}
                               >
                                 {idea.category}
                               </span>
                               {idea.aiRating !== undefined && (
                                  <button
                                    onClick={() => setShowAiReasoning(showAiReasoning === idea.id ? null : idea.id)}
                                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 shadow-sm transition-all flex items-center gap-1.5 ${
                                        idea.aiRating >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                                        idea.aiRating >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                                        'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                     AI {idea.aiRating}
                                     <span className="material-icons-round text-xs">
                                       {showAiReasoning === idea.id ? 'expand_less' : 'info'}
                                     </span>
                                  </button>
                               )}
                            </div>
                            {!isReadOnly && <span className="material-icons-round text-gray-300 text-lg">drag_indicator</span>}
                          </div>
                          
                          {/* AI Reasoning Display */}
                          {showAiReasoning === idea.id && idea.aiReasoning && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl"
                            >
                              <div className="flex items-start gap-2">
                                <span className="material-icons-round text-blue-600 text-sm mt-0.5">psychology</span>
                                <div>
                                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">AI Analiza</p>
                                  <p className="text-xs text-blue-900 font-medium leading-relaxed">{idea.aiReasoning}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        
                        <h4 className="font-extrabold text-gray-900 mb-3 leading-tight text-lg group-hover:text-gray-900 transition-colors">
                          {idea.title}
                        </h4>
                        
                        <div className="mb-6">
                          {!collapsedDescriptions.has(idea.id) && (
                            <p className="text-sm text-gray-600 font-medium mb-3 leading-relaxed">{idea.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleDescription(idea.id)}
                              className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                            >
                              <span className="material-icons-round text-sm">
                                {collapsedDescriptions.has(idea.id) ? 'expand_more' : 'expand_less'}
                              </span>
                              {collapsedDescriptions.has(idea.id) ? 'Prikaži' : 'Sakrij'}
                            </button>
                            <span className="text-gray-200">•</span>
                            <button
                              onClick={() => setEnlargedIdea(idea)}
                              className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                            >
                              <span className="material-icons-round text-sm">open_in_full</span>
                              Uvećaj
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                          <div className="flex items-center gap-3 group/author" title={`Autor: ${idea.author}`}>
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-xs font-black text-gray-600 shadow-md border-2 border-white">
                               {idea.authorAvatar}
                             </div>
                             <div className="flex flex-col">
                               <span className="text-xs font-bold text-gray-900">{idea.author}</span>
                               <span className="text-[10px] text-gray-400 font-medium">Autor</span>
                             </div>
                          </div>
                          
                          {/* Fallback strijelice za brzu promjenu na desktopu/tabletu bez D&D */}
                          {!isReadOnly && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {stages.indexOf(stage) > 0 && (
                                <button 
                                  onClick={() => moveIdea(idea.id, stages[stages.indexOf(stage) - 1])}
                                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border-2 border-gray-200 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-md hover:shadow-lg"
                                  title="Vrati fazu"
                                >
                                  <span className="material-icons-round text-sm">arrow_back</span>
                                </button>
                              )}
                              {stages.indexOf(stage) < stages.length - 1 && (
                                <button 
                                  onClick={() => moveIdea(idea.id, stages[stages.indexOf(stage) + 1])}
                                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border-2 border-gray-200 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-md hover:shadow-lg"
                                  title="Napreduj fazu"
                                >
                                  <span className="material-icons-round text-sm">arrow_forward</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enlarged Idea Modal */}
      <AnimatePresence>
        {enlargedIdea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setEnlargedIdea(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 md:p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEnlargedIdea(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="material-icons-round text-gray-600">close</span>
              </button>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span 
                    className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm"
                    style={{ backgroundColor: `${city.theme.primary}15`, color: city.theme.primary }}
                  >
                    {enlargedIdea.category}
                  </span>
                  {enlargedIdea.aiRating !== undefined && (
                    <span className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 shadow-sm ${
                        enlargedIdea.aiRating >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        enlargedIdea.aiRating >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                       AI Ocjena: {enlargedIdea.aiRating}
                    </span>
                  )}
                  <span 
                    className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm"
                  >
                    {enlargedIdea.stage}
                  </span>
                </div>
                
                {/* AI Reasoning in Modal */}
                {enlargedIdea.aiRating !== undefined && enlargedIdea.aiReasoning && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-round text-white text-lg">psychology</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                          AI Analiza Ideje
                          <span className={`text-xs px-2 py-0.5 rounded-lg ${
                            enlargedIdea.aiRating >= 80 ? 'bg-emerald-600 text-white' :
                            enlargedIdea.aiRating >= 50 ? 'bg-amber-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {enlargedIdea.aiRating}/100
                          </span>
                        </h4>
                        <p className="text-sm text-blue-900 font-medium leading-relaxed">{enlargedIdea.aiReasoning}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight" style={{ color: city.theme.primary }}>
                  {enlargedIdea.title}
                </h2>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Detaljan Opis</h3>
                <p className="text-base text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {enlargedIdea.description}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-sm font-black text-gray-600 shadow-md border-2 border-white">
                  {enlargedIdea.authorAvatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{enlargedIdea.author}</p>
                  <p className="text-xs text-gray-400 font-medium">Autor ideje</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeaIncubator;
