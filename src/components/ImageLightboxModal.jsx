import React, { useState, useRef, useEffect } from 'react';
import { useJournal } from '../context/JournalContext';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Move } from 'lucide-react';

export const ImageLightboxModal = () => {
  const { selectedLightboxImage, setSelectedLightboxImage } = useJournal();

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Reset zoom & pan position whenever lightbox is opened/closed or image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [selectedLightboxImage]);

  if (!selectedLightboxImage) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + 0.2, 4));
    } else {
      setScale(prev => {
        const newScale = Math.max(prev - 0.2, 1);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
    }
  };

  // Mouse / Touch Drag Pan Start
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  // Mouse / Touch Drag Pan Move
  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  // Drag Pan End
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl select-none"
      onWheel={handleWheel}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between max-w-5xl mx-auto">
        
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Reset Zoom (100%)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 my-auto"></div>

          {/* Zoom Level Indicator */}
          <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800">
            {Math.round(scale * 100)}%
          </span>

          {scale > 1 && (
            <span className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400 px-2">
              <Move className="w-3 h-3 text-indigo-400" />
              <span>Drag to Pan</span>
            </span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          <a
            href={selectedLightboxImage.url}
            download={`chart-${Date.now()}.png`}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl transition-colors border border-slate-800 shadow-xl"
            title="Download Screenshot"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            onClick={() => setSelectedLightboxImage(null)}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl transition-colors border border-slate-800 shadow-xl"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Image Viewer Workspace (Zoom & Pan Canvas) */}
      <div 
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center overflow-hidden p-4 ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="max-w-full max-h-[80vh] flex items-center justify-center"
        >
          <img
            src={selectedLightboxImage.url}
            alt={selectedLightboxImage.caption || 'Trading Chart'}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-slate-800 shadow-2xl pointer-events-none"
          />
        </div>
      </div>

      {/* Bottom Caption Overlay */}
      {selectedLightboxImage.caption && (
        <div className="absolute bottom-6 inset-x-4 z-30 flex justify-center pointer-events-none">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl px-6 py-3 text-center max-w-xl shadow-2xl backdrop-blur-md">
            <p className="text-xs sm:text-sm font-semibold text-slate-200">
              {selectedLightboxImage.caption}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
