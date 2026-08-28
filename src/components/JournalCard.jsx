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
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  Edit3, 
  Trash2, 
  Eye, 
  Brain,
  Award,
  Layers
} from 'lucide-react';

export const JournalCard = ({ entry }) => {
  const { setSelectedEntry, startEditEntry, deleteEntry, setSelectedLightboxImage } = useJournal();

  const isWin = entry.pnl > 0;
  const isLoss = entry.pnl < 0;

  const moodConfig = getMoodConfig(entry.mood);
  const planConfig = getPlanAdherenceConfig(entry.planFollowed);

  // Extract unique trade assets
  const tradeAssets = entry.trades && entry.trades.length > 0 
    ? Array.from(new Set(entry.trades.map(t => t.asset)))
    : [entry.asset || 'EUR/USD'];

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete journal entry for ${entry.date}?`)) {
      deleteEntry(entry.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    startEditEntry(entry);
  };

  return (
    <div 
      onClick={() => setSelectedEntry(entry)}
      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-200 hover:shadow-xl hover:translate-y-[-2px] cursor-pointer relative group overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isWin ? 'bg-emerald-500' : isLoss ? 'bg-rose-500' : 'bg-slate-700'
      }`}></div>

      {/* Row 1: Date & Daily Net P/L */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <span>{formatDate(entry.date)}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[11px]">
              {entry.session || 'Session'}
            </span>
          </div>

          {/* Assets Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {tradeAssets.map((assetName, idx) => (
              <span key={idx} className="text-sm font-extrabold text-white tracking-tight bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                {assetName}
              </span>
            ))}
            {entry.tradesCount > 1 && (
              <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md font-medium">
                {entry.tradesCount} Trades
              </span>
            )}
          </div>
        </div>

        {/* Daily Net P/L Pill */}
        <div className={`flex flex-col items-end px-3.5 py-1.5 rounded-xl border ${
          isWin 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : isLoss 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
            : 'bg-slate-800 border-slate-700 text-slate-300'
        }`}>
          <div className="flex items-center space-x-1 font-extrabold text-base">
            {isWin ? <TrendingUp className="w-4 h-4" /> : isLoss ? <TrendingDown className="w-4 h-4" /> : null}
            <span>{formatCurrency(entry.pnl)}</span>
          </div>
          <span className="text-[11px] font-semibold opacity-90">{formatPercent(entry.pnlPercentage)}</span>
        </div>
      </div>

      {/* Row 2: Individual Trades List Snippet */}
      {entry.trades && entry.trades.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 mb-3.5 space-y-1.5">
          <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Trades Executed ({entry.trades.length})</span>
          </div>

          <div className="space-y-1">
            {entry.trades.map((tr, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-slate-900/80 px-2.5 py-1 rounded-lg">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    tr.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tr.direction}
                  </span>
                  <span className="font-semibold text-slate-200">{tr.asset}</span>
                  {tr.strategy && <span className="text-[10px] text-slate-500 hidden sm:inline-block">• {tr.strategy}</span>}
                </div>

                <span className={`font-bold ${tr.pnl > 0 ? 'text-emerald-400' : tr.pnl < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {formatCurrency(tr.pnl)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Badges (Plan Compliance + Mood) */}
      <div className="flex flex-wrap items-center gap-2 mb-3.5">
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${planConfig.badgeClass}`}>
          {entry.planFollowed === 'yes' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {entry.planFollowed === 'partial' && <AlertTriangle className="w-3.5 h-3.5" />}
          {entry.planFollowed === 'no' && <XCircle className="w-3.5 h-3.5" />}
          <span>{planConfig.label}</span>
        </div>

        <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium ${moodConfig.color}`}>
          <span>{moodConfig.emoji}</span>
          <span>{moodConfig.label}</span>
        </div>

        {entry.mindsetScore && (
          <div className="flex items-center space-x-0.5 text-amber-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <span>⭐</span>
            <span className="font-bold">{entry.mindsetScore}/5</span>
          </div>
        )}
      </div>

      {/* Row 4: Emotion Reflection Snippet */}
      {entry.emotionReflection && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-3.5">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Brain className="w-3.5 h-3.5" />
            <span>Emotional Reflection</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic">
            "{entry.emotionReflection}"
          </p>
        </div>
      )}

      {/* Chart Image Thumbnails */}
      {entry.images && entry.images.length > 0 && (
        <div className="flex items-center space-x-2 mb-3.5 overflow-x-auto pb-1 scrollbar-none">
          {entry.images.map((img) => (
            <div 
              key={img.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLightboxImage(img);
              }}
              className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 hover:border-emerald-500 transition-colors relative group/img cursor-pointer"
            >
              <img src={img.url} alt={img.caption || 'Chart'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ))}
          <span className="text-[11px] text-slate-400 pl-1 shrink-0">
            {entry.images.length} Chart(s)
          </span>
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
        <span className="text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center space-x-1">
          <Eye className="w-3.5 h-3.5" />
          <span>Tap to read full journal</span>
        </span>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleEdit}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Entry"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete Entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
