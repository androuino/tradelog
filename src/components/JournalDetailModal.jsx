import React from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  formatCurrency, 
  formatPercent, 
  formatDate, 
  getMoodConfig, 
  getPlanAdherenceConfig 
} from '../utils/formatters';
import { 
  X, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Smile, 
  Brain, 
  BookOpen, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Edit3,
  Trash2,
  Maximize2,
  Star,
  Layers,
  Tag
} from 'lucide-react';

export const JournalDetailModal = () => {
  const { selectedEntry, setSelectedEntry, startEditEntry, deleteEntry, setSelectedLightboxImage } = useJournal();

  if (!selectedEntry) return null;

  const isWin = selectedEntry.pnl > 0;
  const isLoss = selectedEntry.pnl < 0;

  const moodConfig = getMoodConfig(selectedEntry.mood);
  const planConfig = getPlanAdherenceConfig(selectedEntry.planFollowed);

  // Extract unique trade assets
  const tradeAssets = selectedEntry.trades && selectedEntry.trades.length > 0 
    ? Array.from(new Set(selectedEntry.trades.map(t => t.asset)))
    : [selectedEntry.asset || 'EUR/USD'];

  const handleClose = () => setSelectedEntry(null);

  const handleEdit = () => {
    const entryToEdit = selectedEntry;
    setSelectedEntry(null);
    startEditEntry(entryToEdit);
  };

  const handleDelete = () => {
    if (confirm(`Delete journal entry for ${selectedEntry.date}?`)) {
      deleteEntry(selectedEntry.id);
      setSelectedEntry(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(selectedEntry.date)}</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">{selectedEntry.session} Session</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {tradeAssets.map((assetName, idx) => (
                <span key={idx} className="text-xl font-extrabold text-white tracking-tight bg-slate-950 px-3 py-0.5 rounded-xl border border-slate-800">
                  {assetName}
                </span>
              ))}
              <div className={`px-3 py-1 rounded-xl border text-sm font-extrabold ${
                isWin 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : isLoss 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                {formatCurrency(selectedEntry.pnl)} ({formatPercent(selectedEntry.pnlPercentage)})
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              title="Edit Entry"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              title="Delete Entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* Section 1: Individual Trades List */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  1. Individual Trades Executed ({selectedEntry.trades?.length || selectedEntry.tradesCount || 1})
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-200">
                Net P/L: <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>{formatCurrency(selectedEntry.pnl)}</span>
              </span>
            </div>

            {selectedEntry.trades && selectedEntry.trades.length > 0 ? (
              <div className="space-y-3 mt-3">
                {selectedEntry.trades.map((tr, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                          tr.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {tr.direction || 'LONG'}
                        </span>
                        <span className="text-sm font-bold text-white">{tr.asset}</span>
                        {tr.strategy && (
                          <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                            {tr.strategy}
                          </span>
                        )}
                      </div>

                      <span className={`text-sm font-extrabold ${tr.pnl > 0 ? 'text-emerald-400' : tr.pnl < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {formatCurrency(tr.pnl)}
                      </span>
                    </div>

                    {/* Trade details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400 pt-1">
                      {tr.rrRatio && <div>R:R Ratio: <strong className="text-slate-200">{tr.rrRatio}</strong></div>}
                      {tr.entryPrice && <div>Entry: <strong className="text-slate-200">{tr.entryPrice}</strong></div>}
                      {tr.exitPrice && <div>Exit: <strong className="text-slate-200">{tr.exitPrice}</strong></div>}
                    </div>

                    {tr.notes && (
                      <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800/60">
                        "{tr.notes}"
                      </p>
                    )}

                    {tr.imageUrl && (
                      <div 
                        onClick={() => setSelectedLightboxImage({ url: tr.imageUrl, caption: `${tr.asset} ${tr.direction} Trade` })}
                        className="mt-2 h-36 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer relative group"
                      >
                        <img src={tr.imageUrl} alt="Trade Chart" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-md border border-slate-700">
                            Expand Chart
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Single trade asset: {selectedEntry.asset}</p>
            )}
          </div>

          {/* Section 2: Trading Plan Adherence */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                2. Did you follow your trading plan?
              </h3>
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${planConfig.badgeClass}`}>
                {selectedEntry.planFollowed === 'yes' && <CheckCircle2 className="w-4 h-4" />}
                {selectedEntry.planFollowed === 'partial' && <AlertTriangle className="w-4 h-4" />}
                {selectedEntry.planFollowed === 'no' && <XCircle className="w-4 h-4" />}
                <span>{planConfig.label}</span>
              </div>
            </div>

            {selectedEntry.planRulesChecklist && selectedEntry.planRulesChecklist.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {selectedEntry.planRulesChecklist.map((rule) => (
                  <div key={rule.id} className="flex items-center space-x-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className={rule.checked ? 'text-emerald-400' : 'text-slate-600'}>
                      {rule.checked ? '✓' : '✗'}
                    </span>
                    <span className={rule.checked ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3 & 4: Mindset & Psychological Reflection */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                3 & 4. Emotion & Psychological Reflection
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-xl border text-xs font-semibold ${moodConfig.color}`}>
                  <span>{moodConfig.emoji}</span>
                  <span>{moodConfig.label}</span>
                </div>
                {selectedEntry.mindsetScore && (
                  <div className="flex items-center space-x-1 text-amber-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                    <span>⭐</span>
                    <span className="font-bold">{selectedEntry.mindsetScore}/5</span>
                  </div>
                )}
              </div>
            </div>

            {selectedEntry.emotionReflection ? (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-purple-400 block mb-1">How emotions played out:</span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.emotionReflection}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No emotional reflection recorded.</p>
            )}
          </div>

          {/* Self-Development Prompts */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">
              Trader Self-Development & Mastery
            </h3>

            {selectedEntry.bestExecution && (
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-emerald-400 block mb-1">🌟 Best Execution / Decision:</span>
                <p className="text-xs text-slate-300">{selectedEntry.bestExecution}</p>
              </div>
            )}

            {selectedEntry.mistakes && (
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-rose-400 block mb-1">⚠️ Mistakes Made / Avoided:</span>
                <p className="text-xs text-slate-300">{selectedEntry.mistakes}</p>
              </div>
            )}

            {selectedEntry.keyLesson && (
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-indigo-400 block mb-1">💡 Key Lesson for Tomorrow:</span>
                <p className="text-xs text-slate-300">{selectedEntry.keyLesson}</p>
              </div>
            )}
          </div>

          {/* Attachments */}
          {selectedEntry.images && selectedEntry.images.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                General Attachments ({selectedEntry.images.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedEntry.images.map((img) => (
                  <div 
                    key={img.id}
                    onClick={() => setSelectedLightboxImage(img)}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2 cursor-pointer group hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="h-48 rounded-lg overflow-hidden bg-slate-950 relative">
                      <img src={img.url} alt={img.caption || 'Chart'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Expand Chart</span>
                        </span>
                      </div>
                    </div>
                    {img.caption && (
                      <p className="text-[11px] text-slate-400 mt-2 px-1 italic truncate">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
