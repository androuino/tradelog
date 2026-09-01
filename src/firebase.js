import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let auth = null;
let db = null;
let googleProvider = null;
let appleProvider = null;

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

if (isFirebaseConfigured()) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    appleProvider = new OAuthProvider('apple.com');
  } catch (err) {
    console.warn("Firebase Init Error:", err);
  }
}

export { auth, db };

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return { user: null, error: "Firebase configuration missing" };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: {
        id: result.user.uid,
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
    return { user: null, error: "Firebase configuration missing" };
  }
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return {
      user: {
        id: result.user.uid,
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

// Firestore Sync Helpers
export const syncJournalToCloud = async (userId, entries, lessons) => {
  if (!db || !userId) return false;
  try {
    const userDocRef = doc(db, "journals", userId);
    await setDoc(userDocRef, {
      entries: entries || [],
      lessons: lessons || [],
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Cloud Firestore Sync Warning:", err);
    return false;
  }
};

export const fetchJournalFromCloud = async (userId) => {
  if (!db || !userId) return null;
  try {
    const userDocRef = doc(db, "journals", userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        entries: Array.isArray(data.entries) ? data.entries : null,
        lessons: Array.isArray(data.lessons) ? data.lessons : null
      };
    }
    return null;
  } catch (err) {
    console.warn("Cloud Firestore Fetch Warning:", err);
    return null;
  }
};
