import { db } from './firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { Mission } from '../types';

const COLLECTION_NAME = 'missions';

export const missionService = {
  getAll: async (): Promise<Mission[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
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

  add: async (name: string, desc: string, beginDate: Date, endDate: Date): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        name,
        desc,
        'duration-begin': Timestamp.fromDate(beginDate),
        'duration-end': Timestamp.fromDate(endDate)
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding mission:", error);
      throw error;
    }
  }
};
