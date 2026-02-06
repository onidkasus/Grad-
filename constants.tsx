import { CityConfig, Badge } from './types';

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
