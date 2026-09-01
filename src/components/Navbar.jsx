import React, { useState, useRef, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  BookOpen, 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Image as ImageIcon, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  Lock,
  LogOut,
  User,
  ShieldCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const Navbar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    totalPnL, 
    winRate, 
    planAdherenceRate, 
    totalTrades,
    exportJournalJSON,
    importJournalJSON,
    resetToSampleData,
    clearAllEntries,
    user,
    logout
  } = useJournal();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header 
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('feed')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl">
                📈
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">Trade<span className="text-emerald-400">Log</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Trading Mindset & Journal
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'feed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'new'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Entry</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'gallery'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Media</span>
            </button>
          </nav>

          {/* Right Header Stats & Profile Action */}
          <div className="flex items-center space-x-3">
            
            {/* Net P/L Pill */}
            <div className="hidden xl:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Net P/L:</span>
              <span className={`font-bold flex items-center ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPnL >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {formatCurrency(totalPnL)}
              </span>
            </div>

            {/* Quick Data Actions */}
            <div className="flex items-center space-x-1">
              <button
                onClick={exportJournalJSON}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Export Backup JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <label 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Import Backup JSON"
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importJournalJSON} 
                  className="hidden" 
                />
              </label>

              <button
                onClick={resetToSampleData}
                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors"
                title="Reset Sample Demo Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* User Auth Profile Badge */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
                  {user?.name || 'Trader'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Trader Pro'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Logged in'}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">
                      {user?.provider || 'Protected'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowClearConfirm(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors mb-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Entries (Fresh Start)</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Lock Journal / Logout</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Clear All Entries Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear All Entries?</h3>
                <p className="text-xs text-slate-400">Fresh Start Confirmation</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all journal entries? This action will remove all recorded trades, reflections, and metrics from your browser storage. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllEntries();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Entries</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
