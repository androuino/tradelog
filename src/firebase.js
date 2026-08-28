import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let auth = null;
let googleProvider = null;
let appleProvider = null;

if (firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    appleProvider = new OAuthProvider('apple.com');
  } catch (err) {
    console.warn("Firebase Init Error:", err);
  }
}

export { auth };

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return { user: null, error: "Firebase credentials not yet provided in .env" };
  }
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
    return { user: null, error: error.message };
  }
};

export const signInWithApple = async () => {
  if (!auth || !appleProvider) {
    return { user: null, error: "Firebase credentials not yet provided in .env" };
  }
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
    return { user: null, error: error.message };
  }
};
