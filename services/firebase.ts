// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGaSHROHFX7OfqrLFNzY2DrOZQ9HN5T70",
  authDomain: "gradplus-48d21.firebaseapp.com",
  databaseURL: "https://gradplus-48d21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gradplus-48d21",
  storageBucket: "gradplus-48d21.firebasestorage.app",
  messagingSenderId: "428426274947",
  appId: "1:428426274947:web:bfe858728e6ac3956f13b6",
  measurementId: "G-STDZGTWCRK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

/**
 * Stores login information to the Firestore 'users' collection using the UID as document ID.
 * @param uid - The unique identifier for the user
 * @param username - The username to store
 */
export const storeLogin = async (uid: string, username: string) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      username: username
    }, { merge: true }); // Merge true to avoid overwriting other potential fields
    console.log(`User ${username} stored with UID: ${uid}`);
  } catch (e) {
    console.error("Error storing user: ", e);
    throw e;
  }
};

