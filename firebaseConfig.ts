import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: These values need to be set as Environment Variables in your hosting provider.
// They are found in your Firebase project's settings.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// A check to ensure the user has configured their environment variables.
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase only if the configuration is provided.
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Cloud Firestore. This will be null if the app is not configured.
export const db = app ? getFirestore(app) : null;