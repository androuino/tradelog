import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Image as ImageIcon, Camera, Maximize2, Filter, Calendar } from 'lucide-react';

export const MediaGalleryView = () => {
  const { entries, setSelectedLightboxImage, setSelectedEntry } = useJournal();
  
  const [filterAsset, setFilterAsset] = useState('all');
  const [filterResult, setFilterResult] = useState('all');

  // Collect all images attached to entries
  const allImages = [];
  entries.forEach(entry => {
    if (entry.images && entry.images.length > 0) {
      entry.images.forEach(img => {
        allImages.push({
          ...img,
          entryDate: entry.date,
          entryAsset: entry.asset,
          entryPnl: entry.pnl,
          entrySession: entry.session,
          entryId: entry.id,
          parentEntry: entry
        });
      });
    }
  });

  // Extract unique assets for filter
  const uniqueAssets = Array.from(new Set(entries.map(e => e.asset).filter(Boolean)));

  const filteredImages = allImages.filter(img => {
    const matchesAsset = filterAsset === 'all' || img.entryAsset === filterAsset;
    const matchesResult = filterResult === 'all' || 
      (filterResult === 'win' && img.entryPnl > 0) || 
      (filterResult === 'loss' && img.entryPnl < 0);
    return matchesAsset && matchesResult;
  });

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-12 pt-4 px-4 sm:px-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Trade Chart Screenshots Gallery</h2>
              <p className="text-xs text-slate-400">Review technical setups, order blocks, and trade entries</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Assets / Instruments</option>
              {uniqueAssets.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Results</option>
              <option value="win">Winning Trades Only</option>
              <option value="loss">Losing Trades Only</option>
            </select>
          </div>

        </div>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Camera className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Chart Screenshots Found</h3>
          <p className="text-xs text-slate-400 mt-1">Upload chart screenshots when logging or editing journal entries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg group transition-all duration-200 hover:translate-y-[-2px]"
            >
              {/* Image Container */}
              <div 
                onClick={() => setSelectedLightboxImage(img)}
                className="h-56 bg-slate-950 relative cursor-pointer overflow-hidden"
              >
                <img src={img.url} alt={img.caption || 'Chart'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Zoom Chart</span>
                  </span>
                </div>

                {/* Top P/L Pill */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-md backdrop-blur-md ${
                  img.entryPnl > 0 
                    ? 'bg-emerald-500/80 text-slate-950' 
                    : img.entryPnl < 0 
                    ? 'bg-rose-500/80 text-white' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {formatCurrency(img.entryPnl)}
                </div>
              </div>

              {/* Info Card Body */}
              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-bold text-white">{img.entryAsset}</span>
                  <span>{formatDate(img.entryDate)}</span>
                </div>

                <p className="text-xs text-slate-300 italic line-clamp-2 mt-1">
                  {img.caption || 'Trade setup chart attachment'}
                </p>

                <button
                  onClick={() => setSelectedEntry(img.parentEntry)}
                  className="mt-3 w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white rounded-xl transition-colors text-center block"
                >
                  View Full Journal Entry →
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
