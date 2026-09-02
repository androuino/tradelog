import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadEntriesFromStorage, saveEntriesToStorage, loadLessonsFromStorage, saveLessonsToStorage } from '../utils/storage';
import { sampleEntries, sampleLessons } from '../utils/sampleData';
import { syncJournalToCloud, fetchJournalFromCloud } from '../firebase';

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
    return sampleLessons;
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

  const getSyncId = (u) => {
    if (!u) return null;
    const key = u.email || u.id || 'default_user';
    return key.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
  };

  // Auto save to localStorage & Cloud Sync (Firebase Firestore)
  useEffect(() => {
    saveEntriesToStorage(entries);
    saveLessonsToStorage(lessons);

    // CRITICAL FIX: Only push local state TO cloud after initial cloud fetch completes for the user.
    // This prevents empty PWA / newly installed app local state from wiping existing Cloud data.
    if (user && isCloudLoaded) {
      const syncId = getSyncId(user);
      if (syncId) {
        syncJournalToCloud(syncId, entries, lessons);
      }
    }
  }, [entries, lessons, user, isCloudLoaded]);

  // Load Cloud Data on login / app launch & merge safely with local entries & lessons
  const refreshCloudData = async () => {
    if (!user) return { count: 0, userEmail: null, message: "User not logged in" };
    const primarySyncId = getSyncId(user);
    const legacySyncId = user.id && user.id !== primarySyncId ? user.id : null;

    if (!primarySyncId) return { count: 0, userEmail: user?.email, message: "Invalid sync ID" };

    try {
      // Fetch primary email-based cloud doc
      let cloudData = await fetchJournalFromCloud(primarySyncId);

      // If legacy ID exists (e.g. from previous Google Auth UID sync), fetch legacy data too & merge
      if (legacySyncId) {
        const legacyData = await fetchJournalFromCloud(legacySyncId);
        if (legacyData) {
          cloudData = {
            entries: [...(cloudData?.entries || []), ...(legacyData.entries || [])],
            lessons: [...(cloudData?.lessons || []), ...(legacyData.lessons || [])]
          };
        }
      }

      let entriesCount = 0;
      let lessonsCount = 0;

      if (cloudData) {
        if (cloudData.entries && Array.isArray(cloudData.entries) && cloudData.entries.length > 0) {
          entriesCount = cloudData.entries.length;
          setEntries(prev => {
            const map = new Map();
            // Cloud entries take precedence for initial sync
            cloudData.entries.forEach(item => map.set(item.id, item));
            (prev || []).forEach(item => {
              if (!map.has(item.id)) {
                map.set(item.id, item);
              }
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
              if (!map.has(item.id)) {
                map.set(item.id, item);
              }
            });
            const mergedLessons = Array.from(map.values());
            saveLessonsToStorage(mergedLessons);
            return mergedLessons;
          });
        }
      }
      return { 
        count: entriesCount, 
        lessonsCount, 
        userEmail: user.email,
        message: `Synced ${entriesCount} trade logs & ${lessonsCount} lessons for ${user.email}`
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
    const ok = await syncJournalToCloud(syncId, entries, lessons);
    return { 
      success: ok, 
      message: ok ? `Pushed ${entries.length} entries & ${lessons.length} lessons to cloud for ${user.email}!` : "Cloud upload failed." 
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

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tradelog_auth');
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
    setEntries(sampleEntries);
    saveEntriesToStorage(sampleEntries);
    setLessons(sampleLessons);
    saveLessonsToStorage(sampleLessons);
  };

  const clearAllEntries = () => {
    setEntries([]);
    saveEntriesToStorage([]);
    setLessons([]);
    saveLessonsToStorage([]);
    setSelectedEntry(null);
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
      loginWithOAuth,
      loginWithEmail,
      setupPasscode,
      continueAsGuest,
      logout,
      refreshCloudData,
      isCloudLoaded,

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
