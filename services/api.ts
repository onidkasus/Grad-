
import { User, Idea, Challenge, Poll, Notification, UserRole, IncubatorStage, Category, Post } from '../types';
import { INITIAL_IDEAS, INITIAL_CHALLENGES, INITIAL_POLLS, BADGES } from '../constants';

// Simulated latency to mimic real-world network conditions
const LATENCY = 600;
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

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    cityId: 'zadar',
    author: 'Ivan Horvat',
    authorAvatar: 'IH',
    content: 'Što mislite o novoj regulaciji prometa u centru? Čini mi se da je gužva manja.',
    likes: 15,
    commentsCount: 3,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likedByCurrentUser: false
  }
];

// Database Initializer
const initializeDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(INITIAL_IDEAS));
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  if (!localStorage.getItem(STORAGE_KEYS.CHALLENGES)) localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
  if (!localStorage.getItem(STORAGE_KEYS.POLLS)) localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(INITIAL_POLLS));
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
};

initializeDatabase();

// --- AUTH SERVICE (Port 3001) ---
export const authAPI = {
  login: async (email: string, password?: string): Promise<{user: User, token: string}> => {
    await delay(1200);
    const mockUser: User = {
      id: 'usr_99',
      name: 'Marko Horvat',
      email: email,
      role: UserRole.CITIZEN,
      impactScore: 1450,
      rank: 'Zlatni Inovator',
      verifiedCount: 18,
      ideasCount: 5,
      avatar: 'MH',
      cityId: 'zadar',
      badges: BADGES,
      joined_date: new Date().toISOString()
    };
    const mockToken = `ey_jwt_mock_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    return { user: mockUser, token: mockToken };
  },

  logout: async () => {
    await delay(300);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  updateProfile: async (user: User): Promise<User> => {
    await delay(800);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }
};

// --- IDEAS SERVICE (Port 3002) ---
export const ideasAPI = {
  getAll: async (cityId?: string): Promise<Idea[]> => {
    await delay(500);
    const ideas = JSON.parse(localStorage.getItem(STORAGE_KEYS.IDEAS) || '[]');
    return cityId ? ideas.filter((i: Idea) => i.cityId === cityId) : ideas;
  },

  create: async (idea: Partial<Idea>, user: User): Promise<Idea> => {
    await delay(900);
    const ideas = JSON.parse(localStorage.getItem(STORAGE_KEYS.IDEAS) || '[]');
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
      cityId: idea.cityId || user.cityId,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    ideas.unshift(newIdea);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return newIdea;
  },

  updateStage: async (id: string, stage: IncubatorStage): Promise<Idea> => {
    await delay(400);
    const ideas = JSON.parse(localStorage.getItem(STORAGE_KEYS.IDEAS) || '[]');
    const index = ideas.findIndex((i: Idea) => i.id === id);
    if (index === -1) throw new Error('Idea not found');
    ideas[index].stage = stage;
    ideas[index].updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return ideas[index];
  }
};

// --- CHALLENGES SERVICE ---
export const challengesAPI = {
  getAll: async (cityId?: string): Promise<Challenge[]> => {
    await delay(400);
    const challenges = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHALLENGES) || '[]');
    return cityId ? challenges.filter((c: Challenge) => c.cityId === cityId) : challenges;
  }
};

// --- POLLS SERVICE ---
export const pollsAPI = {
  getAll: async (cityId?: string): Promise<Poll[]> => {
    await delay(300);
    const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
    return cityId ? polls.filter((p: Poll) => p.cityId === cityId) : polls;
  }
};

// --- COMMUNITY SERVICE (Port 3004) ---
export const communityAPI = {
  getPosts: async (cityId?: string): Promise<Post[]> => {
    await delay(400);
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    return cityId ? posts.filter((p: Post) => p.cityId === cityId) : posts;
  },

  createPost: async (content: string, user: User): Promise<Post> => {
    await delay(600);
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      cityId: user.cityId,
      author: user.name,
      authorAvatar: user.avatar,
      content,
      likes: 0,
      commentsCount: 0,
      created_at: new Date().toISOString(),
      likedByCurrentUser: false
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },

  likePost: async (postId: string): Promise<void> => {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    const index = posts.findIndex((p: Post) => p.id === postId);
    if (index !== -1) {
      posts[index].likes += posts[index].likedByCurrentUser ? -1 : 1;
      posts[index].likedByCurrentUser = !posts[index].likedByCurrentUser;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
  }
};

// --- ANALYTICS SERVICE (Port 3005) ---
export const analyticsAPI = {
  getGlobalStats: async () => {
    await delay(700);
    return {
      activeUsers: 14205,
      totalIdeas: 5642,
      carbonReduction: '12%',
      smartCitiesActive: 42
    };
  }
};
