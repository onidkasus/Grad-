
export enum Category {
  ENVIRONMENT = 'Okoliš',
  TECHNOLOGY = 'Tehnologija',
  TRANSPORT = 'Transport',
  TOURISM = 'Turizam',
  EDUCATION = 'Obrazovanje',
  ENERGY = 'Energija',
  SOCIAL = 'Socijalno',
  URBAN = 'Urbanizam'
}

export enum IncubatorStage {
  DISCOVERY = 'Otkrivanje',
  VALIDATION = 'Validacija',
  PROTOTYPING = 'Prototipiranje',
  TESTING = 'Testiranje',
  SCALING = 'Skaliranje'
}

export enum UserRole {
  CITIZEN = 'Građanin',
  OFFICIAL = 'Gradski Službenik',
  ADMIN = 'Sustav Administrator'
}

export interface CityTheme {
  primary: string;
  secondary: string;
  accent: string;
  pattern: string;
  culturalIcon: string;
}

export interface CityConfig {
  id: string;
  name: string;
  theme: CityTheme;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  unlocked: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
  avatar: string; 
  created_at: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: Category;
  impactScore: number;
  author: string;
  authorAvatar: string;
  date: string;
  stage: IncubatorStage;
  likes: number;
  comments: Comment[];
  isVerified?: boolean;
  cityId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  challenge_id?: string;
  tags?: string[];
}

export interface Post {
  id: string;
  userId: string;
  cityId: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: number;
  commentsCount: number;
  created_at: string;
  likedByCurrentUser?: boolean;
}

export interface Challenge {
  id: string;
  cityId: string;
  title: string;
  description: string;
  category: Category;
  progress: number;
  deadline: string;
  ideasCount: number;
  priority: 'Kritično' | 'Visoko' | 'Srednje' | 'Nisko';
  fund: string;
  featured: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'ALERT';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  impactScore: number;
  rank: string;
  verifiedCount: number;
  ideasCount: number;
  avatar: string;
  cityId: string;
  badges: Badge[];
  joined_date: string;
}

export interface Poll {
  id: string;
  cityId: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userVotedOptionId?: string | null;
  endsIn: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'CRDT' | 'DBIT';
}

export interface CompanyData {
  name: string;
  fullName: string;
  oib: string;
  mbs: string;
  address: string;
  founded: string;
  status: string;
  activity: string;
  size: string;
  rating: string;
  blocked: boolean;
  phone: string;
  email: string;
  website: string;
  owner: string;
  directors: string[];
  financials: { year: number; income: number; expenses: number; profit: number; employees: number }[];
}

export interface DigitalDocument {
  id: string;
  title: string;
  category: string;
  date: string;
  issuer: string;
  status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  fileType: 'PDF' | 'IMAGE';
}
