import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { 
  BookMarked, 
  PlusCircle, 
  Search, 
  Star, 
  BookOpen, 
  Quote, 
  Tag, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles, 
  Check, 
  Filter,
  Lightbulb,
  Heart
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Mindset',
  'Psychology',
  'Habits',
  'Risk & Money',
  'Life Strategy'
];

export const LifeLessonsView = () => {
  const { lessons, addLesson, updateLesson, deleteLesson, toggleFavoriteLesson } = useJournal();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    bookTitle: '',
    author: '',
    category: 'Mindset',
    quote: '',
    takeaway: '',
    isFavorite: false,
    date: new Date().toISOString().split('T')[0]
  });

  const handleOpenAddModal = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      bookTitle: '',
      author: '',
      category: 'Mindset',
      quote: '',
      takeaway: '',
      isFavorite: false,
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title || '',
      bookTitle: lesson.bookTitle || '',
      author: lesson.author || '',
      category: lesson.category || 'Mindset',
      quote: lesson.quote || '',
      takeaway: lesson.takeaway || '',
      isFavorite: !!lesson.isFavorite,
      date: lesson.date || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a lesson title.');
      return;
    }

    if (editingLesson) {
      updateLesson(editingLesson.id, formData);
    } else {
      addLesson(formData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (confirm(`Are you sure you want to delete the lesson "${title}"?`)) {
      deleteLesson(id);
    }
  };

  // Filter lessons
  const filteredLessons = (lessons || []).filter(lesson => {
    const matchesSearch = !searchQuery || 
      (lesson.title && lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lesson.bookTitle && lesson.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lesson.author && lesson.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lesson.quote && lesson.quote.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lesson.takeaway && lesson.takeaway.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || lesson.category === selectedCategory;
    const matchesFavorite = !onlyFavorites || lesson.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  // Calculate Stats
  const totalLessons = lessons ? lessons.length : 0;
  const favoriteCount = lessons ? lessons.filter(l => l.isFavorite).length : 0;
  const uniqueBooks = lessons ? new Set(lessons.map(l => l.bookTitle).filter(Boolean)).size : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              <BookMarked className="w-4 h-4" />
              <span>Book Wisdom & Personal Diary</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Life Lessons & Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Document timeless lessons, mental models, quotes, and rules learned from reading books and life experience.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Life Lesson</span>
          </button>
        </div>

        {/* Quick Summary Stats Pills */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Lessons</p>
              <p className="text-lg font-extrabold text-white">{totalLessons}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Starred Favorites</p>
              <p className="text-lg font-extrabold text-amber-400">{favoriteCount}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Books & Sources</p>
              <p className="text-lg font-extrabold text-teal-400">{uniqueBooks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons by title, book, author, or keyword..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}

          {/* Starred filter button */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center space-x-1 transition-all cursor-pointer ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400' : ''}`} />
            <span>Starred</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredLessons.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <BookMarked className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Life Lessons Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All' || onlyFavorites
              ? 'No lessons match your current filters. Try clearing search terms or selecting another category.'
              : 'Start your personal book wisdom diary! Click "+ Add Life Lesson" to add your first key takeaway or favorite book quote.'}
          </p>
          {(searchQuery || selectedCategory !== 'All' || onlyFavorites) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setOnlyFavorites(false);
              }}
              className="mt-2 text-xs font-semibold text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map(lesson => (
            <div 
              key={lesson.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              <div className="space-y-3">
                
                {/* Header Row: Category Badge & Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                    <Tag className="w-3 h-3" />
                    <span>{lesson.category || 'Mindset'}</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleFavoriteLesson(lesson.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        lesson.isFavorite 
                          ? 'text-amber-400 hover:bg-amber-500/10' 
                          : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title={lesson.isFavorite ? 'Unstar' : 'Star Favorite'}
                    >
                      <Star className={`w-4 h-4 ${lesson.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => handleOpenEditModal(lesson)}
                      className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Lesson"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(lesson.id, lesson.title)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lesson Title */}
                <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                  {lesson.title}
                </h3>

                {/* Book & Author Badge */}
                {(lesson.bookTitle || lesson.author) && (
                  <div className="flex items-center space-x-1.5 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-xl w-fit font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lesson.bookTitle || 'Book'}</span>
                    {lesson.author && <span className="text-slate-400">by {lesson.author}</span>}
                  </div>
                )}

                {/* Highlight Quote Box */}
                {lesson.quote && (
                  <div className="bg-slate-950/80 border-l-2 border-indigo-500 rounded-r-xl p-3.5 text-xs text-slate-300 italic relative my-2">
                    <Quote className="w-3.5 h-3.5 text-indigo-400/60 mb-1" />
                    <span>"{lesson.quote}"</span>
                  </div>
                )}

                {/* Reflection / Takeaway */}
                {lesson.takeaway && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Key Takeaway & Reflection
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      {lesson.takeaway}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Date */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Added on {lesson.date}</span>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-indigo-400 transition-colors">
                  Insight Log
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Lesson Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <BookMarked className="w-5 h-5" />
                <span>{editingLesson ? 'Edit Life Lesson' : 'Add New Life Lesson'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Lesson Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Lesson Title / Main Concept *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Thinking in Probabilities & Accepting Risk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Book Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Book Title / Source
                  </label>
                  <input
                    type="text"
                    value={formData.bookTitle}
                    onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                    placeholder="e.g. Trading in the Zone"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Mark Douglas"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Category Tag
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Quote Highlight */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Memorable Quote / Highlight
                </label>
                <textarea
                  rows="2"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="e.g. When you truly accept the risk, you will be at peace with any outcome."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Key Reflection / Takeaway */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Key Takeaway & Practical Application
                </label>
                <textarea
                  rows="3"
                  value={formData.takeaway}
                  onChange={(e) => setFormData({ ...formData, takeaway: e.target.value })}
                  placeholder="Explain how this lesson applies to your mindset, trading execution, or daily life..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Starred Favorite Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modalFavoriteToggle"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="modalFavoriteToggle" className="text-xs font-semibold text-slate-300 cursor-pointer flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Star as Featured Favorite Insight</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLesson ? 'Save Changes' : 'Add Lesson'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
