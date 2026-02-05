import { User, Idea, Challenge, Poll, Notification, UserRole, IncubatorStage, Category, Post } from '../types';
import { BADGES } from '../constants';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LATENCY = 1000;
const delay = (ms: number = LATENCY) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  TOKEN: 'grad_plus_token',
  USER: 'grad_plus_user_data',
  IDEAS: 'grad_plus_ideas_db',
  POSTS: 'grad_plus_posts_db',
  CHALLENGES: 'grad_plus_challenges_db',
  POLLS: 'grad_plus_polls_db',
  NOTIFICATIONS: 'grad_plus_notifications_db'
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
    default: return 'zagreb';
  }
};

const INITIAL_CHALLENGES: Challenge[] = [
  // ZAGREB
  { id: 'c-zg-1', cityId: 'zagreb', title: "Zeleni prsten Sljemena", description: "Revitalizacija pješačkih staza uz pametnu rasvjetu i senzore za vlagu tla.", category: Category.ENVIRONMENT, progress: 30, deadline: "01.12.2024.", ideasCount: 5, priority: "Visoko", fund: "40.000 €", featured: true, created_at: new Date().toISOString() },
  { id: 'c-zg-2', cityId: 'zagreb', title: "Smart Parking Donji Grad", description: "Sustav za detekciju slobodnih mjesta u realnom vremenu preko mobilne aplikacije.", category: Category.TRANSPORT, progress: 65, deadline: "15.10.2024.", ideasCount: 12, priority: "Kritično", fund: "85.000 €", featured: false, created_at: new Date().toISOString() },
  { id: 'c-zg-3', cityId: 'zagreb', title: "Digitalni Vrtići", description: "Platforma za centralizirano upravljanje upisima i komunikaciju s roditeljima.", category: Category.EDUCATION, progress: 10, deadline: "01.09.2025.", ideasCount: 3, priority: "Srednje", fund: "25.000 €", featured: true, created_at: new Date().toISOString() },
  
  // SPLIT
  { id: 'c-st-1', cityId: 'split', title: "Održivi Žnjan", description: "Implementacija pametnih tuševa s reciklažom vode i solarnih suncobrana.", category: Category.ENVIRONMENT, progress: 15, deadline: "15.08.2024.", ideasCount: 2, priority: "Srednje", fund: "30.000 €", featured: true, created_at: new Date().toISOString() },
  { id: 'c-st-2', cityId: 'split', title: "Smart Riva Hub", description: "Postavljanje high-speed internet i info stupova za turiste i građane.", category: Category.TECHNOLOGY, progress: 80, deadline: "01.06.2024.", ideasCount: 9, priority: "Visoko", fund: "20.000 €", featured: false, created_at: new Date().toISOString() },
  
  // ZADAR
  { id: 'c-zd-1', cityId: 'zadar', title: "Eko-Luka Gaženica", description: "Sustav za praćenje kvalitete mora i zraka u realnom vremenu.", category: Category.ENVIRONMENT, progress: 85, deadline: "01.06.2024.", ideasCount: 12, priority: "Kritično", fund: "60.000 €", featured: true, created_at: new Date().toISOString() },
  { id: 'c-zd-2', cityId: 'zadar', title: "AI Morske Orgulje", description: "Sustav za prediktivno održavanje instalacija pomoću AI analize zvuka.", category: Category.TECHNOLOGY, progress: 45, deadline: "20.12.2024.", ideasCount: 4, priority: "Srednje", fund: "15.000 €", featured: false, created_at: new Date().toISOString() },

  // RIJEKA
  { id: 'c-ri-1', cityId: 'rijeka', title: "Industrijska Baština AR", description: "Proširena stvarnost za turističke ture kroz staru industrijsku zonu.", category: Category.TOURISM, progress: 55, deadline: "30.11.2024.", ideasCount: 8, priority: "Nisko", fund: "12.000 €", featured: true, created_at: new Date().toISOString() },
  { id: 'c-ri-2', cityId: 'rijeka', title: "Startup Hub Torpedo", description: "Modernizacija prostora za IT inkubaciju i co-working.", category: Category.TECHNOLOGY, progress: 20, deadline: "01.03.2025.", ideasCount: 6, priority: "Visoko", fund: "120.000 €", featured: false, created_at: new Date().toISOString() },

  // OSIJEK
  { id: 'c-os-1', cityId: 'osijek', title: "Tramvaj 2.0", description: "AI optimizacija linija i uvođenje beskontaktnog plaćanja u cijeloj mreži.", category: Category.TRANSPORT, progress: 50, deadline: "20.10.2024.", ideasCount: 7, priority: "Visoko", fund: "100.000 €", featured: true, created_at: new Date().toISOString() },
  { id: 'c-os-2', cityId: 'osijek', title: "Smart Drava Promenade", description: "Pametna rasvjeta koja štedi energiju detekcijom kretanja prolaznika.", category: Category.ENVIRONMENT, progress: 95, deadline: "01.05.2024.", ideasCount: 15, priority: "Srednje", fund: "35.000 €", featured: false, created_at: new Date().toISOString() },
];

