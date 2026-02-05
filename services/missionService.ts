import { db } from './firebase';
import { collection, getDocs, addDoc, Timestamp, query, where } from 'firebase/firestore';
import { Mission } from '../types';

const COLLECTION_NAME = 'missions';

// Helper: Map app string ID to numeric DB city ID
const getCityNumber = (cityString: string) => {
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

export const missionService = {
  getAll: async (cityIdStr: string): Promise<Mission[]> => {
    try {
      const cityId = getCityNumber(cityIdStr);
      const q = query(collection(db, COLLECTION_NAME), where('cityID', '==', cityId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          desc: data.desc,
          duration_begin: data['duration-begin'] ? (data['duration-begin'] as Timestamp).toDate().toISOString() : '',
          duration_end: data['duration-end'] ? (data['duration-end'] as Timestamp).toDate().toISOString() : ''
        } as Mission;
      });
    } catch (error) {
      console.error("Error fetching missions:", error);
      throw error;
    }
  },

  add: async (name: string, desc: string, beginDate: Date, endDate: Date, cityIdStr: string): Promise<string> => {
    try {
      const cityId = getCityNumber(cityIdStr);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name,
        desc,
        'duration-begin': Timestamp.fromDate(beginDate),
        'duration-end': Timestamp.fromDate(endDate),
        cityID: cityId
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding mission:", error);
      throw error;
    }
  }
};
