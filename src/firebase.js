import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
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
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tradelog-5e83f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tradelog-5e83f.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let auth = null;
let db = null;
let storage = null;
let googleProvider = null;
let appleProvider = null;
// Firebase Storage configuration flag (defaults to false unless CORS is configured on GCP bucket)
let isStorageAvailable = import.meta.env.VITE_ENABLE_STORAGE === 'true';

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

if (isFirebaseConfigured()) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (isStorageAvailable) {
      storage = getStorage(app);
    }
    googleProvider = new GoogleAuthProvider();
    appleProvider = new OAuthProvider('apple.com');
  } catch (err) {
    console.warn("Firebase Init Error:", err);
  }
}

export { auth, db, storage };

// Upload Base64 image to Firebase Cloud Storage if enabled, or use compressed inline base64
export const uploadBase64ToStorage = async (base64Data, path = 'trade_images') => {
  if (!base64Data || typeof base64Data !== 'string') return base64Data;
  if (!base64Data.startsWith('data:image')) return base64Data; // Already URL or not an image

  if (!storage || !isStorageAvailable) {
    // High-efficiency lightweight inline compression (avoids CORS preflight calls)
    return await compressBase64Image(base64Data, 550, 0.45);
  }

  try {
    const compressed = await compressBase64Image(base64Data, 1000, 0.65);
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${path}/${timestamp}_${randomId}.jpg`;
    const imageRef = ref(storage, fileName);

    await uploadString(imageRef, compressed, 'data_url');
    const downloadUrl = await getDownloadURL(imageRef);
    return downloadUrl;
  } catch (err) {
    isStorageAvailable = false;
    return await compressBase64Image(base64Data, 550, 0.45);
  }
};

// Secure Google Sign In — tries popup first for immediate response, with redirect fallback
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return { user: null, error: "Firebase configuration missing" };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result && result.user) {
      return {
        user: {
          id: result.user.uid,
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Trader',
          email: result.user.email,
          avatar: result.user.photoURL,
          provider: 'Google'
        },
        error: null
      };
    }
    return { user: null, error: "Sign-in returned no user data" };
  } catch (error) {
    console.warn("Popup sign-in note, checking for redirect fallback:", error);
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.message?.includes('COOP')
    ) {
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

// Check for redirect result on page reload (called on every app load)
export const checkRedirectResult = async () => {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const provider = result.providerId === 'apple.com' ? 'Apple' : 'Google';
      return {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'Trader',
        email: result.user.email,
        avatar: result.user.photoURL,
        provider
      };
    }
    return null;
  } catch (err) {
    console.warn("Redirect result error:", err);
    return null;
  }
};

// Get the live Firebase Auth current user (for use in sync diagnostics)
export const getFirebaseAuthUser = () => {
  if (!auth) return null;
  return auth.currentUser || null;
};

// Subscribe to Firebase Auth state changes (called once at app root level)
// Returns unsubscribe function. Callback receives Firebase user or null.
export const subscribeToAuthState = (callback) => {
  if (!auth) {
    callback(null);
    return () => { };
  }
  return onAuthStateChanged(auth, callback);
};

// Sign out from Firebase Auth (required to prevent onAuthStateChanged re-logging the user in)
export const firebaseSignOut = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("Firebase sign-out error:", err);
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
    if (result && result.user) {
      return {
        user: {
          id: result.user.uid,
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Trader',
          email: result.user.email,
          avatar: result.user.photoURL,
          provider: 'Apple'
        },
        error: null
      };
    }
    return { user: null, error: "Sign-in returned no user data" };
  } catch (error) {
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.message?.includes('COOP')
    ) {
      try {
        await signInWithRedirect(auth, appleProvider);
        return { user: null, error: null, isRedirecting: true };
      } catch (redirectErr) {
        return { user: null, error: redirectErr.message };
      }
    }
    return { user: null, error: error.message };
  }
};

// Image compression helper to keep Firestore document size well under 1MB limit
export const compressBase64Image = (dataUrl, maxWidth = 550, quality = 0.45) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }
    if (dataUrl.startsWith('data:image/svg+xml')) {
      return resolve(dataUrl);
    }

    let isSettled = false;
    const timeout = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        resolve(dataUrl);
      }
    }, 3500);

    try {
      const img = new Image();
      if (!dataUrl.startsWith('data:')) {
        img.crossOrigin = 'Anonymous';
      }
      img.onload = () => {
        if (isSettled) return;
        clearTimeout(timeout);
        isSettled = true;
        try {
          let width = img.width || 550;
          let height = img.height || 400;
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
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        if (!isSettled) {
          clearTimeout(timeout);
          isSettled = true;
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    } catch (e) {
      if (!isSettled) {
        clearTimeout(timeout);
        isSettled = true;
        resolve(dataUrl);
      }
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
            url: await uploadBase64ToStorage(img.url, 'journal_images')
          }))
        );
      }
      if (Array.isArray(e.trades)) {
        e.trades = await Promise.all(
          e.trades.map(async (t) => ({
            ...t,
            imageUrl: t.imageUrl ? await uploadBase64ToStorage(t.imageUrl, 'trade_screenshots') : t.imageUrl
          }))
        );
      }
      return e;
    })
  );
};

// Safeguard function to ensure entriesJson payload stays safely under Firestore's 1,048,576 byte limit
const enforcePayloadSizeLimit = (entries, maxBytes = 900000) => {
  let entriesCopy = JSON.parse(JSON.stringify(entries));
  let jsonStr = JSON.stringify(entriesCopy);

  if (jsonStr.length <= maxBytes) return entriesCopy;

  // Trim images starting from oldest entries to keep overall document under 900KB
  for (let i = entriesCopy.length - 1; i >= 0; i--) {
    const entry = entriesCopy[i];
    let modified = false;

    if (Array.isArray(entry.images) && entry.images.length > 0) {
      entry.images = entry.images.map(img => ({
        ...img,
        url: '' // omit large base64 from cloud payload for older entries to keep document under limit
      }));
      modified = true;
    }

    if (Array.isArray(entry.trades)) {
      entry.trades.forEach(t => {
        if (t.imageUrl) {
          t.imageUrl = '';
          modified = true;
        }
      });
    }

    if (modified) {
      jsonStr = JSON.stringify(entriesCopy);
      if (jsonStr.length <= maxBytes) break;
    }
  }

  return entriesCopy;
};

// Firestore Sync Helpers
export const syncJournalToCloud = async (userId, entries, lessons) => {
  if (!db || !userId) return { success: false, error: "Firebase not initialized or missing user ID" };
  try {
    const compressedEntries = await compressEntriesForCloud(entries || []);
    const safeEntries = enforcePayloadSizeLimit(compressedEntries, 900000);
    const rawEntries = JSON.parse(JSON.stringify(safeEntries));
    const rawLessons = JSON.parse(JSON.stringify(lessons || []));

    const rawEmail = auth?.currentUser?.email || (userId.includes('@') ? userId : null);
    const primaryDocId = (userId.includes('@') || (rawEmail && !userId.includes('_')))
      ? (rawEmail || userId).toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_')
      : userId;

    const userDocRef = doc(db, "journals", primaryDocId);
    await setDoc(userDocRef, {
      entriesJson: JSON.stringify(rawEntries),
      lessonsJson: JSON.stringify(rawLessons),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true, updatedEntries: rawEntries, error: null };
  } catch (err) {
    console.warn("Cloud Firestore Sync Warning:", err);
    return { success: false, error: err.code || 'sync-failed', message: err.message };
  }
};

export const fetchJournalFromCloud = async (userId) => {
  if (!db || !userId) return null;

  const rawEmail = auth?.currentUser?.email || (userId.includes('@') ? userId : null);
  const normalizedEmail = rawEmail ? rawEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_') : null;
  const authUid = auth?.currentUser?.uid;

  const targetIds = Array.from(new Set([
    userId,
    normalizedEmail,
    rawEmail,
    authUid
  ])).filter(Boolean);

  let bestData = null;
  let maxCount = -1;
  let latestTime = '';
  let lastError = null;

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

        const entries = fetchedEntries || [];
        const lessons = fetchedLessons || [];
        const count = entries.length + lessons.length;
        const updatedAt = data.updatedAt || '';

        // Select document with maximum items or latest update
        if (count > maxCount || (count === maxCount && updatedAt > latestTime)) {
          maxCount = count;
          latestTime = updatedAt;
          bestData = { entries, lessons };
        }
      }
    } catch (err) {
      console.warn(`Cloud Firestore Fetch Note for target ${targetId}:`, err);
      lastError = err;
    }
  }

  if (!bestData && lastError) {
    if (lastError.code === 'permission-denied' || lastError.message?.includes('permissions')) {
      return { error: 'permission-denied', message: 'Missing or insufficient permissions in Firestore Security Rules.' };
    }
  }

  return bestData;
};
