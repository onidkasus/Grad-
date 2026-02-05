import { CompanyData } from '../types';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const CompanyService = {
  search: async (term: string): Promise<CompanyData | null> => {
    try {
      const companiesRef = collection(db, "companies");
      // Search by OIB
      let q = query(companiesRef, where("oib", "==", term));
      let snapshot = await getDocs(q);
      
      if (snapshot.empty) {
         // Fallback: search by Name (exact match)
         q = query(companiesRef, where("name", "==", term));
         snapshot = await getDocs(q);
      }

      if (!snapshot.empty) {
        return snapshot.docs[0].data() as CompanyData;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  getFinancials: async (oib: string) => {
      // Mock or fetch logic
      return [];
  }
};

export default CompanyService;
