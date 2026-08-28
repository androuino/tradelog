import React from 'react';
import { JournalProvider, useJournal } from './context/JournalContext';
import { Navbar } from './components/Navbar';
import { JournalCard } from './components/JournalCard';
import { JournalEntryForm } from './components/JournalEntryForm';
import { JournalDetailModal } from './components/JournalDetailModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { MediaGalleryView } from './components/MediaGalleryView';
import { LoginScreen } from './components/LoginScreen';
import { formatCurrency } from './utils/formatters';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  BookOpen, 
  Award, 
  Smile, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Image as ImageIcon 
} from 'lucide-react';

const MainContent = () => {
  const { 
    isAuthenticated,
    filteredEntries, 
    activeTab, 
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterResult,
    setFilterResult,
    filterPlan,
    setFilterPlan,
    filterMood,
    setFilterMood,
    totalPnL,
    totalTrades,
    winRate,
    planAdherenceRate,
    openNewEntryForDate
  } = useJournal();

  // If not authenticated, render LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        
        {/* Render Tab Views */}
        {activeTab === 'new' && <JournalEntryForm />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'gallery' && <MediaGalleryView />}

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            
            {/* Header Dashboard Metrics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Card 1: Total P/L */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Net P/L Total</span>
                  <div className={`p-1.5 rounded-lg ${totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                </div>
                <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(totalPnL)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                  {totalTrades} Total Trades Recorded
                </span>
              </div>

              {/* Card 2: Win Rate */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Win Rate</span>
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {winRate}%
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                  Win / Loss ratio
                </span>
              </div>

              {/* Card 3: Plan Discipline Rate */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Plan Compliance</span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 tracking-tight">
                  {planAdherenceRate}%
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                  Rules followed rate
                </span>
              </div>

              {/* Card 4: Action button to log trade */}
              <div 
                onClick={() => openNewEntryForDate(new Date().toISOString().split('T')[0])}
                className="bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-2xl p-4 sm:p-5 shadow-xl shadow-emerald-600/10 cursor-pointer transition-all transform hover:-translate-y-0.5 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-slate-950 font-bold text-xs uppercase tracking-wider">
                  <span>Quick Log</span>
                  <PlusCircle className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 leading-tight">
                    Log Today's Journal
                  </h3>
                  <p className="text-[11px] text-slate-950/80 mt-0.5">
                    Record trades & mindset →
                  </p>
                </div>
              </div>

            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search asset, pair, note..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filter Result */}
                <select
                  value={filterResult}
                  onChange={(e) => setFilterResult(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Results (Win & Loss)</option>
                  <option value="win">🟢 Winning Trades</option>
                  <option value="loss">🔴 Losing Trades</option>
                </select>

                {/* Filter Plan */}
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Plan Compliance</option>
                  <option value="yes">✓ Plan Followed 100%</option>
                  <option value="partial">⚠️ Partially Followed</option>
                  <option value="no">✗ Plan Violated</option>
                </select>

                {/* Filter Mood */}
                <select
                  value={filterMood}
                  onChange={(e) => setFilterMood(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Mindset Moods</option>
                  <option value="disciplined">🎯 Disciplined</option>
                  <option value="confident">🦁 Confident</option>
                  <option value="calm">🧘 Calm</option>
                  <option value="anxious">😰 Anxious</option>
                  <option value="greedy">🤑 Greedy</option>
                  <option value="fearful">😨 Fearful</option>
                  <option value="impatient">⏳ Impatient</option>
                  <option value="frustrated">😤 Frustrated</option>
                </select>

              </div>
            </div>

            {/* Journal Entries List */}
            {filteredEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEntries.map((entry) => (
                  <JournalCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center my-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">No journal entries found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No trade logs match your active search or filters. Try clearing your filters or create a new journal entry.
                </p>
                <button
                  onClick={() => openNewEntryForDate(new Date().toISOString().split('T')[0])}
                  className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                >
                  + Add Journal Entry
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Smartphone Bottom Touch Navigation Bar (Fixed with Safe Area Support) */}
      <nav 
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 border-t border-slate-800/90 z-40 backdrop-blur-xl px-4 pt-2 flex items-center justify-around"
      >
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl text-[11px] font-medium transition-colors ${
            activeTab === 'feed' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('new')}
          className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl text-[11px] font-medium transition-colors ${
            activeTab === 'new' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Journal</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl text-[11px] font-medium transition-colors ${
            activeTab === 'calendar' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl text-[11px] font-medium transition-colors ${
            activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-xl text-[11px] font-medium transition-colors ${
            activeTab === 'gallery' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ImageIcon className="w-5 h-5" />
          <span>Media</span>
        </button>
      </nav>

      {/* Modals */}
      <JournalDetailModal />
      <ImageLightboxModal />

    </div>
  );
};

export default function App() {
  return (
    <JournalProvider>
      <MainContent />
    </JournalProvider>
  );
}
