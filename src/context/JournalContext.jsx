import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadEntriesFromStorage, saveEntriesToStorage } from '../utils/storage';
import { sampleEntries } from '../utils/sampleData';
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

  // Auto save to localStorage & Cloud Sync (Firebase Firestore)
  useEffect(() => {
    saveEntriesToStorage(entries);
    if (user && (user.id || user.email)) {
      const syncId = user.id || user.email.replace(/[^a-zA-Z0-9]/g, '_');
      syncJournalToCloud(syncId, entries);
    }
  }, [entries, user]);

  // Load Cloud Data on login
  useEffect(() => {
    if (user && (user.id || user.email)) {
      const syncId = user.id || user.email.replace(/[^a-zA-Z0-9]/g, '_');
      fetchJournalFromCloud(syncId).then(cloudEntries => {
        if (cloudEntries && Array.isArray(cloudEntries)) {
          setEntries(cloudEntries);
          saveEntriesToStorage(cloudEntries);
        }
      });
    }
  }, [user]);

  // Auth helper actions
  const loginWithOAuth = (provider, email, name, avatar) => {
    const userData = {
      name: name || 'Trader Pro',
      email: email || `trader@${provider.toLowerCase()}.com`,
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
    const userData = {
      name: email.split('@')[0],
      email,
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

  const resetToSampleData = () => {
    setEntries(sampleEntries);
    saveEntriesToStorage(sampleEntries);
  };

  const clearAllEntries = () => {
    setEntries([]);
    saveEntriesToStorage([]);
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
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
