
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
  phase?: number;
  aiRating?: number;
  aiReasoning?: string;
}

export interface Post {
  id: string; // Document ID
  postNo: number; // For linking comments? from screenshots
  authorName: string; 
  authorAvatar: string; 
  authorOIB: string;
  content: string;
  time: string; // Relative time string or display string
  created_at: string;
  likes: number;
  comments: number;
  likedByCurrentUser?: boolean;
  cityID: number;
}

export interface PostComment {
  id: string;
  postNo: number;
  authorOIB: string;
  authorName?: string; 
  avatar?: string;
  content: string;
  created_at: string;
  time?: string;
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
  id: string; // The document ID
  firstName: string;
  lastName: string;
  OIB: string;
  cityID: number;
  isAdmin: boolean;
  
  // UI compatibility fields (can be derived or optional)
  name: string; // derived from firstName + lastName
  email?: string;
  role: UserRole; // derived from isAdmin
  impactScore: number;
  rank: string;
  verifiedCount: number;
  ideasCount: number;
  avatar: string;
  cityId: string; // mapped from cityID
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
  endsIn?: string;
  endsAt?: string;
  isClosed?: boolean;
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
  description?: string;
  phones?: string[];
  bankAccounts?: { iban: string; opened: string; closed?: string; bank: string; status: string }[];
  realEstate?: string;
  taxDebt?: string;
  inBlockade?: boolean;
  averageSalary?: { year: number; salary: number }[];
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

export interface CityEvent {
  id: string;
  cityId: string;
  title: string;
  description: string;
  date: any; // Timestamp from firebase usually
  type: 'ELECTION' | 'PUBLIC_HEARING' | 'EVENT' | 'HOLIDAY';
  createdBy: string;
}

export interface DocumentRequest {
  id: string;
  userId: string;
  userName: string;
  documentType: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  cityId: string;
}

