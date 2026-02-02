
import { CityConfig, Challenge, Category, IncubatorStage, Idea, Badge, Transaction, CompanyData, Poll } from './types';

export const BADGES: Badge[] = [
  { id: 'b1', name: 'Pionir', icon: 'auto_awesome', description: 'Prva poslana ideja u sustav.', color: '#1C3E95', unlocked: true },
  { id: 'b2', name: 'Eko Vitez', icon: 'eco', description: '3+ odobrene ideje u kategoriji Okoliš.', color: '#10b981', unlocked: true },
  { id: 'b3', name: 'Digitalni Mag', icon: 'settings_input_component', description: 'Implementiran tehnološki projekt.', color: '#00B0F0', unlocked: false },
  { id: 'b4', name: 'Glas Naroda', icon: 'campaign', description: '100+ lajkova na vašim objavama.', color: '#f59e0b', unlocked: true },
  { id: 'b5', name: 'Gradski Arhitekt', icon: 'architecture', description: 'Projekt ušao u fazu skaliranja.', color: '#8b5cf6', unlocked: false },
  { id: 'b6', name: 'Verifikator', icon: 'fact_check', description: 'Korištenje AI provjere 10+ puta.', color: '#ef4444', unlocked: true },
];

export const CITIES: CityConfig[] = [
  { 
    id: 'zagreb', 
    name: 'Zagreb', 
    theme: {
      primary: '#004A99',
      secondary: '#002E5D',
      accent: '#FFFFFF', 
      pattern: 'url("https://www.transparenttextures.com/patterns/gplay.png")',
      culturalIcon: 'castle'
    }
  },
  { 
    id: 'split', 
    name: 'Split', 
    theme: {
      primary: '#003366',
      secondary: '#C5A059',
      accent: '#FFFFFF',
      pattern: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
      culturalIcon: 'account_balance'
    }
  },
  { 
    id: 'rijeka', 
    name: 'Rijeka', 
    theme: {
      primary: '#0054A6',
      secondary: '#FFD700',
      accent: '#FFFFFF', 
      pattern: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
      culturalIcon: 'directions_boat'
    }
  },
  { 
    id: 'osijek', 
    name: 'Osijek', 
    theme: {
      primary: '#007A33',
      secondary: '#D4AF37',
      accent: '#FFFFFF', 
      pattern: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
      culturalIcon: 'church'
    }
  },
  { 
    id: 'zadar', 
    name: 'Zadar', 
    theme: {
      primary: '#1C3E95',
      secondary: '#00B0F0',
      accent: '#FFD700',
      pattern: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
      culturalIcon: 'waves'
    }
  },
  { 
    id: 'velika_gorica', 
    name: 'Velika Gorica', 
    theme: {
      primary: '#E53935',
      secondary: '#B71C1C',
      accent: '#FFFFFF', 
      pattern: 'url("https://www.transparenttextures.com/patterns/gplay.png")',
      culturalIcon: 'airplane_ticket'
    }
  },
  { 
    id: 'slavonski_brod', 
    name: 'Slavonski Brod', 
    theme: {
      primary: '#FB8C00',
      secondary: '#E65100',
      accent: '#FFFFFF', 
      pattern: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
      culturalIcon: 'fort'
    }
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX-001', date: '2024-03-20', description: 'Prihod od turističke pristojbe', amount: 45200.00, type: 'CRDT' },
  { id: 'TX-002', date: '2024-03-19', description: 'Održavanje gradske rasvjete', amount: 12400.00, type: 'DBIT' },
  { id: 'TX-003', date: '2024-03-18', description: 'EU Fondovi - Održivi promet', amount: 125000.00, type: 'CRDT' },
  { id: 'TX-004', date: '2024-03-17', description: 'Subvencije za vrtiće', amount: 89000.00, type: 'DBIT' },
  { id: 'TX-005', date: '2024-03-16', description: 'Porez na dohodak (Uplata)', amount: 210500.00, type: 'CRDT' },
];

export const INFOBIP_DATA: CompanyData = {
  name: 'INFOBIP d.o.o.',
  fullName: 'INFOBIP d.o.o. za informatičke usluge',
  oib: '29756659895',
  mbs: '130004106',
  address: "Istarska ulica 157, 52100, Vodnjan, Hrvatska",
  founded: '13.04.2006.',
  status: 'Aktivan',
  activity: 'K63100 - Računalna infrastruktura, obrada podataka',
  size: 'Veliko poduzeće',
  rating: 'A+',
  blocked: false,
  phone: '052635826',
  email: 'pravna@infobip.com',
  website: 'www.infobip.com',
  owner: 'INFOBIP LIMITED, Velika Britanija',
  directors: ['Stjepan Žitnik', 'Tomislav Pifar', 'Igor Dvoršak'],
  financials: [
    { year: 2024, income: 128608959.77, expenses: 121437859.17, profit: 9249103.41, employees: 1401 },
    { year: 2023, income: 101758420.82, expenses: 102254697.59, profit: 1595458.28, employees: 1401 },
    { year: 2022, income: 88435177.51, expenses: 86975443.76, profit: 1459733.76, employees: 1321 }
  ]
};

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: '1',
    cityId: 'zadar',
    title: "Ugljično neutralna povijesna jezgra",
    description: "Transformirajte povijesnu jezgru grada u zonu nulte emisije kroz pametna energetska rješenja.",
    category: Category.ENVIRONMENT,
    progress: 72,
    deadline: "31.12.2024.",
    ideasCount: 24,
    priority: "Kritično",
    fund: "50.000 € Fond",
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    cityId: 'zagreb',
    title: "Pametno upravljanje prometnim gužvama",
    description: "Implementacija AI sustava za regulaciju semafora u realnom vremenu na ključnim križanjima.",
    category: Category.TRANSPORT,
    progress: 45,
    deadline: "15.06.2025.",
    ideasCount: 18,
    priority: "Kritično",
    fund: "120.000 € Fond",
    featured: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_IDEAS: Idea[] = [
  {
    id: '101',
    cityId: 'zadar',
    title: "Solarne klupe na rivi",
    description: "Integracija solarnih panela u urbani namještaj za napajanje rasvjete i USB punjača.",
    category: Category.ENERGY,
    impactScore: 94,
    author: "Ana K.",
    authorAvatar: "AK",
    date: "2024-01-12",
    stage: IncubatorStage.PROTOTYPING,
    likes: 42,
    comments: [
      { id: 'c1', author: 'Ivan P.', text: 'Odlična ideja, napokon ćemo imati gdje puniti mobitele!', time: 'Prije 2 sata', avatar: 'IP', created_at: new Date().toISOString() }
    ],
    isVerified: true,
    status: 'APPROVED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-1',
    cityId: 'zadar',
    question: 'Treba li centar grada postati pješačka zona vikendom?',
    options: [
      { id: 'opt-1', text: 'Da, apsolutno', votes: 1420 },
      { id: 'opt-2', text: 'Ne, još je rano', votes: 680 }
    ],
    totalVotes: 2100,
    endsIn: '2 dana'
  }
];
