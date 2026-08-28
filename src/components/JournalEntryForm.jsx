import React, { useState, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { fileToDataUrl } from '../utils/storage';
import { 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  X, 
  Sparkles, 
  Brain, 
  BookOpen, 
  Camera, 
  Calendar as CalendarIcon,
  Smile,
  ShieldCheck,
  Star,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Save,
  Tag
} from 'lucide-react';

const DEFAULT_PLAN_RULES = [
  { id: 'rule-1', label: 'Waited for valid entry signal / setup', checked: true },
  { id: 'rule-2', label: 'Risk capped at <= 1% per trade', checked: true },
  { id: 'rule-3', label: 'Stop Loss placed at technical invalidation', checked: true },
  { id: 'rule-4', label: 'Achieved minimum 1:1.5 R:R Ratio', checked: true },
  { id: 'rule-5', label: 'No revenge trading after losses', checked: true }
];

const MOOD_OPTIONS = [
  { id: 'disciplined', label: 'Disciplined', emoji: '🎯', desc: 'Stuck to process 100%' },
  { id: 'confident', label: 'Confident', emoji: '🦁', desc: 'Executed with conviction' },
  { id: 'calm', label: 'Calm & Focused', emoji: '🧘', desc: 'Zero emotional noise' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', desc: 'Nervous during trade' },
  { id: 'greedy', label: 'Greedy / FOMO', emoji: '🤑', desc: 'Chased entry or held too long' },
  { id: 'fearful', label: 'Fearful', emoji: '😨', desc: 'Hesitated / cut winner early' },
  { id: 'impatient', label: 'Impatient', emoji: '⏳', desc: 'Entered before setup formed' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤', desc: 'Felt annoyed at market' }
];

export const JournalEntryForm = () => {
  const { addEntry, updateEntry, editingEntry, setActiveTab, initialDateForNewEntry } = useJournal();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('London');

  // List of trades in this daily journal entry
  const [trades, setTrades] = useState([
    {
      id: 'tr-1',
      asset: 'EUR/USD',
      direction: 'LONG',
      pnl: 350.00,
      pnlPercentage: 1.75,
      strategy: '15m Order Block Retest',
      entryPrice: '',
      exitPrice: '',
      rrRatio: '1:2.0',
      notes: '',
      imageUrl: ''
    }
  ]);

  // Core Questions
  const [planFollowed, setPlanFollowed] = useState('yes');
  const [planRulesChecklist, setPlanRulesChecklist] = useState(DEFAULT_PLAN_RULES);
  const [customRuleText, setCustomRuleText] = useState('');
  
  const [mood, setMood] = useState('disciplined');
  const [mindsetScore, setMindsetScore] = useState(5);
  const [emotionReflection, setEmotionReflection] = useState('');

  // Self-Development Questions
  const [bestExecution, setBestExecution] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [keyLesson, setKeyLesson] = useState('');
  const [disciplineScore, setDisciplineScore] = useState(5);

  // Picture Attachments
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Active form section tab
  const [activeSection, setActiveSection] = useState('trades'); // 'trades' | 'plan' | 'emotions' | 'reflection' | 'photos'

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date || new Date().toISOString().split('T')[0]);
      setSession(editingEntry.session || 'London');
      
      if (editingEntry.trades && editingEntry.trades.length > 0) {
        setTrades(editingEntry.trades);
      } else if (editingEntry.asset) {
        setTrades([
          {
            id: 'tr-1',
            asset: editingEntry.asset,
            direction: 'LONG',
            pnl: editingEntry.pnl || 0,
            pnlPercentage: editingEntry.pnlPercentage || 0,
            strategy: 'Standard Setup',
            notes: '',
            imageUrl: ''
          }
        ]);
      }

      setPlanFollowed(editingEntry.planFollowed || 'yes');
      setPlanRulesChecklist(editingEntry.planRulesChecklist?.length > 0 ? editingEntry.planRulesChecklist : DEFAULT_PLAN_RULES);
      setMood(editingEntry.mood || 'disciplined');
      setMindsetScore(editingEntry.mindsetScore || 5);
      setEmotionReflection(editingEntry.emotionReflection || '');

      setBestExecution(editingEntry.bestExecution || '');
      setMistakes(editingEntry.mistakes || '');
      setKeyLesson(editingEntry.keyLesson || '');
      setDisciplineScore(editingEntry.disciplineScore || 5);
      setImages(editingEntry.images || []);
    } else if (initialDateForNewEntry) {
      setDate(initialDateForNewEntry);
    }
  }, [editingEntry, initialDateForNewEntry]);

  // Real-time calculated daily totals
  const totalDayPnl = trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const totalDayPnlPct = trades.reduce((acc, t) => acc + (parseFloat(t.pnlPercentage) || 0), 0);
  const winsCount = trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;
  const lossesCount = trades.filter(t => (parseFloat(t.pnl) || 0) < 0).length;

  // Add a new empty trade to this day
  const handleAddTrade = () => {
    setTrades(prev => [
      ...prev,
      {
        id: 'tr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        asset: 'BTC/USD',
        direction: 'LONG',
        pnl: 0,
        pnlPercentage: 0,
        strategy: 'Breakout Retest',
        entryPrice: '',
        exitPrice: '',
        rrRatio: '1:2.0',
        notes: '',
        imageUrl: ''
      }
    ]);
  };

  const handleRemoveTrade = (tradeId) => {
    if (trades.length === 1) {
      alert('Keep at least one trade item in your journal.');
      return;
    }
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  };

  const handleUpdateTrade = (tradeId, field, value) => {
    setTrades(prev => prev.map(t => {
      if (t.id === tradeId) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleTradeImageUpload = async (tradeId, file) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      handleUpdateTrade(tradeId, 'imageUrl', dataUrl);
    } catch (err) {
      console.error('Failed to upload trade chart:', err);
    }
  };

  const handleToggleRule = (ruleId) => {
    setPlanRulesChecklist(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, checked: !rule.checked } : rule
    ));
  };

  const handleAddCustomRule = () => {
    if (!customRuleText.trim()) return;
    setPlanRulesChecklist(prev => [
      ...prev,
      { id: 'rule-' + Date.now(), label: customRuleText.trim(), checked: true }
    ]);
    setCustomRuleText('');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImage(true);
    try {
      const uploadedImages = [];
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        uploadedImages.push({
          id: 'img-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          url: dataUrl,
          caption: file.name
        });
      }
      setImages(prev => [...prev, ...uploadedImages]);
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (imgId) => {
    setImages(prev => prev.filter(img => img.id !== imgId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      id: editingEntry ? editingEntry.id : undefined,
      date,
      session,
      trades,
      pnl: totalDayPnl,
      pnlPercentage: totalDayPnlPct,
      tradesCount: trades.length,
      winsCount,
      lossesCount,
      planFollowed,
      planRulesChecklist,
      mood,
      mindsetScore,
      emotionReflection,
      bestExecution,
      mistakes,
      keyLesson,
      disciplineScore,
      images
    };

    if (editingEntry) {
      updateEntry(formData);
    } else {
      addEntry(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 lg:pb-12 pt-4 px-4 sm:px-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>{editingEntry ? 'Edit Journal Entry' : 'Daily Journal Entry'}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {editingEntry ? 'Update Daily Reflection' : 'Journal Today\'s Trades'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Log multiple trades per day, total P/L, emotional reflection, and self-development.
            </p>
          </div>

          {/* Daily Net Summary Pill */}
          <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <div>
              <span className="text-[10px] text-slate-500 block font-medium uppercase">Daily Net P/L</span>
              <span className={`text-base font-extrabold ${totalDayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalDayPnl >= 0 ? '+' : ''}${totalDayPnl.toFixed(2)} ({trades.length} Trade{trades.length > 1 ? 's' : ''})
              </span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto mt-6 pt-4 border-t border-slate-800 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection('trades')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === 'trades' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-400 bg-slate-800/40 hover:text-white'
            }`}
          >
            1. Trades ({trades.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === 'plan' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-400 bg-slate-800/40 hover:text-white'
            }`}
          >
            2. Trading Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('emotions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === 'emotions' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-400 bg-slate-800/40 hover:text-white'
            }`}
          >
            3. Mood & Emotion
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('reflection')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === 'reflection' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-400 bg-slate-800/40 hover:text-white'
            }`}
          >
            4. Self-Development
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('photos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === 'photos' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-400 bg-slate-800/40 hover:text-white'
            }`}
          >
            5. Attachments ({images.length})
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: TRADES LOGGED TODAY */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg transition-all ${
          activeSection !== 'trades' ? 'hidden sm:block' : ''
        }`}>
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">1. Individual Trades Executed Today</h3>
            </div>
            
            <button
              type="button"
              onClick={handleAddTrade}
              className="flex items-center space-x-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Trade / Pair</span>
            </button>
          </div>

          {/* Date & Session Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center space-x-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Journal Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Trading Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Asian">Asian Session</option>
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
                <option value="London / NY Overlap">London / NY Overlap</option>
                <option value="Crypto 24/7">Crypto 24/7</option>
              </select>
            </div>
          </div>

          {/* Trades Cards List */}
          <div className="space-y-4">
            {trades.map((trade, idx) => (
              <div 
                key={trade.id} 
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-300 flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-300">Trade Item</span>
                  </div>

                  {trades.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTrade(trade.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                      title="Remove Trade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  
                  {/* Pair / Symbol */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Asset / Pair</label>
                    <input
                      type="text"
                      placeholder="e.g. EUR/USD, BTC, NVDA"
                      value={trade.asset}
                      onChange={(e) => handleUpdateTrade(trade.id, 'asset', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Direction */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Direction</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleUpdateTrade(trade.id, 'direction', 'LONG')}
                        className={`py-1 rounded-lg text-xs font-bold transition-all ${
                          trade.direction === 'LONG' 
                            ? 'bg-emerald-500 text-slate-950 shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        LONG 🟢
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateTrade(trade.id, 'direction', 'SHORT')}
                        className={`py-1 rounded-lg text-xs font-bold transition-all ${
                          trade.direction === 'SHORT' 
                            ? 'bg-rose-500 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        SHORT 🔴
                      </button>
                    </div>
                  </div>

                  {/* P/L Amount ($) */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">P/L Amount ($)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 350 or -120"
                      value={trade.pnl !== undefined ? trade.pnl : ''}
                      onChange={(e) => handleUpdateTrade(trade.id, 'pnl', parseFloat(e.target.value) || 0)}
                      className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs font-extrabold focus:outline-none ${
                        (trade.pnl || 0) > 0 
                          ? 'border-emerald-500/50 text-emerald-400' 
                          : (trade.pnl || 0) < 0 
                          ? 'border-rose-500/50 text-rose-400' 
                          : 'border-slate-800 text-white'
                      }`}
                      required
                    />
                  </div>

                  {/* Strategy / Setup Tag */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Strategy / Setup</label>
                    <input
                      type="text"
                      placeholder="e.g. 15m Order Block, FVG"
                      value={trade.strategy || ''}
                      onChange={(e) => handleUpdateTrade(trade.id, 'strategy', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Risk Reward Ratio */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">R:R Ratio</label>
                    <input
                      type="text"
                      placeholder="e.g. 1:2.5"
                      value={trade.rrRatio || ''}
                      onChange={(e) => handleUpdateTrade(trade.id, 'rrRatio', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                    />
                  </div>

                  {/* Trade Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Trade Confluence Notes</label>
                    <input
                      type="text"
                      placeholder="Why did you enter this trade?"
                      value={trade.notes || ''}
                      onChange={(e) => handleUpdateTrade(trade.id, 'notes', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* SECTION 2: DID YOU FOLLOW YOUR TRADING PLAN? */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg transition-all ${
          activeSection !== 'plan' ? 'hidden sm:block' : ''
        }`}>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">2. Did you follow your trading plan today?</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setPlanFollowed('yes')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                planFollowed === 'yes'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-xs">Yes (100%)</span>
            </button>

            <button
              type="button"
              onClick={() => setPlanFollowed('partial')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                planFollowed === 'partial'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="text-xs">Partially</span>
            </button>

            <button
              type="button"
              onClick={() => setPlanFollowed('no')}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                planFollowed === 'no'
                  ? 'bg-rose-500/15 border-rose-500 text-rose-400 font-bold shadow-lg shadow-rose-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <XCircle className="w-6 h-6" />
              <span className="text-xs">No (Violated)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Trading Plan Rules Verified Today:
            </label>

            <div className="space-y-2 mb-4">
              {planRulesChecklist.map((rule) => (
                <label
                  key={rule.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    rule.checked 
                      ? 'bg-slate-950/80 border-emerald-500/40 text-slate-200' 
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <span className="text-xs font-medium">{rule.label}</span>
                  <input
                    type="checkbox"
                    checked={rule.checked}
                    onChange={() => handleToggleRule(rule.id)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add custom plan rule..."
                value={customRuleText}
                onChange={(e) => setCustomRuleText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomRule(); }}}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomRule}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: HOW DID YOU FEEL ABOUT YOUR TRADES TODAY & EMOTION REFLECTION */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg transition-all ${
          activeSection !== 'emotions' ? 'hidden sm:block' : ''
        }`}>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-5">
            <Smile className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">3. How did you feel about your trades today?</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMood(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mood === opt.id
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="text-xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-semibold">{opt.label}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Mindset & Emotional Stability</span>
              <span className="text-[11px] text-slate-500">1 = Emotionally overwhelmed, 5 = Peak clarity & zen</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setMindsetScore(star)}
                  className={`p-1.5 transition-all ${
                    star <= mindsetScore ? 'text-amber-400 scale-110' : 'text-slate-700 hover:text-slate-500'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>4. How did your emotion played out?</span>
            </label>
            <textarea
              rows="4"
              placeholder="Reflect on your psychological state. Did anxiety make you cut a winner early? Did greed trigger FOMO? How did you respond when price moved against you?"
              value={emotionReflection}
              onChange={(e) => setEmotionReflection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* SECTION 4: SELF-DEVELOPMENT & MASTERY PROMPTS */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg transition-all ${
          activeSection !== 'reflection' ? 'hidden sm:block' : ''
        }`}>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-5">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">4. Self-Development & Trader Mastery</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1.5">
                🌟 What was your best execution or decision today?
              </label>
              <input
                type="text"
                placeholder="e.g. Waited 45 minutes for liquidity sweep confirmation on EUR/USD..."
                value={bestExecution}
                onChange={(e) => setBestExecution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1.5">
                ⚠️ What mistakes were made or successfully avoided?
              </label>
              <input
                type="text"
                placeholder="e.g. Almost took revenge trade on BTC, but closed terminal and took a break..."
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-400 mb-1.5">
                💡 What key lesson will you carry into tomorrow?
              </label>
              <input
                type="text"
                placeholder="e.g. Uncorrelated pair diversification works when mechanical criteria are met..."
                value={keyLesson}
                onChange={(e) => setKeyLesson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Overall Discipline Rating</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setDisciplineScore(score)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      score <= disciplineScore
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 5: PICTURE ATTACHMENTS */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg transition-all ${
          activeSection !== 'photos' ? 'hidden sm:block' : ''
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">5. Chart Screenshots & Attachments</h3>
            </div>
            <span className="text-xs text-slate-400">{images.length} Image(s) Attached</span>
          </div>

          <label className="block border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/50 hover:bg-slate-950 group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {uploadingImage ? 'Processing photo...' : 'Click or Drag trade screenshots to attach'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, WEBP chart screenshots</p>
              </div>
            </div>
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {images.map((img) => (
                <div key={img.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-4 right-4 p-1.5 bg-rose-500/90 text-white rounded-lg opacity-90 group-hover:opacity-100 transition-opacity z-10"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-44 rounded-lg overflow-hidden bg-slate-900 border border-slate-800/80 mb-2">
                    <img src={img.url} alt={img.caption || 'Chart'} className="w-full h-full object-cover" />
                  </div>

                  <input
                    type="text"
                    placeholder="Add chart caption..."
                    value={img.caption || ''}
                    onChange={(e) => setImages(prev => prev.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{editingEntry ? 'Save Journal Updates' : 'Publish Daily Journal'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
