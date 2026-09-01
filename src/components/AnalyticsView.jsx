import React from 'react';
import { useJournal } from '../context/JournalContext';
import { formatCurrency, formatPercent, getMoodConfig } from '../utils/formatters';
import { BarChart3, TrendingUp, Target, Brain, Award, ShieldCheck, Zap } from 'lucide-react';

export const AnalyticsView = () => {
  const { entries, totalPnL, winRate, planAdherenceRate, totalWins, totalLosses } = useJournal();

  if (!entries || entries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center px-4">
        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Trading Data Yet</h3>
        <p className="text-xs text-slate-400 mt-1">Log your first trade to unlock performance analytics & mindset metrics.</p>
      </div>
    );
  }

  // Sort entries chronologically by date
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Compute Cumulative Equity Curve data points
  let runningPnl = 0;
  const equityCurve = sortedEntries.map(e => {
    runningPnl += (e.pnl || 0);
    return {
      date: e.date,
      asset: e.asset,
      dailyPnl: e.pnl,
      cumulativePnL: runningPnl
    };
  });

  // Calculate Average Win & Average Loss
  const wins = entries.filter(e => e.pnl > 0);
  const losses = entries.filter(e => e.pnl < 0);

  const avgWin = wins.length > 0 ? (wins.reduce((acc, curr) => acc + curr.pnl, 0) / wins.length) : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((acc, curr) => acc + curr.pnl, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : (avgWin > 0 ? 'Inf' : '0.00');

  // Emotion Breakdown Matrix
  const moodStats = {};
  entries.forEach(e => {
    const m = e.mood || 'disciplined';
    if (!moodStats[m]) {
      moodStats[m] = { count: 0, totalPnl: 0, wins: 0 };
    }
    moodStats[m].count += 1;
    moodStats[m].totalPnl += (e.pnl || 0);
    if (e.pnl > 0) moodStats[m].wins += 1;
  });

  // Plan Followed vs Violated Comparison
  const planFollowedEntries = entries.filter(e => e.planFollowed === 'yes');
  const planViolatedEntries = entries.filter(e => e.planFollowed === 'no');

  const planFollowedWinRate = planFollowedEntries.length > 0
    ? ((planFollowedEntries.filter(e => e.pnl > 0).length / planFollowedEntries.length) * 100).toFixed(0)
    : '0';

  const planViolatedWinRate = planViolatedEntries.length > 0
    ? ((planViolatedEntries.filter(e => e.pnl > 0).length / planViolatedEntries.length) * 100).toFixed(0)
    : '0';

  // Compute SVG Equity Curve coordinates
  const minEquity = Math.min(0, ...equityCurve.map(d => d.cumulativePnL));
  const maxEquity = Math.max(100, ...equityCurve.map(d => d.cumulativePnL));
  const range = (maxEquity - minEquity) || 1;

  const svgWidth = 800;
  const svgHeight = 220;

  const points = equityCurve.map((d, i) => {
    const x = (i / Math.max(1, equityCurve.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 30 - ((d.cumulativePnL - minEquity) / range) * (svgHeight - 60);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-5xl mx-auto pb-24 lg:pb-12 pt-4 px-4 sm:px-6 space-y-6">

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Trading Analytics & Mindset Insights</h2>
            <p className="text-xs text-slate-400">Discover correlations between emotions, plan compliance, and profits.</p>
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block mb-1">Cumulative Net P/L</span>
            <span className={`text-xl font-extrabold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(totalPnL)}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block mb-1">Win Rate</span>
            <span className="text-xl font-extrabold text-white">{winRate}%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">{totalWins} Wins / {totalLosses} Losses</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block mb-1">Profit Factor</span>
            <span className="text-xl font-extrabold text-indigo-400">{profitFactor}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Avg Win: {formatCurrency(avgWin)}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block mb-1">Plan Compliance</span>
            <span className="text-xl font-extrabold text-emerald-400">{planAdherenceRate}%</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Adherence Rate</span>
          </div>
        </div>
      </div>

      {/* Cumulative Equity Curve Chart Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Cumulative Account Equity Growth</h3>
          </div>
          <span className="text-xs text-slate-400">{equityCurve.length} Trades Logged</span>
        </div>

        {/* SVG Curve */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-52 stroke-emerald-400 fill-none">
            {/* Horizontal Zero Line */}
            <line
              x1="0"
              y1={svgHeight - 30 - ((0 - minEquity) / range) * (svgHeight - 60)}
              x2={svgWidth}
              y2={svgHeight - 30 - ((0 - minEquity) / range) * (svgHeight - 60)}
              stroke="#334155"
              strokeDasharray="4"
              strokeWidth="1"
            />

            {/* Gradient Fill under path */}
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {points && (
              <>
                <polygon
                  points={`20,${svgHeight - 20} ${points} ${svgWidth - 20},${svgHeight - 20}`}
                  fill="url(#equityGrad)"
                  stroke="none"
                />
                <polyline
                  points={points}
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Data Dots */}
            {equityCurve.map((d, i) => {
              const x = (i / Math.max(1, equityCurve.length - 1)) * (svgWidth - 40) + 20;
              const y = svgHeight - 30 - ((d.cumulativePnL - minEquity) / range) * (svgHeight - 60);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  className="fill-emerald-400 stroke-slate-950 stroke-2 hover:r-6 cursor-pointer transition-all"
                >
                  <title>{`${d.date} (${d.asset}): ${formatCurrency(d.cumulativePnL)}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Two Column Grid: Emotion Matrix & Plan Adherence Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Emotion vs P/L Matrix Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Emotion vs Performance Matrix</h3>
          </div>

          <div className="space-y-3">
            {Object.keys(moodStats).map((moodKey) => {
              const stat = moodStats[moodKey];
              const moodCfg = getMoodConfig(moodKey);
              const wr = ((stat.wins / stat.count) * 100).toFixed(0);

              return (
                <div key={moodKey} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg">{moodCfg.emoji}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{moodCfg.label}</span>
                      <span className="text-[10px] text-slate-500">{stat.count} trade days • Win Rate {wr}%</span>
                    </div>
                  </div>

                  <div className={`text-xs font-extrabold ${stat.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(stat.totalPnl)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Compliance Impact Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Plan Adherence Impact</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400">When Plan Followed 100%</span>
                <span className="text-base font-extrabold text-emerald-400">{planFollowedWinRate}% Win Rate</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {planFollowedEntries.length} entries where process and risk rules were fully respected.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-400">When Plan Violated</span>
                <span className="text-base font-extrabold text-rose-400">{planViolatedWinRate}% Win Rate</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {planViolatedEntries.length} entries where FOMO, revenge trading, or rule violations occurred.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
