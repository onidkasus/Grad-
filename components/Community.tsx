
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Idea, CityConfig, Category, IncubatorStage, Poll, User, Post } from '../types';
import { communityAPI } from '../services/api';

interface CommunityProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  city: CityConfig;
  polls: Poll[];
  onVote: (pollId: string, optionId: string) => void;
  user: User;
  showToast: (msg: string, type?: 'success' | 'info') => void;
}

const Community: React.FC<CommunityProps> = ({ ideas, setIdeas, city, polls, onVote, user, showToast }) => {
  const [viewMode, setViewMode] = useState<'IDEAS' | 'POSTS'>('IDEAS');
  
  // POSTS STATE
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');

  // IDEA STATE
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.URBAN);
  
  const [isPosting, setIsPosting] = useState(false);
  const [filter, setFilter] = useState('Sve');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (viewMode === 'POSTS') {
      const loadPosts = async () => {
        const p = await communityAPI.getPosts(city.id);
        setPosts(p);
      };
      loadPosts();
    }
  }, [viewMode, city.id]);

  const handleCreateIdea = () => {
    if (!newIdeaTitle.trim() || !newIdeaDesc.trim()) return;
    
    const newIdea: Idea = {
      id: Date.now().toString(),
      title: newIdeaTitle,
      description: newIdeaDesc,
      category: selectedCategory,
      impactScore: 10,
      author: user.name,
      authorAvatar: user.avatar,
      date: new Date().toLocaleDateString('hr-HR'),
      stage: IncubatorStage.DISCOVERY,
      likes: 0,
      comments: [],
      isVerified: false,
      cityId: city.id,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setIdeas(prev => [newIdea, ...prev]);
    setNewIdeaTitle('');
    setNewIdeaDesc('');
    setIsPosting(false);
    showToast('Vaša vizija je uspješno objavljena!', 'success');
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    // FIXED: communityAPI.createPost expects content: string, not an object
    const p = await communityAPI.createPost(newPostContent, user);
    setPosts(prev => [p, ...prev]);
    setNewPostContent('');
    setIsPosting(false);
    showToast('Objava uspješna!', 'success');
  };

  const handleLikeIdea = (id: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, likes: idea.likes + 1 } : idea
    ));
  };

  const handleLikePost = async (id: string) => {
    await communityAPI.likePost(id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1, likedByCurrentUser: true } : p));
  };

  const handleCommentIdea = (ideaId: string) => {
    if(!commentText.trim()) return;
    setIdeas(prev => prev.map(idea => {
      if(idea.id === ideaId) {
        return {
          ...idea,
          comments: [
            ...idea.comments,
            {
              id: Date.now().toString(),
              author: user.name,
              avatar: user.avatar,
              text: commentText,
              time: 'Upravo sad',
              created_at: new Date().toISOString()
            }
          ]
        };
      }
      return idea;
    }));
    setCommentText('');
    showToast('Komentar dodan');
  };

  const categories = Object.values(Category);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 pb-32">
      {/* MAIN CONTENT - FEED */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* TAB SWITCHER */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setViewMode('IDEAS')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'IDEAS' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400 hover:bg-white/50'}`}
          >
            Projekti & Vizije
          </button>
          <button 
            onClick={() => setViewMode('POSTS')}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'POSTS' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400 hover:bg-white/50'}`}
          >
            Javne Rasprave
          </button>
        </div>

        {/* COMPOSER */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {!isPosting ? (
              <motion.div 
                key="simple"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-6 relative z-10"
              >
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-xl text-lg shrink-0"
                      style={{ background: `linear-gradient(135deg, ${city.theme.primary}, ${city.theme.secondary})` }}>
                   {user.avatar}
                 </div>
                 <button 
                   onClick={() => setIsPosting(true)}
                   className="flex-1 text-left px-8 py-4 bg-gray-50 hover:bg-gray-100 rounded-[2rem] text-gray-400 font-bold transition-all border border-transparent hover:border-gray-200"
                 >
                   {viewMode === 'IDEAS' ? `Predložite projekt za ${city.name}...` : 'Započnite raspravu...'}
                 </button>
              </motion.div>
            ) : (
              <motion.div 
                key="expanded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 relative z-10"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: city.theme.primary }}>
                         <span className="material-icons-round text-lg">{viewMode === 'IDEAS' ? 'edit_note' : 'forum'}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">
                        {viewMode === 'IDEAS' ? 'Nova Inicijativa' : 'Nova Objava'}
                      </h3>
                   </div>
                   <button onClick={() => setIsPosting(false)} className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-all flex items-center justify-center">
                      <span className="material-icons-round">close</span>
                   </button>
                </div>

                {viewMode === 'IDEAS' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        value={newIdeaTitle}
                        onChange={e => setNewIdeaTitle(e.target.value)}
                        placeholder="Naslov vaše vizije..."
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl outline-none font-black text-lg transition-all"
                      />
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as Category)}
                        className="px-6 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl outline-none font-black text-xs uppercase tracking-widest text-gray-500 appearance-none cursor-pointer transition-all"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <textarea 
                      value={newIdeaDesc}
                      onChange={e => setNewIdeaDesc(e.target.value)}
                      placeholder="Opišite detalje ideje... Kako ovo poboljšava život u gradu?"
                      className="w-full px-6 py-5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[2rem] outline-none font-medium min-h-[140px] resize-none transition-all"
                    />
                  </>
                ) : (
                  <textarea 
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    placeholder="Što vam je na umu? Podijelite s sugrađanima..."
                    className="w-full px-6 py-5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[2rem] outline-none font-medium min-h-[140px] resize-none transition-all"
                  />
                )}

                <div className="flex justify-between items-center pt-4">
                   <div className="flex gap-2">
                      <button className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-white hover:shadow-lg transition-all flex items-center justify-center border border-gray-100">
                         <span className="material-icons-round">image</span>
                      </button>
                   </div>
                   <button 
                     onClick={viewMode === 'IDEAS' ? handleCreateIdea : handleCreatePost}
                     className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                     style={{ backgroundColor: city.theme.primary }}
                   >
                     {viewMode === 'IDEAS' ? 'Lansiraj Viziju' : 'Objavi'}
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FEED FILTER */}
        <div className="flex items-center justify-between px-2">
           <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {viewMode === 'IDEAS' ? 'Projekti u fokusu' : 'Gradske Rasprave'}
              </h2>
           </div>
           <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100">
             {['Sve', 'Popularno', 'Novo'].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                   filter === f ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-900'
                 }`}
                 style={filter === f ? { color: city.theme.primary } : {}}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>

        {/* FEED CONTENT */}
        <div className="space-y-6">
          {viewMode === 'IDEAS' ? (
            ideas.map((idea) => (
              <motion.div 
                key={idea.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg transition-transform group-hover:rotate-6" 
                      style={{ backgroundColor: city.theme.primary }}
                    >
                      {idea.authorAvatar}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-lg tracking-tight leading-none mb-2">{idea.author}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{idea.date}</span>
                         <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                         <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: city.theme.primary }}>#{idea.category}</span>
                      </div>
                    </div>
                  </div>
                  {idea.isVerified && (
                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
                      <span className="material-icons-round text-xs">verified</span> Službeno
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                  {idea.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-8 text-base">
                  {idea.description}
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLikeIdea(idea.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-all group/btn"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover/btn:bg-red-50 group-hover/btn:text-red-500 transition-all active:scale-125">
                         <span className="material-icons-round text-xl">favorite</span>
                      </div>
                      <span className="text-xs font-black text-gray-900">{idea.likes}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCommentId(activeCommentId === idea.id ? null : idea.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-all group/btn"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover/btn:bg-blue-50 group-hover/btn:text-blue-500 transition-all">
                         <span className="material-icons-round text-xl">forum</span>
                      </div>
                      <span className="text-xs font-black text-gray-900">{idea.comments.length}</span>
                    </button>
                  </div>
                </div>

                {/* COMMENTS SECTION */}
                <AnimatePresence>
                  {activeCommentId === idea.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-gray-50 bg-gray-50/50 rounded-2xl p-6">
                        <div className="space-y-4 mb-4">
                          {idea.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">
                                {comment.avatar}
                              </div>
                              <div className="flex-1 bg-white p-3 rounded-xl rounded-tl-none shadow-sm">
                                <p className="text-xs text-gray-600 font-medium">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCommentIdea(idea.id)}
                            placeholder="Napišite komentar..."
                            className="flex-1 px-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            posts.map((post) => (
              <motion.div 
                key={post.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{post.author}</h4>
                    <p className="text-[10px] text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-base mb-6">{post.content}</p>
                <div className="flex gap-4">
                  <button onClick={() => handleLikePost(post.id)} className={`text-xs font-bold flex items-center gap-1 ${post.likedByCurrentUser ? 'text-red-500' : 'text-gray-400'}`}>
                    <span className="material-icons-round text-sm">favorite</span> {post.likes}
                  </button>
                  <button className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <span className="material-icons-round text-sm">comment</span> {post.commentsCount}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="lg:col-span-4 space-y-8">
        {polls.map(poll => (
          <div key={poll.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Anketa Tjedna</h4>
              <h3 className="text-xl font-black text-gray-900 mb-8 leading-tight tracking-tight">{poll.question}</h3>
              <div className="space-y-4">
                {poll.options.map(option => {
                  const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                  const isSelected = poll.userVotedOptionId === option.id;
                  return (
                    <button 
                      key={option.id}
                      onClick={() => onVote(poll.id, option.id)}
                      disabled={!!poll.userVotedOptionId}
                      className={`w-full p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-blue-50'}`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                          {option.text}
                        </span>
                        <span className="text-[10px] font-black text-gray-500">{poll.userVotedOptionId ? `${percent}%` : ''}</span>
                      </div>
                      {poll.userVotedOptionId && (
                        <div className="absolute left-0 top-0 bottom-0 bg-gray-200/20" style={{ width: `${percent}%` }}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
