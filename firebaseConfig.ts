// FIX: Use namespace import to resolve an issue where 'initializeApp' is not found as a named export.
import * as firebaseApp from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// The Firebase configuration is now hardcoded into the application.
const firebaseConfig = {
  apiKey: "AIzaSyA1m3GkHXp3DOirBgZuvIoEV2QkLuSsw_E",
  authDomain: "panchakarma-workload.firebaseapp.com",
  projectId: "panchakarma-workload",
  storageBucket: "panchakarma-workload.appspot.com",
  messagingSenderId: "374465789655",
  appId: "1:374465789655:web:0c8627195040917274fa92"
};

// A check to ensure the configuration is valid.
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase only if the configuration is provided.
const app = isFirebaseConfigured ? firebaseApp.initializeApp(firebaseConfig) : null;

// Initialize Cloud Firestore. This will be null if the app is not configured.
export const db = app ? getFirestore(app) : null;
