// FIX: Manually declare types for `import.meta.env` to resolve TypeScript errors
// when the 'vite/client' type definitions are not available. This fixes both
// the "Cannot find type definition file" and "property 'env' does not exist" errors.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_FIREBASE_API_KEY?: string;
      readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
      readonly VITE_FIREBASE_PROJECT_ID?: string;
      readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
      readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
      readonly VITE_FIREBASE_APP_ID?: string;
    };
  }
}

// FIX: Use namespace import to resolve an issue where 'initializeApp' is not found as a named export.
import * as firebaseApp from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Gracefully handle cases where import.meta.env is not defined by providing an empty object as a fallback.
// This prevents runtime errors in environments that don't support `import.meta.env`.
const env = import.meta.env || {};

// Firebase configuration is read from environment variables for security and deployment flexibility.
// These variables must be prefixed with VITE_ (e.g., in Vercel).
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// A check to ensure the configuration is valid.
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase only if the configuration is provided.
const app = isFirebaseConfigured ? firebaseApp.initializeApp(firebaseConfig) : null;

// Initialize Cloud Firestore. This will be null if the app is not configured.
export const db = app ? getFirestore(app) : null;