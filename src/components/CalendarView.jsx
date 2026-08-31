import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ChevronLeft, ChevronRight, PlusCircle, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';

export const CalendarView = () => {
  const { entries, setSelectedEntry, openNewEntryForDate } = useJournal();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map entries by date YYYY-MM-DD
  const entriesByDate = entries.reduce((acc, curr) => {
    acc[curr.date] = curr;
    return acc;
  }, {});

  // Monthly stats
  const currentMonthEntries = entries.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monthPnL = currentMonthEntries.reduce((acc, curr) => acc + (curr.pnl || 0), 0);
  const monthWins = currentMonthEntries.filter(e => e.pnl > 0).length;
  const monthLosses = currentMonthEntries.filter(e => e.pnl < 0).length;
  const monthWinRate = currentMonthEntries.length > 0
    ? ((monthWins / currentMonthEntries.length) * 100).toFixed(0)
    : '0';

  // Build calendar matrix
  const days = [];
  // Empty slots for previous month overflow
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dayNumber: d,
      dateString: formattedDateStr,
      entry: entriesByDate[formattedDateStr]
    });
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 lg:pb-12 pt-4 px-4 sm:px-6">

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Trading Performance Calendar</h2>
              <p className="text-xs text-slate-400">Green & red day visual breakdown of your daily journal</p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold text-white min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Monthly Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Monthly Net P/L</span>
            <span className={`text-base font-extrabold ${monthPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(monthPnL)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Win Rate</span>
            <span className="text-base font-extrabold text-white">{monthWinRate}%</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Win / Loss Days</span>
            <span className="text-base font-extrabold text-slate-200">
              <span className="text-emerald-400">{monthWins}W</span> - <span className="text-rose-400">{monthLosses}L</span>
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-500 block">Journaled Days</span>
            <span className="text-base font-extrabold text-indigo-400">{currentMonthEntries.length} Days</span>
          </div>
        </div>

      </div>

      {/* Calendar Grid Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-bold text-slate-400 py-2 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((item, index) => {
            if (!item) {
              return <div key={`empty-${index}`} className="h-20 sm:h-28 rounded-xl bg-slate-950/30 opacity-20"></div>;
            }

            const { dayNumber, dateString, entry } = item;
            const isToday = new Date().toISOString().split('T')[0] === dateString;

            if (entry) {
              const isWin = entry.pnl > 0;
              const isLoss = entry.pnl < 0;

              return (
                <div
                  key={dateString}
                  onClick={() => setSelectedEntry(entry)}
                  className={`h-20 sm:h-28 rounded-xl p-2 flex flex-col justify-between border cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-md relative overflow-hidden group ${isWin
                      ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
                      : isLoss
                        ? 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400 text-rose-300'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center' : ''}`}>
                      {dayNumber}
                    </span>
                    <span className="text-[10px] uppercase font-semibold opacity-75 hidden sm:inline-block">
                      {entry.asset}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-extrabold tracking-tight">
                      {formatCurrency(entry.pnl)}
                    </div>
                    <div className="text-[10px] opacity-80 hidden sm:block">
                      {entry.planFollowed === 'yes' ? '✓ Plan' : '⚠️ Plan'}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={dateString}
                onClick={() => openNewEntryForDate(dateString)}
                className={`h-20 sm:h-28 rounded-xl p-2 flex flex-col justify-between border border-slate-800/60 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700 cursor-pointer transition-colors group ${isToday ? 'border-indigo-500/50 bg-indigo-500/5' : ''
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-slate-500'}`}>
                    {dayNumber}
                  </span>
                </div>

                <div className="flex items-center justify-center text-slate-600 group-hover:text-emerald-400 transition-colors">
                  <PlusCircle className="w-5 h-5 stroke-[1.5]" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
