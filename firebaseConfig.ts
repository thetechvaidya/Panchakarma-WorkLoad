import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Connection status tracking
  console.log("✅ Firebase initialized successfully");
  
  // Test connection
  (async () => {
    try {
      // Simple connection test
      await import('firebase/firestore').then(({ enableNetwork }) => enableNetwork(db));
      console.log("✅ Firebase Firestore connected successfully");
    } catch (error) {
      console.warn("⚠️ Firebase Firestore connection issue:", error);
    }
  })();
  
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.log("📊 Running in offline mode - data will not persist");
}

// Export connection status
export const isFirebaseConnected = () => {
  return !!db;
};

// Export Firebase instances
export { db, app };

// Export test function for debugging
export const testFirebaseConnection = async () => {
  if (!db) {
    return { success: false, error: "Firebase not initialized" };
  }
  
  try {
    const { enableNetwork } = await import('firebase/firestore');
    await enableNetwork(db);
    return { success: true, message: "Firebase connected successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};