const INITIAL_IDEAS: Idea[] = [
  // ZAGREB
  { id: 'i-zg-1', cityId: 'zagreb', title: "Solarne nadstrešnice", description: "Postavljanje solara na krovove tramvajskih stanica za napajanje LED ekrana.", category: Category.ENERGY, impactScore: 85, author: "Ivan Horvat", authorAvatar: "IH", date: "10.03.2024.", stage: IncubatorStage.PROTOTYPING, likes: 120, comments: [], isVerified: true, status: 'APPROVED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'i-zg-2', cityId: 'zagreb', title: "Aplikacija 'ZG Otpad'", description: "Gamifikacija recikliranja s nagradama za građane.", category: Category.ENVIRONMENT, impactScore: 45, author: "Maja P.", authorAvatar: "MP", date: "12.03.2024.", stage: IncubatorStage.VALIDATION, likes: 56, comments: [], isVerified: false, status: 'PENDING', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // SPLIT
  { id: 'i-st-1', cityId: 'split', title: "E-Bicikli Poljud", description: "Sustav javnih e-bicikala povezan s kartom za stadion.", category: Category.TRANSPORT, impactScore: 78, author: "Luka Marulić", authorAvatar: "LM", date: "14.03.2024.", stage: IncubatorStage.SCALING, likes: 210, comments: [], isVerified: true, status: 'APPROVED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // ZADAR
  { id: 'i-zd-1', cityId: 'zadar', title: "Pametni parking Poluotok", description: "Senzori za slobodna mjesta povezani s mobilnom aplikacijom.", category: Category.TRANSPORT, impactScore: 92, author: "Niko Morski", authorAvatar: "NM", date: "15.03.2024.", stage: IncubatorStage.TESTING, likes: 340, comments: [], isVerified: true, status: 'APPROVED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // OSIJEK
  { id: 'i-os-1', cityId: 'osijek', title: "Agro-Senzori za OPG", description: "Mreža senzora za praćenje vlage i hranjivih tvari u tlu za lokalne poljoprivrednike.", category: Category.ENVIRONMENT, impactScore: 90, author: "Pero Perić", authorAvatar: "PP", date: "18.03.2024.", stage: IncubatorStage.DISCOVERY, likes: 89, comments: [], isVerified: true, status: 'APPROVED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const INITIAL_POSTS: Post[] = [
  { id: 'post-1', userId: 'u1', cityId: 'zagreb', author: 'Ivan Horvat', authorAvatar: 'IH', content: 'Što mislite o uvođenju pješačke zone u Masarykovoj trajno? Meni se čini kao super stvar za centar.', likes: 45, commentsCount: 12, created_at: new Date().toISOString(), likedByCurrentUser: false },
  { id: 'post-2', userId: 'u2', cityId: 'split', author: 'Luka Marulić', authorAvatar: 'LM', content: 'Gužve na ulazu u grad su nesnošljive. Hitno nam treba AI sinkronizacija semafora!', likes: 120, commentsCount: 34, created_at: new Date().toISOString(), likedByCurrentUser: true },
  { id: 'post-3', userId: 'u5', cityId: 'zadar', author: 'Niko Morski', authorAvatar: 'NM', content: 'Morske orgulje trebaju redovito čišćenje, zvuk više nije isti kao prije par godina.', likes: 88, commentsCount: 15, created_at: new Date().toISOString(), likedByCurrentUser: false },
  { id: 'post-4', userId: 'u3', cityId: 'rijeka', author: 'Morena F.', authorAvatar: 'MF', content: 'Novi startup hub je pun pogodak. Rijeka napokon postaje IT centar regije!', likes: 200, commentsCount: 45, created_at: new Date().toISOString(), likedByCurrentUser: false },
];

const INITIAL_POLLS: Poll[] = [
  { id: 'p-zg-1', cityId: 'zagreb', question: 'Širenje pješačke zone u Masarykovoj?', options: [{id:'o1', text:'Da', votes: 4500}, {id:'o2', text:'Ne', votes: 1200}], totalVotes: 5700, endsIn: '5 dana' },
  { id: 'p-st-1', cityId: 'split', question: 'Novi stadion na Poljudu ili sanacija?', options: [{id:'o1', text:'Novi stadion', votes: 8900}, {id:'o2', text:'Sanacija', votes: 12000}], totalVotes: 20900, endsIn: '10 dana' },
  { id: 'p-os-1', cityId: 'osijek', question: 'Više biciklističkih staza uz Dravu?', options: [{id:'o1', text:'Naravno', votes: 3400}, {id:'o2', text:'Dosta ih je', votes: 150}], totalVotes: 3550, endsIn: '2 dana' },
];

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
        cityID: data.cityID || 0,
        isAdmin: data.isAdmin || false,
        
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Korisnik',
        email: data.email || `${credential.toLowerCase()}@grad.plus`,
        role: data.isAdmin ? UserRole.ADMIN : UserRole.CITIZEN,
        impactScore: data.impactScore || 100,
        rank: data.rank || 'Novi Građanin',
        verifiedCount: data.verifiedCount || 0,
        ideasCount: data.ideasCount || 0,
        avatar: data.avatar || 'NM',
        cityId: getCityString(data.cityID),
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
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEYS.IDEAS);
    const ideas = stored ? JSON.parse(stored) : INITIAL_IDEAS;
    return cityId ? ideas.filter((i: Idea) => i.cityId === cityId) : ideas;
  },
  create: async (idea: Partial<Idea>, user: User): Promise<Idea> => {
    await delay(800);
    const stored = localStorage.getItem(STORAGE_KEYS.IDEAS);
    const ideas = stored ? JSON.parse(stored) : [...INITIAL_IDEAS];
    const newIdea: Idea = {
      id: `id_${Date.now()}`,
      title: idea.title!,
      description: idea.description!,
      category: idea.category || Category.URBAN,
      impactScore: 10,
      author: user.name,
      authorAvatar: user.avatar,
      date: new Date().toLocaleDateString('hr-HR'),
      stage: IncubatorStage.DISCOVERY,
      likes: 0,
      comments: [],
      isVerified: false,
      cityId: user.cityId,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      challenge_id: idea.challenge_id
    };
    ideas.unshift(newIdea);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return newIdea;
  }
};

export const challengesAPI = {
  getAll: async (cityId?: string): Promise<Challenge[]> => {
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    const challenges = stored ? JSON.parse(stored) : INITIAL_CHALLENGES;
    return cityId ? challenges.filter((c: Challenge) => c.cityId === cityId) : challenges;
  }
};

export const pollsAPI = {
  getAll: async (cityId?: string): Promise<Poll[]> => {
    await delay(200);
    const stored = localStorage.getItem(STORAGE_KEYS.POLLS);
    const polls = stored ? JSON.parse(stored) : INITIAL_POLLS;
    return cityId ? polls.filter((p: Poll) => p.cityId === cityId) : polls;
  }
};

export const communityAPI = {
  getPosts: async (cityId?: string): Promise<Post[]> => {
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = stored ? JSON.parse(stored) : INITIAL_POSTS;
    return cityId ? posts.filter((p: Post) => p.cityId === cityId) : posts;
  },
  createPost: async (content: string, user: User): Promise<Post> => {
    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = stored ? JSON.parse(stored) : [...INITIAL_POSTS];
    const newPost: Post = { id: `post_${Date.now()}`, userId: user.id, cityId: user.cityId, author: user.name, authorAvatar: user.avatar, content, likes: 0, commentsCount: 0, created_at: new Date().toISOString(), likedByCurrentUser: false };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },
  likePost: async (postId: string): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = stored ? JSON.parse(stored) : [...INITIAL_POSTS];
    const index = posts.findIndex((p: Post) => p.id === postId);
    if (index !== -1) {
      posts[index].likes += posts[index].likedByCurrentUser ? -1 : 1;
      posts[index].likedByCurrentUser = !posts[index].likedByCurrentUser;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
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
          id: getCityString(numericId), // Convert "7" -> "slavonski_brod"
          name: data.cityName || 'Nepoznat Grad'
        };
      });
    } catch (e) {
      console.error("Error fetching cities:", e);
      return [];
    }
  }
};
