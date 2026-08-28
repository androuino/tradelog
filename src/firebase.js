import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";

// Your web app's Firebase configuration
// Get these from Google Firebase Console (https://console.firebase.google.com)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForTradeLogJournalApp",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tradelog-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tradelog-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tradelog-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Helper to trigger real Google popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: {
        name: result.user.displayName || 'Google Trader',
        email: result.user.email,
        avatar: result.user.photoURL,
        provider: 'Google'
      },
      error: null
    };
  } catch (error) {
    console.warn("Firebase Auth Google Warning/Demo Fallback:", error.message);
    return { user: null, error: error.message };
  }
};

// Helper to trigger real Apple popup
export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return {
      user: {
        name: result.user.displayName || 'Apple Trader',
        email: result.user.email,
        avatar: result.user.photoURL,
        provider: 'Apple'
      },
      error: null
    };
  } catch (error) {
    console.warn("Firebase Auth Apple Warning/Demo Fallback:", error.message);
    return { user: null, error: error.message };
  }
};
