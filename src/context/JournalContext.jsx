import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadEntriesFromStorage, saveEntriesToStorage, loadLessonsFromStorage, saveLessonsToStorage } from '../utils/storage';
import { syncJournalToCloud, fetchJournalFromCloud, getFirebaseAuthUser, subscribeToAuthState, firebaseSignOut, checkRedirectResult, isFirebaseConfigured } from '../firebase';

const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('tradelog_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tradelog_auth') === 'true';
  });

  const [entries, setEntries] = useState(() => {
    const saved = loadEntriesFromStorage();
    if (saved && Array.isArray(saved)) {
      return saved;
    }
    return [];
  });

  const [lessons, setLessons] = useState(() => {
    const saved = loadLessonsFromStorage();
    if (saved && Array.isArray(saved)) {
      return saved;
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'new' | 'calendar' | 'analytics' | 'gallery'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);
  const [initialDateForNewEntry, setInitialDateForNewEntry] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState('all'); // 'all' | 'win' | 'loss'
  const [filterPlan, setFilterPlan] = useState('all'); // 'all' | 'yes' | 'partial' | 'no'
  const [filterMood, setFilterMood] = useState('all');

  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  // isAuthReady gates the spinner in App.jsx while Firebase processes an OAuth redirect.
  // Start as true if the user is already known (localStorage auth) — they don't need Firebase to resolve.
  // Start as false only when no local auth exists, meaning we might be in the middle of a Google redirect.
  const [isAuthReady, setIsAuthReady] = useState(() => {
    return localStorage.getItem('tradelog_auth') === 'true';
  });

  const getSyncId = (u) => {
    if (!u) return null;
    // Also check live Firebase Auth user to catch cases where localStorage is stale
    const firebaseUser = getFirebaseAuthUser();
    const key = firebaseUser?.email || u.email || firebaseUser?.uid || u.id || 'default_user';
    return key.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
  };

  // Cloud sync status for UI indicator: 'idle' | 'saving' | 'saved' | 'error'
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle');
  const [cloudSyncMessage, setCloudSyncMessage] = useState('');

  // Auto save to localStorage & Cloud Sync (Firebase Firestore with 800ms Debounce)
  useEffect(() => {
    saveEntriesToStorage(entries);
    saveLessonsToStorage(lessons);

    // Only push local state TO cloud after initial cloud fetch completes for the user.
    if (!user || !isCloudLoaded) return;

    const syncId = getSyncId(user);
    if (!syncId) return;

    const timer = setTimeout(() => {
      setCloudSyncStatus('saving');
      syncJournalToCloud(syncId, entries, lessons).then(res => {
        if (res?.success) {
          const fbUser = getFirebaseAuthUser();
          const email = fbUser?.email || user.email;
          setCloudSyncStatus('saved');
          setCloudSyncMessage(`Saved • ${email} • doc: ${syncId}`);
          setTimeout(() => setCloudSyncStatus('idle'), 6000);
        } else {
          setCloudSyncStatus('error');
          setCloudSyncMessage(res?.message || 'Cloud save failed');
        }
      }).catch(() => {
        setCloudSyncStatus('error');
        setCloudSyncMessage('Cloud save failed — check connection');
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [entries, lessons, user, isCloudLoaded]);

  // Load Cloud Data on login / app launch & merge safely with local entries & lessons
  const refreshCloudData = async () => {
    if (!user) return { count: 0, userEmail: null, message: "User not logged in" };

    // Derive the best sync ID using live Firebase Auth + stored user
    const firebaseUser = getFirebaseAuthUser();
    const primaryEmail = firebaseUser?.email || user.email;
    const primaryId = firebaseUser?.uid || user.id;

    const primarySyncId = getSyncId(user);

    // Build all candidate Firestore doc IDs to search across
    const candidateIds = Array.from(new Set([
      primarySyncId,
      primaryEmail ? primaryEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_') : null,
      primaryEmail,
      primaryId,
      firebaseUser?.uid,
      user.id
    ])).filter(Boolean);

    if (!primarySyncId) return { count: 0, userEmail: user?.email, message: "Invalid sync ID" };

    try {
      // Fetch using primary sync ID — fetchJournalFromCloud searches all candidates internally
      let cloudData = await fetchJournalFromCloud(primarySyncId);

      let entriesCount = 0;
      let lessonsCount = 0;

      if (cloudData && cloudData.error === 'permission-denied') {
        return {
          count: 0,
          lessonsCount: 0,
          userEmail: user.email,
          message: `⚠️ Firebase Permission Denied: Update Firestore Security Rules in Firebase Console.`
        };
      }

      if (cloudData) {
        if (cloudData.entries && Array.isArray(cloudData.entries) && cloudData.entries.length > 0) {
          entriesCount = cloudData.entries.length;
          setEntries(prev => {
            const map = new Map();
            cloudData.entries.forEach(item => map.set(item.id, item));
            (prev || []).forEach(item => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            const merged = Array.from(map.values());
            saveEntriesToStorage(merged);
            return merged;
          });
        }
        if (cloudData.lessons && Array.isArray(cloudData.lessons) && cloudData.lessons.length > 0) {
          lessonsCount = cloudData.lessons.length;
          setLessons(prev => {
            const map = new Map();
            cloudData.lessons.forEach(item => map.set(item.id, item));
            (prev || []).forEach(item => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            const mergedLessons = Array.from(map.values());
            saveLessonsToStorage(mergedLessons);
            return mergedLessons;
          });
        }
      }

      const displayEmail = primaryEmail || user.email;
      const docKeyHint = primarySyncId;
      let messageHint;

      if (entriesCount > 0) {
        messageHint = `✅ Pulled ${entriesCount} trades & ${lessonsCount} lessons (doc: ${docKeyHint})`;
      } else if (user.email === 'local@tradelog.app') {
        messageHint = `PIN mode — sign in with Email/Google to sync across devices.`;
      } else if (user.email === 'offline@tradelog.app') {
        messageHint = `Guest mode — sign in with Email/Google to pull cloud entries.`;
      } else {
        messageHint = `0 entries found for doc "${docKeyHint}". Push from iPhone first, using the same account (${displayEmail}).`;
      }

      return { 
        count: entriesCount, 
        lessonsCount, 
        userEmail: displayEmail,
        message: messageHint
      };
    } catch (err) {
      console.warn("Error refreshing cloud data:", err);
      return { count: 0, userEmail: user?.email, message: err.message };
    } finally {
      setIsCloudLoaded(true);
    }
  };

  const forcePushToCloud = async () => {
    if (!user) return { success: false, message: "Please log in first" };
    const syncId = getSyncId(user);
    if (!syncId) return { success: false, message: "No sync ID found" };
    const firebaseUser = getFirebaseAuthUser();
    const displayEmail = firebaseUser?.email || user.email;
    const res = await syncJournalToCloud(syncId, entries, lessons);
    if (res?.error === 'permission-denied') {
      return { success: false, message: "⚠️ Firebase Upload Denied: Missing or insufficient permissions in Firestore Security Rules." };
    }
    return { 
      success: res?.success, 
      message: res?.success 
        ? `☁️ Pushed ${entries.length} trades & ${lessons.length} lessons (doc: ${syncId}, account: ${displayEmail})` 
        : (res?.message || "Cloud upload failed.") 
    };
  };

  useEffect(() => {
    if (user && (user.id || user.email)) {
      setIsCloudLoaded(false);
      refreshCloudData();
    } else {
      setIsCloudLoaded(true);
    }
  }, [user]);

  // ─── Firebase Auth Initialization ────────────────────────────────────────────
  // We MUST sequence these two steps or we get a race condition:
  //   Step 1) Await getRedirectResult() — Firebase finishes processing the OAuth
  //           redirect before we read any auth state. Without this, onAuthStateChanged
  //           fires with null first, shows LoginScreen, then fires again with the user.
  //   Step 2) Subscribe to onAuthStateChanged — now the first callback always has
  //           the correct stable state (user or truly logged-out null).
  useEffect(() => {
    let unsubscribe = () => {};

    const initAuth = async () => {
      // Step 1: Let Firebase process any pending OAuth redirect.
      if (isFirebaseConfigured()) {
        const redirectUser = await checkRedirectResult().catch(() => null);
        if (redirectUser) {
          const userData = {
            id: redirectUser.id,
            name: redirectUser.name,
            email: (redirectUser.email || '').toLowerCase().trim(),
            provider: redirectUser.provider,
            avatar: redirectUser.avatar || null
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('tradelog_user', JSON.stringify(userData));
          localStorage.setItem('tradelog_auth', 'true');
        }
      } else {
        setIsAuthReady(true);
      }

      // Step 2: Subscribe to ongoing auth state.
      unsubscribe = subscribeToAuthState((firebaseUser) => {
        setIsAuthReady(true);

        if (firebaseUser) {
          const cleanEmail = (firebaseUser.email || '').toLowerCase().trim();
          const provider = firebaseUser.providerData?.[0]?.providerId === 'apple.com' ? 'Apple' : 'Google';
          const userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Trader',
            email: cleanEmail,
            provider,
            avatar: firebaseUser.photoURL || null
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('tradelog_user', JSON.stringify(userData));
          localStorage.setItem('tradelog_auth', 'true');
        }
      });
    };

    initAuth();
    return () => unsubscribe();
  }, []);

  // Auth helper actions
  const loginWithOAuth = (provider, email, name, avatar, userId = null) => {
    const cleanEmail = (email || `trader@${provider.toLowerCase()}.com`).toLowerCase().trim();
    const userData = {
      id: userId || null,
      name: name || 'Trader Pro',
      email: cleanEmail,
      provider,
      avatar: avatar || (provider === 'Google' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80')
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('tradelog_user', JSON.stringify(userData));
    localStorage.setItem('tradelog_auth', 'true');
  };

  const loginWithEmail = (email) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const userData = {
      id: null,
      name: cleanEmail.split('@')[0] || 'Trader',
      email: cleanEmail,
      provider: 'Email',
      avatar: null
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('tradelog_user', JSON.stringify(userData));
    localStorage.setItem('tradelog_auth', 'true');
  };

  const setupPasscode = (code) => {
    const userData = {
      name: 'PIN Trader',
      email: 'local@tradelog.app',
      provider: 'Passcode PIN',
      avatar: null
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('tradelog_user', JSON.stringify(userData));
    localStorage.setItem('tradelog_auth', 'true');
  };

  const continueAsGuest = () => {
    const userData = {
      name: 'Guest Trader',
      email: 'offline@tradelog.app',
      provider: 'Local Storage',
      avatar: null
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('tradelog_user', JSON.stringify(userData));
    localStorage.setItem('tradelog_auth', 'true');
  };

  const logout = async () => {
    // Sign out from Firebase Auth first — this is CRITICAL for Google/Apple users.
    // Without this, onAuthStateChanged re-fires with the Firebase user and
    // automatically re-authenticates them, making logout impossible.
    await firebaseSignOut();
    setUser(null);
    setIsAuthenticated(false);
    setIsCloudLoaded(false);
    localStorage.removeItem('tradelog_auth');
    localStorage.removeItem('tradelog_user');
  };

  const addEntry = (newEntryData) => {
    const trades = newEntryData.trades && newEntryData.trades.length > 0 ? newEntryData.trades : [
      {
        id: 'tr-' + Date.now(),
        asset: newEntryData.asset || 'EUR/USD',
        direction: newEntryData.direction || 'LONG',
        pnl: parseFloat(newEntryData.pnl) || 0,
        pnlPercentage: parseFloat(newEntryData.pnlPercentage) || 0,
        strategy: newEntryData.strategy || '',
        notes: ''
      }
    ];

    const calculatedPnl = trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
    const calculatedPnlPct = trades.reduce((acc, t) => acc + (parseFloat(t.pnlPercentage) || 0), 0);
    const winsCount = trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;
    const lossesCount = trades.filter(t => (parseFloat(t.pnl) || 0) < 0).length;

    const tradeImages = trades.map(t => t.imageUrl ? { id: 'img-' + t.id, url: t.imageUrl, caption: t.imageCaption || `${t.asset} Setup` } : null).filter(Boolean);
    const combinedImages = [...(newEntryData.images || []), ...tradeImages];

    const newEntry = {
      id: 'entry-' + Date.now(),
      date: newEntryData.date || new Date().toISOString().split('T')[0],
      session: newEntryData.session || 'London',
      pnl: calculatedPnl,
      pnlPercentage: calculatedPnlPct,
      result: calculatedPnl >= 0 ? (calculatedPnl === 0 ? 'breakeven' : 'win') : 'loss',
      tradesCount: trades.length,
      winsCount,
      lossesCount,
      trades,
      
      planFollowed: newEntryData.planFollowed || 'yes',
      planRulesChecklist: newEntryData.planRulesChecklist || [],
      mood: newEntryData.mood || 'disciplined',
      mindsetScore: parseInt(newEntryData.mindsetScore) || 5,
      emotionReflection: newEntryData.emotionReflection || '',
      
      bestExecution: newEntryData.bestExecution || '',
      mistakes: newEntryData.mistakes || '',
      keyLesson: newEntryData.keyLesson || '',
      disciplineScore: parseInt(newEntryData.disciplineScore) || 5,
      
      images: combinedImages
    };

    setEntries(prev => [newEntry, ...prev]);
    setActiveTab('feed');
    setEditingEntry(null);
    setInitialDateForNewEntry(null);
  };

  const updateEntry = (updatedEntryData) => {
    setEntries(prev => prev.map(item => {
      if (item.id === updatedEntryData.id) {
        const trades = updatedEntryData.trades && updatedEntryData.trades.length > 0 ? updatedEntryData.trades : (item.trades || []);
        
        const calculatedPnl = trades.length > 0
          ? trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0)
          : (parseFloat(updatedEntryData.pnl) || 0);

        const calculatedPnlPct = trades.length > 0
          ? trades.reduce((acc, t) => acc + (parseFloat(t.pnlPercentage) || 0), 0)
          : (parseFloat(updatedEntryData.pnlPercentage) || 0);

        const winsCount = trades.length > 0 ? trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length : (updatedEntryData.winsCount || 0);
        const lossesCount = trades.length > 0 ? trades.filter(t => (parseFloat(t.pnl) || 0) < 0).length : (updatedEntryData.lossesCount || 0);

        return {
          ...item,
          ...updatedEntryData,
          trades,
          pnl: calculatedPnl,
          pnlPercentage: calculatedPnlPct,
          result: calculatedPnl >= 0 ? (calculatedPnl === 0 ? 'breakeven' : 'win') : 'loss',
          tradesCount: trades.length,
          winsCount,
          lossesCount
        };
      }
      return item;
    }));

    setActiveTab('feed');
    setEditingEntry(null);
    if (selectedEntry?.id === updatedEntryData.id) {
      setSelectedEntry(updatedEntryData);
    }
  };

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(item => item.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  };

  const addLesson = (newLesson) => {
    const lesson = {
      ...newLesson,
      id: `lesson-${Date.now()}`,
      date: newLesson.date || new Date().toISOString().split('T')[0]
    };
    setLessons(prev => [lesson, ...prev]);
  };

  const updateLesson = (id, updatedData) => {
    setLessons(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
  };

  const deleteLesson = (id) => {
    setLessons(prev => prev.filter(item => item.id !== id));
  };

  const toggleFavoriteLesson = (id) => {
    setLessons(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  const resetToSampleData = () => {
    clearAllEntries();
  };

  const clearAllEntries = () => {
    setEntries([]);
    saveEntriesToStorage([]);
    setLessons([]);
    saveLessonsToStorage([]);
    setSelectedEntry(null);
    if (user && isCloudLoaded) {
      const syncId = getSyncId(user);
      if (syncId) {
        syncJournalToCloud(syncId, [], []);
      }
    }
  };

  const openNewEntryForDate = (dateStr) => {
    setInitialDateForNewEntry(dateStr);
    setEditingEntry(null);
    setActiveTab('new');
  };

  const startEditEntry = (entry) => {
    setEditingEntry(entry);
    setSelectedEntry(null);
    setActiveTab('new');
  };

  const exportJournalJSON = () => {
    const exportData = {
      version: 1,
      entries,
      lessons
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trading_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJournalJSON = (event) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed)) {
            setEntries(parsed);
            alert(`Successfully imported ${parsed.length} journal entries!`);
          } else if (parsed && typeof parsed === 'object') {
            let countEntries = 0;
            let countLessons = 0;
            if (Array.isArray(parsed.entries)) {
              setEntries(parsed.entries);
              countEntries = parsed.entries.length;
            }
            if (Array.isArray(parsed.lessons)) {
              setLessons(parsed.lessons);
              countLessons = parsed.lessons.length;
            }
            alert(`Successfully imported ${countEntries} journal entries & ${countLessons} life lessons!`);
          } else {
            alert('Invalid backup file format.');
          }
        } catch (err) {
          alert('Failed to parse backup JSON file.');
        }
      };
    }
  };

  // Filtered entries calculation
  const filteredEntries = entries.filter(entry => {
    const query = searchQuery.toLowerCase();
    const tradeAssets = entry.trades ? entry.trades.map(t => t.asset.toLowerCase()).join(' ') : (entry.asset || '').toLowerCase();

    const matchesSearch = !query || 
      tradeAssets.includes(query) ||
      (entry.session && entry.session.toLowerCase().includes(query)) ||
      (entry.emotionReflection && entry.emotionReflection.toLowerCase().includes(query)) ||
      (entry.keyLesson && entry.keyLesson.toLowerCase().includes(query)) ||
      (entry.bestExecution && entry.bestExecution.toLowerCase().includes(query));

    const matchesResult = filterResult === 'all' || entry.result === filterResult;
    const matchesPlan = filterPlan === 'all' || entry.planFollowed === filterPlan;
    const matchesMood = filterMood === 'all' || entry.mood === filterMood;

    return matchesSearch && matchesResult && matchesPlan && matchesMood;
  });

  const totalPnL = entries.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
  const totalTrades = entries.reduce((acc, curr) => acc + (curr.tradesCount || (curr.trades?.length || 1)), 0);
  const totalWins = entries.reduce((acc, curr) => acc + (curr.winsCount || 0), 0);
  const totalLosses = entries.reduce((acc, curr) => acc + (curr.lossesCount || 0), 0);
  const winRate = totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(1) : '0.0';
  const planAdherenceRate = entries.length > 0 
    ? ((entries.filter(e => e.planFollowed === 'yes').length / entries.length) * 100).toFixed(0) 
    : '0';

  return (
    <JournalContext.Provider value={{
      // Auth
      user,
      isAuthenticated,
      isAuthReady,
      loginWithOAuth,
      loginWithEmail,
      setupPasscode,
      continueAsGuest,
      logout,
      refreshCloudData,
      isCloudLoaded,
      cloudSyncStatus,
      cloudSyncMessage,

      // Journal data & actions
      entries,
      filteredEntries,
      activeTab,
      setActiveTab,
      selectedEntry,
      setSelectedEntry,
      editingEntry,
      setEditingEntry,
      startEditEntry,
      selectedLightboxImage,
      setSelectedLightboxImage,
      initialDateForNewEntry,
      openNewEntryForDate,
      addEntry,
      updateEntry,
      deleteEntry,
      resetToSampleData,
      clearAllEntries,
      exportJournalJSON,
      importJournalJSON,
      forcePushToCloud,
      
      // Life Lessons
      lessons,
      addLesson,
      updateLesson,
      deleteLesson,
      toggleFavoriteLesson,
      
      // Filters
      searchQuery,
      setSearchQuery,
      filterResult,
      setFilterResult,
      filterPlan,
      setFilterPlan,
      filterMood,
      setFilterMood,
      
      // Summary Stats
      totalPnL,
      totalTrades,
      winRate,
      planAdherenceRate,
      totalWins,
      totalLosses
    }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => useContext(JournalContext);
