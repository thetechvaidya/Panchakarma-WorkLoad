import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: These values need to be set as Environment Variables in your hosting provider.
// They are found in your Firebase project's settings.
// For client-side access (like in Vercel/Vite), they must be prefixed with VITE_
// FIX: Use `import.meta.env` to access environment variables in a Vite project.
// `process.env` is for Node.js environments and is not available in the browser
// by default in Vite, which can lead to build failures.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// A check to ensure the user has configured their environment variables.
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase only if the configuration is provided.
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Cloud Firestore. This will be null if the app is not configured.
export const db = app ? getFirestore(app) : null;