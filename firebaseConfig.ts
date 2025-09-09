
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration is hardcoded as requested for automatic setup.
const firebaseConfig = {
  apiKey: "AIzaSyA1m3GkHXp3DOirBgZuvIoEV2QkLuSsw_E",
  authDomain: "panchakarma-workload.firebaseapp.com",
  projectId: "panchakarma-workload",
  storageBucket: "panchakarma-workload.firebasestorage.app",
  messagingSenderId: "374465789655",
  appId: "1:374465789655:web:0c8627195040917274fa92"
};

// Initialize Firebase
// FIX: Updated Firebase initialization to use the modular v9 SDK. The `initializeApp` function is a named export, not a method on a namespace.
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);