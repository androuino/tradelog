import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Target, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Coins, 
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const ASSET_PRESETS = [
  { id: 'forex_usd', name: 'Forex (EUR/USD, GBP/USD, AUD/USD)', type: 'forex', pipMultiplier: 10, unitName: 'Lots', defaultSL: 20 },
  { id: 'forex_jpy', name: 'Forex JPY Pairs (USD/JPY, EUR/JPY)', type: 'forex_jpy', pipMultiplier: 7.5, unitName: 'Lots', defaultSL: 25 },
  { id: 'gold', name: 'Gold (XAU/USD)', type: 'commodity', pipMultiplier: 1.0, unitName: 'Lots', defaultSL: 30 },
  { id: 'btc', name: 'Bitcoin (BTC/USD)', type: 'crypto', pipMultiplier: 1.0, unitName: 'BTC', defaultSL: 500 },
  { id: 'indices', name: 'Indices (US30 / NAS100)', type: 'index', pipMultiplier: 1.0, unitName: 'Contracts', defaultSL: 40 }
];

const RISK_PRESETS = [0.5, 1.0, 1.5, 2.0, 3.0];
const SL_PRESETS = [10, 15, 20, 25, 30, 50];

export const LotCalculatorView = () => {
  // Load saved preferences or defaults
  const [accountBalance, setAccountBalance] = useState(() => {
    return parseFloat(localStorage.getItem('lot_calc_balance')) || 10000;
  });
  
  const [riskPercent, setRiskPercent] = useState(() => {
    return parseFloat(localStorage.getItem('lot_calc_risk_pct')) || 1.0;
  });

  const [assetId, setAssetId] = useState('forex_usd');
  const [stopLossPips, setStopLossPips] = useState(20);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [usePriceMode, setUsePriceMode] = useState(false);

  // Save defaults when updated
  useEffect(() => {
    localStorage.setItem('lot_calc_balance', accountBalance);
    localStorage.setItem('lot_calc_risk_pct', riskPercent);
  }, [accountBalance, riskPercent]);

  const selectedAsset = ASSET_PRESETS.find(a => a.id === assetId) || ASSET_PRESETS[0];

  // Calculate SL Pips from price if in Price Mode
  useEffect(() => {
    if (usePriceMode && entryPrice && stopLossPrice) {
      const ep = parseFloat(entryPrice);
      const slp = parseFloat(stopLossPrice);
      if (!isNaN(ep) && !isNaN(slp) && ep !== slp) {
        const diff = Math.abs(ep - slp);
        let calculatedPips = diff;
        if (selectedAsset.type === 'forex') {
          calculatedPips = Math.round(diff * 10000);
        } else if (selectedAsset.type === 'forex_jpy') {
          calculatedPips = Math.round(diff * 100);
        } else if (selectedAsset.type === 'gold') {
          calculatedPips = Math.round(diff * 10);
        }
        setStopLossPips(calculatedPips > 0 ? calculatedPips : 1);
      }
    }
  }, [entryPrice, stopLossPrice, usePriceMode, selectedAsset]);

  // Derived computations
  const riskAmount = (accountBalance * (riskPercent / 100)) || 0;
  const slPips = Math.max(parseFloat(stopLossPips) || 1, 0.1);

  // Lot calculation based on asset class
  let calculatedLots = 0;
  if (selectedAsset.type === 'forex') {
    // 1 Lot = $10 per pip for 100,000 units
    calculatedLots = riskAmount / (slPips * selectedAsset.pipMultiplier);
  } else if (selectedAsset.type === 'forex_jpy') {
    calculatedLots = riskAmount / (slPips * selectedAsset.pipMultiplier);
  } else if (selectedAsset.type === 'gold') {
    // 1 Lot = 100oz. $1.00 move = $100 per lot = 10 pips ($10/pip)
    calculatedLots = riskAmount / (slPips * 10);
  } else if (selectedAsset.type === 'crypto') {
    // For BTC, SL distance in $
    calculatedLots = riskAmount / slPips;
  } else {
    // Index contracts
    calculatedLots = riskAmount / slPips;
  }

  const standardLots = Math.max(calculatedLots, 0);
  const miniLots = standardLots * 10;
  const microLots = standardLots * 100;
  const unitsCount = Math.round(standardLots * 100000);

  // Risk Rating Status
  const getRiskStatus = () => {
    if (riskPercent <= 1.0) {
      return {
        badge: '🟢 Conservative Risk',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        desc: 'Professional capital preservation level.'
      };
    } else if (riskPercent <= 2.0) {
      return {
        badge: '🟡 Moderate Risk',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        desc: 'Standard active trading risk range.'
      };
    } else {
      return {
        badge: '🔴 High Aggressive Risk',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        desc: 'Caution: High risk increases drawdown probability!'
      };
    }
  };

  const riskStatus = getRiskStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              Position & Lot Size Auto-Calculator
              <Sparkles className="w-4 h-4 ml-2 text-emerald-400" />
            </h1>
            <p className="text-xs text-slate-400">
              Calculate exact lot sizes, position units, and risk amount based on your capital & stop loss pips.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Calculator Controls */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
          
          {/* 1. Account Capital Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-emerald-400" />
                Account Capital ($)
              </span>
              <span className="text-[11px] font-normal text-slate-400">Auto-saved for quick logging</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 10000"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-base font-extrabold text-white focus:outline-none focus:border-emerald-500 transition-all pl-10"
              />
              <span className="absolute left-3.5 top-3.5 text-slate-500 font-bold">$</span>
            </div>
          </div>

          {/* 2. Risk Percentage (%) & Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center">
                <Percent className="w-4 h-4 mr-1 text-emerald-400" />
                Risk Percentage per Trade (%)
              </label>
              <span className="text-xs font-extrabold text-emerald-400">
                ${riskAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Risk
              </span>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-extrabold text-white text-center focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs font-bold text-slate-400">%</span>

              {/* Quick Risk Buttons */}
              <div className="flex-1 flex items-center space-x-1.5 overflow-x-auto">
                {RISK_PRESETS.map((rp) => (
                  <button
                    key={rp}
                    type="button"
                    onClick={() => setRiskPercent(rp)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      riskPercent === rp
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rp}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Asset Class Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center">
              <Layers className="w-4 h-4 mr-1 text-indigo-400" />
              Asset Class / Instrument
            </label>
            <select
              value={assetId}
              onChange={(e) => {
                setAssetId(e.target.value);
                const a = ASSET_PRESETS.find(p => p.id === e.target.value);
                if (a) setStopLossPips(a.defaultSL);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
            >
              {ASSET_PRESETS.map((ap) => (
                <option key={ap.id} value={ap.id}>
                  {ap.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Stop Loss Distance (Pips / Points) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center">
                <Target className="w-4 h-4 mr-1 text-rose-400" />
                Stop Loss Distance ({selectedAsset.type === 'crypto' ? '$ Distance' : 'Pips / Points'})
              </label>

              {/* Mode Toggle: Pips vs Price Difference */}
              <button
                type="button"
                onClick={() => setUsePriceMode(!usePriceMode)}
                className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center"
              >
                {usePriceMode ? 'Switch to Direct Pips Input' : 'Calculate SL from Entry & Stop Prices'}
              </button>
            </div>

            {!usePriceMode ? (
              <div className="space-y-2">
                <input
                  type="number"
                  step="any"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(parseFloat(e.target.value) || 1)}
                  placeholder="e.g. 20"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-extrabold text-white focus:outline-none focus:border-rose-500"
                />
                
                {/* Quick SL Presets */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Pips:</span>
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    {SL_PRESETS.map((sl) => (
                      <button
                        key={sl}
                        type="button"
                        onClick={() => setStopLossPips(sl)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          stopLossPips === sl
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sl} pips
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Entry Price</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1.0850"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stop Loss Price</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1.0830"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div className="col-span-2 text-xs text-emerald-400 font-extrabold flex items-center justify-between pt-1">
                  <span>Calculated SL Distance:</span>
                  <span className="bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {stopLossPips} pips
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Dynamic Lot Size Output Display */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Lot Result Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center">
                <Coins className="w-4 h-4 mr-1.5" />
                Recommended Position Size
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${riskStatus.color}`}>
                {riskStatus.badge}
              </span>
            </div>

            {/* Giant Primary Output Number */}
            <div className="space-y-1 my-4 text-center py-2 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {standardLots < 0.01 && standardLots > 0
                  ? standardLots.toFixed(4)
                  : standardLots.toFixed(2)}
              </div>
              <div className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
                {selectedAsset.unitName} (Standard Lots)
              </div>
            </div>

            {/* Detailed Lot Size Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="text-xs text-slate-400 font-semibold mb-0.5">Standard</div>
                <div className="text-sm font-extrabold text-white">{standardLots.toFixed(2)}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="text-xs text-slate-400 font-semibold mb-0.5">Mini Lots</div>
                <div className="text-sm font-extrabold text-indigo-400">{miniLots.toFixed(1)}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                <div className="text-xs text-slate-400 font-semibold mb-0.5">Micro Lots</div>
                <div className="text-sm font-extrabold text-amber-400">{microLots.toFixed(0)}</div>
              </div>
            </div>

          </div>

          {/* Risk Breakdown Summary Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg text-xs">
            <h3 className="font-extrabold text-white flex items-center border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
              Risk & Position Overview
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Total Capital:</span>
                <span className="font-bold text-white">{formatCurrency(accountBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Risk Amount ({riskPercent}%):</span>
                <span className="font-extrabold text-emerald-400">{formatCurrency(riskAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Stop Loss Distance:</span>
                <span className="font-bold text-white">{stopLossPips} pips</span>
              </div>
              {selectedAsset.type.startsWith('forex') && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Pip Value per Standard Lot:</span>
                  <span className="font-bold text-indigo-400">
                    ${selectedAsset.pipMultiplier.toFixed(2)} / pip
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 <span className="font-semibold text-slate-300">Pro Tip:</span> Always set your Stop Loss before opening a trade. Sticking to a strict <span className="text-emerald-400 font-bold">1% risk rule</span> guarantees you can endure a streak of 10 consecutive losses with only a ~10% total drawdown!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
