import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: 'AIzaSyA1m3GkHXp3DOirBgZuvIoEV2QkLuSsw_E',
  authDomain: 'panchakarma-workload.firebaseapp.com',
  projectId: 'panchakarma-workload',
  storageBucket: 'panchakarma-workload.firebasestorage.app',
  messagingSenderId: '374465789655',
  appId: '1:374465789655:web:0c8627195040917274fa92'
};

// Ensure we don't re-initialize in HMR / multiple imports
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
