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

export const signUpWithEmailPassword = async (email, password, name = '') => {
  if (!auth) {
    return { user: null, error: "Firebase configuration missing" };
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: {
        id: result.user.uid,
        name: name || email.split('@')[0],
        email: result.user.email,
        avatar: null,
        provider: 'Email'
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

// Image compression helper to keep Firestore document size well under 1MB limit
export const compressBase64Image = (dataUrl, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }
    if (dataUrl.startsWith('data:image/svg+xml')) {
      return resolve(dataUrl);
    }
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        let width = img.width || 800;
        let height = img.height || 600;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
};

const compressEntriesForCloud = async (entries) => {
  if (!Array.isArray(entries)) return [];
  return Promise.all(
    entries.map(async (entry) => {
      const e = { ...entry };
      if (Array.isArray(e.images)) {
        e.images = await Promise.all(
          e.images.map(async (img) => ({
            ...img,
            url: await compressBase64Image(img.url)
          }))
        );
      }
      if (Array.isArray(e.trades)) {
        e.trades = await Promise.all(
          e.trades.map(async (t) => ({
            ...t,
            imageUrl: t.imageUrl ? await compressBase64Image(t.imageUrl) : t.imageUrl
          }))
        );
      }
      return e;
    })
  );
};

// Firestore Sync Helpers
export const syncJournalToCloud = async (userId, entries, lessons) => {
  if (!db || !userId) return false;
  try {
    const compressedEntries = await compressEntriesForCloud(entries || []);
    const rawEntries = JSON.parse(JSON.stringify(compressedEntries));
    const rawLessons = JSON.parse(JSON.stringify(lessons || []));

    // Target current auth UID and email to strictly match Firestore Security Rules
    const targetIds = Array.from(new Set([
      auth?.currentUser?.uid,
      auth?.currentUser?.email
    ])).filter(Boolean);

    if (targetIds.length === 0) {
      targetIds.push(userId);
    }

    let success = false;
    for (const targetId of targetIds) {
      try {
        const userDocRef = doc(db, "journals", targetId);
        await setDoc(userDocRef, {
          entriesJson: JSON.stringify(rawEntries),
          lessonsJson: JSON.stringify(rawLessons),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        success = true;
      } catch (e) {
        console.warn(`Firestore sync note for target ${targetId}:`, e);
      }
    }
    return success;
  } catch (err) {
    console.warn("Cloud Firestore Sync Warning:", err);
    return false;
  }
};

export const fetchJournalFromCloud = async (userId) => {
  if (!db || !userId) return null;
  const targetIds = Array.from(new Set([
    auth?.currentUser?.uid,
    auth?.currentUser?.email
  ])).filter(Boolean);

  if (targetIds.length === 0) {
    targetIds.push(userId);
  }

  for (const targetId of targetIds) {
    try {
      const userDocRef = doc(db, "journals", targetId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let fetchedEntries = null;
        let fetchedLessons = null;

        if (data.entriesJson) {
          try {
            fetchedEntries = JSON.parse(data.entriesJson);
          } catch (e) {
            console.warn("Error parsing entriesJson:", e);
          }
        }
        if (!fetchedEntries && Array.isArray(data.entries)) {
          fetchedEntries = data.entries;
        }

        if (data.lessonsJson) {
          try {
            fetchedLessons = JSON.parse(data.lessonsJson);
          } catch (e) {
            console.warn("Error parsing lessonsJson:", e);
          }
        }
        if (!fetchedLessons && Array.isArray(data.lessons)) {
          fetchedLessons = data.lessons;
        }

        return {
          entries: fetchedEntries || [],
          lessons: fetchedLessons || []
        };
      }
    } catch (err) {
      console.warn(`Cloud Firestore Fetch Note for target ${targetId}:`, err);
    }
  }
  return null;
};
