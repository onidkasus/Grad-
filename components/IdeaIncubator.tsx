
import React from 'react';
import { Idea, IncubatorStage, CityConfig } from '../types';

interface IdeaIncubatorProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  isReadOnly?: boolean;
  city: CityConfig;
}

const IdeaIncubator: React.FC<IdeaIncubatorProps> = ({ ideas, setIdeas, isReadOnly = true, city }) => {
  const stages = Object.values(IncubatorStage);
  const approvedIdeas = ideas.filter(i => i.status === 'APPROVED');

  const moveIdea = (ideaId: string, newStage: IncubatorStage) => {
    if (isReadOnly) return;
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, stage: newStage } : idea
    ));
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
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400">{stage}</h3>
                  <span 
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shadow-sm"
                    style={{ backgroundColor: `${city.theme.primary}10`, color: city.theme.primary }}
                  >
                    {stageIdeas.length}
                  </span>
                </div>
              </div>

              <div className={`flex-1 rounded-[2.5rem] p-4 border transition-all duration-500 ${
                stageIdeas.length > 0 ? 'bg-white/40 shadow-sm border-gray-100' : 'bg-gray-50/50 border-transparent min-h-[300px]'
              }`}>
                <div className="space-y-4">
                  {stageIdeas.length === 0 ? (
                    <div className="py-12 text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Prazno
                    </div>
                  ) : (
                    stageIdeas.map((idea) => (
                      <div 
                        key={idea.id}
                        draggable={!isReadOnly}
                        onDragStart={(e) => handleDragStart(e, idea.id)}
                        className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm group transition-all ${!isReadOnly ? 'cursor-grab active:cursor-grabbing hover:shadow-xl hover:-translate-y-1' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span 
                            className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: `${city.theme.primary}10`, color: city.theme.primary }}
                          >
                            {idea.category}
                          </span>
                          {!isReadOnly && <span className="material-icons-round text-gray-300 text-xs">drag_indicator</span>}
                        </div>
                        <h4 className="font-black text-gray-900 mb-2 leading-tight text-sm group-hover:text-blue-600 transition-colors" style={{ color: !isReadOnly ? 'inherit' : city.theme.primary }}>
                          {idea.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2 font-medium mb-4 leading-relaxed">{idea.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[9px] font-black text-gray-500 shadow-inner">
                               {idea.authorAvatar}
                             </div>
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{idea.author}</span>
                          </div>
                          
                          {/* Fallback strijelice za brzu promjenu na desktopu/tabletu bez D&D */}
                          {!isReadOnly && (
                            <div className="flex gap-1">
                              {stages.indexOf(stage) > 0 && (
                                <button 
                                  onClick={() => moveIdea(idea.id, stages[stages.indexOf(stage) - 1])}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all"
                                >
                                  <span className="material-icons-round text-xs">chevron_left</span>
                                </button>
                              )}
                              {stages.indexOf(stage) < stages.length - 1 && (
                                <button 
                                  onClick={() => moveIdea(idea.id, stages[stages.indexOf(stage) + 1])}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all"
                                >
                                  <span className="material-icons-round text-xs">chevron_right</span>
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
    </div>
  );
};

export default IdeaIncubator;
