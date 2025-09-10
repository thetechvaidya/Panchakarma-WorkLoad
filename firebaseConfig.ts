import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration
// Uses VITE_ environment variables for Vercel deployment.
// Hardcoded fallbacks for sensitive keys have been removed to prevent security risks.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // The storage bucket URL has been corrected. A fallback is used to ensure the correct
  // URL is used if the environment variable is not set.
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "panchakarma-workload.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initializes Firebase synchronously.
 * This function should be called before any Firebase services are used.
 * It ensures that the app is initialized and prevents race conditions.
 *
 * @returns An object containing the initialized `app` and `db` instances.
 *          Returns { app: null, db: null } if initialization fails.
 */
export const initFirebase = () => {
  if (!app) {
    // Check for essential Firebase config variables.
    // The app cannot function correctly without these.
    if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
      console.error(
        "❌ Critical Firebase environment variables are missing (VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_API_KEY)." +
        "Firebase cannot be initialized. Please set these in your Vercel project settings."
      );
      return { app: null, db: null };
    }

    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("✅ Firebase initialized successfully.");
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      return { app: null, db: null };
    }
  }

  return { app, db };
};