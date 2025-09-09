import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - works automatically with Vercel environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA1m3GkHXp3DOirBgZuvIoEV2QkLuSsw_E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "panchakarma-workload.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "panchakarma-workload",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "panchakarma-workload.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "374465789655",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:374465789655:web:0c8627195040917274fa92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);