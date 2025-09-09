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

// Initialize Firebase with non-blocking approach
let app;
let db;
let isInitialized = false;
let isConnected = false;

const initializeFirebase = async () => {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isInitialized = true;
    console.log("✅ Firebase initialized successfully");
    
    // Test connection asynchronously without blocking
    try {
      const { enableNetwork } = await import('firebase/firestore');
      await Promise.race([
        enableNetwork(db),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      isConnected = true;
      console.log("✅ Firebase Firestore connected successfully");
    } catch (error) {
      console.warn("⚠️ Firebase connection timeout or error:", error);
      isConnected = false;
    }
    
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    console.log("📊 Running in offline mode - data will not persist");
    isInitialized = false;
    isConnected = false;
  }
};

// Initialize Firebase asynchronously without blocking the UI
initializeFirebase();

// Export connection status functions
export const isFirebaseInitialized = () => isInitialized;
export const isFirebaseConnected = () => isConnected;

// Export Firebase instances
export { db, app };

// Real-time connection status with timeout
export const checkFirebaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  if (!db) {
    return { connected: false, error: "Firebase not initialized" };
  }
  
  try {
    const { enableNetwork, collection, getDocs, limit, query } = await import('firebase/firestore');
    
    // Quick connection test with timeout
    await Promise.race([
      getDocs(query(collection(db, 'connection_test'), limit(1))),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
    ]);
    
    isConnected = true;
    return { connected: true };
  } catch (error) {
    isConnected = false;
    return { connected: false, error: error.message };
  }
};

// Force offline mode for testing
export const forceOfflineMode = () => {
  isConnected = false;
  console.log("🔄 Forced offline mode enabled");
};