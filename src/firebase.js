import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD7qjTrmTyTO22ZdWze3RmdiboMwgIuDLk",
  authDomain: "thelowe-down.firebaseapp.com",
  projectId: "thelowe-down",
  storageBucket: "thelowe-down.firebasestorage.app",
  messagingSenderId: "679113035762",
  appId: "1:679113035762:web:0b5fd9e3bebdfee05f656b",
};

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
