import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - use environment variables in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA1m3GkHXp3DOirBgZuvIoEV2QkLuSsw_E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'panchakarma-workload.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'panchakarma-workload',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'panchakarma-workload.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '374465789655',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:374465789655:web:0c8627195040917274fa92'
};

// Ensure we don't re-initialize in HMR / multiple imports
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
