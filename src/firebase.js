import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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

// Secure Google Sign In (Popup with mobile Redirect fallback)
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
    // Fallback to redirect if popup is blocked on mobile browsers
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, error: null, isRedirecting: true };
      } catch (redirectErr) {
        return { user: null, error: redirectErr.message };
      }
    }
    return { user: null, error: error.message };
  }
};

// Check for redirect result on page reload (Mobile OAuth return)
export const checkRedirectResult = async () => {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return {
        id: result.user.uid,
        name: result.user.displayName || 'Trader',
        email: result.user.email,
        avatar: result.user.photoURL,
        provider: 'Google'
      };
    }
    return null;
  } catch (err) {
    console.warn("Redirect result error:", err);
    return null;
  }
};

// Secure Email & Password Authentication
export const signInWithEmailPassword = async (email, password) => {
  if (!auth) {
    return { user: null, error: "Firebase configuration missing" };
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: {
        id: result.user.uid,
        name: result.user.displayName || email.split('@')[0],
        email: result.user.email,
        avatar: null,
        provider: 'Email'
      },
      error: null
    };
  } catch (error) {
    // If account doesn't exist yet, automatically create account with password
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const createResult = await createUserWithEmailAndPassword(auth, email, password);
        return {
          user: {
            id: createResult.user.uid,
            name: email.split('@')[0],
            email: createResult.user.email,
            avatar: null,
            provider: 'Email'
          },
          error: null
        };
      } catch (createErr) {
        return { user: null, error: createErr.message };
      }
    }
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
