// Utility functions for formatting numbers, currency, dates, and badges

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  const num = Number(amount);
  const formatted = Math.abs(num).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (num > 0) return `+${formatted}`;
  if (num < 0) return `-${formatted}`;
  return formatted;
};

export const formatPercent = (percent) => {
  if (percent === null || percent === undefined || isNaN(percent)) return '0.0%';
  const num = Number(percent);
  const formatted = Math.abs(num).toFixed(1) + '%';
  if (num > 0) return `+${formatted}`;
  if (num < 0) return `-${formatted}`;
  return formatted;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const getMoodConfig = (mood) => {
  const moods = {
    disciplined: { label: 'Disciplined', emoji: '🎯', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    confident: { label: 'Confident', emoji: '🦁', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    calm: { label: 'Calm & Focused', emoji: '🧘', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    anxious: { label: 'Anxious', emoji: '😰', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    greedy: { label: 'Greedy / FOMO', emoji: '🤑', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    fearful: { label: 'Fearful', emoji: '😨', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    impatient: { label: 'Impatient', emoji: '⏳', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    frustrated: { label: 'Frustrated', emoji: '😤', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  };
  return moods[mood?.toLowerCase()] || { label: mood || 'Neutral', emoji: '😐', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
};

export const getPlanAdherenceConfig = (status) => {
  switch (status?.toLowerCase()) {
    case 'yes':
    case 'followed':
      return { label: 'Plan Followed 100%', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: 'CheckCircle2' };
    case 'partial':
    case 'partially':
      return { label: 'Partially Followed', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: 'AlertTriangle' };
    case 'no':
    case 'violated':
      return { label: 'Plan Violated', badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30', icon: 'XCircle' };
    default:
      return { label: 'Not Specified', badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: 'HelpCircle' };
  }
};
