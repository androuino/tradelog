import React from 'react';
import { useJournal } from '../context/JournalContext';
import { JournalCard } from './JournalCard';
import { 
  Search, 
  Filter, 
  BookOpen, 
  PlusCircle, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  Target,
  Brain
} from 'lucide-react';

export const JournalFeed = () => {
  const { 
    filteredEntries, 
    searchQuery, 
    setSearchQuery,
    filterResult,
    setFilterResult,
    filterPlan,
    setFilterPlan,
    filterMood,
    setFilterMood,
    setActiveTab,
    resetToSampleData,
    setEditingEntry
  } = useJournal();

  const handleNewClick = () => {
    setEditingEntry(null);
    setActiveTab('new');
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-12 pt-4 px-4 sm:px-6 space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by asset (EUR/USD, BTC), session, or lesson..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            
            {/* Result Filter */}
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Results</option>
              <option value="win">Wins Only</option>
              <option value="loss">Losses Only</option>
            </select>

            {/* Plan Filter */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Plan Adherence: All</option>
              <option value="yes">Plan Followed (100%)</option>
              <option value="partial">Partially Followed</option>
              <option value="no">Plan Violated</option>
            </select>

            {/* Mood Filter */}
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Mood: All</option>
              <option value="disciplined">Disciplined 🎯</option>
              <option value="confident">Confident 🦁</option>
              <option value="calm">Calm 🧘</option>
              <option value="anxious">Anxious 😰</option>
              <option value="greedy">Greedy 🤑</option>
              <option value="frustrated">Frustrated 😤</option>
            </select>

          </div>

        </div>
      </div>

      {/* Feed List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Journal Entries Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No entries match your current search filters. Try clearing filters or create a new daily journal entry.
          </p>
          <div className="flex items-center justify-center space-x-3 mt-6">
            <button
              onClick={handleNewClick}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
            >
              + Log Today's Trade
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEntries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

    </div>
  );
};
