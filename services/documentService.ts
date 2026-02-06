import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { DigitalDocument, DocumentRequest } from '../types';

export const documentService = {
  // Fetch documents for a specific user
  async getUserDocuments(userId: string): Promise<DigitalDocument[]> {
    try {
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DigitalDocument));

      // Deduplicate by title to fix potential double-seeding issues
      const uniqueDocsMap = new Map();
      docs.forEach(doc => {
        // Use a composite key or just title if titles are unique enough for this purpose
        if (!uniqueDocsMap.has(doc.title)) {
          uniqueDocsMap.set(doc.title, doc);
        }
      });
      
      return Array.from(uniqueDocsMap.values());
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  // Create a new document request
  async createDocumentRequest(request: Omit<DocumentRequest, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'document_requests'), {
        ...request,
        createdAt: new Date().toISOString(), // Storing as string to match interface, or use Timestamp.now() if changing interface
        status: 'PENDING'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating document request:', error);
      throw error;
    }
  },

  // Seed mock documents for a user (helper for demo)
  async seedDocuments(userId: string) {
    try {
      // First check if ANY documents exist for this user to avoid duplication
      // We query directly here to avoid the deduplication logic hiding the fact that docs exist
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) return;

      const MOCK_DOCS: Omit<DigitalDocument, 'id'>[] = [
      { 
        userId,
        title: 'Rodni List (Izvadak)', 
        category: 'Statusna stanja', 
        date: '12.03.2024.', 
        issuer: 'Matični ured Zadar', 
        status: 'VERIFIED', 
        fileType: 'PDF' 
      },
      { 
        userId,
        title: 'Rješenje o komunalnoj naknadi', 
        category: 'Financije', 
        date: '01.02.2024.', 
        issuer: 'Grad Zadar - Odjel za financije', 
        status: 'VERIFIED', 
        fileType: 'PDF' 
      },
      { 
        userId,
        title: 'Građevinska dozvola - Privremena', 
        category: 'Graditeljstvo', 
        date: '20.03.2024.', 
        issuer: 'Upravni odjel za prostorno uređenje', 
        status: 'PENDING', 
        fileType: 'PDF' 
      },
    ];

    for (const doc of MOCK_DOCS) {
        await addDoc(collection(db, 'documents'), doc);
      }
    } catch (error) {
      console.error('Error seeding documents:', error);
    }
  }
};
