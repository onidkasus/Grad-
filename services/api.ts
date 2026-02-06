[import { User, Idea, Challenge, Poll, Notification, UserRole, IncubatorStage, Category, Post, Badge, PostComment, CityEvent } from '../types';
import { BADGES } from '../constants';
import { db } from './firebase';
import { AiService } from './aiService';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  getDoc,
  updateDoc, 
  doc, 
  increment, 
  arrayUnion, 
  arrayRemove,
  Timestamp,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

const STORAGE_KEYS = {
  TOKEN: 'grad_plus_token',
  USER: 'grad_plus_user_data'
};

// Helper: Map numeric DB city ID to app string ID
const getCityString = (id: number) => {
  switch(id) {
    case 2: return 'split';
    case 3: return 'rijeka';
    case 4: return 'osijek'; 
    case 5: return 'zadar';
    case 6: return 'velika_gorica';
    case 7: return 'slavonski_brod';
    // Add more mappings as needed based on DB
    default: return 'zagreb';
  }
};

export const getCityNumber = (cityString: string) => {
    switch(cityString) {
        case 'split': return 2;
        case 'rijeka': return 3;
        case 'osijek': return 4;
        case 'zadar': return 5;
        case 'velika_gorica': return 6;
        case 'slavonski_brod': return 7;
        case 'zagreb': default: return 1; 
    }
}

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper mapping for numeric phases
const getStageFromPhase = (phase: number): IncubatorStage => {
  switch(phase) {
    case 1: return IncubatorStage.DISCOVERY;
    case 2: return IncubatorStage.VALIDATION;
    case 3: return IncubatorStage.PROTOTYPING;
    case 4: return IncubatorStage.TESTING;
    case 5: return IncubatorStage.SCALING;
    // For 0 or unknown, default to Discovery but UI should handle "Not Accepted"
    default: return IncubatorStage.DISCOVERY;
  }
};

const getPhaseFromStage = (stage: IncubatorStage): number => {
  switch(stage) {
    case IncubatorStage.DISCOVERY: return 1;
    case IncubatorStage.VALIDATION: return 2;
    case IncubatorStage.PROTOTYPING: return 3;
    case IncubatorStage.TESTING: return 4;
    case IncubatorStage.SCALING: return 5;
    default: return 0;
  }
};

export const authAPI = {
  login: async (credential: string): Promise<{user: User, token: string}> => {
    try {
      const usersRef = collection(db, "users");
      // Try searching by OIB
      let q = query(usersRef, where("OIB", "==", credential));
      let querySnapshot = await getDocs(q);

      // Fallback: try searching by username (legacy/alt field)
      if (querySnapshot.empty) {
        q = query(usersRef, where("username", "==", credential));
        querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        throw new Error('Pogrešan OIB. Sustav e-Građanin ne prepoznaje unesene vjerodajnice.');
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      
      const user: User = {
        id: docSnap.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        OIB: data.OIB || credential,
        cityID: data.cityID || 1,
        isAdmin: data.isAdmin || false,
        
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Korisnik',
        email: data.email || `${credential.toLowerCase()}@grad.plus`,
        role: data.isAdmin ? UserRole.ADMIN : UserRole.CITIZEN, // Using enums from types
        impactScore: data.impactScore || 100,
        rank: data.rank || 'Novi Građanin',
        verifiedCount: data.verifiedCount || 0,
        ideasCount: data.ideasCount || 0,
        avatar: data.avatar || getInitials(data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Korisnik'),
        cityId: getCityString(data.cityID || 1),
        badges: data.badges || BADGES,
        joined_date: data.joined_date || new Date().toISOString()
      };
      
      const mockToken = `jwt_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user, token: mockToken };
    } catch (e: any) {
      console.error("Login Error:", e);
      throw new Error(e.message || 'Greška pri prijavi.');
    }
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }
};

export const ideasAPI = {
  getAll: async (cityId?: string): Promise<Idea[]> => {
    try {
      const ideasRef = collection(db, "ideas");
      let q = query(ideasRef); // Start with base collection
      
      if (cityId) {
        const cityNum = getCityNumber(cityId); 
        // Using 'in' to support both number (new format) and string (legacy) cityIDs
        q = query(ideasRef, where("cityID", "in", [cityNum, cityNum.toString()]));
      } else {
        q = query(ideasRef, orderBy("createdAt", "desc"));
      }

      const snapshot = await getDocs(q);
      const ideas = snapshot.docs.map(doc => {
        const data = doc.data();
        let status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
        
        // Phase logic: 0 = Pending/Not Accepted, 1-5 = Accepted/Approved
        let phase = typeof data.phase === 'number' ? data.phase : 0;
        
        // Legacy compatibility: If phase is 0 (or missing) but item is accepted
        if (phase === 0 && data.isAccepted) {
             const s = data.stage;
             if (s === IncubatorStage.VALIDATION) phase = 2;
             else if (s === IncubatorStage.PROTOTYPING) phase = 3;
             else if (s === IncubatorStage.TESTING) phase = 4;
             else if (s === IncubatorStage.SCALING) phase = 5;
             else phase = 1; // Default to Discovery if accepted
        }
        
        if (phase > 0) {
            status = 'APPROVED';
        } else if (data.isProcessed) {
             status = data.isAccepted ? 'APPROVED' : 'REJECTED';
        }

        return {
          id: doc.id,
          title: data.title || "Bez Naslova",
          description: data.desc || data.description || "",
          category: data.category || Category.URBAN,
          impactScore: data.impactScore || 0,
          author: data.authorName || "Građanin",
          authorAvatar: data.authorAvatar || getInitials(data.authorName || "Građanin"),
          date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('hr-HR') : "Danas",
          stage: getStageFromPhase(phase),
          phase: phase,
          likes: data.votes || 0,
          comments: [], 
          isVerified: status === 'APPROVED',
          cityId: getCityString(parseInt(data.cityID || "1")), 
          status: status,
          created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updated_at: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          challenge_id: data.challengeID,
          // Check various casing and fallback to impactScore for legacy/consistency
          aiRating: data.aiRating ?? data.AIRating ?? data.ai_rating ?? data.impactScore ?? 0,
          aiReasoning: data.aiReasoning ?? data.AIReasoning ?? data.ai_reasoning ?? undefined
        } as Idea;
      });
      
      // Sort client side to bypass index requirements
      return ideas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    } catch (e) {
      console.error("Error fetching ideas:", e);
      return [];
    }
  },
  
  create: async (idea: Partial<Idea>, user: User): Promise<Idea> => {
    try {
      // Store cityID as number to match new format
      const cityIdVal = getCityNumber(user.cityId);
      
      // Get AI Rating (Parallel or awaited)
      let aiRating = 50;
      let aiReasoning = 'Standardna ocjena.';
      if (idea.title && idea.description) {
          try {
             // Don't block too long, but for now we await
             const aiResult = await AiService.rateIdea(idea.title, idea.description);
             aiRating = aiResult.rating;
             aiReasoning = aiResult.reasoning;
          } catch (e) {
             console.warn("Could not fetch AI rating", e);
          }
      }

      const ideaData = {
        title: idea.title,
        desc: idea.description,
        category: idea.category,
        authorOIB: user.OIB,
        authorName: user.name,
        authorAvatar: user.avatar,
        cityID: cityIdVal, 
        stage: IncubatorStage.DISCOVERY,
        votes: 0,
        isAccepted: false,
        isProcessed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        challengeID: idea.challenge_id || null,
        impactScore: 10,
        aiRating: aiRating,
        aiReasoning: aiReasoning
      };
      
      const docRef = await addDoc(collection(db, "ideas"), ideaData);
      return {
        ...idea,
        id: docRef.id,
        author: user.name,
        created_at: new Date().toISOString(),
        aiRating: aiRating,
        aiReasoning: aiReasoning,
        likes: 0,
        comments: [],
        status: 'PENDING',
        stage: IncubatorStage.DISCOVERY,
        cityId: user.cityId,
        impactScore: 10
      } as Idea;
    } catch (e) {
      console.error("Error creating idea:", e);
      throw e;
    }
  },

  updateStage: async (ideaId: string, stage: IncubatorStage) => {
    try {
        const phase = getPhaseFromStage(stage);
        const docRef = doc(db, "ideas", ideaId);
        await updateDoc(docRef, {
            phase: phase,
            stage: stage, // Sync legacy field
            updatedAt: serverTimestamp()
        });
    } catch(e) {
        console.error("Error updating stage", e);
        throw e;
    }
  },

  accept: async (ideaId: string) => {
    try {
        const docRef = doc(db, "ideas", ideaId);
        await updateDoc(docRef, {
            isAccepted: true,
            isProcessed: true,
            phase: 1, // Move to phase 1 (Discovery/Accepted)
            stage: IncubatorStage.DISCOVERY,
            updatedAt: serverTimestamp()
        });
    } catch(e) {
        console.error("Error accepting idea", e);
        throw e;
    }
  },

  recommendToZagreb: async (ideaId: string) => {
    try {
        const docRef = doc(db, "ideas", ideaId);
        await updateDoc(docRef, {
            cityID: 1, // 1 is Zagreb
            updatedAt: serverTimestamp()
        });
    } catch(e) {
        console.error("Error recommending to Zagreb", e);
        throw e;
    }
  },

  reject: async (ideaId: string) => {
    try {
        const docRef = doc(db, "ideas", ideaId);
        await updateDoc(docRef, {
            isAccepted: false,
            isProcessed: true,
            phase: 0, 
            updatedAt: serverTimestamp()
        });
    } catch(e) {
        console.error("Error rejecting idea", e);
        throw e;
    }
  }
};

export const challengesAPI = {
  getAll: async (cityId?: string): Promise<Challenge[]> => {
    try {
      const ref = collection(db, "challenges");
      let q = query(ref, where("isActive", "==", true));
      
      if (cityId) {
        const cityNum = getCityNumber(cityId);
        q = query(ref, where("cityID", "==", cityNum), where("isActive", "==", true));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          cityId: getCityString(data.cityID || 1),
          title: data.title || "Izazov",
          description: data.desc || "",
          category: data.category || Category.URBAN,
          progress: data.progress || 0,
          deadline: data.deadline || "TBD",
          ideasCount: data.ideasCount || 0,
          priority: data.priority || 'Srednje',
          fund: data.fund || "0 €",
          featured: data.featured || false,
          created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Challenge;
      });
    } catch (e) {
      console.error("Error fetching challenges:", e);
      return [];
    }
  },

  add: async (challenge: Omit<Challenge, 'id' | 'ideasCount' | 'created_at'>): Promise<Challenge> => {
    try {
        const cityNum = getCityNumber(challenge.cityId);
        const data = {
            cityID: cityNum,
            title: challenge.title,
            desc: challenge.description, // Mapping to DB field desc
            category: challenge.category,
            progress: challenge.progress,
            deadline: challenge.deadline,
            priority: challenge.priority,
            fund: challenge.fund,
            featured: challenge.featured,
            isActive: true,
            ideasCount: 0,
            createdAt: serverTimestamp()
        };
        const ref = await addDoc(collection(db, "challenges"), data);
        
        return {
            ...challenge,
            id: ref.id,
            ideasCount: 0,
            created_at: new Date().toISOString()
        };
    } catch (e) {
        console.error("Error adding challenge:", e);
        throw e;
    }
  }
};


export const pollsAPI = {
  getAll: async (cityId?: string, userId?: string): Promise<Poll[]> => {
    try {
       const ref = collection(db, "polls");
       let q = ref as any;
       if (cityId) {
          q = query(ref, where("cityID", "==", getCityNumber(cityId)));
       }
       const snapshot = await getDocs(q);
       return snapshot.docs.map(doc => {
         const data: any = doc.data();
         if (data.isDeleted) return null;
         const endsAtDate = data.endsAt?.toDate ? data.endsAt.toDate() : (data.endsAt ? new Date(data.endsAt) : null);
         const now = new Date();
         const isClosed = data.isClosed === true || (endsAtDate ? endsAtDate.getTime() <= now.getTime() : false);
         let endsIn = data.endsIn || "Aktivno";
         if (endsAtDate) {
           if (isClosed) {
             endsIn = "Zatvoreno";
           } else {
             const diffMs = endsAtDate.getTime() - now.getTime();
             const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
             const hours = Math.floor(diffMs / (1000 * 60 * 60));
             endsIn = days >= 1 ? `Preostalo ${days}d` : `Preostalo ${Math.max(hours, 1)}h`;
           }
         }
         return {
           id: doc.id,
           cityId: getCityString(data.cityID || 1),
           question: data.question || "",
           options: data.options || [],
           totalVotes: data.totalVotes || 0,
           userVotedOptionId: userId ? data.voterMap?.[userId] || null : null,
           endsIn,
           endsAt: endsAtDate ? endsAtDate.toISOString() : undefined,
           isClosed
         } as Poll;
       }).filter(Boolean) as Poll[];
    } catch (e) {
      console.error("Error fetching polls:", e);
      return [];
    }
  }
  ,
  create: async (poll: { question: string; options: string[]; cityId: string; endsInDays?: number | null }, user: User): Promise<Poll> => {
    try {
      const optionItems = poll.options.map((text, index) => ({
        id: `opt-${Date.now()}-${index}`,
        text,
        votes: 0
      }));
      const endsAt = typeof poll.endsInDays === 'number'
        ? Timestamp.fromDate(new Date(Date.now() + poll.endsInDays * 24 * 60 * 60 * 1000))
        : null;
      const data = {
        cityID: getCityNumber(poll.cityId),
        question: poll.question,
        options: optionItems,
        totalVotes: 0,
        endsIn: poll.endsInDays ? `Preostalo ${poll.endsInDays}d` : 'Aktivno',
        endsAt,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        voterMap: {}
      };
      const docRef = await addDoc(collection(db, "polls"), data);
      return {
        id: docRef.id,
        cityId: poll.cityId,
        question: poll.question,
        options: optionItems,
        totalVotes: 0,
        endsIn: data.endsIn,
        endsAt: endsAt ? endsAt.toDate().toISOString() : undefined,
        isClosed: false
      } as Poll;
    } catch (e) {
      console.error("Error creating poll:", e);
      throw e;
    }
  },
  vote: async (pollId: string, optionId: string, userId: string): Promise<Poll | null> => {
    try {
      const pollRef = doc(db, "polls", pollId);
      const snap = await getDoc(pollRef);
      if (!snap.exists()) return null;

      const data: any = snap.data();
      const endsAtDate = data.endsAt?.toDate ? data.endsAt.toDate() : (data.endsAt ? new Date(data.endsAt) : null);
      if (data.isClosed === true) return null;
      if (endsAtDate && endsAtDate.getTime() <= Date.now()) return null;
      if (data.voterMap && data.voterMap[userId]) return null;

      const options = (data.options || []).map((opt: any) =>
        opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );
      const totalVotes = (data.totalVotes || 0) + 1;

      await updateDoc(pollRef, {
        options,
        totalVotes,
        [`voterMap.${userId}`]: optionId
      });

      const isClosed = data.isClosed === true || (endsAtDate ? endsAtDate.getTime() <= Date.now() : false);
      return {
        id: pollId,
        cityId: getCityString(data.cityID || 1),
        question: data.question || "",
        options,
        totalVotes,
        userVotedOptionId: optionId,
        endsIn: data.endsIn || 'Aktivno',
        endsAt: endsAtDate ? endsAtDate.toISOString() : undefined,
        isClosed
      } as Poll;
    } catch (e) {
      console.error("Error voting on poll:", e);
      throw e;
    }
  },
  setClosed: async (pollId: string, closed: boolean): Promise<void> => {
    try {
      const pollRef = doc(db, "polls", pollId);
      await updateDoc(pollRef, {
        isClosed: closed,
        closedAt: closed ? serverTimestamp() : null
      });
    } catch (e) {
      console.error("Error updating poll closed state:", e);
      throw e;
    }
  },
  remove: async (pollId: string): Promise<void> => {
    try {
      const pollRef = doc(db, "polls", pollId);
      await updateDoc(pollRef, { isDeleted: true, deletedAt: serverTimestamp() });
    } catch (e) {
      console.error("Error deleting poll:", e);
      throw e;
    }
  }
};

export const communityAPI = {
  getPosts: async (cityId?: string): Promise<Post[]> => {
    try {
      const ref = collection(db, "posts");
      let q = query(ref, orderBy("createdAt", "desc"));
      if(cityId) {
         // Sort by createdAt descending locally to avoid index creation if possible, 
         // but simple queries handle it fine. Use "cityID" as number according to screenshot.
         const cityNum = getCityNumber(cityId);
         q = query(ref, where("cityID", "==", cityNum)); // Removed orderBy("createdAt", "desc") to avoid composite index error for now
      }
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          postNo: data.postNo || 0,
          authorOIB: data.authorOIB,
          cityID: data.cityID || 1,
          authorName: data.authorName || "Građanin", 
          authorAvatar: data.authorAvatar || getInitials(data.authorName || "Građanin"),
          content: data.content || "",
          likes: data.likes || 0,
          comments: data.commentsCount || 0, // Mapping commentsCount to comments property
          created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          time: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('hr-HR') : "Nedavno",
          likedByCurrentUser: false 
        } as Post;
      });
      // Client-side sort
      return posts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (e) {
      console.error("Error fetching posts:", e);
      return [];
    }
  },
  createPost: async (content: string, user: User): Promise<Post> => {
     try {
       // Need to generate a postNo. For now, using a simple counter is unsafe in distributed systems without transactions/shards
       // But user screenshot shows 1. We will try to find max (client side or separate counter doc). 
       // For speed/simplicity in this context, we will query the latest post to get its postNo + 1. 
       // NOTE: Race conditions possible.
       
       const postsRef = collection(db, "posts");
       const lastPostQuery = query(postsRef, orderBy("postNo", "desc"), limit(1));
       const lastSnapshot = await getDocs(lastPostQuery);
       let nextPostNo = 1;
       if (!lastSnapshot.empty) {
           nextPostNo = (lastSnapshot.docs[0].data().postNo || 0) + 1;
       }

       const postData = {
         content,
         authorOIB: user.OIB,
         authorName: user.name, // Storing redundant data simplifies reads
         authorAvatar: user.avatar,
         cityID: getCityNumber(user.cityId),
         postNo: nextPostNo,
         likes: 0,
         commentsCount: 0, // Using commentsCount in DB to track
         createdAt: serverTimestamp()
       };
       const docRef = await addDoc(collection(db, "posts"), postData);
       return {
         id: docRef.id,
         postNo: nextPostNo,
         authorOIB: user.OIB,
         cityID: getCityNumber(user.cityId),
         authorName: user.name,
         authorAvatar: user.avatar,
         content,
         likes: 0,
         comments: 0,
         created_at: new Date().toISOString(),
         time: "Upravo sad",
         likedByCurrentUser: false
       };
     } catch (e) {
       console.error("Error creating post:", e);
       throw e;
     }
  },
  createOfficialPost: async (content: string, cityId: string): Promise<Post> => {
     try {
       const postsRef = collection(db, "posts");
       const lastPostQuery = query(postsRef, orderBy("postNo", "desc"), limit(1));
       const lastSnapshot = await getDocs(lastPostQuery);
       let nextPostNo = 1;
       if (!lastSnapshot.empty) {
         nextPostNo = (lastSnapshot.docs[0].data().postNo || 0) + 1;
       }

       const postData = {
         content,
         authorOIB: '00000000000',
         authorName: 'Gradska Uprava',
         authorAvatar: '🏛️',
         cityID: getCityNumber(cityId),
         postNo: nextPostNo,
         likes: 0,
         commentsCount: 0,
         createdAt: serverTimestamp()
       };
       const docRef = await addDoc(collection(db, "posts"), postData);
       return {
         id: docRef.id,
         postNo: nextPostNo,
         authorOIB: postData.authorOIB,
         cityID: postData.cityID,
         authorName: postData.authorName,
         authorAvatar: postData.authorAvatar,
         content,
         likes: 0,
         comments: 0,
         created_at: new Date().toISOString(),
         time: "Upravo sad",
         likedByCurrentUser: false
       } as Post;
     } catch (e) {
       console.error("Error creating official post:", e);
       throw e;
     }
  },
  likePost: async (postId: string): Promise<void> => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (e) {
      console.error(e);
    }
  },
  // Adding comment functionality
  getComments: async (postNo: number): Promise<PostComment[]> => {
      try {
          const ref = collection(db, "post-comments");
          const q = query(ref, where("postNo", "==", postNo));
          const snapshot = await getDocs(q);
          const comments = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                  id: doc.id,
                  postNo: data.postNo,
                  authorOIB: data.authorOIB,
                  authorName: data.authorName || "Građanin", 
                  avatar: data.avatar || getInitials(data.authorName || "Građanin"),
                  content: data.content,
                  created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                  time: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('hr-HR') : "Nedavno"
              } as PostComment;
          });
          return comments.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } catch (e) {
          console.error("Error fetching comments:", e);
          return [];
      }
  },
  addComment: async (postNo: number, content: string, user: User, postId: string): Promise<PostComment> => {
      try {
          const commentData = {
              postNo: postNo, // Link by Number as per schema screenshot
              authorOIB: user.OIB,
              authorName: user.name,
              avatar: user.avatar,
              content: content,
              createdAt: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(db, "post-comments"), commentData);
          
          // Increment comment count on post
          const postRef = doc(db, "posts", postId);
          await updateDoc(postRef, {
              commentsCount: increment(1)
          });
          
          return {
              id: docRef.id,
              postNo,
              authorOIB: user.OIB,
              authorName: user.name,
              avatar: user.avatar,
              content,
              created_at: new Date().toISOString(),
              time: "Upravo sad"
          };
      } catch(e) {
          console.error("Error adding comment:", e);
          throw e;
      }
  },
  deletePost: async (postId: string): Promise<void> => {
      try {
          const postRef = doc(db, "posts", postId);
          await updateDoc(postRef, {
              content: "[Obrisano]",
              authorName: "[Brisan]"
          });
      } catch(e) {
          console.error("Error deleting post:", e);
          throw e;
      }
  }
};

export const transactionsAPI = {
  getAll: async (cityId?: string): Promise<any[]> => {
    try {
      const ref = collection(db, "transactions");
      const snapshot = await getDocs(ref); 
      // Simplified query to avoid index errors initially, can refine later
      return snapshot.docs.map(doc => {
         const data = doc.data();
         return {
             id: doc.id,
             date: data.date || new Date().toISOString().split('T')[0],
             description: data.description || 'Transakcija',
             amount: data.amount || 0,
             type: data.type || 'DBIT' 
         };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};

export const citiesAPI = {
  getAll: async (): Promise<{id: string, name: string}[]> => {
    try {
      const citiesRef = collection(db, "cities");
      const snapshot = await getDocs(citiesRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const numericId = parseInt(doc.id, 10);
        return {
          id: getCityString(numericId),
          name: data.cityName || 'Nepoznat Grad'
        };
      });
    } catch (e) {
      console.error("Error fetching cities:", e);
      return [];
    }
  }
};

export const eventsAPI = {
  getAll: async (cityId?: string): Promise<CityEvent[]> => {
    try {
      const ref = collection(db, "events");
      let q = query(ref);
      if (cityId) {
        q = query(ref, where("cityId", "==", cityId));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          cityId: data.cityId,
          title: data.title,
          description: data.description,
          date: data.date, // Timestamp or string, handled in UI
          type: data.type,
          createdBy: data.createdBy
        } as CityEvent;
      });
    } catch (e) {
      console.error("Error fetching events:", e);
      return [];
    }
  },

  add: async (event: Omit<CityEvent, 'id'>): Promise<string> => {
    try {
      const ref = collection(db, "events");
      const docRef = await addDoc(ref, event);
     return docRef.id;
    } catch (e) {
      console.error("Error adding event:", e);
      throw e;
    }
  }
};

